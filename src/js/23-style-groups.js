/* Editable styles for Components and Imagery & motif, and editable steps for
   Spacing & shape. The same idea as text styles (22-type-styles.js):

   - each item starts from the design system (spacing, radius and colour tokens);
   - an edit stores only the property that changed, in S.compStyles[item][prop],
     so an unedited item keeps following the tokens;
   - the Preview always shows every item; the template website and AI-designed
     pages get rules only for what was edited, so an untouched project renders
     exactly as it did.

   Spacing steps and corner radii are numbers inside the space.scale and
   shape.radius tokens, so editing one rewrites that number in the token. */

/* A step of the spacing unit the website uses (siteCSS works from the first spacing step). */
function sgUnit() {
  const sp = String(tv("space.scale") || "").match(/\d+(?:\.\d+)?/g) || [];
  const f = sp.map(Number).filter(n => n > 0)[0];
  return f ? Math.max(4, Math.min(16, f <= 16 ? f : f / 2)) : 8;
}
const SG_ASPECTS = [["16/9", "16:9 wide"], ["21/9", "21:9 panoramic"], ["3/2", "3:2"], ["4/3", "4:3"], ["1/1", "1:1 square"], ["4/5", "4:5 portrait"]];
const SG_SHADOWS = [["none", "None"], ["soft", "Soft"], ["strong", "Strong"]];
const SG_SHADOW_CSS = { none: "none", soft: "0 2px 8px rgba(0,0,0,.08)", strong: "0 8px 24px rgba(0,0,0,.18)" };
const SG_LOGO = [["50%", "Circle"], ["6px", "Rounded square"], ["0px", "Square"]];

/* Each property: how to read its default from the design system, and which parts
   of a page it styles. `site` selectors are scoped to the template site (.s) and
   the Preview; `design` selectors reach AI-designed pages (.pg). */
const SG_ITEMS = {
  components: [
    { id: "button", name: "Buttons", role: "Primary, secondary and outlined actions", pick: ["action", "secondary"], props: [
      { k: "h", label: "Height", unit: "px", min: 24, max: 72, step: 1, base: () => sgUnit() * 5, site: [[".btn:not(.s)", v => `height:${v}px`]], design: [[".pg .btn,.pg button,.pg a[class*='btn']", v => `min-height:${v}px`]] },
      { k: "px", label: "Side padding", unit: "px", min: 4, max: 64, step: 1, base: () => sgUnit() * 2, site: [[".btn:not(.s)", v => `padding-left:${v}px;padding-right:${v}px`]], design: [[".pg .btn,.pg button,.pg a[class*='btn']", v => `padding-left:${v}px;padding-right:${v}px`]] },
      { k: "r", label: "Corner radius", unit: "px", min: 0, max: 999, step: 1, base: () => designTokens().r[1], site: [[".btn", v => `border-radius:${v}px`]], design: [[".pg .btn,.pg button,.pg a[class*='btn']", v => `border-radius:${v}px`]] },
      { k: "bw", label: "Outline width", unit: "px", min: 0, max: 6, step: 0.5, base: () => 1.5, site: [[".btn.o", v => `border-width:${v}px`]] },
    ] },
    { id: "card", name: "Cards", role: "Item cards and info cards", pick: ["card", "infoCard"], props: [
      { k: "r", label: "Corner radius", unit: "px", min: 0, max: 48, step: 1, base: () => designTokens().r[2], site: [[".card,.hcard,.box", v => `border-radius:${v}px`]] },
      { k: "pad", label: "Inner padding", unit: "px", min: 4, max: 48, step: 1, base: () => designTokens().s[1], site: [[".card .b,.hcard,.box", v => `padding:${v}px`]] },
      { k: "bw", label: "Border width", unit: "px", min: 0, max: 4, step: 0.5, base: () => 1, site: [[".card,.hcard,.box", v => `border-width:${v}px;border-style:${+v ? "solid" : "none"}`]] },
      { k: "sh", label: "Shadow", opts: SG_SHADOWS, base: () => "none", site: [[".card,.hcard,.box", v => `box-shadow:${SG_SHADOW_CSS[v] || "none"}`]] },
    ] },
    { id: "field", name: "Text fields", role: "Inputs in forms", pick: ["field"], props: [
      { k: "h", label: "Height", unit: "px", min: 28, max: 64, step: 1, base: () => 38, site: [[".sx-field i,.field i", v => `height:${v}px`]], design: [[".pg input:not([type=checkbox]):not([type=radio]),.pg select", v => `min-height:${v}px`]] },
      { k: "r", label: "Corner radius", unit: "px", min: 0, max: 32, step: 1, base: () => designTokens().r[1], site: [[".sx-field i,.field i", v => `border-radius:${v}px`]], design: [[".pg input,.pg select,.pg textarea", v => `border-radius:${v}px`]] },
      { k: "bw", label: "Border width", unit: "px", min: 0, max: 4, step: 0.5, base: () => 1, site: [[".sx-field:not(.sx-focus):not(.sx-err) i,.field i", v => `border-width:${v}px`]], design: [[".pg input,.pg select,.pg textarea", v => `border-width:${v}px`]] },
    ] },
    { id: "chip", name: "Tags & chips", role: "Labels on cards, filters", pick: ["tag"], props: [
      { k: "r", label: "Corner radius", unit: "px", min: 0, max: 999, step: 1, base: () => designTokens().r[0], site: [[".tag", v => `border-radius:${v}px`]] },
      { k: "px", label: "Side padding", unit: "px", min: 2, max: 24, step: 1, base: () => 6, site: [[".tag", v => `padding-left:${v}px;padding-right:${v}px`]] },
      { k: "fs", label: "Text size", unit: "px", min: 9, max: 18, step: 1, base: () => 11, site: [[".tag", v => `font-size:${v}px`]] },
    ] },
  ],
  imagery: [
    { id: "heroPhoto", name: "Hero photo", role: "The large photo at the top of the page", pick: ["heroPhoto"], props: [
      { k: "ar", label: "Aspect ratio", opts: SG_ASPECTS, base: () => "16/9", site: [[".hero .ph", v => `aspect-ratio:${v};min-height:0`]] },
      { k: "r", label: "Corner radius", unit: "px", min: 0, max: 48, step: 1, base: () => designTokens().r[2], site: [[".hero .ph", v => `border-radius:${v}px`]] },
    ] },
    { id: "cardPhoto", name: "Card photo", role: "The photo at the top of each card", pick: ["cardPhoto"], props: [
      { k: "ar", label: "Aspect ratio", opts: SG_ASPECTS, base: () => "4/3", site: [[".card .im", v => `aspect-ratio:${v};height:auto`]] },
    ] },
    { id: "mediaPhoto", name: "Media photo", role: "Photos beside text and the second hero photo", pick: ["sidePhoto", "storyPhoto"], props: [
      { k: "ar", label: "Aspect ratio", opts: SG_ASPECTS, base: () => "4/3", site: [[".story .im,.hero .side .im", v => `aspect-ratio:${v};min-height:0`]] },
      { k: "r", label: "Corner radius", unit: "px", min: 0, max: 48, step: 1, base: () => designTokens().r[2], site: [[".story .im,.hero .side .im", v => `border-radius:${v}px`]] },
    ] },
    { id: "logo", name: "Logo mark", role: "The mark beside the site name", pick: ["brandMark"], props: [
      { k: "shape", label: "Shape", opts: SG_LOGO, base: () => "50%", site: [[".brand i", v => `border-radius:${v}`]] },
      { k: "size", label: "Size", unit: "px", min: 16, max: 64, step: 1, base: () => 28, site: [[".brand i", v => `width:${v}px;height:${v}px`]] },
    ] },
  ],
};
const sgAll = () => [...SG_ITEMS.components, ...SG_ITEMS.imagery];
const sgDef = id => sgAll().find(x => x.id === id);
const sgGroupOf = id => SG_ITEMS.components.some(x => x.id === id) ? "components" : "imagery";
const sgEdits = id => (S.compStyles || {})[id] || {};
const sgEdited = id => Object.keys(sgEdits(id)).length > 0;
const sgBase = (item, p) => p.base();
function sgVal(item, p) { const e = sgEdits(item.id); return p.k in e ? e[p.k] : sgBase(item, p); }
function sgShow(p, v) { if (p.opts) return ((p.opts.find(o => String(o[0]) === String(v)) || [v, String(v)])[1]); return `${v}${p.unit || ""}`; }

/* scope ".s.spec" (Preview) or ".s" (website). `all` writes every component property,
   so the Preview shows the system; photo shapes are written only once edited, so the
   Preview keeps its short layout. The website gets edited properties only. */
function sgCSS(scope, all) {
  return sgAll().map(item => item.props.filter(p => (all && sgGroupOf(item.id) === "components") || p.k in sgEdits(item.id)).map(p => (p.site || []).map(([sel, f]) => `${sel.split(",").map(q => `${scope} ${q}`).join(",")}{${f(sgVal(item, p))}}`).join("\n")).join("\n")).join("\n");
}
function sgDesignCSS() {
  return sgAll().map(item => item.props.filter(p => p.design && p.k in sgEdits(item.id)).map(p => p.design.map(([sel, f]) => `${sel}{${f(sgVal(item, p)).split(";").filter(Boolean).map(x => x + " !important").join(";")}}`).join("\n")).join("\n")).join("\n");
}

/* ---------- sheets ---------- */
function sgSample(item) {
  const d = designTokens(), a = d.accent, on = d.onAccent, i = d.ink, g = d.ground;
  const v = k => sgVal(item, item.props.find(p => p.k === k));
  const ph = `background:color-mix(in srgb,${a} 16%,${g})`;
  switch (item.id) {
    case "button": return `<span style="display:inline-flex;align-items:center;height:${v("h")}px;padding:0 ${v("px")}px;border-radius:${v("r")}px;background:${a};color:${on};font-weight:600;font-size:13px">Primary</span> <span style="display:inline-flex;align-items:center;height:${v("h")}px;padding:0 ${v("px")}px;border-radius:${v("r")}px;border:${v("bw")}px solid ${a};color:${a};font-weight:600;font-size:13px">Outlined</span>`;
    case "card": return `<span style="display:block;width:150px;border:${v("bw")}px ${+v("bw") ? "solid" : "none"} color-mix(in srgb,${i} 16%,transparent);border-radius:${v("r")}px;overflow:hidden;background:color-mix(in srgb,${g} 60%,#fff);box-shadow:${SG_SHADOW_CSS[v("sh")]}"><span style="display:block;height:44px;${ph}"></span><span style="display:block;padding:${v("pad")}px;font-size:12px;color:${i}"><b>Card title</b><br>Short line</span></span>`;
    case "field": return `<span style="display:flex;align-items:center;width:180px;height:${v("h")}px;padding:0 10px;border:${v("bw")}px solid color-mix(in srgb,${i} 35%,transparent);border-radius:${v("r")}px;background:#fff;font-size:13px;color:${i}">Typed value</span>`;
    case "chip": return `<span style="display:inline-flex;align-items:center;padding:1px ${v("px")}px;border:1px solid color-mix(in srgb,${i} 25%,transparent);border-radius:${v("r")}px;font-size:${v("fs")}px;color:${i}">Tag</span> <span style="display:inline-flex;align-items:center;padding:1px ${v("px")}px;border:1px solid color-mix(in srgb,${i} 25%,transparent);border-radius:${v("r")}px;font-size:${v("fs")}px;color:${i}">Another tag</span>`;
    case "heroPhoto": return `<span style="display:block;width:200px;aspect-ratio:${v("ar")};border-radius:${v("r")}px;${ph}"></span>`;
    case "cardPhoto": return `<span style="display:block;width:120px;aspect-ratio:${v("ar")};border-radius:4px;${ph}"></span>`;
    case "mediaPhoto": return `<span style="display:block;width:120px;aspect-ratio:${v("ar")};border-radius:${v("r")}px;${ph}"></span>`;
    case "logo": return `<span style="display:inline-flex;align-items:center;gap:8px;font-family:'${d.fontDisplay}',Georgia,serif;font-size:18px;color:${i}"><span style="width:${v("size")}px;height:${v("size")}px;border-radius:${v("shape")};background:${a};display:inline-block"></span>Brand</span>`;
  }
  return "";
}
function sgSheet(group) {
  const sel = S.sel && S.sel.kind === "cstyle" ? S.sel.id : null;
  const rows = SG_ITEMS[group].map(item => `<div class="trow pick ${sel === item.id ? "sel" : ""}" data-cstyle="${item.id}" tabindex="0" role="button" aria-label="Edit ${esc(item.name)}"><div class="tmeta"><div class="title-s">${esc(item.name)}${sgEdited(item.id) ? ' <span class="badge p">edited</span>' : ""}</div><div class="body-s osv">${esc(item.role)}</div><div class="body-s osv">${item.props.map(p => `${esc(p.label)} ${esc(sgShow(p, sgVal(item, p)))}`).join(" · ")}</div></div><div class="tsample" style="background:${esc(tv("color.ground") || "#fff")};padding:12px;border-radius:12px">${sgSample(item)}</div></div>`).join("");
  return SHEET(SH(group === "components" ? "Component styles" : "Photo and logo styles", "click one to edit its properties") + rows);
}
function wireStyleRows(root) {
  $$("[data-cstyle]", root).forEach(r => {
    const go = () => { select({ kind: "cstyle", id: r.dataset.cstyle }); renderSystem(); };
    r.onclick = e => { e.stopPropagation(); go(); };
    r.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
  });
  $$("[data-scale]", root).forEach(r => {
    const [k, i] = r.dataset.scale.split(":");
    const go = () => { select({ kind: "scale", id: k, i: +i }); renderSystem(); };
    r.onclick = e => { e.stopPropagation(); go(); };
    r.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
  });
}

/* ---------- side panel: one component or imagery style ---------- */
let sgDrafts = {}, sgDraftOwner = null;
function renderStyleItemRail() {
  if (sgDraftOwner !== S) { sgDraftOwner = S; sgDrafts = {}; }
  const r = $("#rail-system"), item = sgDef(S.sel.id);
  if (!item) { S.sel = null; renderSystemRail(); return; }
  const group = sgGroupOf(item.id);
  const cur = Object.fromEntries(item.props.map(p => [p.k, sgVal(item, p)]));
  const d = sgDrafts[item.id] || { ...cur };
  const dirty = item.props.some(p => String(d[p.k]) !== String(cur[p.k]));
  const ctl = p => p.opts
    ? `<div class="field"><label for="sg_${p.k}">${esc(p.label)}</label><select id="sg_${p.k}">${p.opts.map(([v, n]) => `<option value="${esc(v)}" ${String(v) === String(d[p.k]) ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></div>`
    : `<div class="field"><label for="sg_${p.k}">${esc(p.label)}${p.unit ? ` (${p.unit})` : ""}</label><input type="number" id="sg_${p.k}" value="${esc(d[p.k])}" step="${p.step}" min="${p.min}" max="${p.max}" inputmode="decimal"></div>`;
  const pairs = []; for (let i = 0; i < item.props.length; i += 2) pairs.push(item.props.slice(i, i + 2));
  const toks = group === "components" ? ["shape.radius", "space.scale", "comp.cta", "comp.dishCard"] : ["imagery", "motif", "shape.radius"];
  const tw = toks.map(T).filter(t => t && plainWhy(t));
  const why = tw.slice(0, 2).map(t => plainWhy(t)).join(" ");
  const cs = [...new Set(tw.flatMap(t => cites(t.why)))];
  r.innerHTML = `<div class="rhead"><div class="title-m" style="min-width:0">${esc(item.name)}</div><span class="spacer"></span><button class="icon-btn" data-closesel aria-label="Clear selection"><span class="ms">close</span></button></div>
  <div class="field"><label for="sgPick">${group === "components" ? "Component" : "Photo or logo"}</label><select id="sgPick">${SG_ITEMS[group].map(x => `<option value="${x.id}" ${x.id === item.id ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select></div>
  <form class="sys-editor" id="sgForm" novalidate>
    ${pairs.map(pp => `<div class="row" style="gap:12px;flex-wrap:nowrap">${pp.map(ctl).join("")}</div>`).join("")}
    <div class="sg-prev" style="padding:14px;border:1px solid var(--outline-variant);border-radius:12px;background:${esc(tv("color.ground") || "#fff")}">${sgSampleWith(item, d)}</div>
    <section class="sys-whybox"><span class="title-s">Why this setting?</span><div class="body-m">${why ? esc(why) : '<span class="osv">No explanation added.</span>'}</div>${cs.length ? `<div class="sys-based"><span class="body-s osv">Based on</span>${basedOnHTML(cs)}</div>` : ""}<span class="body-s osv">${sgEdited(item.id) ? "Edited by you · " : ""}Starts from the design system's spacing, corner radius and colours</span></section>
    <p class="body-s bad-t" id="sgErr" role="alert"></p>
    <div class="row sys-apply" id="sgActions" ${dirty ? "" : "hidden"}><span class="spacer"></span><button type="button" class="btn text sm" id="sgCancel">Cancel</button><button type="submit" class="btn filled sm">Apply change</button></div>
    ${sgEdited(item.id) ? `<div class="row"><button type="button" class="btn text sm" id="sgReset">Reset to the design system</button></div>` : ""}
  </form>`;
  const read = () => Object.fromEntries(item.props.map(p => [p.k, p.opts ? $("#sg_" + p.k).value : $("#sg_" + p.k).value]));
  const f = $("#sgForm");
  const draft = () => { const v = read(); sgDrafts[item.id] = v; $("#sgActions").hidden = item.props.every(p => String(v[p.k]) === String(cur[p.k])); $("#sgErr").textContent = ""; $(".sg-prev", r).innerHTML = sgSampleWith(item, v); };
  f.addEventListener("input", draft); f.addEventListener("change", draft);
  f.onsubmit = e => {
    e.preventDefault(); const v = read();
    const bad = item.props.find(p => !p.opts && (v[p.k] === "" || !Number.isFinite(+v[p.k]) || +v[p.k] < p.min || +v[p.k] > p.max));
    if (bad) { $("#sgErr").textContent = `${bad.label} must be a number from ${bad.min} to ${bad.max}.`; return; }
    snapshot(`${item.name.toLowerCase()} style`);
    const out = {};
    item.props.forEach(p => { const val = p.opts ? v[p.k] : +v[p.k]; if (String(val) !== String(sgBase(item, p))) out[p.k] = val; });
    S.compStyles = { ...(S.compStyles || {}) };
    if (Object.keys(out).length) S.compStyles[item.id] = out; else delete S.compStyles[item.id];
    delete sgDrafts[item.id]; save(); renderSystem(); if (S.view === "review") renderReview();
    toast(`${item.name} updated across the website`);
  };
  $("#sgCancel").onclick = () => { delete sgDrafts[item.id]; renderStyleItemRail(); };
  const rs = $("#sgReset"); if (rs) rs.onclick = () => { snapshot(`reset ${item.name.toLowerCase()} style`); S.compStyles = { ...(S.compStyles || {}) }; delete S.compStyles[item.id]; delete sgDrafts[item.id]; save(); renderSystem(); if (S.view === "review") renderReview(); toast(`${item.name} follows the design system again`); };
  $("#sgPick").onchange = () => { select({ kind: "cstyle", id: $("#sgPick").value }); renderSystem(); };
  wireCites(r);
  $$("[data-closesel]", r).forEach(x => x.onclick = clearSel);
}
/* The sample drawn from draft values, so the panel previews before Apply. */
function sgSampleWith(item, vals) {
  const keep = S.compStyles; S.compStyles = { ...(S.compStyles || {}), [item.id]: Object.fromEntries(item.props.map(p => [p.k, p.opts ? vals[p.k] : +vals[p.k] || 0])) };
  try { return sgSample(item); } finally { S.compStyles = keep; }
}

/* ---------- spacing steps and corner radii: one number inside a token ---------- */
const SCALE_INFO = {
  "space.scale": { name: i => `Spacing step ${i + 1}`, use: ["inside small parts, between an icon and its label", "inside cards and buttons", "between cards", "padding inside a section", "between sections", "page margins"], max: 200 },
  "shape.radius": { name: i => `Corner radius · ${["small", "medium", "large"][i] || "step " + (i + 1)}`, use: ["tags and small parts", "buttons and inputs", "cards and images"], max: 999 },
};
function scaleNums(k) { return (String(tv(k) || "").match(/\d+(?:\.\d+)?/g) || []).map(Number); }
/* Replace the i-th number in a token's text, keeping its wording and separators. */
function scaleWith(k, i, val) {
  const v = String(tv(k) || ""); const n = scaleNums(k);
  if (i < n.length) { let c = -1; return v.replace(/\d+(?:\.\d+)?/g, m => (++c === i ? String(val) : m)); }
  const sep = /·/.test(v) ? " · " : " / ";
  const out = n.slice(); while (out.length < i) out.push(out.length ? out[out.length - 1] : val); out.push(val);
  return out.join(sep);
}
let scDraft = null;
function renderScaleRail() {
  const r = $("#rail-system"), k = S.sel.id, i = S.sel.i, info = SCALE_INFO[k], t = T(k);
  if (!info || !t) { S.sel = null; renderSystemRail(); return; }
  const n = scaleNums(k), cur = n[i] != null ? n[i] : (n[n.length - 1] || 8);
  const dv = scDraft && scDraft.k === k && scDraft.i === i ? scDraft.v : cur;
  const steps = n.map((x, j) => `<button type="button" class="chip sm ${j === i ? "on" : ""}" data-step="${j}" aria-pressed="${j === i}">${x}px</button>`).join("");
  const cs = cites(t.why);
  r.innerHTML = `<div class="rhead"><div class="title-m" style="min-width:0">${esc(info.name(i))}</div><span class="spacer"></span><button class="icon-btn" data-closesel aria-label="Clear selection"><span class="ms">close</span></button></div>
  <div class="field"><span class="label-m osv">${k === "space.scale" ? "Spacing scale" : "Corner radii"}</span><div class="row" style="gap:6px;flex-wrap:wrap">${steps}</div></div>
  <form class="sys-editor" id="scForm" novalidate>
    <div class="field"><label for="scVal">${k === "space.scale" ? "Space" : "Radius"} (px)</label><input type="number" id="scVal" value="${esc(dv)}" min="0" max="${info.max}" step="1" inputmode="decimal"></div>
    <div class="body-s osv">Used for ${esc(info.use[i] || "larger layouts")}.</div>
    <div class="sc-prev" style="padding:14px;border:1px solid var(--outline-variant);border-radius:12px;display:flex;align-items:center;gap:12px">${scSample(k, dv)}</div>
    <section class="sys-whybox"><span class="title-s">Why this setting?</span><div class="body-m">${esc(plainWhy(t)) || '<span class="osv">No explanation added.</span>'}</div>${cs.length ? `<div class="sys-based"><span class="body-s osv">Based on</span>${basedOnHTML(cs)}</div>` : ""}</section>
    <p class="body-s bad-t" id="scErr" role="alert"></p>
    <div class="row sys-apply" id="scActions" ${String(dv) !== String(cur) ? "" : "hidden"}><span class="spacer"></span><button type="button" class="btn text sm" id="scCancel">Cancel</button><button type="submit" class="btn filled sm">Apply change</button></div>
  </form>`;
  $("#scVal").oninput = () => { const v = $("#scVal").value; scDraft = { k, i, v }; $("#scActions").hidden = String(v) === String(cur); $("#scErr").textContent = ""; $(".sc-prev", r).innerHTML = scSample(k, v); };
  $("#scForm").onsubmit = e => {
    e.preventDefault(); const v = $("#scVal").value;
    if (v === "" || !Number.isFinite(+v) || +v < 0 || +v > info.max) { $("#scErr").textContent = `Enter a number from 0 to ${info.max}.`; return; }
    snapshot(`${info.name(i).toLowerCase()} → ${+v}px`);
    t.v = scaleWith(k, i, +v); t.edited = true; t.user = true; t.mine = typeof mineLabel === "function" ? mineLabel(t) : t.mine;
    scDraft = null; save(); renderSystem(); if (S.view === "review") renderReview(); toast(`${info.name(i)} updated across the website`);
  };
  $("#scCancel").onclick = () => { scDraft = null; renderScaleRail(); };
  $$("[data-step]", r).forEach(b => b.onclick = () => { scDraft = null; select({ kind: "scale", id: k, i: +b.dataset.step }); renderSystem(); });
  wireCites(r);
  $$("[data-closesel]", r).forEach(x => x.onclick = clearSel);
}
function scSample(k, v) {
  const n = Math.max(0, +v || 0), a = tv("color.accent") || "#333";
  return k === "space.scale"
    ? `<span style="display:inline-block;width:${Math.min(n, 120)}px;height:${Math.min(n, 120)}px;background:color-mix(in srgb,${a} 35%,transparent);border:1px solid ${a}"></span><span class="mono">${n}px</span>`
    : `<span style="display:inline-block;width:72px;height:72px;border:2px solid ${a};border-radius:${n}px"></span><span class="mono">${n}px</span>`;
}
