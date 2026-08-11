// Validate the serverless grey-key cutout on a real FLUX image.
import fs from "node:fs";
import sharp from "sharp";

fs.mkdirSync("shots", { recursive: true });
const env = fs.readFileSync(".env.local", "utf8");
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m")) || [])[1]?.trim();
const acc = get("CF_ACCOUNT_ID");
const tok = get("CF_AI_API_TOKEN");
if (!acc || !tok) {
  console.log("missing CF creds in .env.local");
  process.exit(1);
}

const r = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${acc}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt:
        "A snarling wolf head, bold heavy linework, monochrome screen-print, isolated and centered on a plain flat solid light grey background, high-contrast, no border.",
      steps: 6,
    }),
  }
);
console.log("CF status:", r.status);
const data = await r.json();
const b64 = data?.result?.image;
if (!b64) {
  console.log("no image; CF body:", JSON.stringify(data).slice(0, 300));
  process.exit(1);
}
const jpeg = Buffer.from(b64, "base64");
fs.writeFileSync("shots/_raw_flux.jpg", jpeg);

// grey-key (same logic as the route)
const { data: px, info } = await sharp(jpeg)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height } = info;
const ch = info.channels;
const corners = [
  0,
  (width - 1) * ch,
  (height - 1) * width * ch,
  ((height - 1) * width + (width - 1)) * ch,
];
let br = 0, bg = 0, bb = 0;
for (const i of corners) {
  br += px[i]; bg += px[i + 1]; bb += px[i + 2];
}
br /= corners.length; bg /= corners.length; bb /= corners.length;
console.log("bg colour ~", [br, bg, bb].map((n) => Math.round(n)));
const T = 44, T2 = T * T;
let keyed = 0;
for (let p = 0; p < px.length; p += ch) {
  const dr = px[p] - br, dg = px[p + 1] - bg, db = px[p + 2] - bb;
  if (dr * dr + dg * dg + db * db <= T2) { px[p + 3] = 0; keyed++; }
}
console.log("keyed transparent:", Math.round((keyed / (px.length / ch)) * 100) + "%");
const cut = await sharp(px, { raw: { width, height, channels: ch } }).png().toBuffer();

// trim + square (same as route) then composite on a black "tee" to judge
const trimmed = await sharp(cut).trim().toBuffer();
const squared = await sharp(trimmed)
  .resize(960, 960, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({ top: 32, bottom: 32, left: 32, right: 32, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
fs.writeFileSync("shots/_greykey_cut.png", squared);

const onBlack = await sharp({
  create: { width: 1024, height: 1024, channels: 3, background: { r: 22, g: 22, b: 24 } },
})
  .composite([{ input: squared }])
  .png()
  .toBuffer();
fs.writeFileSync("shots/_greykey_on_black.png", onBlack);
console.log("wrote shots/_greykey_on_black.png");
