import { NextRequest } from "next/server";
import { removeBackground } from "@imgly/background-removal-node";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Image route. Generates the graphic with Cloudflare Workers AI
// FLUX.1 [schnell] (free, commercial-clean), then strips the flat light-grey
// background to a transparent PNG with @imgly so the decal renderer gets the
// same `{ image: <png data url> }` shape it always has. FLUX has no transparent
// output of its own — the design-director asks for a flat grey backdrop and we
// cut it out here.
const FLUX_MODEL = "@cf/black-forest-labs/flux-1-schnell";
const STEPS = 6; // FLUX schnell caps at 8
const MAX_PROMPT_CHARS = 1500; // FLUX prompt limit is 2048

// Best-effort per-IP generation cap (~6 / minute). In-memory, pinned to
// globalThis so it survives dev hot-reloads. Keeps generation bounded.
const GEN_CAP = 6;
const WINDOW_MS = 60_000;
type Bucket = number[];
const store: Map<string, Bucket> =
  (globalThis as { __fashionGen?: Map<string, Bucket> }).__fashionGen ??
  new Map<string, Bucket>();
(globalThis as { __fashionGen?: Map<string, Bucket> }).__fashionGen = store;

function overCap(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const recent = (store.get(ip) ?? []).filter((t) => t > cutoff);
  if (recent.length >= GEN_CAP) {
    store.set(ip, recent);
    return true;
  }
  recent.push(now);
  store.set(ip, recent);
  return false;
}

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
  const accountId = process.env.CF_ACCOUNT_ID;
  const token = process.env.CF_AI_API_TOKEN;
  if (!accountId || !token) {
    console.error("[fashion/generate] CF_ACCOUNT_ID / CF_AI_API_TOKEN not set");
    return json(
      {
        error: "unconfigured",
        message:
          "Cloudflare Workers AI isn't configured. Add CF_ACCOUNT_ID and CF_AI_API_TOKEN to web/.env.local.",
      },
      500
    );
  }

  const ip = clientIp(req);
  if (overCap(ip)) return json({ error: "rate_limit" }, 429);

  const body = await req.json().catch(() => null);
  const imagePrompt =
    typeof body?.image_prompt === "string" ? body.image_prompt.trim() : "";
  if (!imagePrompt) return json({ error: "invalid_request" }, 400);

  // Reinforce the flat-grey, cleanly-cut-out intent (FLUX can't do transparency;
  // a clean solid backdrop is what lets @imgly isolate the graphic).
  const prompt =
    `${imagePrompt.slice(0, MAX_PROMPT_CHARS)}. ` +
    `A single centered graphic isolated on a plain flat solid light grey ` +
    `background, die-cut sticker / screen-print style, no scene, no gradient, ` +
    `no border, bold and high-contrast.`;

  // 1) Generate with Cloudflare Workers AI FLUX.1 [schnell].
  let b64: string | undefined;
  try {
    const r = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${FLUX_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, steps: STEPS }),
      }
    );

    if (!r.ok) {
      const errText = await r.text().catch(() => "");
      if (r.status === 429) return json({ error: "rate_limit" }, 429);
      console.error("[fashion/generate] Cloudflare error", r.status, errText.slice(0, 300));
      return json({ error: "image_failed" }, 502);
    }

    // CF REST envelope: { success, errors, messages, result: { image: <b64 jpeg> } }
    const data = await r.json().catch(() => null);
    b64 = data?.result?.image;
    if (!b64 || typeof b64 !== "string") {
      console.error("[fashion/generate] no result.image in Cloudflare response");
      return json({ error: "image_failed" }, 502);
    }
  } catch (err) {
    console.error("[fashion/generate] Cloudflare request failed", err);
    return json({ error: "image_failed" }, 502);
  }

  // 2) Cut the flat-grey background out -> transparent PNG (@imgly).
  // The node build needs a typed Blob (it rejects data: URLs and untyped
  // buffers), so wrap the base64 JPEG bytes in a Blob with an explicit MIME.
  try {
    const inBlob = new Blob([Buffer.from(b64, "base64")], { type: "image/jpeg" });
    const outBlob = await removeBackground(inBlob, {
      output: { format: "image/png" },
    });
    const outBuf = Buffer.from(await outBlob.arrayBuffer());

    // 3) Trim the transparent margin and re-centre on a square so the art FILLS
    // its placement zone (FLUX centres the subject with wide grey margins → the
    // cutout otherwise floats small inside the print box). Contain-to-square
    // keeps the aspect ratio (no distortion); the 32px pad leaves a clean edge.
    let finalBuf: Buffer = outBuf;
    try {
      const trimmed = await sharp(outBuf).trim().toBuffer();
      finalBuf = await sharp(trimmed)
        .resize(960, 960, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .extend({
          top: 32,
          bottom: 32,
          left: 32,
          right: 32,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();
    } catch (e) {
      console.error("[fashion/generate] trim/normalise failed; using raw cutout", e);
      finalBuf = outBuf;
    }

    return json({ image: `data:image/png;base64,${finalBuf.toString("base64")}` });
  } catch (err) {
    // Graceful fallback (approved): never return the grey-box image; surface a
    // friendly error so the studio shows "try again" instead of crashing.
    console.error("[fashion/generate] background removal failed", err);
    return json({ error: "image_failed" }, 502);
  }
}
