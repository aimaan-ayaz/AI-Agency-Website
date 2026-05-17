import { NextRequest } from "next/server";
import { createHmac, timingSafeEqual, createHash } from "crypto";

// Signed session for JARVIS.
//
// The access gate alone is cosmetic — it only flips client state. Real
// protection is here: on a correct key the auth route sets an
// HttpOnly, signed session cookie, and every paid/private API route
// rejects requests that don't carry a valid one. No cookie → 401,
// before any Claude/Deepgram/ElevenLabs spend.
//
// The signing secret is derived from the two access keys (already
// server-only secrets), so there's no extra env var to manage and it
// changes automatically if the keys are rotated.

const COOKIE = "jrv_sess";
const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

type JarvisUser = "Aimaan" | "Zaid";

function secret(): string | null {
  const a = process.env.JARVIS_KEY_AIMAAN;
  const z = process.env.JARVIS_KEY_ZAID;
  if (!a || !z) return null;
  return createHash("sha256").update(`${a}::${z}::jrv-v1`).digest("hex");
}

function b64url(s: string): string {
  return Buffer.from(s).toString("base64url");
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

/** Build a signed token for a user (12h expiry). */
export function createSessionToken(user: JarvisUser): string | null {
  const key = secret();
  if (!key) return null;
  const payload = b64url(JSON.stringify({ u: user, exp: Date.now() + TTL_MS }));
  return `${payload}.${sign(payload, key)}`;
}

/** Verify the request's session cookie. Returns the user or null. */
export function getSessionUser(req: NextRequest): JarvisUser | null {
  const key = secret();
  if (!key) return null;
  const token = req.cookies.get(COOKIE)?.value;
  if (!token || !token.includes(".")) return null;

  const [payload, mac] = token.split(".");
  const expected = sign(payload, key);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data?.exp !== "number" || data.exp < Date.now()) return null;
    if (data.u !== "Aimaan" && data.u !== "Zaid") return null;
    return data.u;
  } catch {
    return null;
  }
}

/** Cookie options — Secure only over HTTPS (prod), so localhost dev works. */
export function sessionCookie(token: string) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_MS / 1000,
  };
}
