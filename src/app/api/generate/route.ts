import { NextRequest } from "next/server";
import { removeBackground } from "@imgly/background-removal-node";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // FLUX + cutout can exceed the 10s serverless default

// Image route. Generates the graphic with Cloudflare Workers AI
// FLUX.1 [schnell] (free, commercial-clean), then strips the flat light-grey
// background to a transparent PNG. Primary cutout is the ML model (@imgly);
// if it can't run (e.g. serverless without its ONNX runtime) we fall back to a
// sharp grey-key so the route still returns a usable transparent PNG.
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

function short(e: unknown): string {
  return String((e as Error)?.message || e || "").slice(0, 180);
}

// Serverless-safe background removal. FLUX renders the graphic on a flat solid
// light-grey field, so we key out pixels close to the sampled corner colour.
// Rougher than the ML cutout but needs no ONNX model / native runtime.
async function greyKeyCutout(jpegBuf: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(jpegBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const ch = info.channels; // 4 after ensureAlpha
  // Background colour = average of the four corner pixels.
  const corners = [
    0,
    (width - 1) * ch,
    (height - 1) * width * ch,
    ((height - 1) * width + (width - 1)) * ch,
  ];
  let br = 0,
    bg = 0,
    bb = 0;
  for (const i of corners) {
    br += data[i];
    bg += data[i + 1];
    bb += data[i + 2];
  }
  br /= corners.length;
  bg /= corners.length;
  bb /= corners.length;
  const T = 44; // colour-distance threshold (0–441)
  const T2 = T * T;
  for (let p = 0; p < data.length; p += ch) {
    const dr = data[p] - br;
    const dg = data[p + 1] - bg;
    const db = data[p + 2] - bb;
    if (dr * dr + dg * dg + db * db <= T2) data[p + 3] = 0;
  }
  return sharp(data, { raw: { width, height, channels: ch } }).png().toBuffer();
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
          "Image generation isn't configured on the server (CF_ACCOUNT_ID / CF_AI_API_TOKEN).",
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
  // a clean solid backdrop is what lets us isolate the graphic).
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
      return json(
        { error: "image_failed", stage: "cloudflare", status: r.status, detail: errText.slice(0, 180) },
        502
      );
    }

    // CF REST envelope: { success, errors, messages, result: { image: <b64 jpeg> } }
    const data = await r.json().catch(() => null);
    b64 = data?.result?.image;
    if (!b64 || typeof b64 !== "string") {
      console.error("[fashion/generate] no result.image in Cloudflare response");
      return json({ error: "image_failed", stage: "cloudflare_noimage" }, 502);
    }
  } catch (err) {
    console.error("[fashion/generate] Cloudflare request failed", err);
    return json({ error: "image_failed", stage: "cloudflare_fetch", detail: short(err) }, 502);
  }

  // 2) Cut the flat-grey background to transparent. Prefer the ML cutout; fall
  // back to the sharp grey-key if it can't run (keeps the route working
  // serverless even when @imgly's native/ONNX runtime is unavailable).
  let cutoutBuf: Buffer;
  let method = "imgly";
  try {
    const inBlob = new Blob([Buffer.from(b64, "base64")], { type: "image/jpeg" });
    const outBlob = await removeBackground(inBlob, { output: { format: "image/png" } });
    cutoutBuf = Buffer.from(await outBlob.arrayBuffer());
  } catch (imglyErr) {
    console.error("[fashion/generate] @imgly cutout failed; trying sharp grey-key", imglyErr);
    try {
      cutoutBuf = await greyKeyCutout(Buffer.from(b64, "base64"));
      method = "greykey";
    } catch (keyErr) {
      console.error("[fashion/generate] grey-key fallback failed", keyErr);
      return json({ error: "image_failed", stage: "cutout", detail: short(imglyErr) }, 502);
    }
  }

  // 3) Trim the transparent margin and re-centre on a square so the art FILLS
  // its placement zone (FLUX centres the subject with wide margins). Contain-to-
  // square keeps the aspect ratio (no distortion); the 32px pad leaves an edge.
  let finalBuf: Buffer = cutoutBuf;
  try {
    const trimmed = await sharp(cutoutBuf).trim().toBuffer();
    finalBuf = await sharp(trimmed)
      .resize(960, 960, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
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
    finalBuf = cutoutBuf;
  }

  return json({ image: `data:image/png;base64,${finalBuf.toString("base64")}`, method });
}
