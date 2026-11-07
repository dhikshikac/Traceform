// End-to-end test of the AI pipeline with the mock AI:
// new project → research generated → build everything → review shows AI content, all editable.
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 5197, MOCK = 5196;
const mock = spawn(process.execPath, ["tests/mock-ai.mjs"], { env: { ...process.env, MOCK_PORT: String(MOCK) }, stdio: "ignore" });
const server = spawn(process.execPath, ["server/server.mjs"], { env: { ...process.env, PORT: String(PORT), AI_PROVIDER: "openai", OPENAI_BASE_URL: `http://localhost:${MOCK}/v1` }, stdio: "ignore" });
await new Promise(r => setTimeout(r, 900));
const errors = [], fail = m => { throw new Error(m); };
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", e => errors.push(e.message));
  const prompts = [];
  page.on("request", r => { if (r.url().endsWith("/api/ai") && r.method() === "POST") prompts.push(r.postData() || ""); });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => /AI live/.test(document.querySelector("#aiState")?.textContent || ""));
  if (!(await page.isVisible("#landing"))) fail("landing page should be the first screen");
  console.log("✓ opens on the projects landing page");
  await page.click("#newProj");
  await page.fill("#wzWhat", "an online ordering site for a food co-op");
  await page.selectOption("#wzType", "ecommerce");
  await page.fill("#wzWho", "members over 60, mostly on phones");
  await page.fill("#wzBrief", "Members over 60 order on phones. They care which farm food comes from.");
  await page.fill("#wzAvoid", "a chain supermarket");
  await page.click("#wzNext");
  await page.waitForFunction(() => [...document.querySelectorAll("#themes input")].some(i => i.value === "Mock theme A"), null, { timeout: 15000 });
  console.log("✓ research generated");
  const first = prompts[0] || "";
  for (const want of ["PROJECT TYPE: Online store", "WHO IT'S FOR: members over 60", "DESIGNER'S CONTEXT: Members over 60", "MUST NEVER LOOK OR FEEL LIKE: a chain supermarket"])
    if (!first.includes(want)) fail("prompt is missing: " + want);
  console.log("✓ project type and context are in the AI prompt");
  await page.click("[data-genall]");
  await page.waitForFunction(() => document.querySelector("#stage .site h1")?.textContent === "Mock site headline", null, { timeout: 20000 });
  console.log("✓ inspiration, system and site generated");
  const accent = await page.evaluate(() => S.tokens.find(t => t.k === "color.accent").v);
  if (accent !== "#2F5D50") fail("system tokens not applied: " + accent);
  if (!(await page.evaluate(() => S.directions?.length === 3))) fail("directions missing");
  await page.click('#stage [data-el="hero"]');
  await page.waitForSelector("#ceSave");
  await page.fill('[data-cp="hero.headline"]', "Edited by a person");
  await page.click("#ceSave");
  await page.waitForFunction(() => document.querySelector("#stage .site h1")?.textContent === "Edited by a person");
  console.log("✓ generated content is editable");
} finally { await browser.close(); server.kill(); mock.kill(); }
if (errors.length) { console.error("Page errors:\n" + errors.join("\n")); process.exit(1); }
console.log("✓ pipeline test passed");
