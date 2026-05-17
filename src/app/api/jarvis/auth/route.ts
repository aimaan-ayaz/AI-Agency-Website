import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { checkLock, registerFailure, clearFailures } from "@/lib/jarvis/lockout";
import { createSessionToken, sessionCookie } from "@/lib/jarvis/session";

// Force the Node.js runtime: we use `crypto` and module-level in-memory
// lockout state, neither of which works on the edge runtime.
export const runtime = "nodejs";

type JarvisUser = "Aimaan" | "Zaid";

// Constant-time-ish comparison. Returns false on length mismatch without
// leaking timing on the matched portion.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  try {
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "local";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  // 1. Refuse early if this IP is currently locked out.
  const lock = checkLock(ip);
  if (lock.locked) {
    return NextResponse.json(
      { ok: false, locked: true, retryAfter: lock.retryAfter },
      { status: 423 }
    );
  }

  // 2. Parse the submitted key.
  const body = await req.json().catch(() => null);
  const key = typeof body?.key === "string" ? body.key : "";
  if (!key) {
    return NextResponse.json(
      { ok: false, error: "missing_key", attemptsLeft: lock.attemptsLeft },
      { status: 400 }
    );
  }

  // 3. Server-only secrets. If they aren't configured, fail loudly so
  //    Aimaan knows to set them (rather than silently denying access).
  const keyAimaan = process.env.JARVIS_KEY_AIMAAN;
  const keyZaid = process.env.JARVIS_KEY_ZAID;
  if (!keyAimaan || !keyZaid) {
    console.error("[jarvis/auth] JARVIS_KEY_AIMAAN / JARVIS_KEY_ZAID not set");
    return NextResponse.json(
      { ok: false, error: "server_unconfigured" },
      { status: 500 }
    );
  }

  // 4. Match against each user's key — case-insensitive + whitespace
  //    trimmed (so capitalization / stray spaces don't lock you out).
  const norm = (s: string) => s.trim().toLowerCase();
  const submitted = norm(key);
  let user: JarvisUser | null = null;
  if (safeEqual(submitted, norm(keyAimaan))) user = "Aimaan";
  else if (safeEqual(submitted, norm(keyZaid))) user = "Zaid";

  if (!user) {
    const after = registerFailure(ip);
    return NextResponse.json(
      {
        ok: false,
        error: "invalid_key",
        locked: after.locked,
        retryAfter: after.retryAfter,
        attemptsLeft: after.attemptsLeft,
      },
      { status: after.locked ? 423 : 401 }
    );
  }

  // 5. Success — reset the counter, issue a signed session cookie, and
  //    hand back the identity. Every protected route checks that cookie.
  clearFailures(ip);
  const res = NextResponse.json({ ok: true, user });
  const token = createSessionToken(user);
  if (token) res.cookies.set(sessionCookie(token));
  return res;
}
