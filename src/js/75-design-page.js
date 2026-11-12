/* The designed home page.

   The Review page used to render a fixed layout - hero, two cards, a story strip,
   an hours block - and pour generated words into it. Whatever the research said,
   every project came out the same shape, so the design system could only change
   colours and type. This asks the model to design the page itself: structure,
   sections, rhythm and all, from the research, the borrowed references and the
   design system.

   The result is plain HTML and CSS rendered in a sandboxed frame, so the page's
   own stylesheet cannot reach the app (the generated site's short class names -
   .s, .nav, .pin - used to leak into Traceform's chrome).

   Three things keep the page tied to the earlier stages rather than merely
   informed by them:
     - the design system reaches the page as CSS variables, so a token is used by
       reference and a later token edit restyles the page without regenerating;
       anything the model writes outside the system is corrected (enforceTokens);
     - every section names the insight cards, saved references and tokens it rests
       on, and those names are checked against what actually exists;
     - the inputs are fingerprinted, so the Review page can say when the research,
       inspiration or system has moved on since the page was designed.

   Only the home page is designed. Its nav names the other pages so the structure
   is legible, but those links do nothing yet.

   NOTE: everything on the render path here is a function declaration. This file
   is concatenated after 40-app.js, whose boot() already ran renderAll(), so a
   top-level const from this file is not initialised yet when the page first draws. */

/* ---------- the design system as CSS variables ---------- */
function dzHex(v) { return /^#[0-9a-f]{6}$/i.test(String(v || "")); }
function dzNums(v) { return (String(v || "").match(/\d+(?:\.\d+)?/g) || []).map(Number); }
/* Which token each variable family carries, for the "applied" check. */
function dzVarMap() {
  return [
    ["color.ground", /var\(\s*--ground\b/], ["color.ink", /var\(\s*--ink\b/],
    ["color.accent", /var\(\s*--accent\b/], ["color.heat", /var\(\s*--signal\b/],
    ["type.display", /var\(\s*--font-display\b/], ["type.body", /var\(\s*--font-body\b/],
    ["type.scale", /var\(\s*--t-(display|h2|h3|body|small)\b/],
    ["space.scale", /var\(\s*--s[1-5]\b/], ["shape.radius", /var\(\s*--r-[sml]\b/],
  ];
}
function designTokens() {
  const col = (k, d) => dzHex(tv(k)) ? tv(k) : d;
  const ground = col("color.ground", "#FFFFFF"), ink = col("color.ink", "#111111");
  const accent = col("color.accent", "#333333"), signal = col("color.heat", accent);
  // Type: body is the step nearest 16px, small the smallest, headings the steps above body.
  const ts = dzNums(tv("type.scale")).filter(n => n >= 9 && n <= 120).sort((a, b) => b - a);
  const body = ts.length ? ts.reduce((b, n) => Math.abs(n - 16) < Math.abs(b - 16) ? n : b, ts[0]) : 16;
  const heads = ts.filter(n => n > body);
  const small = ts.length && ts[ts.length - 1] < body ? ts[ts.length - 1] : Math.round(body * 0.82);
  const display = heads[0] || Math.round(body * 2.5);
  const h3 = heads.length > 1 ? heads[heads.length - 1] : Math.round(body * 1.25);
  const h2 = heads.length > 2 ? heads[Math.floor(heads.length / 2)] : Math.round((display + h3) / 2);
  // Spacing: five steps, sampled evenly from a longer scale or extended from a shorter one.
  let sp = dzNums(tv("space.scale")).filter(n => n > 0 && n <= 200).sort((a, b) => a - b);
  if (!sp.length) sp = [8, 16, 24, 40, 64];
  if (sp.length > 5) sp = [0, 1, 2, 3, 4].map(i => sp[Math.round(i * (sp.length - 1) / 4)]);
  while (sp.length < 5) sp.push(Math.round(sp[sp.length - 1] * 1.6));
  const rad = dzNums(tv("shape.radius"));
  const r = i => rad.length ? rad[Math.min(i, rad.length - 1)] : [4, 8, 12][i];
  return {
    ground, ink, accent, signal,
    onAccent: ratio("#ffffff", accent) >= 4.5 ? "#FFFFFF" : (ratio(ink, accent) >= 4.5 ? ink : "#111111"),
    fontDisplay: String(tv("type.display") || "Georgia").replace(/['"]/g, ""),
    fontBody: String(tv("type.body") || "system-ui").replace(/['"]/g, ""),
    t: { display, h2, h3, body, small }, s: sp, r: [r(0), r(1), r(2)],
  };
}
function designVarsCSS() {
  const d = designTokens();
  return `:root{--ground:${d.ground};--ink:${d.ink};--accent:${d.accent};--signal:${d.signal};--on-accent:${d.onAccent};` +
    `--font-display:'${d.fontDisplay}',Georgia,serif;--font-body:'${d.fontBody}',system-ui,sans-serif;` +
    `--t-display:${d.t.display}px;--t-h2:${d.t.h2}px;--t-h3:${d.t.h3}px;--t-body:${d.t.body}px;--t-small:${d.t.small}px;` +
    d.s.map((n, i) => `--s${i + 1}:${n}px;`).join("") +
    `--r-s:${d.r[0]}px;--r-m:${d.r[1]}px;--r-l:${d.r[2]}px}`;
}
/* Tokens that are prose rather than a value: imagery, motif, component specs. */
function dzSpecTokens() {
  const vars = new Set(dzVarMap().map(x => x[0]));
  return (S.tokens || []).filter(t => !vars.has(t.k) && String(t.v || "").trim() && !/^\[from research\]$/i.test(t.v) && !/^none$/i.test(t.v));
}
function dzSystemIsTemplate() { return S.pid !== "p-mali" && !(S.gen && S.gen.system) && !(S.tokens || []).some(t => t.edited || t.ai); }

/* ---------- what each earlier page contributes ---------- */
function dzCards() { return (S.themes || []).flatMap(t => (t.cards || []).map(c => ({ ...c, theme: t.name }))); }
/* A saved reference counts as "borrowed from" only once something was chosen. */
function dzBorrowed() {
  return (S.tiles || []).filter(t => t.whole || (t.annotations || []).length ||
    (t.borrow && !/^\(not yet chosen\)$/i.test(t.borrow) && !/^nothing\b/i.test(t.borrow)));
}
function systemDump() {
  const d = designTokens();
  const why = k => { const t = T(k); return t && t.why && !/^Template default/i.test(t.why) ? `   <- ${t.why}${t.not ? ` (NOT: ${t.not})` : ""}` : ""; };
  const lines = [
    "Colour, type, spacing and radius are provided to the page as CSS variables. Use them by name:",
    `  var(--ground)        ${d.ground}  page background${why("color.ground")}`,
    `  var(--ink)           ${d.ink}  text${why("color.ink")}`,
    `  var(--accent)        ${d.accent}  primary buttons, links, the one emphasis colour${why("color.accent")}`,
    `  var(--signal)        ${d.signal}  secondary signal colour, used sparingly${why("color.heat")}`,
    `  var(--on-accent)     ${d.onAccent}  text placed on --accent`,
    `  var(--font-display)  ${d.fontDisplay}  headings${why("type.display")}`,
    `  var(--font-body)     ${d.fontBody}  everything else${why("type.body")}`,
    `  var(--t-display) ${d.t.display}px · var(--t-h2) ${d.t.h2}px · var(--t-h3) ${d.t.h3}px · var(--t-body) ${d.t.body}px · var(--t-small) ${d.t.small}px${why("type.scale")}`,
    `  var(--s1)..var(--s5) ${d.s.join(" / ")}px  every margin, padding and gap${why("space.scale")}`,
    `  var(--r-s) ${d.r[0]}px · var(--r-m) ${d.r[1]}px · var(--r-l) ${d.r[2]}px  corner radius${why("shape.radius")}`,
  ];
  const specs = dzSpecTokens();
  if (specs.length) {
    lines.push("", "Specs to follow as written (cite the key in \"uses.tokens\" where a section applies one):");
    specs.forEach(t => lines.push(`  ${t.k}: ${t.v}${t.why && !/^Template default/i.test(t.why) ? `   <- ${t.why}` : ""}${t.not ? ` (NOT: ${t.not})` : ""}`));
  }
  const rs = S.reasons || {};
  const reasoned = ["color", "type", "space", "imagery", "components"].filter(k => rs[k]);
  if (reasoned.length) { lines.push("", "Why the system is the way it is:"); reasoned.forEach(k => lines.push(`  ${k}: ${rs[k]}`)); }
  const imgs = (S.userImgs || []).map((u, i) => ({ u, i })).filter(x => x.u && x.u.src);
  if (imgs.length) {
    lines.push("", "The designer's own photographs. Use each where its note says, with data-photo set to its key:");
    imgs.forEach(({ u, i }) => lines.push(`  user:${i}  "${u.name}"${u.slot ? ` [assigned to: ${u.slot}]` : ""}${u.use ? ` - ${u.use}` : ""}`));
  }
  if (dzSystemIsTemplate()) lines.push("", "(These are still starting values: no design system has been drafted for this project yet.)");
  return lines.join("\n");
}

/* ---------- the brief ---------- */
function designBrief() {
  const cards = dzCards();
  return [
    projectHeader(),
    "",
    `1. RESEARCH - ${cards.length} insight card${cards.length === 1 ? "" : "s"}, grouped by theme. Each id (the word before the colon) is citable:`,
    insightDump(),
    "",
    "REJECTED ASSUMPTIONS - the design must not do any of these:",
    avoidList().join("; ") || "(none)",
    "",
    "2. INSPIRATION - only what the designer saved and chose to borrow. Nothing else is a reference:",
    inspirationDump(),
    "",
    "3. DESIGN SYSTEM - decisions already made:",
    systemDump(),
  ].join("\n");
}

function designRules() {
  return `
WHAT TO MAKE
A complete, production-quality home page for this project: the page a good studio
would hand over, not a wireframe and not a template with the words swapped.

IT MUST FOLLOW THE THREE SOURCES ABOVE
- Research decides structure and copy. Every section exists because of an insight
  card; the strongest (high-confidence) findings get the most prominent sections.
  Nothing on the page may contradict a card or do anything on the rejected list.
- Inspiration decides the borrowed moves. Every borrowed part listed under
  INSPIRATION must be visibly honoured somewhere on the page - the layout idea,
  rhythm, type treatment or component the designer pointed at - and the section
  that honours it names that reference. Where an attached image is one of those
  references, look at it. If nothing was saved, borrow from nowhere.
- The design system decides every visual value. Colours, fonts, font sizes,
  spacing and radius come ONLY from the CSS variables listed above:
  "color:var(--ink)", "padding:var(--s4)", "font-size:var(--t-h2)". Never write a
  hex, rgb or named colour, a font name, or define your own variables. For a tint
  or shade, mix the variables: "color-mix(in srgb,var(--accent) 12%,var(--ground))".
  The component and imagery specs are instructions, not suggestions.

HOW IT MUST BE BUILT
- Return the page as CSS plus body HTML. No <html>, <head>, <body>, <script>,
  no external fonts, images, or URLs of any kind.
- Scope every CSS rule under ".pg" (the body HTML is wrapped in a .pg element).
  Write ".pg .hero h1 {...}", never "h1 {...}".
- Layout with flex and grid. It must hold up from 320px to 1400px wide
  with no sideways scrolling: rows of links or cards wrap (flex-wrap) or stack. Do not
  size anything in vh.
- No JavaScript and no interactivity beyond :hover and :focus styles.
- Accessible markup: the page's top bar in a <header> (its nav in a <nav>), the
  content sections inside one <main>, the closing section a <footer>, so nothing
  sits outside a landmark; exactly one <h1>, heading levels in order with none skipped,
  every button a real <button type="button"> at least 44px tall with a label that
  says what it does, every form field with a <label>.

STRUCTURE IS YOURS TO DECIDE
Decide the sections, their order, and the shape of each from the research. A
project whose research is about trust needs a different page from one about
speed. Do not default to hero / three feature cards / testimonials / footer
unless the research actually argues for exactly that.

IMAGERY
Where a photograph belongs, write <figure class="ph" data-photo="..."> containing
a short art direction note: what the photo shows and why that subject. data-photo
is a stock-library search phrase naming the SUBJECT - 2-4 plain nouns, no
adjectives, no brand or person names ("jewelers workbench", "nurse and patient") -
or the key of one of the designer's own photographs when the design system lists
any (data-photo="user:0"). Give each .ph a size (aspect-ratio or height); the
real photograph is fitted into it. Follow the imagery spec for what the photos
show. No emoji or icon fonts as decoration.

NAV
The nav names the other pages this product would have, chosen from the research
(3-5 of them, the home one marked current). They are not links yet: render them
as plain spans. Do not write href attributes.

TRACEABILITY - this is the point of the tool
Put data-tf="<short-id>" on every top-level section (e.g. data-tf="hero").
Return exactly one decision record per data-tf section - same count, same ids.
A receipt is a sentence in the form "<what was decided> <- <the evidence>",
quoting the research or naming the saved reference:
  "Pantry setup is skipped entirely on the home page <- 64% abandon apps that
   demand it first"
"uses" lists what the section actually rests on, copied exactly from above:
"cards" = insight card ids, "refs" = saved reference titles, "tokens" = design
system keys such as "color.accent" or "comp.cta". These are checked against the
project, so never invent one; a section with no evidence behind it leaves them
empty and says so in its receipt.
"typical" lists 2-3 options with your estimate of how often AI-generated pages of
this kind choose each, the last being this page's choice; "mine" is that choice.

COPY
Real, specific sentences for this organisation, in the words its research shows
these people use. No lorem ipsum, no "[PLACEHOLDER]", no generic marketing lines
("Empower your workflow", "Seamlessly integrate"). If a fact is genuinely unknown,
write it as [ASK <who>] and use at most one of those on the page.`;
}

function designSchema() {
  return `{"css":string,"html":string,"nav":[{"label":string,"current":boolean}],
"sections":[{"id":string,"name":string,"receipt":string,"uses":{"cards":[string],"refs":[string],"tokens":[string]},"gaps":[string],"typical":[[string,number]],"mine":string}],
"reasoning":string}`;
}

/* The designer's uploaded references are pictures; a title alone tells the model
   nothing about them. Send the pictures when the provider can read them. */
async function designReferenceImages() {
  try {
    const lim = await sample.limits().catch(() => null);
    if (!lim || !lim.images) return { blobs: [], note: "" };
    const picks = dzBorrowed().filter(t => t.img).slice(0, 3);
    const blobs = [], names = [];
    for (const t of picks) {
      try { const b = await (await fetch(t.img)).blob(); if (b && b.size && b.size < 4 * 1024 * 1024) { blobs.push(b); names.push(t.title); } } catch { }
    }
    return { blobs, note: blobs.length ? `\n\nATTACHED IMAGES, in order, are these saved references: ${names.map((n, i) => `${i + 1}. ${n}`).join("; ")}.` : "" };
  } catch { return { blobs: [], note: "" }; }
}

async function aiHomePage() {
  const refs = await designReferenceImages();
  const prompt = `${designBrief()}${refs.note}\n${designRules()}\n\nJSON (no extra keys, no markdown fences): ${designSchema()}\n` +
    `"reasoning" is 2-3 sentences on why the page is shaped this way, naming the research that decided it.`;
  const ask = imgs => aiRetry(() => sample.json(prompt, { modelTier: "default", ...(imgs.length ? { images: imgs } : {}) }));
  const usable = o => o && typeof o.html === "string" && o.html.trim();
  let out, err;
  try { out = await ask(refs.blobs); } catch (e) { err = e; }
  // A page is a long reply: one malformed or empty answer is worth a second ask,
  // and the images are dropped in case they were what the provider choked on.
  if (!usable(out)) { try { out = await ask([]); } catch (e) { if (!err) err = e; } }
  if (!usable(out) && err) throw err;
  return out;
}

/* ---------- keep it safe to render ---------- */
/* The model's output is markup we inject. Scripts, inline handlers and external
   loads are stripped, and the frame is sandboxed besides. */
function sanitizeDesign(html) {
  return String(html || "")
    .replace(/<\s*(script|iframe|object|embed|link|meta|base|form)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|iframe|object|embed|link|meta|base)\b[^>]*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");
}
function sanitizeCSS(css) {
  return String(css || "")
    .replace(/@import[^;]*;/gi, "")
    .replace(/url\(\s*['"]?\s*(?!data:image\/)[^)]*\)/gi, "none")
    .replace(/<\s*\/?\s*style[^>]*>/gi, "")
    // The frame grows to fit its content, so a viewport-height unit would chase
    // its own tail. Treat the viewport as a fixed 800px tall.
    .replace(/(\d*\.?\d+)\s*(?:d|s|l)?vh\b/gi, (m, n) => `${Math.round(parseFloat(n) * 8)}px`);
}

/* ---------- hold the page to the design system ---------- */
/* The model is told to use only the system's variables. It mostly does; this
   makes "mostly" into "always". Exact token values become the variable, tints and
   shades of a system colour are left alone, and a colour or font from outside the
   system is replaced with the nearest thing inside it. */
function dzHue(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (d < 1) return 0;
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}
function enforceTokens(css) {
  const d = designTokens();
  const sys = [["--ground", d.ground], ["--ink", d.ink], ["--accent", d.accent], ["--signal", d.signal]];
  const chroma = rgb => Math.max(...rgb) - Math.min(...rgb);
  const sysHues = sys.map(([, hex]) => hexToRgb(hex)).filter(rgb => chroma(rgb) > 24).map(rgb => dzHue(...rgb));
  const fixed = { colors: 0, fonts: 0 };
  const hueGap = (a, b) => { const x = Math.abs(a - b) % 360; return x > 180 ? 360 - x : x; };
  /* -> replacement string, or null to leave the literal as written */
  const judge = (rgb, alpha) => {
    const hex = "#" + rgb.map(n => Math.round(n).toString(16).padStart(2, "0")).join("");
    const exact = sys.find(([, v]) => v.toLowerCase() === hex.toLowerCase());
    if (exact && alpha >= 1) return `var(${exact[0]})`;
    if (exact) return `color-mix(in srgb,var(${exact[0]}) ${Math.round(alpha * 100)}%,transparent)`;
    if (chroma(rgb) <= 24) return null;                                      // a neutral: white, black, greys
    if (sysHues.some(h => hueGap(h, dzHue(...rgb)) <= 28)) return null;       // a tint or shade of a system colour
    fixed.colors++;
    const l = lum(hex);
    const base = l > 0.55 ? "color-mix(in srgb,var(--accent) 12%,var(--ground))" : l < 0.08 ? "var(--ink)" : "var(--accent)";
    return alpha >= 1 ? base : `color-mix(in srgb,${base} ${Math.round(alpha * 100)}%,transparent)`;
  };
  const fixValue = val => val
    .replace(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi, (m, h) => {
      if (h.length === 3 || h.length === 4) h = h.split("").map(c => c + c).join("");
      const a = h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1;
      return judge(hexToRgb(h.slice(0, 6)), a) || m;
    })
    .replace(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+%?))?\s*\)/gi, (m, r, g, b, a) => {
      const alpha = a == null ? 1 : /%$/.test(a) ? parseFloat(a) / 100 : parseFloat(a);
      return judge([+r, +g, +b], isNaN(alpha) ? 1 : alpha) || m;
    });
  const reserved = /^--(ground|ink|accent|signal|on-accent|font-display|font-body|t-(display|h2|h3|body|small)|s[1-5]|r-[sml])$/;
  const out = String(css || "").replace(/([{;]\s*)([-\w]+)(\s*:\s*)([^;{}]+)(?=[;}])/g, (m, pre, prop, colon, val) => {
    const p = prop.toLowerCase();
    if (reserved.test(p)) return `${pre}--tf-ignored${colon}0`;               // the page may not redefine the system
    if (p === "font-family") {
      if (/var\(\s*--font-/.test(val) || /^\s*inherit\s*$/i.test(val)) return m;
      if (/mono|courier/i.test(val)) return m;
      fixed.fonts++;
      const first = val.split(",")[0].replace(/['"]/g, "").trim().toLowerCase();
      const isDisplay = first === d.fontDisplay.toLowerCase() && d.fontDisplay.toLowerCase() !== d.fontBody.toLowerCase();
      return `${pre}${prop}${colon}var(${isDisplay ? "--font-display" : "--font-body"})`;
    }
    return `${pre}${prop}${colon}${fixValue(val)}`;
  });
  return { css: out, fixed };
}

/* ---------- fingerprint of what the page was designed from ---------- */
function dzHash(s) { let h = 5381; s = String(s || ""); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function designBasis() {
  return {
    research: dzHash(insightDump() + "|" + avoidList().join(";")),
    inspiration: dzHash(inspirationDump()),
    // Colour, type, spacing and radius restyle the page live, so only the prose
    // specs and the designer's own images can leave a designed page behind.
    system: dzHash(dzSpecTokens().map(t => `${t.k}=${t.v}`).join("\n") + "|" + (S.userImgs || []).map(u => `${u.name}:${u.slot || ""}:${u.use || ""}`).join(";")),
  };
}
/* The sources that have changed since the page was designed. */
function designStale() {
  const b = S.design && S.design.basis; if (!b) return [];
  const now = designBasis();
  return [["research", "research"], ["inspiration", "inspiration"], ["system", "design system"]].filter(([k]) => b[k] !== now[k]).map(x => x[1]);
}

/* ---------- apply ---------- */
function applyHomePage(out) {
  const html = sanitizeDesign(out && out.html);
  if (!html.trim()) throw Object.assign(new Error("empty"), { text: "The AI returned no page." });
  const enf = enforceTokens(sanitizeCSS(out.css));
  const strs = (a, n) => (Array.isArray(a) ? a : []).map(x => String(x == null ? "" : x).trim()).filter(Boolean).slice(0, n);
  const recs = new Map((out.sections || []).filter(s => s && s.id).map(s => [String(s.id), s]));
  // The frame numbers sections in document order, so the records follow the
  // document too: one per data-tf element, none for an element that is not there.
  const ids = [...new Set([...new DOMParser().parseFromString(html, "text/html").querySelectorAll("[data-tf]")].map(el => el.getAttribute("data-tf")).filter(Boolean))];
  const sections = ids.map(id => {
    const s = recs.get(id) || {}; const u = s.uses && typeof s.uses === "object" ? s.uses : {};
    return {
      id, name: String(s.name || id), receipt: String(s.receipt || ""),
      uses: { cards: strs(u.cards, 8), refs: strs(u.refs, 6), tokens: strs(u.tokens, 10) },
      gaps: strs(s.gaps, 4),
      typical: (s.typical || []).filter(Array.isArray).slice(0, 3).map(t => [String(t[0]), Math.max(0, Math.min(100, +t[1] || 0))]),
      mine: String(s.mine || ""),
    };
  });
  const photos = [];
  html.replace(/data-photo\s*=\s*"([^"]*)"/gi, (m, q) => { if (q.trim()) photos.push(q.trim()); return m; });
  // A regenerate replaces the whole page; the one it replaces stays reachable
  // from History.
  dzKeepDesign(S.design); delete S.designPrev;
  S.design = {
    css: enf.css, html,
    nav: (out.nav || []).filter(n => n && n.label).map(n => ({ label: String(n.label).slice(0, 24), current: !!n.current })),
    sections, photos: [...new Set(photos)], fixed: enf.fixed,
    reasoning: String((out && out.reasoning) || ""),
    basis: designBasis(), at: Date.now(),
  };
  dzKeepDesign(S.design);
  S.siteBuilt = true;
  if (S.sel && S.sel.kind === "sec") S.sel = null;
}

/* ---------- how far the page follows each source ---------- */
/* What a section rests on, after checking every name against the project. A
   record may also cite a card or reference only in its receipt sentence. */
function sectionUses(s) {
  const cards = dzCards(), tiles = S.tiles || [], toks = S.tokens || [];
  const u = s.uses || {}; const text = `${s.receipt || ""} ${(u.cards || []).join(" ")}`;
  const norm = x => String(x || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const said = (u.refs || []).map(norm).filter(Boolean), receipt = norm(s.receipt);
  // A token may be cited by its key or by the variable that carries it.
  const named = new Set((u.tokens || []).map(x => { const hit = dzVarMap().find(([, re]) => re.test(/^var\(/.test(x) ? x : `var(${x}`)); return hit ? hit[0] : x; }));
  return {
    cards: cards.filter(c => new RegExp(`(^|[^A-Za-z0-9])${c.id}([^A-Za-z0-9]|$)`).test(text)),
    refs: tiles.filter(t => { const n = norm(t.title); return n && (said.some(r => r === n || (r.length > 5 && (n.includes(r) || r.includes(n)))) || (n.length > 5 && receipt.includes(n))); }),
    tokens: toks.filter(t => named.has(t.k)),
  };
}
/* A receipt often ends in a bare card id ("<- cc1"), which means nothing to a
   reader. Show the finding it points at instead. */
function receiptText(s) { return dzNameCards(s.receipt); }
function dzNameCards(text) {
  let t = String(text || "");
  dzCards().forEach(c => {
    const short = c.text.length > 70 ? c.text.slice(0, 69).trimEnd() + "…" : c.text;
    t = t.replace(new RegExp(`(^|[^A-Za-z0-9])(?:card\\s+)?${c.id}(?![A-Za-z0-9])`, "g"), `$1“${short.replace(/\$/g, "$$$$")}”`);
  });
  return t;
}
function designCoverage() {
  const d = S.design || {}; const secs = d.sections || [];
  const per = secs.map(sectionUses);
  const cards = dzCards(), usedCards = new Set(per.flatMap(u => u.cards.map(c => c.id)));
  const borrowed = dzBorrowed(), usedRefs = new Set(per.flatMap(u => u.refs.map(t => t.id)));
  const cited = new Set(per.flatMap(u => u.tokens.map(t => t.k)));
  const css = dzAllCSS(d);
  const applied = new Set(dzVarMap().filter(([, re]) => re.test(css)).map(x => x[0]));
  // The ground and ink colours and the body font are set on the frame itself.
  ["color.ground", "color.ink", "type.body"].forEach(k => applied.add(k));
  const cta = (String(tv("comp.cta") || "").match(/“([^”]+)”/) || [])[1];
  const plain = String(d.html || "").replace(/<[^>]+>/g, " ").toLowerCase();
  if (cta && plain.includes(cta.toLowerCase())) applied.add("comp.cta");
  const toks = (S.tokens || []).filter(t => String(t.v || "").trim() && !/^\[from research\]$/i.test(t.v) && !/^none$/i.test(t.v));
  return {
    research: { total: cards.length, used: cards.filter(c => usedCards.has(c.id)), unused: cards.filter(c => !usedCards.has(c.id)), avoid: avoidList().length },
    inspiration: { saved: (S.tiles || []).length, total: borrowed.length, used: borrowed.filter(t => usedRefs.has(t.id)), unused: borrowed.filter(t => !usedRefs.has(t.id)) },
    system: { total: toks.length, used: toks.filter(t => applied.has(t.k) || cited.has(t.k)), unused: toks.filter(t => !applied.has(t.k) && !cited.has(t.k)), fixed: d.fixed || { colors: 0, fonts: 0 }, template: dzSystemIsTemplate() },
    ungrounded: secs.filter((s, i) => !per[i].cards.length && !per[i].refs.length),
  };
}

/* ---------- render ---------- */
/* srcdoc + sandbox: the page cannot run scripts. The parent keeps DOM access
   (allow-same-origin) so section markers stay clickable and photographs can be
   fitted in. Decision markers and the selected section are classes the parent
   toggles, so neither needs the frame rebuilt. */
function designFrameHTML() {
  const d = S.design || {};
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(S.project || "Home")}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Nunito+Sans:wght@400;600;700&display=swap">
<style>
${designVarsCSS()}
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:var(--ground);color:var(--ink);font-family:var(--font-body);font-size:var(--t-body);line-height:1.5;-webkit-font-smoothing:antialiased}
.pg h1,.pg h2,.pg h3{font-family:var(--font-display)}
.pg img{max-width:100%}
.pg button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
.pg .ph{margin:0;max-width:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;min-height:160px;
  background:color-mix(in srgb,var(--accent) 12%,transparent);
  border:1px dashed color-mix(in srgb,var(--ink) 25%,transparent);
  color:color-mix(in srgb,var(--ink) 70%,transparent);font-size:13px;line-height:1.4}
${dzAllCSS(d)}
.pg .ph.filled{position:relative;padding:0;border:0;overflow:hidden;background:color-mix(in srgb,var(--ink) 8%,var(--ground))}
.pg .ph.filled>img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;display:block}
.tf-marks .pg [data-tf]{position:relative;outline:1px dashed color-mix(in srgb,var(--accent) 45%,transparent);outline-offset:-1px}
.tf-marks .pg [data-tf]::before{content:attr(data-n);position:absolute;left:6px;top:6px;z-index:50;width:20px;height:20px;border-radius:50%;
  background:var(--accent);color:var(--on-accent);font:600 11px/20px system-ui;text-align:center}
.pg [data-tf]{cursor:pointer}
.tf-marks .pg [data-tf]:hover{outline-style:solid}
.pg [data-tf].tf-sel{outline:2px solid var(--accent);outline-offset:-2px}
</style></head><body><div class="pg">${d.html || ""}</div></body></html>`;
}

/* Fit real photographs into the page's photo slots: the designer's own image
   where one was named, otherwise the stock photograph frozen for that subject. */
function fillDesignPhotos(doc) {
  let n = 0;
  doc.querySelectorAll(".pg .ph[data-photo]").forEach(f => {
    if (f.classList.contains("filled")) return;
    const q = f.getAttribute("data-photo");
    const ph = typeof photoGet === "function" ? photoGet(q) : null;
    const src = userImg(q) || (ph && !ph.miss && ph.src) || null;
    if (!src) return;
    const note = f.textContent.trim();
    f.textContent = "";
    const img = doc.createElement("img");
    img.src = src; img.alt = note || (ph && ph.alt) || ""; img.loading = "lazy";
    if (ph && ph.creator) img.setAttribute("data-credit", `${ph.creator} · ${ph.license}`);
    f.appendChild(img); f.classList.add("filled"); n++;
  });
  return n;
}

/* Put the designed page on the stage. The frame is only rebuilt when the page
   itself changed: selecting a section or toggling the markers must not reload it,
   or the page jumps back to the top on every click. */
/* Declared without a value on purpose: boot() in 40-app.js has already mounted
   the frame by the time this line runs, and an initialiser here would wipe the
   key it just set (reloading the frame and stranding the reflow check). */
var dzFrameKey, dzPhotoBusy;
function mountDesignFrame(st) {
  const key = designFrameHTML();
  let f = st.querySelector("#designFrame");
  if (!f || dzFrameKey !== key || !f.contentDocument) {
    st.innerHTML = `<div class="designwrap"><iframe id="designFrame" class="designframe" sandbox="allow-same-origin" title="Designed home page"></iframe></div><div id="designCredits"></div>`;
    f = st.querySelector("#designFrame");
    dzFrameKey = key;
    f.onload = () => wireDesignFrame(f);
    f.srcdoc = key;
  } else {
    // Anything else the last render left on the stage (the generate banner is re-added by its owner).
    [...st.children].forEach(c => { if (!c.classList.contains("designwrap") && c.id !== "designCredits") c.remove(); });
  }
  f.classList.toggle("phone", S.device === "phone");
  syncDesignFrame();
}
function wireDesignFrame(f) {
  const doc = f.contentDocument; if (!doc) return;
  [...doc.querySelectorAll("[data-tf]")].forEach(el => {
    el.addEventListener("click", ev => {
      ev.preventDefault(); ev.stopPropagation();
      // The innermost marked section wins when sections are nested.
      select({ kind: "sec", id: el.getAttribute("data-tf") }); S.reviewTab = "panel"; save();
      syncDesignFrame(); renderReviewRail();
    });
  });
  doc.addEventListener("click", () => { if (S.sel && S.sel.kind === "sec") { select(null); syncDesignFrame(); renderReviewRail(); } });
  const fit = () => { try { f.style.height = Math.max(320, doc.body.scrollHeight) + "px"; } catch { } };
  f._fit = fit;
  try { new ResizeObserver(fit).observe(doc.body); } catch { }
  try { doc.fonts.ready.then(fit); } catch { }
  syncDesignFrame();
  // The audit reads this document, so it can only be drawn once it has loaded.
  dzCheckReflow(dzFrameKey);
  axRun(dzFrameKey);
  if (dzScrollAfter) { const id = dzScrollAfter; dzScrollAfter = null; setTimeout(() => scrollDesignTo(id), 150); }
  // Look up whatever photographs the page asks for and has not been given yet.
  const want = ((S.design && S.design.photos) || []).filter(q => !/^user:/.test(q) && typeof photoGet === "function" && !photoGet(q));
  // One at a time (the library rate-limits bursts), and each is shown as it
  // lands: a slow lookup must not hold back the photographs already found.
  if (want.length && !dzPhotoBusy && typeof photoResolve === "function") {
    dzPhotoBusy = true;
    const pid = currentPid();
    (async () => {
      for (const q of want) {
        if (!stillOnProject(pid)) break;
        if (await photoResolve(q) && stillOnProject(pid) && S.view === "review") syncDesignFrame();
      }
    })().finally(() => { dzPhotoBusy = false; });
  }
}
/* Everything about the frame that can change without reloading it. */
function syncDesignFrame() {
  const f = document.querySelector("#designFrame"); const doc = f && f.contentDocument; if (!doc || !doc.body) return;
  doc.documentElement.classList.toggle("tf-marks", !!(S.overlays && S.overlays.receipts));
  const ids = ((S.design && S.design.sections) || []).map(s => s.id);
  const selId = S.sel && S.sel.kind === "sec" ? S.sel.id : null;
  doc.querySelectorAll("[data-tf]").forEach(el => {
    const id = el.getAttribute("data-tf");
    el.setAttribute("data-n", String(ids.indexOf(id) + 1 || ""));
    el.classList.toggle("tf-sel", id === selId);
  });
  fillDesignPhotos(doc);
  if (f._fit) f._fit();
  const cr = document.querySelector("#designCredits"); if (cr) cr.innerHTML = photoCreditBar();
}
function scrollDesignTo(id) {
  const f = document.querySelector("#designFrame"); const doc = f && f.contentDocument; if (!doc) return;
  const el = [...doc.querySelectorAll("[data-tf]")].find(e => e.getAttribute("data-tf") === id);
  if (el) try { el.scrollIntoView({ block: "center", behavior: "smooth" }); } catch { }
}

/* ---------- designs in version history ---------- */
/* A history entry records which design was current (by its timestamp), not the
   design itself: a page is several kilobytes and there are up to forty entries.
   The last few designs are kept alongside, in S.designs. */
function dzKeepDesign(d) {
  if (!d || !d.html || !d.at) return;
  S.designs = S.designs || {};
  S.designs[d.at] = d;
  Object.keys(S.designs).map(Number).sort((a, b) => b - a).slice(8).forEach(k => { delete S.designs[k]; });
}
/* The design a history entry points at: null when there was none, undefined
   when it is no longer kept (the caller then leaves the current design alone). */
function dzDesignAt(at) {
  if (at == null) return null;
  if (S.design && S.design.at === at) return S.design;
  return (S.designs && S.designs[at]) || undefined;
}
function applyVersionDesign(st) {
  if (!st || !("design" in st) || st.design === undefined) return;
  S.design = st.design ? JSON.parse(JSON.stringify(st.design)) : null;
  if (S.sel && S.sel.kind === "sec") S.sel = null;
}

/* ---------- typicality ---------- */
/* The estimate sometimes comes back as a fraction (0.1) rather than a percentage. */
function dzTypical(s) {
  const list = (s.typical || []).filter(t => Array.isArray(t));
  const frac = list.length && list.every(t => t[1] <= 1);
  return list.map(t => [String(t[0]), Math.round(frac ? t[1] * 100 : t[1])]);
}
function dzMinePct(s) { const t = dzTypical(s).find(x => x[0] === s.mine); return t ? t[1] : null; }

/* ---------- reflow ---------- */
/* The accessibility audit itself is axe-core (77-audit.js). axe has no rule for
   reflow, so that one criterion is measured here. */
var dzReflow;
/* Does the page fit a 320px-wide screen without scrolling sideways? Measured in
   a hidden copy of the frame, so the preview itself is not resized. */
function dzCheckReflow(key) {
  if (!key || (dzReflow && dzReflow.key === key)) return;
  const mine = dzReflow = { key, state: "pending", over: 0, tries: 0 };
  /* Like the audit, this only means something if the browser actually laid the
     copy out. In a background tab it has no width at all, which would read as
     "fits" - so wait for a drawn frame, and measure again rather than trust a
     copy with no size. */
  const measure = () => {
    if (dzReflow !== mine) return;
    mine.tries++;
    const f = document.createElement("iframe");
    f.setAttribute("sandbox", "allow-same-origin"); f.setAttribute("aria-hidden", "true"); f.tabIndex = -1;
    f.style.cssText = "position:fixed;left:0;top:0;width:320px;height:640px;opacity:0;pointer-events:none;z-index:-1;border:0";
    f.onload = () => {
      setTimeout(() => {
        let w = 0, drawn = false;
        try { w = f.contentDocument.documentElement.scrollWidth; drawn = f.contentWindow.innerWidth > 0 && f.contentDocument.body.getBoundingClientRect().height > 0; } catch { }
        f.remove();
        if (dzReflow !== mine) return;
        if (!drawn) { if (mine.tries < 6) requestAnimationFrame(() => setTimeout(measure, 400)); return; }
        mine.state = w > 322 ? "bad" : "ok"; mine.over = w - 320;
        if (S.view === "review" && (S.reviewTab === "audit" || !(S.sel && S.sel.kind === "sec"))) renderReviewRail();
      }, 250);
    };
    f.srcdoc = key;
    document.body.appendChild(f);
  };
  requestAnimationFrame(measure);
}
/* Pattern flags for a designed page: where it made the most common AI choice,
   and where a section has nothing behind it. */
function designPatterns() {
  const p = [];
  ((S.design && S.design.sections) || []).forEach(s => {
    const pc = dzMinePct(s); const u = sectionUses(s);
    if (pc != null && pc > 50) p.push({ lvl: "warn", t: `${s.name} makes the most common AI choice (${pc}%)`, id: s.id });
    if (!u.cards.length && !u.refs.length) p.push({ lvl: "edge", t: `${s.name} isn't backed by research or inspiration`, id: s.id });
  });
  return p;
}

/* ---------- prompt one section ---------- */
/* The older "Prompt this part" drove tools that edit the fixed layout's content
   model. A designed page has no such model, so here the AI is handed the one
   section - its HTML, its extra CSS, its decision record - together with the same
   research, inspiration and design system the page was built from, and returns
   either an answer or that section rewritten. Nothing outside the section is
   touched, the rewrite goes through the same sanitising and token enforcement as
   a generated page, and every change is a version that can be undone. */
var dzAsk;            // {id, busy, turns:[{role, content, ver?}]} for the section being discussed
var dzScrollAfter;    // section to bring back into view once the frame reloads
function dzAllCSS(d) { d = d || {}; return (d.css || "") + "\n" + Object.values(d.extra || {}).join("\n"); }
function dzSectionEl(doc, id) { return [...doc.querySelectorAll("[data-tf]")].find(e => e.getAttribute("data-tf") === id) || null; }
function sectionRules(id) {
  return `
HOW TO ANSWER
- If the designer is asking a question ("why this?", "what research is behind
  it?"), answer it in "reply" in 1-3 plain sentences, naming the research,
  reference or token that decided it, and set "change" to false.
- If they are asking for a change, make it to THIS SECTION ONLY and set "change"
  to true. Do what they asked, and keep everything they did not ask about.
- If what they ask for is on the rejected list or contradicts an insight card,
  do not do it: set "change" to false and say which finding it conflicts with.
- If they ask to remove the section, set "change" and "remove" to true.

WHEN YOU CHANGE IT
- "html" is the section's complete new HTML: one root element carrying
  data-tf="${id}". No other data-tf attributes, no <script>, no href, no URLs.
- "css" is ALL the extra CSS this section needs beyond the page's stylesheet. It
  replaces the section's current extra CSS, so repeat any of that you still
  rely on. Scope every rule under .pg [data-tf="${id}"].
- The design system still decides every visual value: colours, fonts, sizes,
  spacing and radius only through the CSS variables listed above, tints through
  color-mix of those variables. Never a hex, rgb or named colour or a font name.
- Photographs stay <figure class="ph" data-photo="2-4 plain nouns">art direction</figure>.
- Buttons are <button type="button">; keep one <h1> on the page and heading
  levels in order; nothing may scroll sideways at 320px wide.
- "record" is the section's updated decision record. The receipt says what the
  section now does and why, in the form "<decision> <- <evidence>"; where the
  change came from the designer rather than the research, say "designer's call".
  "uses" lists only insight card ids, saved reference titles and token keys that
  really exist above.
- "reply" is one sentence saying what you changed.

JSON (no extra keys, no markdown fences): {"reply":string,"change":boolean,"remove":boolean,"html":string,"css":string,
"record":{"name":string,"receipt":string,"uses":{"cards":[string],"refs":[string],"tokens":[string]},"gaps":[string],"typical":[[string,number]],"mine":string}}`;
}
function applySectionEdit(id, out, ask) {
  const d = S.design; const old = (d.sections || []).find(x => x.id === id);
  const doc = new DOMParser().parseFromString(d.html, "text/html"); const el = dzSectionEl(doc, id);
  if (!old || !el) throw Object.assign(new Error("gone"), { text: "That section is no longer on the page." });
  const strs = (a, n) => (Array.isArray(a) ? a : []).map(x => String(x == null ? "" : x).trim()).filter(Boolean).slice(0, n);
  const next = { ...d, sections: d.sections.map(x => ({ ...x })), extra: { ...(d.extra || {}) }, fixed: { colors: 0, fonts: 0, ...(d.fixed || {}) } };
  if (out.remove) {
    el.remove(); next.sections = next.sections.filter(x => x.id !== id); delete next.extra[id];
  } else {
    const body = new DOMParser().parseFromString(sanitizeDesign(out.html), "text/html").body;
    if (!body.firstElementChild) throw Object.assign(new Error("empty"), { text: "The AI returned no section." });
    let root = body.children.length === 1 ? body.firstElementChild : null;
    if (!root) { root = doc.createElement("section"); root.innerHTML = body.innerHTML; }
    // The section keeps its identity; anything inside it claiming to be another
    // top-level section would have no record to go with it.
    const known = new Set(d.sections.map(x => x.id));
    root.querySelectorAll("[data-tf]").forEach(n => { if (n.getAttribute("data-tf") === id || !known.has(n.getAttribute("data-tf"))) n.removeAttribute("data-tf"); });
    root.setAttribute("data-tf", id);
    el.replaceWith(doc.importNode(root, true));
    const enf = enforceTokens(sanitizeCSS(out.css || ""));
    next.extra[id] = enf.css;
    next.fixed.colors += enf.fixed.colors; next.fixed.fonts += enf.fixed.fonts;
    const r = out.record && typeof out.record === "object" ? out.record : {}; const u = r.uses && typeof r.uses === "object" ? r.uses : null;
    const typ = (r.typical || []).filter(Array.isArray).slice(0, 3).map(t => [String(t[0]), Math.max(0, Math.min(100, +t[1] || 0))]);
    Object.assign(next.sections.find(x => x.id === id), {
      name: String(r.name || old.name), receipt: String(r.receipt || old.receipt),
      uses: u ? { cards: strs(u.cards, 8), refs: strs(u.refs, 6), tokens: strs(u.tokens, 10) } : old.uses,
      gaps: Array.isArray(r.gaps) ? strs(r.gaps, 4) : old.gaps,
      ...(typ.length ? { typical: typ, mine: String(r.mine || typ[typ.length - 1][0]) } : {}),
      edited: true, ask: String(ask || "").slice(0, 200),
    });
  }
  snapshot(`${out.remove ? "removed" : "edited"} section · ${old.name}`);
  next.html = doc.body.innerHTML;
  const photos = []; next.html.replace(/data-photo\s*=\s*"([^"]*)"/gi, (m, q) => { if (q.trim()) photos.push(q.trim()); return m; });
  next.photos = [...new Set(photos)];
  next.at = Date.now();
  S.design = next; dzKeepDesign(next);
  if (out.remove && S.sel && S.sel.kind === "sec") S.sel = null;
  save();
  return S.history.length - 1;
}
async function askSection(id, q) {
  const d = S.design; const s = d && (d.sections || []).find(x => x.id === id);
  if (!s || !sample || (dzAsk && dzAsk.busy)) return;
  if (!dzAsk || dzAsk.id !== id) dzAsk = { id, turns: [] };
  const earlier = dzAsk.turns.slice(-6).map(t => `${t.role === "user" ? "DESIGNER" : "YOU"}: ${t.content}`).join("\n");
  dzAsk.turns.push({ role: "user", content: q }); dzAsk.busy = true; renderReviewRail();
  const pid = S.pid, at = d.at; let changed = false;
  try {
    const el = dzSectionEl(new DOMParser().parseFromString(d.html, "text/html"), id);
    const prompt = [
      designBrief(), "",
      "THE PAGE'S STYLESHEET (read-only; reuse its classes where they fit):", String(d.css || "").slice(0, 12000), "",
      `THE DESIGNER IS ASKING ABOUT ONE SECTION of the designed home page: "${s.name}" (data-tf="${id}").`,
      "ITS HTML NOW:", el ? el.outerHTML : "(missing)",
      "ITS EXTRA CSS NOW:", (d.extra && d.extra[id]) || "(none)",
      "ITS DECISION RECORD NOW:", JSON.stringify({ name: s.name, receipt: s.receipt, uses: s.uses, gaps: s.gaps, typical: s.typical, mine: s.mine }),
      earlier ? `\nEARLIER IN THIS CONVERSATION:\n${earlier}` : "",
      `\nTHE DESIGNER SAYS: """${q}"""`,
      sectionRules(id),
    ].join("\n");
    const out = await aiRetry(() => sample.json(prompt, { modelTier: "default" }));
    // The answer belongs to the page it was asked about.
    if (S.pid !== pid || !S.design || S.design.at !== at) return;
    const turn = { role: "assistant", content: String((out && out.reply) || "").trim() };
    if (out && out.change && (out.remove || String(out.html || "").trim())) {
      turn.ver = applySectionEdit(id, out, q); changed = true;
      if (!turn.content) turn.content = out.remove ? "Removed this section." : "Changed this section.";
      if (!out.remove) dzScrollAfter = id;
    }
    dzAsk.turns.push({ ...turn, content: turn.content || "I have no answer for that." });
  } catch (e) {
    if (dzAsk) dzAsk.turns.push({ role: "assistant", sys: true, content: e.text || ({ rate_limited: "Too many requests; try again in a minute.", bad_json: "The AI's reply couldn't be read. Try again.", refused: "The AI declined that; try rephrasing." }[e.code] || "Couldn't reach the AI (" + (e.code || "error") + ").") });
  } finally {
    if (dzAsk) dzAsk.busy = false;
    if (S.pid === pid && S.view === "review") { if (changed) renderReview(); else renderReviewRail(); }
  }
}
function sectionPromptBox(s) {
  const st = dzAsk && dzAsk.id === s.id ? dzAsk : { turns: [], busy: false };
  const lastEdit = [...st.turns].reverse().find(t => t.ver != null);
  const canUndo = t => t === lastEdit && S.history[t.ver] && S.history.length - 1 === t.ver;
  return `<div class="card outlined secprompt"><div class="title-s">Prompt this part</div>
    <div class="note" style="margin:var(--sp-1) 0 var(--sp-2)">${sample ? "Ask why it is this way, or ask for a change. Only this section is rewritten, from the same research, inspiration and design system." : "Connect an AI provider to prompt this section."}</div>
    <div id="spOut" class="col" style="max-height:240px;overflow:auto">${st.turns.map(t => `<div class="msg ${t.role === "user" ? "me" : ""} ${t.sys ? "sys" : ""}">${esc(t.role === "user" ? t.content : dzNameCards(t.content))}${canUndo(t) ? `<div class="acts"><button class="btn text sm" data-spundo="${t.ver}"><span class="ms">undo</span>Undo</button></div>` : ""}</div>`).join("")}${st.busy ? `<div class="msg">Thinking…</div>` : ""}</div>
    <form id="spForm" class="row" style="flex-wrap:nowrap;margin-top:var(--sp-2)"><input class="inl" id="spIn" ${!sample || st.busy ? "disabled" : ""} style="border:1px solid var(--outline);height:40px;border-radius:20px;padding:0 var(--sp-4)" placeholder="e.g. “why this?” · “make the headline shorter” · “add pickup hours”" aria-label="Prompt this section"><button class="icon-btn on" aria-label="Send" ${!sample || st.busy ? "disabled" : ""}><span class="ms">send</span></button></form></div>`;
}
function wireSectionPrompt(r, id) {
  const form = r.querySelector("#spForm"); if (!form) return;
  const out = r.querySelector("#spOut"); if (out) out.scrollTop = out.scrollHeight;
  form.onsubmit = e => { e.preventDefault(); const q = r.querySelector("#spIn").value.trim(); if (q) askSection(id, q); };
  r.querySelectorAll("[data-spundo]").forEach(b => b.onclick = e => {
    e.preventDefault(); const i = +b.dataset.spundo;
    if (dzAsk) dzAsk.turns.forEach(t => { if (t.ver === i) delete t.ver; });
    dzScrollAfter = id; restore(i);
  });
}
