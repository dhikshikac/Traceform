// Smoke test: starts the server, opens the app in headless Chromium, clicks through each page,
// and fails on any uncaught page error. Needs `npx playwright install chromium` once.
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 5199;
const server = spawn(process.execPath, ["server/server.mjs"], { env: { ...process.env, PORT: String(PORT), AI_PROVIDER: "none" }, stdio: "inherit" });
await new Promise(r => setTimeout(r, 800));
const errors = [];
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-open="p-mali"]');
  await page.click('[data-open="p-mali"]');
  for (const v of ["research", "inspiration", "system", "review"]) { await page.click(`[data-v="${v}"]`); await page.waitForTimeout(150); }
  await page.click('[data-v="research"]');
  await page.click('[data-c="c1"]');                       // insight card modal
  await page.waitForSelector("#cmSave");
} finally { await browser.close(); server.kill(); }
if (errors.length) { console.error("Page errors:\n" + errors.join("\n")); process.exit(1); }
console.log("✓ smoke test passed");
