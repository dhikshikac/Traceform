/* Base system: what the design system starts from.

   The project either starts from its AI-generated system (drafted from research and
   inspiration) or from an established system (Material 3, Apple HIG, Carbon,
   Polaris) or an uploaded tokens.json. A base sets colours, fonts, the type scale,
   spacing, corner radius and the button wording; tokens that come from research
   rather than a design language (imagery, motif, item cards, signal use) always
   stay from the AI draft.

   Everything customised in the other sections sits on top of the base:
     - token edits made by the person (t.user),
     - text-style edits (S.typeStyles),
     - component and imagery edits (S.compStyles).
   Text, component and imagery defaults are read from the tokens, so they follow
   the base automatically. Switching base asks whether to keep those edits. */

/* Values the base system tables (BASE_TOKENS in 40-app.js) leave out. */
const BASE_EXTRA = {
  m3: { "color.heat": "#B3261E" }, hig: { "color.heat": "#FF3B30" },
  carbon: { "color.heat": "#DA1E28" }, polaris: { "color.heat": "#D72C0D" },
};
const BASE_ORDER = ["custom", "m3", "hig", "carbon", "polaris", "upload"];
function baseName(k) { return k === "custom" ? "AI-generated (from your research)" : (BASES[k] && BASES[k].name) || "Custom"; }
function baseKey() { return BASES[S.baseSystem] ? S.baseSystem : "custom"; }

/* What the person has customised on top of the base. */
function baseCustomizations() {
  const toks = (S.tokens || []).filter(t => t.user).map(t => ({ kind: "token", label: decName(t), val: t.v }));
  const ts = Object.keys(S.typeStyles || {}).filter(k => typeof tsDef === "function" && tsDef(k)).map(k => ({ kind: "text style", label: tsDef(k).name }));
  const cs = Object.keys(S.compStyles || {}).filter(k => typeof sgDef === "function" && sgDef(k)).map(k => ({ kind: "style", label: sgDef(k).name }));
  return [...toks, ...ts, ...cs];
}

/* Tokens for a base: the AI draft, with the base's values laid over the
   design-language tokens. */
function baseTokens(k, imported) {
  const fresh = sysDraft();
  if (k === "custom") return fresh;
  const vals = k === "upload" ? (imported || {}) : { ...(BASE_TOKENS[k] || {}), ...(BASE_EXTRA[k] || {}) };
  const label = k === "upload" ? "imported" : `${BASES[k].name} default`;
  Object.entries(vals).forEach(([key, val]) => {
    const t = fresh.find(x => x.k === key); if (!t) return;
    t.v = t.type === "color" ? String(val).toUpperCase() : String(val);
    t.why = label; t.edited = true; t.user = false;
    if (k !== "upload" && BASE_PREV[k] && BASE_PREV[k][key] && Array.isArray(t.prev) && !t.prev.some(p => p[0] === BASE_PREV[k][key])) t.prev = [[BASE_PREV[k][key], k === "m3" ? 46 : k === "hig" ? 38 : k === "carbon" ? 12 : 31], ...t.prev];
  });
  return fresh;
}

function applyBase(k, keep, imported) {
  const old = S.tokens || [];
  snapshot(`base system → ${baseName(k)}`);
  S.tokens = baseTokens(k, imported);
  if (keep) old.filter(t => t.user).forEach(o => { const i = S.tokens.findIndex(t => t.k === o.k); if (i >= 0) S.tokens[i] = JSON.parse(JSON.stringify(o)); });
  else { S.typeStyles = {}; S.compStyles = {}; }
  if (typeof keepLocked === "function") keepLocked(old);
  S.tokens.forEach(t => { if (typeof mineLabel === "function") t.mine = mineLabel(t); });
  S.baseSystem = k; S.sysBuilt = true;
  save(); renderSystem(); if (S.view === "review") renderReview();
  toast(`Base: ${baseName(k)}${keep ? " · your customizations kept" : ""}`);
}

function chooseBase(k, imported) {
  if (k === baseKey() && k !== "upload") return;
  const n = baseCustomizations().length;
  if (!n) { applyBase(k, false, imported); return; }
  dialog(`<span class="headline-s">Switch to ${esc(baseName(k))}?</span>
    <div class="body-m">You have ${n} customization${n === 1 ? "" : "s"} on top of ${esc(baseName(baseKey()))}. Keep ${n === 1 ? "it" : "them"} on top of the new base, or start clean from ${esc(baseName(k))}?</div>`,
    [["Cancel", "text", () => { }], ["Start clean", "outlined", () => applyBase(k, false, imported)], ["Keep my customizations", "filled", () => applyBase(k, true, imported)]]);
}

function uploadBase() {
  dialog(`<span class="headline-s">Upload a design system</span><div class="note">Paste a tokens.json or a Figma variables export. Keys named color.ground, color.accent, color.heat, color.ink, type.display, type.body, type.scale, space.scale and shape.radius are used; others are ignored.</div><div class="field"><textarea id="dsTA" rows="8" placeholder='{"color.accent":"#2B6E63", "type.display":"Fraunces", "shape.radius":"4 / 8 / 12"}'></textarea></div>`,
    [["Cancel", "text", () => { }], ["Use as base", "filled", () => {
      let o; try { o = JSON.parse($("#dsTA").value); } catch { toast("That isn't valid JSON"); return; }
      const keys = new Set((S.tokens || []).map(t => t.k));
      const vals = Object.fromEntries(Object.entries(o || {}).filter(([k, v]) => keys.has(k) && (typeof v === "string" || typeof v === "number")).map(([k, v]) => [k, String(v)]));
      const bad = Object.entries(vals).find(([k, v]) => k.startsWith("color.") && !/^#[0-9a-f]{6}$/i.test(v));
      if (bad) { toast(`${bad[0]} must be a six-digit hex colour`); return; }
      if (!Object.keys(vals).length) { toast("No recognised token keys in that file"); return; }
      chooseBase("upload", vals);
    }]]);
}

/* ---------- the Base system page ---------- */
function renderBaseSystem() {
  const c = $("#sysCenter"), cur = baseKey(), mine = baseCustomizations();
  const draft = sysDraft(), dv = k => (draft.find(t => t.k === k) || {}).v;
  const sw = k => k === "custom" ? [dv("color.ground"), dv("color.accent"), dv("color.heat"), dv("color.ink")] : k === "upload" ? ["#999", "#CCC", "#EEE"] : [BASE_TOKENS[k]["color.ground"], BASE_TOKENS[k]["color.accent"], BASE_EXTRA[k]["color.heat"], BASE_TOKENS[k]["color.ink"]];
  const facts = k => {
    if (k === "custom") return [`${dv("type.display")} / ${dv("type.body")}`, `radius ${dv("shape.radius")}`];
    if (k === "upload") return ["any keys you provide", "the rest from your AI draft"];
    const b = BASE_TOKENS[k]; return [`${b["type.display"]}${b["type.body"] !== b["type.display"] ? " / " + b["type.body"] : ""}`, `radius ${b["shape.radius"]}`];
  };
  const desc = { custom: "Drafted from your research and saved inspiration. Every setting has a why and a what-not.", upload: "Paste a tokens.json or a Figma variables export." };
  c.innerHTML = `<div class="pane-hd sys-hd"><div><span class="title-l">Base system</span><div class="body-s osv">Choose what your design system starts from. Everything you customize in the other sections is applied on top of it.</div></div></div>
  <div class="dsgrid" role="radiogroup" aria-label="Base system">${BASE_ORDER.map(k => `<div class="ds ${cur === k ? "on" : ""}" data-base="${k}" tabindex="0" role="radio" aria-checked="${cur === k}">
    <div class="row" style="gap:6px"><span class="title-s">${esc(baseName(k))}</span>${k === "upload" ? '<span class="ms" style="margin-left:auto">upload</span>' : cur === k ? '<span class="badge p" style="margin-left:auto">In use</span>' : ""}</div>
    <div class="sws">${sw(k).map(s => `<i style="background:${esc(s || "#ccc")}"></i>`).join("")}</div>
    <div class="body-s">${esc(desc[k] || BASES[k].desc)}</div>
    <div class="body-s osv">${facts(k).map(esc).join(" · ")}</div>
    ${k !== "custom" && k !== "upload" ? `<div class="body-s osv">${esc(BASES[k].note)}</div>` : ""}
  </div>`).join("")}</div>
  <section class="sheet"><div class="sheet-hd"><span class="title-s">What the base sets</span><span class="body-s osv">${esc(baseName(cur))}</span></div>
    <div class="toks" style="grid-template-columns:150px 1.2fr 1fr"><div class="h">setting</div><div class="h">value</div><div class="h">from</div>${(S.tokens || []).filter(t => ["color", "type", "space"].includes(t.sec) || t.k === "comp.cta").map(t => { const o = origin(t); return `<div class="tokrow" data-tok="${t.k}" tabindex="0" role="button"><div>${esc(decName(t))}</div><div>${t.type === "color" ? `<span class="sw" style="background:${esc(t.v)}"></span>` : ""}${esc(t.v)}</div><div class="osv">${esc(o[0] === "AI draft" || o[0] === "Template" ? (cur === "custom" ? o[0] : "AI draft (kept)") : o[0])}</div></div>`; }).join("")}</div></section>
  <div class="note">Imagery, motif, item cards and signal use always come from your research, whichever base you pick.</div>`;
  $$("[data-base]", c).forEach(d => { const go = () => d.dataset.base === "upload" ? uploadBase() : chooseBase(d.dataset.base); d.onclick = go; d.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } }; });
  $$("[data-tok]", c).forEach(r => r.onclick = () => { select({ kind: "token", id: r.dataset.tok }); renderSystem(); });
  renderBaseRail(mine);
}
function renderBaseRail(mine) {
  const r = $("#rail-system"), cur = baseKey();
  r.innerHTML = `<div class="pane-hd"><span class="title-m">Base system</span></div>
  <div class="card outlined"><span class="label-m osv">In use</span><div class="title-s">${esc(baseName(cur))}</div><div class="body-s osv">${esc(cur === "custom" ? "Drafted from your research." : cur === "upload" ? "Your uploaded tokens, with the rest from your AI draft." : BASES[cur].desc)}</div></div>
  <div class="col" style="gap:8px"><span class="title-s">Your customizations on top · ${mine.length}</span>${mine.length ? mine.map(m => `<div class="body-s" style="padding:6px 0;border-bottom:1px solid var(--outline-variant)"><span class="osv">${esc(m.kind)}</span> · ${esc(m.label)}${m.val ? ` <span class="mono osv">${esc(m.val)}</span>` : ""}</div>`).join("") : `<div class="body-s osv">None yet. Edits you make in Color, Text styles, Spacing &amp; shape, Imagery &amp; motif and Components appear here.</div>`}</div>
  ${mine.length ? `<button class="btn text sm" id="clearMine">Clear my customizations</button>` : ""}`;
  const cm = $("#clearMine", r); if (cm) cm.onclick = () => dialog(`<span class="headline-s">Clear your customizations?</span><div class="body-m">Every setting goes back to ${esc(baseName(cur))}. You can undo this from version history.</div>`, [["Cancel", "text", () => { }], ["Clear", "filled", () => applyBase(cur, false, cur === "upload" ? Object.fromEntries((S.tokens || []).filter(t => t.why === "imported").map(t => [t.k, t.v])) : undefined)]]);
}
