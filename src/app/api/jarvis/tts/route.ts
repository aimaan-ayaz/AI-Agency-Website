import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/jarvis/ratelimit";
import { getSessionUser } from "@/lib/jarvis/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ElevenLabs text-to-speech. The API key stays server-side; the browser
// only ever receives audio bytes. Tuned for a calm, composed JARVIS.

// "Adam" — deep, composed, narration-grade. Override via env if you pick
// a different voice from the ElevenLabs library later (one line).
const DEFAULT_VOICE = "pNInz6obpgDQGcFmaJgB";
// flash v2.5 = lowest latency + cheapest on the free character quota.
const MODEL = "eleven_flash_v2_5";
// Protect the 10k-char/month free tier from a runaway reply.
const MAX_CHARS = 800;

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "local";
}
function err(error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  if (!getSessionUser(req)) return err("unauthorized", 401);
  if (!rateLimit(clientIp(req)).allowed) return err("rate_limit", 429);

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("[jarvis/tts] ELEVENLABS_API_KEY not set");
    return err("unconfigured", 500);
  }

  const body = await req.json().catch(() => null);
  const raw = typeof body?.text === "string" ? body.text.trim() : "";
  if (!raw) return err("invalid_request", 400);
  const text = raw.slice(0, MAX_CHARS);
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;

  try {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=3`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: MODEL,
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!r.ok || !r.body) {
      const detail = await r.text().catch(() => "");
      console.error("[jarvis/tts] elevenlabs", r.status, detail);
      if (r.status === 401) return err("eleven_auth", 401);
      if (r.status === 429) return err("rate_limit", 429);
      // Free quota exhausted comes back as 401/402 with a detail body.
      if (/quota|credit/i.test(detail)) return err("quota", 402);
      return err("tts_failed", 502);
    }

    // Pipe ElevenLabs audio straight through to the browser.
    return new Response(r.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[jarvis/tts] unexpected", e);
    return err("server_error", 500);
  }
}
