// End-to-end: type a prompt → Gemini → FLUX → trim → printed on the tee.
// Verifies the WHOLE pipeline and the new larger/centred default print.
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

await page.goto(`${BASE}?cw=Black&view=front`, {
  waitUntil: "networkidle2",
  timeout: 60000,
});
await page
  .waitForFunction(() => window.__fashionReady === true, { timeout: 30000 })
  .catch(() => console.log("  (ready timeout)"));
await sleep(1500);

// type a prompt and submit
await page.click('input[placeholder^="Describe"]');
await page.type('input[placeholder^="Describe"]', "a snarling wolf");
await page.keyboard.press("Enter");
console.log("submitted prompt: a snarling wolf");

// wait for the print to land (design count > 0), up to 70s
const ok = await page
  .waitForFunction(() => (window.__fashionDesignCount ?? 0) > 0, {
    timeout: 70000,
    polling: 800,
  })
  .then(() => true)
  .catch(() => false);
console.log("design landed:", ok);

await sleep(2500); // let the reveal sweep finish
await page.screenshot({ path: `${OUT}/e2e_wolf_front.png` });
console.log("shot: e2e_wolf_front");

// orbit to three-quarter to confirm it sits on the front and reads woven-in
await page.goto(`${BASE}?cw=Black&view=tq`, { waitUntil: "networkidle2" });
await sleep(2500);
await page.screenshot({ path: `${OUT}/e2e_wolf_tq.png` });
console.log("shot: e2e_wolf_tq (note: fresh load has no design — front shot is the proof)");

await browser.close();
console.log("done");
