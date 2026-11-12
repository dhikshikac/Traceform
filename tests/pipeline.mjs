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
  await page.selectOption("#wzType", "webapp");
  await page.fill("#wzName", "Mock Co-op");
  await page.fill("#wzWho", "members over 60, mostly on phones");
  await page.fill("#wzBrief", "Members over 60 order on phones. They care which farm food comes from.");
  await page.click("#wzNext");
  await page.waitForFunction(() => [...document.querySelectorAll("#themes input")].some(i => i.value === "Mock theme A"), null, { timeout: 15000 });
  console.log("✓ research generated");
  const first = prompts[0] || "";
  for (const want of ["PROJECT TYPE: Web or desktop application", "WHO IT'S FOR: members over 60", "DESIGNER'S CONTEXT: Members over 60"])
    if (!first.includes(want)) fail("prompt is missing: " + want);
  console.log("✓ project type and context are in the AI prompt");
  // Opening Review builds every stage it rests on, in order, then designs the page.
  await page.click('.navrail [data-v="review"]');
  const frameText = sel => page.evaluate(s => document.querySelector("#designFrame")?.contentDocument?.querySelector(s)?.textContent || "", sel);
  await page.waitForFunction(() => document.querySelector("#designFrame")?.contentDocument?.querySelector(".pg h1")?.textContent === "Mock site headline", null, { timeout: 30000 });
  console.log("✓ inspiration, system and the home page generated");
  const accent = await page.evaluate(() => S.tokens.find(t => t.k === "color.accent").v);
  if (accent !== "#2F5D50") fail("system tokens not applied: " + accent);
  if (!(await page.evaluate(() => S.directions?.length === 3))) fail("directions missing");
  // The Design system page is drawn from what was generated for this project.
  await page.click('.navrail [data-v="system"]');
  let sysText = "";
  for (const sec of ["color", "type", "space", "imagery", "components"]) {
    await page.click(`#secnav [data-s="${sec}"]`);
    sysText += "\n" + await page.textContent("#sysCenter") + "\n" + await page.textContent("#rail-system");
  }
  for (const not of [/som tam/i, /khao soi/i, /Mali/, /pounded/i, /heat pips/i, /dish card/i, /restaurant sites/i, /Order a few/i])
    if (not.test(sysText)) fail("the design system page still shows Mali's Table content: " + not);
  // The AI's estimate for its own choice is shown; nothing is made up for a value it never rated.
  if (await page.evaluate(() => prevFor(T("color.accent"))[1]) !== 9) fail("the AI's estimate for its own choice was not kept");
  await page.evaluate(() => setToken("color.accent", "#000000", "test"));
  if (await page.evaluate(() => prevFor(T("color.accent"))[1]) !== null) fail("an estimate was invented for an edited value");
  await page.evaluate(() => { S.tokens = sysDraft(); save(); renderSystem(); });
  if (await page.evaluate(() => tv("color.accent")) !== "#2F5D50") fail("the generated draft was not kept");
  console.log("✓ the design system page shows no seeded Mali content, and estimates are not invented");
  await page.click('.navrail [data-v="review"]');
  await page.waitForSelector("#designFrame");
  if (!(await page.evaluate(() => !!document.querySelector("#genslot-review .genbar") && !document.querySelector("#stage .genbar")))) fail("the generate bar should be its own row above the page");

  const order = prompts.map(p => /affinity mapping/.test(p) ? "research" : /visual directions/.test(p) ? "inspiration" : /Draft this project's design tokens/.test(p) ? "system" : /WHAT TO MAKE/.test(p) ? "page" : "").filter(Boolean);
  if (order.join(">") !== "research>inspiration>system>page") fail("stages ran out of order: " + order.join(">"));
  const brief = prompts.find(p => /WHAT TO MAKE/.test(p)) || "";
  for (const want of ["Members choose by where food comes from", "var(--accent)        #2F5D50", "Shop the week", "REJECTED ASSUMPTIONS", "Nothing else is a reference"])
    if (!brief.includes(want)) fail("design brief is missing: " + want);
  console.log("✓ the design brief carries the research, the saved inspiration and the generated design system");

  // The design system reaches the page by reference, and anything outside it is corrected.
  const look = () => page.evaluate(() => { const d = document.querySelector("#designFrame").contentDocument, cs = e => d.defaultView.getComputedStyle(d.querySelector(e)); return { cta: cs(".pg .cta").backgroundColor, hero: cs(".pg .hero").backgroundColor, font: cs(".pg .hero").fontFamily, h1: cs(".pg h1").fontSize }; });
  let seen = await look();
  if (seen.cta !== "rgb(47, 93, 80)") fail("accent token not used by the page: " + seen.cta);
  if (/255, 0, 255/.test(seen.hero)) fail("an off-system colour survived: " + seen.hero);
  if (/comic/i.test(seen.font)) fail("an off-system font survived: " + seen.font);
  if (!(await page.evaluate(() => S.design.fixed.colors === 1 && S.design.fixed.fonts === 1))) fail("corrections were not counted");
  await page.evaluate(() => { setToken("color.accent", "#123456", "test"); renderReview(); });
  await page.waitForFunction(() => { const d = document.querySelector("#designFrame")?.contentDocument; return d && d.querySelector(".pg .cta") && d.defaultView.getComputedStyle(d.querySelector(".pg .cta")).backgroundColor === "rgb(18, 52, 86)"; }, null, { timeout: 5000 });
  console.log("✓ the page uses the design tokens, off-system values are corrected, and a token edit restyles it");

  // Section records follow the page, and what they cite is checked against the project.
  const rec = await page.evaluate(() => ({ ids: S.design.sections.map(s => s.id), uses: sectionUses(S.design.sections[0]), cov: designCoverage() }));
  if (rec.ids.join(",") !== "hero,extra") fail("section records don't match the page: " + rec.ids);
  if (rec.uses.cards.length !== 1 || rec.uses.refs.length !== 0) fail("invented citations were not dropped: " + JSON.stringify(rec.uses));
  if (rec.cov.research.used.length !== 1 || rec.cov.research.total !== 2) fail("research coverage is wrong");
  if (!(await page.textContent("#rail-review")).includes("1 of 2 insights")) fail("the rail doesn't show what the page was built from");
  if (!(await page.textContent("#rail-review")).includes("AI alone")) fail("an ungrounded section isn't flagged");
  console.log("✓ decision records are checked against the research, inspiration and tokens");

  // Selecting a section must not rebuild the frame.
  await page.evaluate(() => { document.querySelector("#designFrame").dataset.same = "1"; });
  await page.frameLocator("#designFrame").locator('[data-tf="hero"]').click({ position: { x: 5, y: 40 } });
  await page.waitForSelector('#rail-review .secpanel[data-secpanel="hero"]');
  if (!(await page.evaluate(() => document.querySelector("#designFrame").dataset.same === "1"))) fail("selecting a section reloaded the page");
  if (await frameText(".pg h1") !== "Mock site headline") fail("frame lost its content");
  // With a section selected the panel is about that section and nothing else.
  const focused = await page.textContent("#rail-review");
  if (focused.includes("Built from") || focused.includes("Second section")) fail("the section panel still shows the overview");
  if (!focused.includes("Prompt this part") || !focused.includes("Farm named in the headline")) fail("the section panel is missing its record");
  await page.click("#secNext");
  await page.waitForSelector('#rail-review .secpanel[data-secpanel="extra"]');
  await page.click("#secBack");
  await page.waitForFunction(() => /Built from/.test(document.querySelector("#rail-review").textContent) && !document.querySelector("#rail-review .secpanel"));
  if (await page.evaluate(() => !!S.sel)) fail("going back did not clear the selection");
  console.log("✓ selecting a section swaps the overview for that section's panel, without reloading the page");

  // Changing the research afterwards is noticed.
  await page.evaluate(() => { S.themes[0].cards[0].text = "Changed after the page was designed."; select(null); renderReview(); });
  if (!(await page.textContent("#rail-review")).includes("research has changed")) fail("stale design not flagged");
  console.log("✓ a design that has fallen behind its research says so");

  // The audit is axe-core run on the page in the frame: nothing in it is canned.
  await page.click('#rail-review [data-rt="audit"]');
  await page.waitForFunction(() => axView(dzFrameKey).state !== "pending" && dzReflow && dzReflow.state !== "pending", null, { timeout: 30000 });
  const ax = await page.evaluate(() => { const v = axView(dzFrameKey); return { state: v.state, error: v.error, version: v.version, fails: (v.fails || []).map(x => x.rule), passes: (v.passes || []).length }; });
  if (ax.state !== "done") fail("axe did not run: " + ax.error);
  if (!/^\d+\.\d+/.test(ax.version || "")) fail("no axe version reported");
  if (!ax.fails.includes("image-alt")) fail("axe should report the image with no alt text: " + ax.fails);
  if (ax.passes < 5) fail("axe reported too few passing rules: " + ax.passes);
  const auditText = await page.textContent("#rail-review");
  for (const want of ["axe-core " + ax.version, "An image has no text description", "Why it matters", "How to fix", "Images must have alternative text", "1.1.1", "checks pass", "fits a small phone screen"])
    if (!auditText.includes(want)) fail("audit is missing: " + want);
  for (const gone of ["More accessible than", "WCAG score", "placeholder"])
    if (auditText.includes(gone)) fail("the audit still shows seeded content: " + gone);
  await page.click('#rail-review [data-axshow="hero"]');
  await page.waitForSelector('#rail-review .secpanel[data-secpanel="hero"]');
  console.log("✓ the audit is axe-core " + ax.version + " run on the designed page, and points at the section to fix");

  // History carries the page design: regenerate, then restore the one before.
  const firstAt = await page.evaluate(() => S.design.at);
  await page.evaluate(() => generateFrom("site"));
  await page.waitForFunction(at => S.design.at !== at && !gen().busy, firstAt, { timeout: 20000 });
  await page.click('#rail-review [data-rt="history"]');
  const idx = await page.evaluate(() => S.history.map(h => h.what).lastIndexOf("before AI generated site"));
  if (idx < 0) fail("regenerating did not create a version");
  if (idx < 1) fail("no version to go back to");
  // Entry idx holds the state just before the regenerate, so the version before it shows the first design.
  await page.click(`#rail-review [data-ver="${idx - 1}"]`);
  await page.waitForSelector("#designPreview");
  await page.waitForFunction(() => document.querySelector("#designPreview")?.contentDocument?.querySelector(".pg h1")?.textContent === "Mock site headline");
  await page.click("#vbBack");
  await page.waitForSelector("#designFrame");
  await page.click(`#rail-review [data-restore="${idx - 1}"]`);
  if (await page.evaluate(() => S.design.at) !== firstAt) fail("the earlier design could not be restored");
  await page.waitForFunction(() => document.querySelector("#designFrame")?.contentDocument?.querySelector(".pg h1")?.textContent === "Mock site headline");
  console.log("✓ version history previews and restores earlier page designs");

  // Prompt one section: a question changes nothing, a request rewrites only that section.
  await page.click('#rail-review [data-rt="panel"]');
  await page.evaluate(() => { select(null); renderReviewRail(); });
  await page.click('#rail-review [data-sec="hero"]');
  await page.waitForSelector("#spForm");
  const beforeAt = await page.evaluate(() => S.design.at);
  await page.fill("#spIn", "why this?");
  await page.press("#spIn", "Enter");
  await page.waitForFunction(() => /Because members choose by farm/.test(document.querySelector("#spOut")?.textContent || ""), null, { timeout: 8000 });
  if (await page.evaluate(() => S.design.at) !== beforeAt) fail("a question changed the page");
  await page.fill("#spIn", "make the headline shorter");
  await page.press("#spIn", "Enter");
  await page.waitForFunction(() => document.querySelector("#designFrame")?.contentDocument?.querySelector(".pg h1")?.textContent === "Edited by prompt", null, { timeout: 8000 });
  const ed = await page.evaluate(() => { const d = document.querySelector("#designFrame").contentDocument; return { ids: S.design.sections.map(s => s.id), tf: [...d.querySelectorAll("[data-tf]")].map(e => e.getAttribute("data-tf")), second: !!d.querySelector('[data-tf="extra"]'), h1: d.defaultView.getComputedStyle(d.querySelector(".pg h1")).color, rec: S.design.sections[0], ver: S.history[S.history.length - 1].what }; });
  if (ed.ids.join(",") !== "hero,extra" || ed.tf.join(",") !== "hero,extra" || !ed.second) fail("the edit touched more than its section: " + JSON.stringify(ed.tf));
  if (/0, 255, 0/.test(ed.h1)) fail("an edit escaped the design system: " + ed.h1);
  if (!ed.rec.edited || !/designer's call/.test(ed.rec.receipt)) fail("the decision record was not updated");
  if (!/edited section/.test(ed.ver)) fail("the edit is not a version");
  if (!(await page.textContent('#rail-review .secpanel[data-secpanel="hero"]')).includes("Edited")) fail("the section is not marked as edited");
  await page.click("[data-spundo]");
  await page.waitForFunction(() => document.querySelector("#designFrame")?.contentDocument?.querySelector(".pg h1")?.textContent === "Mock site headline", null, { timeout: 8000 });
  console.log("✓ a section can be questioned, rewritten by prompt within the design system, and undone");
} finally { await browser.close(); server.kill(); mock.kill(); }
if (errors.length) { console.error("Page errors:\n" + errors.join("\n")); process.exit(1); }
console.log("✓ pipeline test passed");
