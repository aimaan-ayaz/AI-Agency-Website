// Verify the revision: thin tee + fixed collar, large central default print,
// shrunk UI, and the reworked MOBILE layout (prompt top, name-left + half buy).
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

async function shot(name, q, { w = 1200, h = 1200, mobile = false } = {}) {
  await page.setViewport({
    width: w,
    height: h,
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: mobile ? 2 : 1,
  });
  await page.goto(`${BASE}?${q}`, { waitUntil: "networkidle2", timeout: 60000 });
  await page
    .waitForFunction(() => window.__fashionReady === true, { timeout: 30000 })
    .catch(() => console.log("  (ready timeout)", name));
  await sleep(1800);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("shot:", name);
  return page;
}

// ── desktop ──
await shot("v2_d_tq", "cw=Black&view=tq");
await shot("v2_d_front", "cw=White&view=front"); // collar / no-logo check
await shot("v2_d_frontfull", "cw=Black&zone=front_full&view=front"); // default print coverage
await shot("v2_d_demo", "cw=Black&view=front&demo=front_full"); // a real print

// ── mobile (iPhone-ish 390×844) ──
await shot("v2_m_empty", "cw=Black&view=tq", { w: 390, h: 844, mobile: true });
await shot("v2_m_withdesign", "cw=Black&view=front&demo=front_full", {
  w: 390,
  h: 844,
  mobile: true,
});

// mobile buy-now modal
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(
    (x) => x.textContent.trim().toLowerCase() === "buy now"
  );
  if (b) b.click();
});
await sleep(600);
await page.screenshot({ path: `${OUT}/v2_m_buynow.png` });
console.log("shot: v2_m_buynow");

await browser.close();
console.log("done");
