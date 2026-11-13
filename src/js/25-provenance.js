/* Where each value comes from, and which edit wins.

   The System page has three layers: the base system (24-base-system.js), the
   system settings on it (tokens: colours, fonts, type scale, spacing steps, corner
   radii), and item styles that can set their own values (text styles, components,
   photos). A specific item's own value beats the system setting it would otherwise
   follow. These helpers make that visible:
     - baseShort / provLabel: the same source wording everywhere;
     - sysSource*: which system setting an item property follows;
     - overridersOf: which items ignore a system setting because they set their own. */

function baseShort() { const k = baseKey(); return k === "custom" ? "your AI draft" : k === "upload" ? "your uploaded tokens" : BASES[k].name; }
function baseChipHTML() { return `<button type="button" class="chip sm assist base-chip" data-gobase title="Change the base system"><span class="ms" style="font-size:16px">layers</span>Base: ${esc(baseShort())}</button>`; }
function wireBaseChip(root) { $$("[data-gobase]", root).forEach(b => b.onclick = e => { e.stopPropagation(); S.sysSection = "base"; select(null); save(); renderSystem(); }); }

/* One wording for where a value comes from. */
function provLabel(edited) { return edited ? "Edited by you" : `From ${baseShort()}`; }
function provBadge(edited) { return edited ? '<span class="badge p">Edited by you</span>' : `<span class="body-s osv">From ${esc(baseShort())}</span>`; }

/* The value the base system gives a token, before your edits. */
function baseTokenValue(k) { try { const t = baseTokens(baseKey(), S.baseImport).find(x => x.k === k); return t ? t.v : null; } catch { return null; } }
function resetTokenToBase(k) {
  const fresh = baseTokens(baseKey(), S.baseImport).find(x => x.k === k); const i = (S.tokens || []).findIndex(x => x.k === k);
  if (!fresh || i < 0) return;
  snapshot(`reset ${k} to ${baseShort()}`); S.tokens[i] = fresh; if (typeof mineLabel === "function") fresh.mine = mineLabel(fresh);
  save(); renderSystem(); if (S.view === "review") renderReview(); toast(`${decName(fresh)} follows ${baseShort()} again`);
}

/* Which system setting a style property follows, in words and as a key. */
const SCALE_WORD = { "space.scale": i => i === 0 ? "the first spacing step" : `spacing step ${i + 1}`, "shape.radius": i => `the ${["small", "medium", "large"][i] || "step " + (i + 1)} corner radius` };
function sgFrom(item, p) {
  const m = { button: { h: "space.scale:0", px: "space.scale:0", r: "shape.radius:1" }, card: { r: "shape.radius:2", pad: "space.scale:1" }, field: { r: "shape.radius:1" }, chip: { r: "shape.radius:0" }, heroPhoto: { r: "shape.radius:2" }, mediaPhoto: { r: "shape.radius:2" } };
  return (m[item.id] || {})[p.k] || null;
}
function sysSourceWord(from) { if (!from) return ""; const [k, i] = from.split(":"); return SCALE_WORD[k] ? SCALE_WORD[k](+i) : decName(T(k) || { k }); }
const TS_FROM = { size: () => "type.scale", font: s => s.fam === "display" ? "type.display" : "type.body" };
function tsSourceWord(prop, s) { return prop === "size" ? "the type scale" : prop === "font" ? `the ${s.fam === "display" ? "display" : "body"} font` : ""; }

/* Items that set their own value instead of following a system setting.
   key: a token key; idx: a step inside it (spacing step, radius), or null for any. */
function overridersOf(key, idx) {
  const out = [];
  if (typeof TS_LIST !== "undefined") TS_LIST.forEach(s => {
    const e = tsEdits(s.id) || {};
    if (key === "type.scale" && e.size != null) out.push({ name: s.name, what: "size", sel: { kind: "tstyle", id: s.id } });
    if ((key === "type.display" && s.fam === "display" || key === "type.body" && s.fam === "body") && e.font) out.push({ name: s.name, what: "font", sel: { kind: "tstyle", id: s.id } });
  });
  if (typeof sgAll === "function") sgAll().forEach(item => item.props.forEach(p => {
    const f = sgFrom(item, p); if (!f || !(p.k in sgEdits(item.id))) return;
    const [k, i] = f.split(":");
    if (k === key && (idx == null || +i === idx)) out.push({ name: item.name, what: p.label.toLowerCase(), sel: { kind: "cstyle", id: item.id } });
  }));
  return out;
}
function overridersHTML(key, idx) {
  const o = overridersOf(key, idx); if (!o.length) return "";
  return `<div class="ov-note"><span class="ms">call_split</span><div class="body-s"><b>Not affected by this setting:</b> ${o.map(x => `<button type="button" class="linkish" data-ovsel='${esc(JSON.stringify(x.sel))}'>${esc(x.name)}</button> (own ${esc(x.what)})`).join(", ")}. An item's own value wins over the system. Reset ${o.length === 1 ? "it" : "them"} to follow this setting again.</div></div>`;
}
function wireOverriders(root) { $$("[data-ovsel]", root).forEach(b => b.onclick = e => { e.preventDefault(); select(JSON.parse(b.dataset.ovsel)); renderSystem(); }); }

/* Links from a style panel to the system-wide settings behind it, so everything the
   Tokens sheet can edit is also one click away from the Preview. */
function relatedHTML(keys) {
  const ts = keys.map(k => T(k)).filter(Boolean);
  return ts.length ? `<div class="body-s osv rel-set">Related settings: ${ts.map(t => `<button type="button" class="linkish" data-relk="${esc(t.k)}">${esc(decName(t))}</button>`).join(" · ")}</div>` : "";
}
function wireRelated(root) { $$("[data-relk]", root).forEach(b => b.onclick = e => { e.preventDefault(); select({ kind: "token", id: b.dataset.relk }); renderSystem(); }); }
/* Under a field in a style panel: does it follow the system, or override it? */
function fieldNote(edited, sourceWord, baseShown) {
  if (!sourceWord) return edited ? `<div class="fnote own">Your value · default ${esc(baseShown)}</div>` : `<div class="fnote">Default</div>`;
  return edited
    ? `<div class="fnote own">Your value · overrides ${esc(sourceWord)} (${esc(baseShown)}), so changing that won't move it</div>`
    : `<div class="fnote">Follows ${esc(sourceWord)}</div>`;
}
