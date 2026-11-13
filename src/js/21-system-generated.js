/* Design-system spec sheets for generated projects.

   The sheets in 20-design-system-specs.js were written by hand for Mali's Table:
   its dish cards, its heat pips, its hand-lettered menu board, its photographs.
   Every other project was shown the same sheets, so a clinic portal's design
   system illustrated itself with som tam.

   Nothing on these sheets is written in advance. Each one is drawn from:
     - the project's tokens (values, the evidence behind each, what each is not);
     - S.kit, drafted by the AI in the same pass as the tokens: sample copy in the
       project's own words and the photographs its research calls for;
     - the rejected assumptions from the Research page;
     - real stock photographs looked up for the subjects the kit names.
   Mali's Table keeps its hand-built sheets, as the worked example. */
/* Only until the system is regenerated: after that its sheets are drawn from the new
   tokens like any other project's, or the regenerated values never showed. */
function sysSeeded() { return S.pid === "p-mali" && !(S.gen && S.gen.system === "done"); }
/* The design system as it was last generated: what "reset" goes back to. It used
   to go back to Mali's Table's tokens, whatever the project. */
function sysDraft() {
  if (S.draftTokens && S.draftTokens.length) return JSON.parse(JSON.stringify(S.draftTokens));
  return sysSeeded() || typeof genericTokens !== "function" ? seedTokens() : genericTokens();
}

/* Sample copy and imagery for the sheets. Drafted with the design system; for a
   system generated before that existed, taken from what the project already has
   (the designed page, the explored directions) rather than invented. */
function systemKit() {
  const k = S.kit || {}, sm = k.samples || {}, im = k.imagery || {};
  const v = typeof vocab === "function" ? vocab(S.type) : { nav: [], cta: "Learn more" };
  const d = S.design && S.design.html ? S.design : null;
  let h1 = "", para = "";
  if (d) { try { const doc = new DOMParser().parseFromString(d.html, "text/html"); h1 = ((doc.querySelector("h1") || {}).textContent || "").trim(); para = ((doc.querySelector("p") || {}).textContent || "").trim(); } catch { } }
  const dir = ((S.directions || [])[0] || {}).mock || {};
  const ctx = typeof projectContext === "function" ? projectContext() : {};
  const cta = (String(tv("comp.cta") || "").match(/“([^”]+)”/) || [])[1] || v.cta;
  const navFrom = d && (d.nav || []).length ? d.nav.map(n => n.label) : v.nav.slice(0, 3);
  const list = (a, n) => (Array.isArray(a) ? a : []).filter(Boolean).slice(0, n);
  const items = list(sm.items, 3).length ? list(sm.items, 3) : list(dir.dishes, 3).filter(x => x && x[0]).map(x => ({ name: x[0], detail: "", meta: x[1] || "" }));
  return {
    drafted: !!S.kit,
    headline: sm.headline || h1 || dir.headline || S.project || "",
    body: sm.body || para || dir.sub || ctx.what || "",
    label: cta,
    nav: list(sm.nav, 4).length ? list(sm.nav, 4) : navFrom,
    items,
    field: sm.field && sm.field.label ? sm.field : null,
    chips: list(sm.chips, 4),
    show: list(im.show, 4).length ? list(im.show, 4) : (d ? (d.photos || []).filter(q => !/^user:/.test(q)).slice(0, 4).map(q => ({ subject: q, what: q, why: "used on the designed page" })) : []),
    avoid: list(im.avoid, 4).length ? list(im.avoid, 4) : avoidList().slice(0, 4).map(a => ({ what: a, why: "a rejected assumption on the Research page" })),
  };
}
/* "why" as written by the AI cites card ids; show the finding instead. */
function sysWhy(t) {
  const w = t && t.why && !/^Template default/i.test(t.why) ? t.why : "";
  return w && typeof dzNameCards === "function" ? dzNameCards(w) : w;
}
/* A token's value as shown on a sheet. Models sometimes end a value with the card
   id it came from ("... by farm name (cc1)."); that belongs in "why", and an id
   means nothing to a reader. */
function sysVal(v) {
  const ids = (S.themes || []).flatMap(t => (t.cards || []).map(c => c.id)).filter(Boolean);
  let out = String(v == null ? "" : v);
  if (ids.length) out = out.replace(new RegExp(`\\s*\\((?:(?:card\\s+)?(?:${ids.map(x => x.replace(/[^\w-]/g, "")).join("|")})\\s*(?:,|and|&)?\\s*)+\\)`, "gi"), "");
  return out.replace(/\s+([.,;])/g, "$1").trim();
}
function sysNoKitNote() {
  return S.kit || !(S.gen && S.gen.system) ? "" : `<div class="note">The examples on this sheet come from your page and explored directions. Regenerate the design system to draft them from your research and inspiration.</div>`;
}

function genSpecColor() {
  const roles = [["color.ground", "Ground", "Page background"], ["color.accent", "Accent", "Primary buttons, links and the one emphasis colour"], ["color.heat", "Signal", "A second colour for status and alerts, used sparingly"], ["color.ink", "Ink", "Text and icons"]];
  const g = tv("color.ground");
  const rows = roles.map(([k, n, u]) => {
    const t = T(k); if (!t) return ""; const on = onColor(t.v); const why = sysWhy(t);
    return `<div class="crow" ${tokBtn(k)}><div class="cinfo"><div class="title-s">${n}</div><div class="body-s osv">${esc(u)}</div></div>
    <div class="cmain"><div class="cswatch" style="background:${esc(t.v)};color:${on}"><span>${n}</span><span class="mono">${esc(String(t.v).toUpperCase())}</span></div><div class="cswatch sm" style="background:${on};color:${esc(t.v)};border:1px solid var(--outline-variant)"><span>Text on ${n.toLowerCase()}</span><span class="mono">${on}</span></div></div>
    <div class="cramp">${ramp(t.v).map(([s, h]) => `<div style="background:${h};color:${onColor(h)}" title="${h.toUpperCase()}"><span>${s}</span></div>`).join("")}<div class="mono osv" style="grid-column:1/-1">${k} · lighter and darker steps</div></div></div>`;
  }).join("");
  const d = designTokens();
  const pairs = [["Text on the page background", tv("color.ink"), g, 4.5, "color.ink"], ["Button text on the accent colour", d.onAccent, tv("color.accent"), 4.5, "color.accent"], ["Accent against the background (buttons, focus)", tv("color.accent"), g, 3, "color.accent"], ["Signal against the background", tv("color.heat"), g, 3, "color.heat"]];
  return SHEET(SH("Colour roles", "click a role to change its colour") + rows) + contrastSheet(pairs);
}

function genSpecType() {
  const d = designTokens(), k = systemKit();
  const fam = f => f === "display" ? `'${d.fontDisplay}',Georgia,serif` : `'${d.fontBody}',system-ui,sans-serif`;
  const styles = [["Display", "display", d.t.display, 600, k.headline], ["Heading", "display", d.t.h2, 600, k.headline], ["Subheading", "display", d.t.h3, 600, k.nav[0] || k.headline], ["Body", "body", d.t.body, 400, k.body], ["Small", "body", d.t.small, 400, k.body], ["Button label", "body", d.t.small, 600, k.label]];
  const rows = styles.map(([n, f, sz, w, txt]) => `<div class="trow" ${tokBtn(n === "Button label" ? "comp.cta" : f === "display" ? "type.display" : "type.body")}><div class="tmeta"><div class="title-s">${n}</div><div class="body-s osv">${esc(f === "display" ? d.fontDisplay : d.fontBody)} · ${sz}px · weight ${w}</div></div><div class="tsample" style="font-family:${fam(f)};font-size:${sz}px;line-height:${f === "display" ? 1.15 : 1.5};font-weight:${w}">${esc(String(txt || S.project || "").slice(0, n === "Body" || n === "Small" ? 140 : 60))}</div></div>`).join("");
  const acc = T("type.accentLine"); const av = String((acc && acc.v) || "").trim();
  const accRow = acc && av && !/^none$/i.test(av) && !/^\[/.test(av) ? `<div class="trow" ${tokBtn("type.accentLine")}><div class="tmeta"><div class="title-s">Accent treatment</div><div class="body-s osv">${esc(sysVal(av))}</div></div><div class="tsample" style="font-family:${fam("body")};font-size:${d.t.small}px;${/caps|upper|track|letter/i.test(av) ? "text-transform:uppercase;letter-spacing:.08em;" : ""}${/underline/i.test(av) ? `text-decoration:underline;text-decoration-color:${d.accent};text-underline-offset:5px;` : ""}${/rule|bar|line/i.test(av) && !/underline/i.test(av) ? `border-left:3px solid ${d.accent};padding-left:10px;` : ""}font-weight:600">${esc(k.chips[0] || k.nav[0] || k.label)}</div></div>` : "";
  const sc = T("type.scale"), fd = T("type.display"), fb = T("type.body");
  return SHEET(SH("Text styles", `sizes come from the scale ${esc(tv("type.scale") || "")} · click a row to change the font`) + rows + accRow) + sysNoKitNote();
}

function genSpecSpace() {
  const d = designTokens();
  const use = ["inside small parts, between an icon and its label", "inside cards and buttons", "between cards", "padding inside a section", "between sections"];
  const sp = d.s.map((s, i) => `<div class="srow" ${tokBtn("space.scale")}><div class="sbox"><i style="width:${Math.min(s, 72)}px;height:${Math.min(s, 72)}px"></i></div><div class="mono">step ${i + 1}</div><div class="body-s">${s}px</div><div class="body-s osv">${use[i] || ""}</div></div>`).join("");
  const ru = ["tags and small parts", "buttons and inputs", "cards and images"], rn = ["small", "medium", "large"];
  const rad = d.r.map((r, i) => `<div class="srow" ${tokBtn("shape.radius")}><div class="sbox"><i style="width:44px;height:44px;border-radius:${r}px;background:transparent;border:2px solid var(--primary)"></i></div><div class="mono">${rn[i]}</div><div class="body-s">${r}px</div><div class="body-s osv">${ru[i]}</div></div>`).join("");
  return SHEET(SH("Spacing", "every margin, padding and gap on the page uses one of these steps") + sp) + SHEET(SH("Corner radius", "") + rad);
}

/* The stock photographs the imagery sheet needs and has not looked up yet. */
var sysPhotoBusy;
function sysPhotoFill() {
  if (sysSeeded() || sysPhotoBusy || typeof photoResolve !== "function") return;
  const want = systemKit().show.map(x => x.subject).filter(q => q && !photoGet(q));
  if (!want.length) return;
  sysPhotoBusy = true; const pid = currentPid();
  (async () => {
    for (const q of want) {
      if (!stillOnProject(pid)) break;
      if (await photoResolve(q) && stillOnProject(pid) && S.view === "system" && S.sysSection === "imagery") renderSystem();
    }
  })().finally(() => { sysPhotoBusy = false; });
}
function genSpecImagery() {
  const k = systemKit(); const im = T("imagery"), mo = T("motif");
  const spec = t => t && String(t.v || "").trim() && !/^\[/.test(t.v) && !/^none$/i.test(t.v) ? t : null;
  const direction = spec(im) ? `<div class="sysrule" ${tokBtn("imagery")}><div class="title-s">${esc(sysVal(im.v))}</div></div>` : `<div class="note">No imagery direction yet. Generate the design system to draft one from your research.</div>`;
  const shots = k.show.map(x => { const ph = photoGet(x.subject); const got = ph && !ph.miss && ph.src;
    return `<div class="icard"><div class="iph" style="overflow:hidden">${got ? pic(x.subject, x.what) : `<div class="sysph"><span class="ms">${ph && ph.miss ? "image_not_supported" : "image_search"}</span><span>${ph && ph.miss ? "No stock photo found for this" : "Looking for an example photo…"}</span></div>`}</div><div class="title-s">${esc(x.what || x.subject)}</div>${x.why ? `<div class="body-s osv">${esc(typeof dzNameCards === "function" ? dzNameCards(x.why) : x.why)}</div>` : ""}${got ? `<div class="body-s osv">Example photo by ${esc(ph.creator)} (${esc(ph.license)})</div>` : ""}</div>`; }).join("");
  const avoid = k.avoid.map(x => `<div class="sysavoid"><span class="ms bad-t">block</span><div><div class="title-s">${esc(x.what)}</div>${x.why ? `<div class="body-s osv">${esc(typeof dzNameCards === "function" ? dzNameCards(x.why) : x.why)}</div>` : ""}</div></div>`).join("");
  const motif = motifSheet(mo && spec(mo) ? mo : null);
  return userImagerySheet() +
    SHEET(SH("Photography direction", "what the site's photographs should show · click to edit") + direction) +
    (shots ? SHEET(SH("What to photograph", "subjects drawn from your research; the photos are stock examples of each, not final images") + `<div class="igrid">${shots}</div>`) : "") +
    (avoid ? SHEET(SH("What to avoid", "") + `<div class="col" style="gap:var(--sp-2)">${avoid}</div>`) : "") + motif + sysNoKitNote();
}

function genSpecComponents() {
  const d = designTokens(), k = systemKit();
  const a = d.accent, on = d.onAccent, i = d.ink, g = d.ground;
  const fb = `'${d.fontBody}',system-ui,sans-serif`, fd = `'${d.fontDisplay}',Georgia,serif`;
  const scope = `font-family:${fb};color:${i}`;
  const btn = (kind, state) => {
    let s = `display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 ${d.s[1]}px;border-radius:${d.r[1]}px;font-size:${Math.max(13, d.t.small)}px;font-weight:600;max-width:100%;text-align:center;`;
    if (kind === "Primary") s += `background:${a};color:${on};`; else if (kind === "Secondary") s += `background:${mix(a, g, .85)};color:${a};`; else s += `background:transparent;border:1.5px solid ${a};color:${a};`;
    if (state === "Hover") s += "filter:brightness(.92);"; if (state === "Pressed") s += "filter:brightness(.84);"; if (state === "Disabled") s += "opacity:.38;";
    return `<span style="${s}">${esc(k.label)}</span>`;
  };
  const states = ["Default", "Hover", "Pressed", "Disabled"];
  const cta = T("comp.cta");
  const buttons = `<div class="cgrid" style="grid-template-columns:90px repeat(4,1fr)"><div></div>${states.map(s => `<div class="label-m osv">${s}</div>`).join("")}${["Primary", "Secondary", "Outlined"].map(kd => `<div class="label-m osv">${kd}</div>${states.map(s => `<div class="ccell">${btn(kd, s)}</div>`).join("")}`).join("")}</div>`;
  /* The why lives in the side panel; the sheet shows the system itself. */
  const buttonWhy = "";
  const specRow = key => { const t = T(key); return t && String(t.v || "").trim() && !/^\[/.test(t.v) ? `<div class="sysrule" ${tokBtn(key)}><div class="title-s">${esc(sysVal(t.v))}</div></div>` : ""; };
  const card = (it, hover) => `<div style="border:1px solid color-mix(in srgb,${i} 16%,transparent);border-radius:${d.r[2]}px;overflow:hidden;background:${mix(g, "#ffffff", .6)};width:100%;max-width:240px;${hover ? "box-shadow:0 4px 12px rgba(0,0,0,.14);" : ""}"><div style="padding:${d.s[1]}px;display:flex;flex-direction:column;gap:${d.s[0]}px"><b style="font-family:${fd};font-size:${d.t.h3}px;line-height:1.2">${esc(it.name)}</b>${it.detail ? `<span style="font-size:${d.t.small}px;opacity:.8">${esc(it.detail)}</span>` : ""}${it.meta ? `<span style="font-size:${d.t.small}px;font-weight:600">${esc(it.meta)}</span>` : ""}${hover ? `<span style="color:${a};font-weight:600;font-size:${d.t.small}px">${esc(k.label)} →</span>` : ""}</div></div>`;
  const cards = k.items.length ? `<div class="cgrid" style="grid-template-columns:repeat(${Math.min(3, k.items.length + 1)},1fr)">${k.items.slice(0, 2).map(it => `<div class="ccell col"><div class="label-m osv">Default</div>${card(it)}</div>`).join("")}<div class="ccell col"><div class="label-m osv">Hover</div>${card(k.items[0], true)}</div></div>` : "";
  const tabs = k.nav.length ? `<div class="cgrid" style="grid-template-columns:repeat(2,1fr)">${["Default", "One selected"].map(s => `<div class="ccell col"><div class="label-m osv">${s}</div><div style="display:flex;flex-wrap:wrap;gap:${d.s[1]}px;font-size:${d.t.small}px;border-bottom:1px solid color-mix(in srgb,${i} 20%,transparent);padding-bottom:var(--sp-2);width:100%">${k.nav.map((n, x) => `<span style="${s !== "Default" && x === 0 ? `font-weight:700;box-shadow:inset 0 -2px 0 ${a}` : ""}">${esc(n)}</span>`).join("")}</div></div>`).join("")}</div>` : "";
  const f = k.field;
  const field = s => `<div style="font-size:${d.t.small}px;width:100%"><div style="margin-bottom:var(--sp-1);font-weight:600">${esc(f.label)}</div><div style="min-height:44px;border:${s === "Error" ? `2px solid ${d.signal}` : s === "Focus" ? `2px solid ${a}` : `1px solid color-mix(in srgb,${i} 40%,transparent)`};border-radius:${d.r[1]}px;padding:0 12px;display:flex;align-items:center;background:#fff;color:#111">${s === "Error" ? "" : `<span style="${s === "Default" ? "opacity:.55" : ""}">${esc(f.example || "")}</span>`}</div>${s === "Error" ? `<div style="color:${ratio(d.signal, g) >= 4.5 ? d.signal : i};margin-top:var(--sp-1)">${esc(f.error || "This field is required")}</div>` : ""}</div>`;
  const fields = f ? `<div class="cgrid" style="grid-template-columns:repeat(3,1fr)">${["Default", "Focus", "Error"].map(s => `<div class="ccell col"><div class="label-m osv">${s}</div>${field(s)}</div>`).join("")}</div>` : "";
  const chips = k.chips.length ? `<div class="row" style="gap:var(--sp-2);flex-wrap:wrap">${k.chips.map((c, x) => `<span style="display:inline-flex;align-items:center;min-height:32px;padding:0 var(--sp-3);border-radius:${d.r[0]}px;font-size:${d.t.small}px;border:1px solid ${x === 0 ? "transparent" : `color-mix(in srgb,${i} 40%,transparent)`};background:${x === 0 ? mix(a, g, .82) : "transparent"};color:${x === 0 ? a : i}">${x === 0 ? "✓ " : ""}${esc(c)}</span>`).join("")}</div>` : "";
  // The samples are drawn on the project's own background colour, as they will
  // appear on the page; the explanation under them stays in the app's colours.
  /* A sample with a style editor (23-style-groups.js) opens it when clicked. */
  const selCS = S.sel && S.sel.kind === "cstyle" ? S.sel.id : null;
  const wrap = (t, sub, demo, notes, cs) => demo || notes ? SHEET(SH(t, sub + (cs && typeof sgDef === "function" && sgDef(cs) ? (sub ? " · " : "") + "click to edit" : "")) + (demo ? `<div class="sysdemo${cs ? " pick" + (selCS === cs ? " sel" : "") : ""}" ${cs ? `data-cstyle="${cs}" tabindex="0" role="button" aria-label="Edit ${esc(t)}"` : ""} style="${scope};background:${g}">${demo}</div>` : "") + (notes || "")) : "";
  return wrap("Buttons", "the primary action, in every state", buttons, buttonWhy, "button") +
    wrap("Item card", "how one of the main things on offer is shown", cards, specRow("comp.dishCard"), "card") +
    wrap("Signal", "where the second colour is allowed", "", specRow("comp.heat")) +
    wrap("Navigation", "", tabs) + wrap("Form field", "", fields, "", "field") + wrap("Tags and filters", "", chips, "", "chip") + sysNoKitNote();
}

/* ---------- your own photographs ---------- */
/* One row per photograph: the picture, what it is, and the instruction the AI
   follows when it places it. The note is the part that matters, so it gets the
   room; whether the photo is actually on the page is stated rather than left to
   be discovered. */
function userImagerySheet() {
  const imgs = S.userImgs || []; const designed = !!(S.design && S.design.html);
  const cards = imgs.map((u, i) => {
    const onPage = designed ? (S.design.photos || []).includes("user:" + i) : !!u.slot;
    const status = onPage ? `<span class="badge ok">${designed ? "On the page" : "In use"}</span>` : `<span class="badge">Not used yet</span>`;
    /* Laid out like a saved inspiration card: the photo, its name, the note, the action. */
    return `<div class="refcard uiref" data-ui="${i}">
      <div class="refthumb"><img src="${u.src || IMG[u.imgk] || ""}" alt="${esc(u.name)}" draggable="false"></div>
      <div class="refinfo">
        <div class="row" style="flex-wrap:nowrap"><input class="inl title-s uiname" data-uiname="${i}" value="${esc(u.name)}" placeholder="Name this photo" aria-label="Photo name">${status}<button class="icon-btn rmref" data-uidel="${i}" aria-label="Remove ${esc(u.name || "photo")}" title="Remove"><span class="ms">delete</span></button></div>
        <textarea class="uiuse body-s" data-uiuse="${i}" rows="3" aria-label="Where this photo goes" placeholder="Where should this photo go?">${esc(sysVal(u.use || ""))}</textarea>
        <div class="refactions"><button class="btn tonal sm" data-uiai="${i}"><span class="ms">auto_awesome</span>${u.use ? "Rewrite from research" : "Write from research"}</button>
          ${designed ? "" : `<select class="chip sm" data-uislot="${i}" aria-label="Place this photo"><option value="">Place on page…</option><option value="hero" ${u.slot === "hero" ? "selected" : ""}>Home hero</option><option value="side" ${u.slot === "side" ? "selected" : ""}>Second photo</option><option value="story" ${u.slot === "story" ? "selected" : ""}>Story header</option></select>`}</div>
      </div></div>`;
  }).join("");
  /* Same header as Inspirations: title, count, one line, and the add button. The whole
     section takes dropped images. */
  return `<section class="card outlined insp-sec uidrop"><div class="pane-hd"><div><span class="title-l">Your photos <span class="badge p">${imgs.length}</span></span><div class="body-s osv">Real photos of this project. Add a note on where each goes.</div></div><span class="spacer"></span><label class="btn filled" for="uiFile" tabindex="0" role="button"><span class="ms">add</span>Add photo</label><input type="file" id="uiFile" accept="image/*" multiple hidden></div>
    ${cards ? `<div class="refgrid uigrid">${cards}</div>` : `<div class="insp-anno-empty body-s osv">No photos yet. Drop them here or use Add photo.</div>`}</section>`;
}


/* ---------- motifs ---------- */
/* An SVG from the model is shown inline, so only plain shapes survive: no scripts,
   event handlers, links, images, text, styles or foreign content. */
function cleanSvg(raw) {
  const str = String(raw || "").trim(); if (!/^<svg[\s>]/i.test(str) || str.length > 6000) return "";
  let doc; try { doc = new DOMParser().parseFromString(str, "image/svg+xml"); } catch { return ""; }
  const root = doc.documentElement; if (!root || root.nodeName.toLowerCase() !== "svg" || doc.querySelector("parsererror")) return "";
  const TAGS = new Set(["svg", "g", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon"]);
  const ATTRS = new Set(["viewbox", "xmlns", "d", "cx", "cy", "r", "rx", "ry", "x", "y", "x1", "y1", "x2", "y2", "points", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-dasharray", "opacity", "fill-opacity", "stroke-opacity", "transform", "fill-rule"]);
  const paint = v => /^(none|currentcolor|#[0-9a-f]{3,8})$/i.test(String(v).trim());
  const walk = el => {
    [...el.children].forEach(ch => { if (!TAGS.has(ch.nodeName.toLowerCase())) ch.remove(); else walk(ch); });
    [...el.attributes].forEach(a => { const n = a.name.toLowerCase();
      if (!ATTRS.has(n) || ((n === "fill" || n === "stroke") && !paint(a.value)) || /url\(|javascript:/i.test(a.value)) el.removeAttribute(a.name); });
  };
  walk(root);
  if (!root.getAttribute("viewBox")) root.setAttribute("viewBox", "0 0 120 120");
  return root.childElementCount ? new XMLSerializer().serializeToString(root) : "";
}
/* The motif direction, the motifs the AI drew, and the designer's own. */
function motifSheet(mo) {
  const drawn = (S.motifs || []).filter(m => m && m.svg), mine = S.userMotifs || [];
  const ground = tv("color.ground"), accent = tv("color.accent"), done = !!(S.gen && S.gen.system === "done");
  const drawnCards = drawn.map(m => `<div class="mcard" ${tokBtn("motif")}><div class="msvg mtsvg" style="background:${esc(ground)};color:${esc(accent)}">${cleanSvg(m.svg)}</div><span class="title-s">${esc(m.name)}</span>${m.use ? `<span class="body-s osv">${esc(m.use)}</span>` : ""}</div>`).join("");
  const mineCards = mine.map((m, i) => `<div class="mcard"><div class="msvg" style="background:${esc(ground)}">${m.src ? `<img src="${m.src}" alt="${esc(m.name || "Motif")}" style="max-width:100%;max-height:100%;object-fit:contain">` : ""}</div><div class="row" style="flex-wrap:nowrap"><span class="title-s" style="flex:1;min-width:0">${esc(m.name || "Motif")}</span><span class="badge">Yours</span><button class="icon-btn rmref" data-mtdel="${i}" aria-label="Remove ${esc(m.name || "motif")}" title="Remove"><span class="ms">delete</span></button></div></div>`).join("");
  const empty = `<div class="insp-anno-empty body-s osv">${done ? "No motifs drawn yet." : "Regenerate the design system to draw motifs from your research and inspiration."} You can also add your own.</div>`;
  return `<section class="card outlined insp-sec mtdrop"><div class="pane-hd"><div><span class="title-l">Motifs <span class="badge p">${drawn.length + mine.length}</span></span><div class="body-s osv">${mo ? esc(sysVal(mo.v)) : "Recurring shapes the site repeats."}</div></div><span class="spacer"></span>${sample && done ? `<button class="btn tonal" id="mtDraw"><span class="ms">auto_awesome</span>${drawn.length ? "Redraw" : "Draw motifs"}</button>` : ""}<label class="btn filled" for="mtFile" tabindex="0" role="button"><span class="ms">add</span>Add motif</label><input type="file" id="mtFile" accept="image/*,.svg" multiple hidden></div>
    ${drawn.length || mine.length ? `<div class="mgrid">${drawnCards}${mineCards}</div>` : empty}</section>`;
}
function wireMotifs(c) {
  const fi = $("#mtFile", c); if (!fi) return;
  const add = files => [...files].forEach(f => { if (!f.type.startsWith("image/")) return; const rd = new FileReader();
    rd.onload = async () => { const pid = currentPid(); const key = "mt:" + (S.pid || "p") + ":" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); const isSvg = /svg/.test(f.type);
      let stored = rd.result; if (!isSvg) stored = await rememberImage(key, rd.result); else { try { await imgPut(key, rd.result); } catch {} }
      if (!stillOnProject(pid)) return; S.userMotifs = S.userMotifs || []; S.userMotifs.push({ name: f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "), src: stored, imgKey: key });
      snapshot("added motif"); save(); renderSystem(); toast("Motif added · regenerate to build it into the system"); };
    rd.readAsDataURL(f); });
  fi.onchange = e => add(e.target.files);
  const lbl = $('label[for="mtFile"]', c); if (lbl) lbl.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fi.click(); } };
  const zone = $(".mtdrop", c); if (zone) { zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("over"); }); zone.addEventListener("dragleave", () => zone.classList.remove("over")); zone.addEventListener("drop", e => { e.preventDefault(); zone.classList.remove("over"); add(e.dataTransfer.files); }); }
  $$("[data-mtdel]", c).forEach(b => b.onclick = e => { e.stopPropagation(); const i = +b.dataset.mtdel; const m = (S.userMotifs || [])[i]; if (!m) return;
    snapshot("removed motif"); S.userMotifs.splice(i, 1); save(); renderSystem(); toast(`“${m.name || "Motif"}” removed`); });
  const dr = $("#mtDraw", c); if (dr) dr.onclick = async () => { const pid = currentPid(); dr.disabled = true; dr.innerHTML = '<span class="spin" style="width:14px;height:14px;border-width:2px" aria-hidden="true"></span>Drawing…';
    try { const m = cleanMotifs(await aiMotifs()); if (!stillOnProject(pid)) return; if (!m.length) throw new Error("none"); snapshot("drew motifs"); S.motifs = m; save(); toast(`${m.length} motif${m.length === 1 ? "" : "s"} drawn from your research and inspiration`); }
    catch (e) { if (stillOnProject(pid)) toast("Couldn't draw motifs (" + (e.code || e.message || "error") + ")"); }
    if (stillOnProject(pid)) renderSystem(); };
}
