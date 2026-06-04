// Temporary Phase-1 verification harness: drives system Chrome headless to
// screenshot the /fashion studio in deterministic colourway/zone/view combos.
// Usage: node scripts/shoot.mjs <set>   where <set> = calib | gate
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000/fashion";
const OUT = "shots";
const W = 1200,
  H = 1200;

const SETS = {
  // Phase 2: demo printed graphic + prompt-bar UI.
  phase2: [
    { name: "p2_back_print", q: "cw=Black&view=back&demo=back_center" },
    { name: "p2_chest_print", q: "cw=White&view=front&demo=front_chest" },
    { name: "p2_ui", q: "cw=Black&view=tq" },
  ],
  // Product UI pass: clean tee (no calibration graphic), both colourways + matte close-ups.
  product: [
    { name: "p_black_tq", q: "cw=Black&view=tq" },
    { name: "p_white_tq", q: "cw=White&view=tq" },
    { name: "p_black_front", q: "cw=Black&view=front" },
    { name: "p_white_front", q: "cw=White&view=front" },
    { name: "matte_closeup_black", q: "cw=Black&view=front&r=3.4" },
    { name: "matte_closeup_white", q: "cw=White&view=front&r=3.4" },
  ],
  // Calibration pass: Onyx, each zone framed in its best view, + geometry check.
  calib: [
    { name: "geom_front", q: "cw=Bone&zone=none&view=front" },
    { name: "geom_back", q: "cw=Bone&zone=none&view=back" },
    { name: "geom_left", q: "cw=Bone&zone=none&view=left" },
    { name: "geom_right", q: "cw=Bone&zone=none&view=right" },
    { name: "zmark_tq", q: "cw=Onyx&zone=none&view=tq" },
    { name: "zone_front_chest", q: "cw=Onyx&zone=front_chest&view=front" },
    { name: "zone_front_full", q: "cw=Onyx&zone=front_full&view=front" },
    { name: "zone_back_center", q: "cw=Onyx&zone=back_center&view=back" },
    { name: "zone_left_sleeve", q: "cw=Onyx&zone=left_sleeve&view=left" },
    { name: "zone_right_sleeve", q: "cw=Onyx&zone=right_sleeve&view=right" },
  ],
  // Gate pass: all 4 colourways (Z mark only) + graphics rotated + woven-in close-ups.
  gate: [
    { name: "cw_onyx", q: "cw=Onyx&zone=none&view=tq" },
    { name: "cw_charcoal", q: "cw=Charcoal&zone=none&view=tq" },
    { name: "cw_bone", q: "cw=Bone&zone=none&view=tq" },
    { name: "cw_ice", q: "cw=Ice&zone=none&view=tq" },
    { name: "graphic_front_bone", q: "cw=Bone&zone=front_full&view=front" },
    { name: "graphic_back_onyx", q: "cw=Onyx&zone=back_center&view=back" },
    { name: "weave_closeup_bone", q: "cw=Bone&zone=front_chest&view=front&r=2.2" },
    { name: "zmark_closeup_ice", q: "cw=Ice&zone=none&view=front&r=2.2" },
  ],
};

const setName = process.argv[2] || "calib";
const shots = SETS[setName];
if (!shots) {
  console.error("unknown set:", setName, "— use calib | gate");
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: [
    "--no-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--enable-webgl",
  ],
  defaultViewport: { width: W, height: H, deviceScaleFactor: 1 },
});

const page = await browser.newPage();
page.on("pageerror", (e) => console.log("  [pageerror]", e.message));
page.on("console", (m) => {
  const t = m.text();
  if (m.type() === "error") console.log("  [console.error]", t);
});

for (const s of shots) {
  const url = `${BASE}?${s.q}`;
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await page
      .waitForFunction(() => window.__fashionReady === true, { timeout: 30000 })
      .catch(() => console.log("  (ready flag timeout)"));
    // let textures/font + a few render frames settle
    await new Promise((r) => setTimeout(r, 1800));
    await page.screenshot({ path: `${OUT}/${s.name}.png` });
    console.log("shot:", s.name, "←", url);
  } catch (e) {
    console.log("FAILED:", s.name, e.message);
  }
}

await browser.close();
console.log("done →", OUT);
