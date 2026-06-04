// Deterministic reveal check: hold the whole-tee reveal at fixed levels.
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000/fashion";
const OUT = "shots";
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
  defaultViewport: { width: 1200, height: 1200, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("  [pageerror]", e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.log("  [console.error]", m.text());
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await page.goto(`${BASE}?cw=Black&view=front&demo=front_full`, {
  waitUntil: "networkidle2",
  timeout: 60000,
});
await page
  .waitForFunction(() => window.__fashionReady === true, { timeout: 30000 })
  .catch(() => console.log("  (ready timeout)"));
await sleep(1800);

for (const v of [0.0, 0.25, 0.5, 0.75, 1.0]) {
  await page.evaluate((val) => window.__fashionRevealHold && window.__fashionRevealHold(val), v);
  await sleep(600); // let a few frames render at the held level
  const tag = String(Math.round(v * 100)).padStart(3, "0");
  await page.screenshot({ path: `${OUT}/rev_hold_${tag}.png` });
  console.log("shot: rev_hold_", tag);
}

await browser.close();
console.log("done");
