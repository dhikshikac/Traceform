/* Accessibility audit.

   The Audit tab used to be written by hand: a list of criteria where several
   lines were always "pass" whatever the page looked like, three were switches a
   Fix button flipped, and the headline compared the score with 1,200 sites that
   did not exist. None of that was a measurement.

   It is now axe-core (Deque's open-source engine, the one behind Lighthouse and
   most accessibility tooling) run on the page that is being previewed. Every
   line in the tab is a rule axe evaluated against the rendered DOM: failures,
   passes, and the cases it could not decide and leaves for a person.

   The page is audited in a copy, inside a frame that may run scripts but has no
   access to the app (sandbox without allow-same-origin), so the preview itself
   stays script-free. Results come back by postMessage.

   NOTE: render-path code here uses function declarations and value-less vars
   only; see the note at the top of 75-design-page.js. */
var axSrc, axState, axLegacyKey;   // axState = {key, state: "pending" | "done" | "error", res, error}

async function axSource() {
  if (axSrc) return axSrc;
  // dist/ ships a copy in vendor/; the dev server serves the installed package.
  for (const u of ["vendor/axe.min.js", "node_modules/axe-core/axe.min.js"]) {
    try {
      const r = await fetch(u);
      if (!r.ok) continue;
      const t = await r.text();
      if (t.length > 100000 && /axe/i.test(t.slice(0, 4000))) { axSrc = t; return t; }
    } catch { }
  }
  throw new Error("The accessibility checker (axe-core) could not be loaded. Run npm install.");
}

/* Runs inside the audit frame. Kept as a function so it is checked as code,
   then stringified into the frame. */
function axInFrame(id) {
  var send = function (m) { m.tfAxe = id; parent.postMessage(m, "*"); };
  var slim = function (list, withNodes) {
    return list.map(function (x) {
      return {
        id: x.id, impact: x.impact, help: x.help, helpUrl: x.helpUrl, tags: x.tags, count: x.nodes.length,
        nodes: !withNodes ? [] : x.nodes.slice(0, 8).map(function (n) {
          var c = (n.any || []).concat(n.all || [], n.none || []).filter(function (k) { return k.data && k.data.fgColor; })[0];
          var msg = (n.any || []).concat(n.all || [], n.none || []).map(function (k) { return k.message; }).filter(Boolean)[0];
          var el = null; try { el = document.querySelector(n.target[n.target.length - 1]); } catch (e) { }
          return {
            text: el ? String(el.innerText || el.getAttribute("alt") || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 80) : "",
            target: (n.target || []).map(String), html: String(n.html || "").slice(0, 160),
            why: String(n.failureSummary || msg || "").slice(0, 400),
            data: c ? { fg: c.data.fgColor, bg: c.data.bgColor, ratio: c.data.contrastRatio, need: c.data.expectedContrastRatio } : null
          };
        })
      };
    });
  };
  var go = function () {
    axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } })
      .then(function (r) {
        var b = document.body.getBoundingClientRect();
        // Any page with words on it gives the contrast rule something to test. If that
        // rule found nothing to look at, the page was not really drawn.
        var saw = function (list) { return list.some(function (x) { return x.id === "color-contrast"; }); };
        var words = String(document.body.innerText || "").replace(/\s+/g, "").length > 0;
        var drawn = b.width > 0 && b.height > 0 && (!words || saw(r.violations) || saw(r.passes) || saw(r.incomplete));
        send({ ok: true, laidOut: drawn, version: axe.version, violations: slim(r.violations, true), incomplete: slim(r.incomplete, true), passes: slim(r.passes, false), inapplicable: (r.inapplicable || []).length });
      })
      .catch(function (e) { send({ ok: false, error: String((e && e.message) || e) }); });
  };
  // A frame callback only fires once the page is really being drawn.
  var start = function () {
    var ran = false, once = function () { if (!ran) { ran = true; setTimeout(go, 100); } };
    if (window.requestAnimationFrame) requestAnimationFrame(function () { requestAnimationFrame(once); });
    setTimeout(once, 2500);
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start, start); else start();
}

/* Audit a full HTML document (as a string). One audit is kept at a time, keyed
   by the document, so asking again for the same page costs nothing. */
function axRun(key) {
  if (!key || (axState && axState.key === key)) return;
  const st = axState = { key, state: "pending", tries: 0 };
  const settle = (state, extra) => {
    if (st.state !== "pending") return;
    Object.assign(st, { state }, extra);
    // Not while a section's prompt box is open: a redraw would wipe what is being typed.
    if (axState === st && S.view === "review" && (S.reviewTab === "audit" || !(S.sel && S.sel.kind === "sec"))) renderReviewRail();
  };
  /* A browser only lays a page out while its tab is actually being shown. In a
     background tab the copy below would have no size, axe would find nothing to
     measure, and the page would look cleaner than it is. So the audit waits for
     a frame to be drawn before it starts, and a result from a copy that was not
     drawn is thrown away and asked for again - never reported. */
  const whenDrawn = fn => requestAnimationFrame(() => fn());
  const launch = src => {
    if (axState !== st || st.state !== "pending") return;
    st.tries++;
    const id = "ax" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const f = document.createElement("iframe");
    f.setAttribute("sandbox", "allow-scripts"); f.setAttribute("aria-hidden", "true"); f.tabIndex = -1; f.title = "Accessibility audit";
    // Inside the viewport but invisible: browsers also stop laying out an
    // off-screen frame from another origin, which this one deliberately is.
    f.style.cssText = "position:fixed;left:0;top:0;width:1280px;height:900px;border:0;opacity:0;pointer-events:none;z-index:-1";
    const runner = `<script>${src.replace(/<\/script/gi, "<\\/script")}</` + `script><script>(${axInFrame.toString()})(${JSON.stringify(id)})</` + `script>`;
    const at = key.toLowerCase().lastIndexOf("</body>");
    const done = () => { window.removeEventListener("message", onMsg); clearTimeout(timer); f.remove(); };
    const again = why => { done(); if (st.tries < 4) whenDrawn(() => setTimeout(() => launch(src), 400)); else settle("error", { error: why }); };
    const onMsg = ev => {
      const m = ev.data;
      if (!m || m.tfAxe !== id || ev.source !== f.contentWindow) return;
      if (m.ok && m.laidOut === false) return again("The browser did not draw the page for the checker, so nothing could be measured. Keep this tab in view and reload.");
      done();
      if (m.ok) settle("done", { res: m }); else settle("error", { error: m.error || "The checker failed on this page." });
    };
    const timer = setTimeout(() => again("The checker timed out on this page."), 30000);
    window.addEventListener("message", onMsg);
    f.srcdoc = at >= 0 ? key.slice(0, at) + runner + key.slice(at) : key + runner;
    document.body.appendChild(f);
  };
  axSource().then(src => whenDrawn(() => launch(src))).catch(e => settle("error", { error: e.message || "The checker could not be loaded." }));
}

/* "wcag143" -> "1.4.3". Rules with no success criterion are best practices. */
function axSC(tags) {
  return (tags || []).map(t => { const m = /^wcag(\d)(\d)(\d{1,2})$/.exec(t); return m ? `${m[1]}.${m[2]}.${m[3]}` : null; }).filter(Boolean);
}
function axView(key) {
  const st = axState && axState.key === key ? axState : null;
  if (!st || st.state === "pending") return { state: "pending" };
  if (st.state === "error") return { state: "error", error: st.error };
  const r = st.res;
  const mk = kind => x => { const sc = axSC(x.tags); return { rule: x.id, kind, impact: x.impact || "", name: x.help, url: x.helpUrl, sc, p: sc.length ? ({ 1: "P", 2: "O", 3: "U", 4: "R" })[sc[0][0]] || "B" : "B", count: x.count, nodes: x.nodes || [] }; };
  const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const fails = (r.violations || []).map(mk("fail")).sort((a, b) => (order[a.impact] ?? 4) - (order[b.impact] ?? 4));
  const reviews = (r.incomplete || []).map(mk("review"));
  const passes = (r.passes || []).map(mk("pass"));
  return { state: "done", version: r.version, fails, reviews, passes, inapplicable: r.inapplicable || 0 };
}
/* How many problems, or null while the audit is still running. */
function axFailCount(key, extra) {
  const v = axView(key); if (v.state !== "done") return null;
  return v.fails.length + (extra || []).filter(x => !x.ok && !x.pending).length;
}

/* A contrast failure whose colours are simply two design tokens is fixed at the
   token, so the design system and the page stay the same thing. */
function axTokenFix(item) {
  if (item.rule !== "color-contrast") return null;
  const eq = (a, b) => String(a || "").toLowerCase() === String(b || "").toLowerCase();
  const g = tv("color.ground"), on = typeof designTokens === "function" ? designTokens().onAccent : "#ffffff";
  for (const n of item.nodes) {
    const d = n.data; if (!d) continue;
    if (eq(d.bg, g)) { if (eq(d.fg, tv("color.heat"))) return "signal"; if (eq(d.fg, tv("color.accent"))) return "accenttext"; if (eq(d.fg, tv("color.ink"))) return "ink"; }
    // Button text is white or near it (a faded white still reads as white to the checker).
    const pale = /^#[0-9a-f]{6}$/i.test(d.fg || "") && hexToRgb(d.fg).every(c => c >= 235);
    if (eq(d.bg, tv("color.accent")) && (eq(d.fg, on) || pale)) return "onaccent";
  }
  return null;
}
function axApplyFix(f) {
  const g = tv("color.ground");
  const darken = (k, min, test) => { let c = tv(k), n = 0; while (test(c) < min && n < 40) { c = shade(c, -6); n++; } if (c !== tv(k)) setToken(k, c, "darkened to pass WCAG contrast"); };
  if (f === "ink") darken("color.ink", 4.5, c => ratio(c, g));
  else if (f === "signal") darken("color.heat", 4.5, c => ratio(c, g));
  else if (f === "accenttext") darken("color.accent", 4.5, c => ratio(c, g));
  else if (f === "onaccent") darken("color.accent", 4.5, c => ratio("#ffffff", c));
}

/* Plain-language versions of the rules a generated page most often trips.
   axe's own wording is written for accessibility specialists ("Elements must
   meet minimum color contrast ratio thresholds"); a designer new to this needs
   to know what is wrong, who it affects and what to do. Rules not listed here
   fall back to axe's wording, which is always available under Technical details.
     t = what is wrong (or, once it passes, what is right)   ok = the passing line
     who = who it affects   fix = what to do */
function axPlain(rule) {
  return ({
    "color-contrast": { t: "Some text is hard to read against its background", ok: "Text stands out clearly from its background", who: "People with low vision, and anyone reading on a phone in bright light, may not be able to read it.", fix: "Make the text darker or its background lighter until the contrast is high enough." },
    "link-in-text-block": { t: "Links look the same as the text around them", ok: "Links can be told apart from the text around them", who: "People who can't tell the link colour from the text colour won't know it is a link.", fix: "Underline links, or give them a clearly different colour." },
    "image-alt": { t: "An image has no text description", ok: "Every image has a text description", who: "People using a screen reader hear nothing for this image, so they miss what it shows.", fix: "Add a short description of what the image shows (its alt text)." },
    "role-img-alt": { t: "A picture has no text description", ok: "Pictures have text descriptions", who: "People using a screen reader miss what the picture shows.", fix: "Add a short description of what the picture shows." },
    "landmark-one-main": { t: "The page doesn't mark where its main content is", ok: "The page marks where its main content is", who: "People using a screen reader can't jump straight to the content and must listen through the header every time.", fix: "Wrap the main content of the page in a <main> element." },
    "region": { t: "Some content sits outside the page's named areas", ok: "All content sits inside a named area of the page", who: "Screen readers let people jump between areas such as header, main and footer. Content outside them is easy to miss.", fix: "Put the top bar in <header>, the content in <main> and the closing part in <footer>." },
    "page-has-heading-one": { t: "The page has no main heading", ok: "The page has a main heading", who: "People using a screen reader rely on the main heading to know what the page is about.", fix: "Make the most important title on the page an <h1>." },
    "heading-order": { t: "Headings skip a level", ok: "Headings go in order, with none skipped", who: "Screen-reader users move through a page by its headings. A skipped level makes it sound like a part is missing.", fix: "Use headings in order: h1, then h2, then h3, without jumping over one." },
    "empty-heading": { t: "A heading is empty", ok: "No headings are empty", who: "A screen reader announces a heading and then says nothing.", fix: "Give the heading text, or remove it." },
    "button-name": { t: "A button has no label", ok: "Every button has a label", who: "A screen reader just says “button”, so people can't tell what it does.", fix: "Give the button visible text, or a label that says what it does." },
    "link-name": { t: "A link has no label", ok: "Every link has a label", who: "A screen reader just says “link”, so people can't tell where it goes.", fix: "Give the link text that says where it leads." },
    "label": { t: "A form field has no label", ok: "Every form field has a label", who: "People using a screen reader don't know what to type into it.", fix: "Add a visible label that says what the field is for." },
    "select-name": { t: "A dropdown has no label", ok: "Every dropdown has a label", who: "People using a screen reader don't know what they are choosing.", fix: "Add a visible label for the dropdown." },
    "target-size": { t: "Something is too small to tap easily", ok: "Buttons and links are big enough to tap", who: "People with limited hand control, or anyone on a phone, will miss it or hit the wrong thing.", fix: "Make it at least 24 by 24 pixels, or add space around it." },
    "document-title": { t: "The page has no title", ok: "The page has a title", who: "The title is the first thing a screen reader says, and it names the browser tab.", fix: "Give the page a title." },
    "html-has-lang": { t: "The page doesn't say what language it is in", ok: "The page says what language it is in", who: "Screen readers use this to pick the right pronunciation.", fix: "Set the page's language." },
    "html-lang-valid": { t: "The page's language setting isn't valid", ok: "The page's language setting is valid", who: "Screen readers use this to pick the right pronunciation.", fix: "Use a real language code, such as “en”." },
    "meta-viewport": { t: "The page stops people zooming in", ok: "People can zoom in on the page", who: "People with low vision zoom in to read. Blocking zoom locks them out.", fix: "Allow zooming." },
    "list": { t: "A list is built incorrectly", ok: "Lists are built correctly", who: "Screen readers announce how many items a list has; a broken list gives the wrong count.", fix: "Put only list items directly inside a list." },
    "listitem": { t: "A list item isn't inside a list", ok: "List items are inside lists", who: "A screen reader won't announce it as part of a list.", fix: "Put the item inside a <ul> or <ol>." },
    "nested-interactive": { t: "A button or link is inside another one", ok: "No button or link is inside another", who: "Keyboard and screen-reader users can't reach the inner one reliably.", fix: "Separate them so neither contains the other." },
    "duplicate-id-aria": { t: "Two parts of the page share the same ID", ok: "IDs used for labelling are unique", who: "A screen reader may read the wrong label.", fix: "Give each one a different ID." },
    "scrollable-region-focusable": { t: "A scrolling area can't be reached by keyboard", ok: "Scrolling areas can be reached by keyboard", who: "People who don't use a mouse can't scroll it.", fix: "Make the scrolling area focusable." },
    "aria-allowed-attr": { t: "An accessibility attribute is used where it isn't allowed", ok: "Accessibility attributes are used where they are allowed", who: "Assistive technology may ignore it or describe the element wrongly.", fix: "Remove the attribute, or use the right element for the job." },
    "aria-prohibited-attr": { t: "An accessibility label is on an element that can't have one", ok: "Accessibility labels are only on elements that can have them", who: "A screen reader will ignore the label.", fix: "Use a real button or link, or move the label to one." },
    "aria-required-attr": { t: "An accessibility role is missing a required setting", ok: "Accessibility roles have their required settings", who: "Assistive technology can't describe the element properly.", fix: "Add the missing setting, or use a standard element instead." },
    "aria-valid-attr-value": { t: "An accessibility attribute has a value that isn't valid", ok: "Accessibility attributes have valid values", who: "Assistive technology may ignore it.", fix: "Correct the value." },
    "landmark-unique": { t: "Two areas of the page have the same name", ok: "Each named area of the page is distinct", who: "Screen-reader users can't tell the two apart when jumping between areas.", fix: "Give each area its own label." },
    "landmark-no-duplicate-banner": { t: "The page has more than one header area", ok: "The page has a single header area", who: "Screen-reader users can't tell which is the real page header.", fix: "Keep one <header> for the whole page." },
    "landmark-no-duplicate-contentinfo": { t: "The page has more than one footer area", ok: "The page has a single footer area", who: "Screen-reader users can't tell which is the real page footer.", fix: "Keep one <footer> for the whole page." },
    "landmark-no-duplicate-main": { t: "The page has more than one main area", ok: "The page has a single main area", who: "Screen-reader users can't tell where the main content is.", fix: "Keep one <main> for the whole page." },
    "bypass": { t: "There's no way to skip past the top of the page", ok: "People can skip past the top of the page", who: "Keyboard users must tab through every header link on every page.", fix: "Add headings and a <main> area so people can jump to the content." },
  })[rule] || null;
}
/* axe's four impact levels, in words that say what they mean for a person. */
function axImpact(k) { return ({ critical: ["Blocks some people", "e"], serious: ["Hard for some people", "e"], moderate: ["Gets in the way", "w"], minor: ["Small issue", ""] })[k] || null; }

/* The Audit tab.
     key     the audited document
     where   node selector -> id of the part of the page to show, or null
     extra   checks axe has no rule for, measured by Traceform and labelled so:
             [{sc, name, plain, who, fix, ok, pending, t}] */
function axTabHTML(key, where, extra) {
  const v = axView(key); extra = extra || [];
  if (v.state === "pending") return `<div class="rempty" style="padding:var(--sp-6) var(--sp-2)"><span class="spin" aria-hidden="true"></span><div class="title-s">Checking accessibility…</div><div class="body-s osv">Testing the page the way a screen reader, a keyboard and low vision would meet it.</div></div>`;
  if (v.state === "error") return `<div class="card err"><div class="title-s">The check could not run</div><div class="body-s osv" style="margin-top:var(--sp-1)">${esc(v.error || "")}</div></div><div class="note">Nothing is shown here unless it was actually measured.</div>`;
  const xf = extra.filter(x => !x.ok && !x.pending), xp = extra.filter(x => x.ok && !x.pending);
  const nFail = v.fails.length + xf.length, nPass = v.passes.length + xp.length, total = nFail + nPass;
  const share = total ? Math.round(100 * nPass / total) : 100;
  const col = !nFail ? "var(--ok)" : v.fails.some(x => x.impact === "critical" || x.impact === "serious") || xf.length ? "var(--error)" : "var(--warn)";
  const hex = c => /^#[0-9a-f]{3,8}$/i.test(String(c || "")) ? c : null;
  const quote = t => { t = String(t || "").replace(/\s+/g, " ").trim(); return t ? "“" + (t.length > 44 ? t.slice(0, 43) + "…" : t) + "”" : ""; };
  const head = `<div class="card high"><div class="score"><div class="big" style="background:conic-gradient(${col} ${share * 3.6}deg,var(--surface-container-highest) 0)"><span><b>${nPass}/${total}</b><small>checks pass</small></span></div>
    <div style="flex:1;min-width:170px"><div class="title-m">${nFail ? `${nFail} thing${nFail === 1 ? "" : "s"} to fix` : "Nothing to fix"}</div>
    <div class="body-s osv">${nFail ? "These would make the page harder or impossible for some people to use." : "The automated checks found no accessibility problems."}${v.reviews.length ? ` ${v.reviews.length} more need${v.reviews.length === 1 ? "s" : ""} a person to look.` : ""}</div></div></div>
    <details class="axabout"><summary>How is this checked?</summary><div class="body-s osv">A real accessibility checker (axe-core ${esc(v.version || "")}) tests the page exactly as it is drawn in the preview. It follows WCAG 2.2 level AA, the accessibility standard most organisations are required to meet. Nothing here is an estimate. Automated checks catch only part of the standard: using the page with a keyboard, listening to it with a screen reader, and judging whether the wording makes sense still need a person.</div></details></div>`;

  /* One problem, laid out as: what is wrong, who it affects, where, how to fix. */
  const item = it => {
    const pl = axPlain(it.rule); const n0 = it.nodes[0] || {};
    const fix = it.kind === "fail" ? axTokenFix(it) : null;
    const sec = where ? it.nodes.map(n => where(n.target[n.target.length - 1])).find(Boolean) : null;
    const imp = it.kind === "fail" ? axImpact(it.impact) : null;
    const d = it.nodes.map(n => n.data).find(x => x && hex(x.fg) && hex(x.bg));
    const need = d ? String(d.need || "4.5:1").replace(/:1$/, "") : "";
    const demo = d ? `<div class="axdemo"><span class="axsample" style="color:${hex(d.fg)};background:${hex(d.bg)}">Sample text</span><span class="body-s">Contrast is <b>${esc(String(d.ratio))} to 1</b>.<br>It needs at least <b>${esc(need)} to 1</b>.</span></div>` : "";
    const eg = it.nodes.map(n => quote(n.text)).filter(Boolean)[0];
    const places = `${it.count} place${it.count === 1 ? "" : "s"}${eg ? `, for example ${esc(eg)}` : ""}`;
    const raw = String(n0.why || "").replace(/^Fix (any|all) of the following:\s*/i, "").split("\n").map(x => x.trim()).filter(Boolean).join(" ");
    const review = it.kind === "review";
    return `<div class="axitem ${it.kind}">
      <div class="axhd"><span class="ms ${review ? "warn-t" : "bad-t"}">${review ? "help" : "error"}</span><span class="axtitle">${esc(review ? (pl ? pl.t.replace(/^Some text is/, "Some text may be") : it.name) : pl ? pl.t : it.name)}</span></div>
      ${imp ? `<span class="badge ${imp[1]}" style="align-self:flex-start">${imp[0]}</span>` : ""}
      ${review ? `<div class="body-s">The checker couldn't tell on its own, usually because the text sits on a photo or a gradient. Have a look yourself.</div>` : ""}
      ${pl ? `<div class="body-s"><b>Why it matters:</b> ${esc(pl.who)}</div>` : ""}
      ${demo}
      <div class="body-s"><b>Where:</b> ${places}.</div>
      ${pl && !review ? `<div class="body-s"><b>How to fix:</b> ${esc(pl.fix)}${fix ? " Traceform can do this by adjusting the colour in your design system." : ""}</div>` : ""}
      <div class="row axacts">${fix ? `<button class="btn tonal sm" data-axfix="${fix}"><span class="ms">auto_fix_high</span>Fix it for me</button>` : ""}${sec ? `<button class="btn ${fix ? "text" : "tonal"} sm" data-axshow="${esc(sec)}"><span class="ms">my_location</span>Show on page</button>` : ""}${it.url ? `<a class="axlink" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">Learn more<span class="ms" style="font-size:13px;vertical-align:-2px;margin-left:var(--sp-0)">open_in_new</span></a>` : ""}</div>
      <details class="axtech"><summary>Technical details</summary><div class="body-s osv">${it.sc.length ? `WCAG ${esc(it.sc.join(", "))} · ` : "Best practice · "}rule <span class="mono">${esc(it.rule)}</span><br>${esc(it.name)}${raw ? `<br>${esc(raw)}` : ""}</div>${n0.html ? `<code class="axnode">${esc(n0.html)}</code>` : ""}</details>
    </div>`;
  };
  const passLine = it => { const pl = axPlain(it.rule); return `<div class="axok"><span class="ms ok-t">check_circle</span><span>${esc(pl ? pl.ok : it.name)}</span></div>`; };
  const xItem = x => x.pending
    ? `<div class="axok"><span class="ms osv">hourglass_empty</span><span>${esc(x.t)}</span></div>`
    : `<div class="axitem fail"><div class="axhd"><span class="ms bad-t">error</span><span class="axtitle">${esc(x.plain || x.name)}</span></div><span class="badge e" style="align-self:flex-start">Hard for some people</span>${x.who ? `<div class="body-s"><b>Why it matters:</b> ${esc(x.who)}</div>` : ""}<div class="body-s"><b>What was measured:</b> ${esc(x.t)}.</div>${x.fix ? `<div class="body-s"><b>How to fix:</b> ${esc(x.fix)}</div>` : ""}<details class="axtech"><summary>Technical details</summary><div class="body-s osv">WCAG ${esc(x.sc)} ${esc(x.name)} · measured by Traceform, because the checker has no rule for it</div></details></div>`;

  const groups = [["P", "Can people see and read it?", "Perceivable"], ["O", "Can people use it?", "Operable"], ["U", "Is it clear?", "Understandable"], ["R", "Does it work with screen readers?", "Robust"], ["B", "Good habits", "Recommended, not required by the standard"]];
  const body = groups.map(([k, name, sub]) => {
    const f = v.fails.filter(x => x.p === k), rv = v.reviews.filter(x => x.p === k), ps = v.passes.filter(x => x.p === k);
    const xs = k === "P" ? extra : [];
    const bad = f.length + xs.filter(x => !x.ok && !x.pending).length;
    const good = [...ps.map(passLine), ...xs.filter(x => x.ok && !x.pending).map(x => `<div class="axok"><span class="ms ok-t">check_circle</span><span>${esc(x.okText || x.t)}</span></div>`)];
    if (!f.length && !rv.length && !ps.length && !xs.length) return "";
    return `<div class="axgroup"><div class="row" style="flex-wrap:nowrap;align-items:baseline"><span class="title-s" style="flex:1">${name}</span><span class="badge ${bad ? "e" : rv.length ? "w" : "ok"}">${bad ? `${bad} to fix` : rv.length ? `${rv.length} to check` : "All good"}</span></div><div class="body-s osv">${sub}</div>
      ${[...f.map(item), ...xs.filter(x => !x.ok || x.pending).map(xItem), ...rv.map(item)].join("")}
      ${good.length ? `<details class="axpass"><summary>${good.length} passed</summary>${good.join("")}</details>` : ""}</div>`;
  }).join("");
  return `${head}${body}`;
}
function wireAxTab(r, onShow) {
  $$("[data-axfix]", r).forEach(b => b.onclick = () => { axApplyFix(b.dataset.axfix); S.reviewTab = "audit"; save(); renderReview(); });
  $$("[data-axshow]", r).forEach(b => b.onclick = () => onShow(b.dataset.axshow));
}

/* The fixed-layout page as a standalone document, so it can be audited the same
   way as a designed one. Decision-marker pins are review chrome, not the site. */
function legacyAuditDoc() {
  const html = pageHTML().replace(/<span class="pin[^"]*"[^>]*>[^<]*<\/span>/g, "");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(S.project || "Site")}</title>
<link rel="stylesheet" href="${tokenFontsHref()}">
<style>html,body{margin:0}</style></head><body>${html}</body></html>`;
}
