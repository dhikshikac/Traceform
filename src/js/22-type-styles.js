/* Text styles: each style the website uses, with its own font, size, line height,
   weight and letter spacing.

   A style starts from the design system: the display or body font token and the
   size that type.scale gives it (designTokensBase in 75-design-page.js). Editing a
   style stores only what was changed, in S.typeStyles[id], so an unedited style
   keeps following the tokens, and editing the type scale or a font still moves it.

   Where a style reaches:
     - the Text styles sheet (Tokens view) and the Preview (32-system-specimen.js);
     - the template website (siteCSS: only edited styles add rules, so an unedited
       project renders exactly as before);
     - AI-designed pages, through designTokens(): an edited size changes --t-*. */

const TS_LIST = [
  { id: "display", name: "Display", role: "Page and hero headlines", fam: "display", size: "display", lh: 1.15, w: 600, tr: -0.5 },
  { id: "h2", name: "Heading", role: "Section headings", fam: "display", size: "h2", lh: 1.2, w: 600, tr: 0 },
  { id: "h3", name: "Subheading", role: "Card titles, pull quotes", fam: "display", size: "h3", lh: 1.25, w: 600, tr: 0 },
  { id: "body", name: "Body", role: "Paragraphs and most text", fam: "body", size: "body", lh: 1.5, w: 400, tr: 0 },
  { id: "small", name: "Small", role: "Captions, descriptions, meta", fam: "body", size: "small", lh: 1.45, w: 400, tr: 0 },
  { id: "label", name: "Button label", role: "Buttons and links styled as buttons", fam: "body", size: "small", lh: 1.2, w: 600, tr: 0.2 },
];
const TS_WEIGHTS = [[300, "Light"], [400, "Regular"], [500, "Medium"], [600, "Semibold"], [700, "Bold"], [800, "Extra bold"]];
const tsDef = id => TS_LIST.find(x => x.id === id);
function tsEdits(id) { return (S.typeStyles || {})[id] || null; }
function tsEdited(id) { const e = tsEdits(id); return !!e && Object.keys(e).length > 0; }

/* The style as the design system gives it, before any edit. */
function tsBase(id) {
  const s = tsDef(id); if (!s) return null;
  const d = typeof designTokensBase === "function" ? designTokensBase() : designTokens();
  return { font: s.fam === "display" ? d.fontDisplay : d.fontBody, size: d.t[s.size], lh: s.lh, w: s.w, tr: s.tr };
}
/* The style as it is used: the base with this project's edits on top. */
function tsResolved(id) {
  const b = tsBase(id); if (!b) return null;
  const e = tsEdits(id) || {};
  const num = (v, d) => (v === "" || v == null || !Number.isFinite(+v)) ? d : +v;
  return { font: e.font || b.font, size: num(e.size, b.size), lh: num(e.lh, b.lh), w: num(e.w, b.w), tr: num(e.tr, b.tr) };
}
function tsFamilyCSS(font, fam) { return `'${String(font).replace(/['"]/g, "")}',${fam === "display" ? "Georgia,serif" : "system-ui,sans-serif"}`; }
function tsDecl(id) {
  const r = tsResolved(id), s = tsDef(id);
  return `font-family:${tsFamilyCSS(r.font, s.fam)};font-size:${r.size}px;line-height:${r.lh};font-weight:${r.w};letter-spacing:${r.tr}px`;
}

/* Which parts of a page use which style. Shared by the Preview and the website. */
const TS_TARGETS = {
  display: [".hero .ov h1", "h1.t", ".shero h1"],
  h2: ["h2.sec", ".gh"],
  h3: [".brand", ".card h3", ".story .q", ".box h4", ".hcard b"],
  body: [".hero .ov p", ".lead p", ".story p:not(.q)", ".prose p"],
  small: ["p.secsub", ".card p", ".card .b>p", ".links>a:not(.btn)", ".hcard .l", ".foot", ".sx-field"],
  label: [".btn"],
};
/* Rules for the website: only the styles that were edited, so an untouched
   project renders exactly as it did. */
function tsSiteCSS(scope) {
  return TS_LIST.filter(s => tsEdited(s.id)).map(s => `${TS_TARGETS[s.id].map(q => `${scope} ${q}`).join(",")}{${tsDecl(s.id)}}`).join("\n");
}
/* Rules for the Preview: every style, edited or not, so the preview shows the system. */
function tsSpecimenCSS(scope) {
  return TS_LIST.map(s => `${TS_TARGETS[s.id].map(q => `${scope} ${q}`).join(",")}{${tsDecl(s.id)}}`).join("\n");
}

/* Rules for an AI-designed page. Its HTML and CSS were written by the model, so
   the text-style classes above don't exist there; the edited properties go onto
   the plain elements instead, and win over the page's own CSS. Only what was
   edited is set, so everything else stays as the page was designed. */
const TS_DESIGN_TARGETS = {
  display: [".pg h1"], h2: [".pg h2"], h3: [".pg h3"], body: [".pg p"],
  small: [".pg small", ".pg figcaption"],
  label: [".pg .btn", ".pg button", ".pg a[class*='btn']", ".pg a[class*='button']"],
};
function tsDesignCSS() {
  return TS_LIST.filter(s => tsEdited(s.id)).map(s => {
    const e = tsEdits(s.id), r = tsResolved(s.id), out = [];
    if (e.font) out.push(`font-family:${tsFamilyCSS(r.font, s.fam)}`);
    if (e.size != null) out.push(`font-size:${r.size}px`);
    if (e.lh != null) out.push(`line-height:${r.lh}`);
    if (e.w != null) out.push(`font-weight:${r.w}`);
    if (e.tr != null) out.push(`letter-spacing:${r.tr}px`);
    return out.length ? `${TS_DESIGN_TARGETS[s.id].join(",")}{${out.map(x => x + " !important").join(";")}}` : "";
  }).join("\n");
}

/* ---------- the Text styles sheet ---------- */
function tsSheetRows(sample) {
  const sel = S.sel && S.sel.kind === "tstyle" ? S.sel.id : null;
  return TS_LIST.map(s => {
    const r = tsResolved(s.id); const ed = tsEdited(s.id);
    const wn = (TS_WEIGHTS.find(x => x[0] === r.w) || [r.w, String(r.w)])[1];
    const txt = (sample && sample[s.id]) || s.name;
    return `<div class="trow pick ${sel === s.id ? "sel" : ""}" data-tstyle="${s.id}" tabindex="0" role="button" aria-label="Edit ${esc(s.name)} text style"><div class="tmeta"><div class="title-s">${esc(s.name)}</div><div>${provBadge(ed)}</div><div class="body-s osv">${esc(s.role)}</div><div class="body-s osv">${esc(r.font)} · ${r.size}px · ${wn} ${r.w} · line ${r.lh} · tracking ${r.tr}px</div></div><div class="tsample" style="${tsDecl(s.id)};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(String(txt).slice(0, s.id === "body" || s.id === "small" ? 140 : 60))}</div></div>`;
  }).join("");
}
function wireTypeStyleRows(root) {
  $$("[data-tstyle]", root).forEach(r => {
    const go = () => { select({ kind: "tstyle", id: r.dataset.tstyle }); renderSystem(); };
    r.onclick = e => { e.stopPropagation(); go(); };
    r.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
  });
}

/* ---------- the side panel editor for one text style ---------- */
let tsDrafts = {}, tsDraftOwner = null;
function renderTypeStyleRail() {
  if (tsDraftOwner !== S) { tsDraftOwner = S; tsDrafts = {}; }
  const r = $("#rail-system"), id = S.sel.id, s = tsDef(id);
  if (!s) { S.sel = null; renderSystemRail(); return; }
  const b = tsBase(id), cur = tsResolved(id), d = tsDrafts[id] || { ...cur };
  const dirty = ["font", "size", "lh", "w", "tr"].some(k => String(d[k]) !== String(cur[k]));
  const famTok = T(s.fam === "display" ? "type.display" : "type.body");
  const fonts = [...new Set([b.font, ...(FONTS.display || []), ...(FONTS.body || []), cur.font, d.font].filter(Boolean))];
  const why = [...new Set([famTok && plainWhy(famTok), T("type.scale") && plainWhy(T("type.scale"))].filter(Boolean))];
  const cs = [...new Set([...(famTok ? cites(famTok.why) : []), ...(T("type.scale") ? cites(T("type.scale").why) : [])])];
  const e0 = tsEdits(id) || {};
  const shown = { font: b.font, size: b.size + "px", lh: String(b.lh), w: String(b.w), tr: b.tr + "px" };
  const note = k => fieldNote(k in e0, tsSourceWord(k, s), shown[k]);
  const num = (k, lbl, step, min, max, unit) => `<div class="field"><label for="ts_${k}">${lbl}${unit ? ` (${unit})` : ""}</label><input type="number" id="ts_${k}" value="${esc(d[k])}" step="${step}" min="${min}" max="${max}" inputmode="decimal">${note(k)}</div>`;
  r.innerHTML = `<div class="rhead"><div class="title-m" style="min-width:0">${esc(s.name)}</div><span class="spacer"></span><button class="icon-btn" data-closesel aria-label="Clear selection"><span class="ms">close</span></button></div>
  <div class="field"><label for="tsPick">Text style</label><select id="tsPick">${TS_LIST.map(x => `<option value="${x.id}" ${x.id === id ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select></div>
  <form class="sys-editor" id="tsForm" novalidate>
    <div class="field"><label for="ts_font">Font family</label><select id="ts_font">${fonts.map(f => `<option value="${esc(f)}" ${f === d.font ? "selected" : ""}>${esc(f)}${f === b.font ? ` (${s.fam === "display" ? "display" : "body"} font)` : ""}</option>`).join("")}</select>${note("font")}</div>
    <div class="row" style="gap:12px;flex-wrap:nowrap">${num("size", "Size", 1, 8, 160, "px")}${num("lh", "Line height", 0.05, 0.8, 3, "")}</div>
    <div class="row" style="gap:12px;flex-wrap:nowrap"><div class="field"><label for="ts_w">Weight</label><select id="ts_w">${TS_WEIGHTS.map(([w, n]) => `<option value="${w}" ${+d.w === w ? "selected" : ""}>${n} · ${w}</option>`).join("")}</select>${note("w")}</div>${num("tr", "Letter spacing", 0.1, -5, 10, "px")}</div>
    <div class="ts-prev" style="${tsDeclFrom(d, s.fam)};padding:12px;border:1px solid var(--outline-variant);border-radius:12px;background:${esc(tv("color.ground") || "#fff")};color:${esc(tv("color.ink") || "#111")};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(s.id === "label" ? "Primary action" : s.id === "body" || s.id === "small" ? "The quick brown fox jumps over the lazy dog." : s.name + " sample")}</div>
    <section class="sys-whybox"><span class="title-s">Why this setting?</span><div class="body-m">${why.length ? esc(why.join(" ")) : '<span class="osv">No explanation added.</span>'}</div>${cs.length ? `<div class="sys-based"><span class="body-s osv">Based on</span>${basedOnHTML(cs)}</div>` : ""}<span class="body-s osv">${esc(provLabel(tsEdited(id)))} · base: ${esc(baseShort())}</span></section>
    ${relatedHTML([s.fam === "display" ? "type.display" : "type.body", "type.scale", "type.accentLine"])}
    <p class="body-s bad-t" id="tsErr" role="alert"></p>
    <div class="row sys-apply" id="tsActions" ${dirty ? "" : "hidden"}><span class="spacer"></span><button type="button" class="btn text sm" id="tsCancel">Cancel</button><button type="submit" class="btn filled sm">Apply change</button></div>
    ${tsEdited(id) ? `<div class="row"><button type="button" class="btn text sm" id="tsReset">Reset to follow ${esc(baseShort())}</button></div>` : ""}
  </form>
  ${promptBox(s.name, "")}`;
  const read = () => ({ font: $("#ts_font").value, size: $("#ts_size").value, lh: $("#ts_lh").value, w: +$("#ts_w").value, tr: $("#ts_tr").value });
  const f = $("#tsForm");
  const draft = () => {
    const v = read(); tsDrafts[id] = v;
    const same = ["font", "size", "lh", "w", "tr"].every(k => String(v[k]) === String(cur[k]));
    $("#tsActions").hidden = same; $("#tsErr").textContent = "";
    sysLivePreview();
    const p = $(".ts-prev", r); if (p) p.style.cssText = p.style.cssText.replace(/font-family:[^;]*;font-size:[^;]*;line-height:[^;]*;font-weight:[^;]*;letter-spacing:[^;]*/, tsDeclFrom(v, s.fam));
  };
  f.addEventListener("input", draft); f.addEventListener("change", draft);
  f.onsubmit = e => {
    e.preventDefault(); const v = read();
    const bad = [["size", 8, 160, "Size"], ["lh", 0.8, 3, "Line height"], ["tr", -5, 10, "Letter spacing"]].find(([k, lo, hi]) => String(v[k]) !== String(cur[k]) && (v[k] === "" || !Number.isFinite(+v[k]) || +v[k] < lo || +v[k] > hi));
    if (bad) { $("#tsErr").textContent = `${bad[3]} must be a number from ${bad[1]} to ${bad[2]}.`; return; }
    snapshot(`text style ${s.name} → ${v.font} ${v.size}px ${v.w}`);
    const out = {};
    if (v.font !== b.font) out.font = v.font;
    if (+v.size !== b.size) out.size = +v.size;
    if (+v.lh !== b.lh) out.lh = +v.lh;
    if (+v.w !== b.w) out.w = +v.w;
    if (+v.tr !== b.tr) out.tr = +v.tr;
    S.typeStyles = { ...(S.typeStyles || {}) };
    if (Object.keys(out).length) S.typeStyles[id] = out; else delete S.typeStyles[id];
    delete tsDrafts[id]; save(); renderSystem(); if (S.view === "review") renderReview();
    toast(`${s.name} updated across the website`);
  };
  $("#tsCancel").onclick = () => { delete tsDrafts[id]; renderTypeStyleRail(); sysLivePreview(); };
  const rs = $("#tsReset"); if (rs) rs.onclick = () => { snapshot(`reset text style ${s.name}`); S.typeStyles = { ...(S.typeStyles || {}) }; delete S.typeStyles[id]; delete tsDrafts[id]; save(); renderSystem(); if (S.view === "review") renderReview(); toast(`${s.name} follows ${baseShort()} again`); };
  $("#tsPick").onchange = () => { select({ kind: "tstyle", id: $("#tsPick").value }); renderSystem(); };
  wireRelated(r);
  wireStylePrompt(r, "tstyle:" + id, [{ id: "ts_font", k: "font", label: "Font family", opts: fonts }, { id: "ts_size", k: "size", label: "Size in px", min: 8, max: 160 }, { id: "ts_lh", k: "lh", label: "Line height", min: 0.8, max: 3 }, { id: "ts_w", k: "w", label: "Weight", opts: TS_WEIGHTS.map(x => String(x[0])) }, { id: "ts_tr", k: "tr", label: "Letter spacing in px", min: -5, max: 10 }],
    `text style "${s.name}" (${s.role}): ${cur.font}, ${cur.size}px, line height ${cur.lh}, weight ${cur.w}, letter spacing ${cur.tr}px. Why: ${why.join(" ") || "no explanation"}`);
  wireCites(r);
  $$("[data-closesel]", r).forEach(x => x.onclick = clearSel);
}
function tsDeclFrom(v, fam) {
  return `font-family:${tsFamilyCSS(v.font, fam)};font-size:${+v.size || 16}px;line-height:${+v.lh || 1.4};font-weight:${+v.w || 400};letter-spacing:${Number.isFinite(+v.tr) ? +v.tr : 0}px`;
}
