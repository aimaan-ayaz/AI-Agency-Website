// Verify prompt-text legibility over the tee (scrim) + 2 example chips on one row.
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
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("  [pageerror]", e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.log("  [console.error]", m.text());
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(name, w, h, mobile) {
  await page.setViewport({
    width: w,
    height: h,
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: mobile ? 2 : 1,
  });
  await page.goto(`${BASE}?cw=Black&view=front`, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await page
    .waitForFunction(() => window.__fashionReady === true, { timeout: 30000 })
    .catch(() => console.log("  (ready timeout)", name));
  await sleep(1800);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("shot:", name);
}

await shot("c_desktop", 1440, 900, false);
await shot("c_iphonese", 375, 667, true);

await browser.close();
console.log("done");
