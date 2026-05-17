import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/jarvis/ratelimit";
import { getSessionUser } from "@/lib/jarvis/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Mints a short-lived Deepgram key for the browser WebSocket. The real
// DEEPGRAM_API_KEY never leaves the server.
//
// PERF: project id + the minted key are cached on globalThis and reused
// until the key is near expiry. Without this, every "tap to speak" paid
// two sequential Deepgram REST round-trips (~3-4s of dead air before
// listening). With it, repeat starts are effectively instant.

const KEY_TTL = 300; // seconds the ephemeral key lives
const REFRESH_BEFORE = 45_000; // re-mint when <45s remain (ms)

type Cache = {
  projectId?: string;
  token?: string;
  exp?: number; // ms epoch
};
const cache: Cache =
  (globalThis as { __jarvisDgCache?: Cache }).__jarvisDgCache ?? {};
(globalThis as { __jarvisDgCache?: Cache }).__jarvisDgCache = cache;

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "local";
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  if (!getSessionUser(req)) return json({ error: "unauthorized" }, 401);
  if (!rateLimit(clientIp(req)).allowed) return json({ error: "rate_limit" }, 429);

  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) {
    console.error("[jarvis/deepgram-token] DEEPGRAM_API_KEY not set");
    return json({ error: "unconfigured" }, 500);
  }

  // Fast path: a still-fresh cached token.
  if (cache.token && cache.exp && cache.exp - Date.now() > REFRESH_BEFORE) {
    return json({ token: cache.token });
  }

  const auth = { Authorization: `Token ${key}` };
  try {
    // Project id never changes — resolve once, then cache forever.
    if (!cache.projectId) {
      const pr = await fetch("https://api.deepgram.com/v1/projects", {
        headers: auth,
      });
      if (!pr.ok) {
        const t = await pr.text();
        console.error("[jarvis/deepgram-token] projects", pr.status, t);
        return json({ error: "deepgram_auth", status: pr.status }, 502);
      }
      const projects = await pr.json();
      cache.projectId = projects?.projects?.[0]?.project_id;
      if (!cache.projectId) return json({ error: "no_project" }, 502);
    }

    const kr = await fetch(
      `https://api.deepgram.com/v1/projects/${cache.projectId}/keys`,
      {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: "jarvis-ephemeral",
          scopes: ["usage:write"],
          time_to_live_in_seconds: KEY_TTL,
        }),
      }
    );
    if (!kr.ok) {
      const t = await kr.text();
      console.error("[jarvis/deepgram-token] mint", kr.status, t);
      return json(
        { error: "mint_failed", status: kr.status },
        kr.status === 401 || kr.status === 403 ? 403 : 502
      );
    }
    const minted = await kr.json();
    if (!minted?.key) return json({ error: "mint_failed" }, 502);

    cache.token = minted.key as string;
    cache.exp = Date.now() + KEY_TTL * 1000;
    return json({ token: cache.token });
  } catch (e) {
    console.error("[jarvis/deepgram-token] unexpected", e);
    return json({ error: "server_error" }, 500);
  }
}
