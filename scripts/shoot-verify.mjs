// Verification harness for the latest batch: no chest logo, thicker tee,
// whole-tee bottom-up reveal sweep, and the Buy-Now "opening soon" modal.
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000/fashion";
const OUT = "shots";
const W = 1200,
  H = 1200;

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
  if (m.type() === "error") console.log("  [console.error]", m.text());
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function load(q) {
  await page.goto(`${BASE}?${q}`, { waitUntil: "networkidle2", timeout: 60000 });
  await page
    .waitForFunction(() => window.__fashionReady === true, { timeout: 30000 })
    .catch(() => console.log("  (ready flag timeout)"));
  await sleep(1800);
}

// 1) default load — chest should have NO logo, shirt fuller/thicker
await load("cw=Black&view=tq");
await page.screenshot({ path: `${OUT}/v_default_tq.png` });
console.log("shot: v_default_tq");

await load("cw=Black&view=front");
await page.screenshot({ path: `${OUT}/v_default_front.png` });
console.log("shot: v_default_front (verify no chest logo)");

await load("cw=White&view=left");
await page.screenshot({ path: `${OUT}/v_default_left_edge.png` });
console.log("shot: v_default_left_edge (verify edges)");

// 2) whole-tee bottom-up reveal — seed a design, trigger the sweep, capture frames
await load("cw=Black&view=front&demo=front_full");
await page.evaluate(() => window.__fashionReveal && window.__fashionReveal());
await sleep(120);
await page.screenshot({ path: `${OUT}/v_reveal_t120.png` });
await sleep(150);
await page.screenshot({ path: `${OUT}/v_reveal_t270.png` });
await sleep(200);
await page.screenshot({ path: `${OUT}/v_reveal_t470.png` });
await sleep(700);
await page.screenshot({ path: `${OUT}/v_reveal_done.png` });
console.log("shot: v_reveal_* (bottom-up sweep frames)");

// 3) Buy-Now modal
await load("cw=Black&view=tq");
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(
    (x) => x.textContent.trim().toLowerCase() === "buy now"
  );
  if (b) b.click();
});
await sleep(600);
await page.screenshot({ path: `${OUT}/v_buynow_modal.png` });
console.log("shot: v_buynow_modal");

await browser.close();
console.log("done →", OUT);
