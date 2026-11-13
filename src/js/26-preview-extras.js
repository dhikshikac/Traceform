/* System page Preview: live edits, per-section highlights, and the content switch.

   1. Live edits. Every editor in the side panel keeps a draft until Apply
      (sysDrafts, tsDrafts, sgDrafts, scDraft). The Preview is drawn with those
      drafts applied for the moment it takes to build the HTML, then the real state
      is put back, so Cancel simply redraws without them.
   2. Highlights. On top of the page, a layer that never takes clicks shows what the
      current section is about: colour roles, text styles on hover, spacing guides.
      Components gets a strip of states inside the page itself (32-system-specimen.js).
   3. Content. Placeholder words and images by default; "My content" swaps in the
      project's own (specContent). */

/* ---------- 1. live edits ---------- */
function sysHasDrafts() {
  const tok = Object.entries(sysDrafts || {}).some(([k, d]) => { const t = T(k); return t && d && sysDirty(t); });
  const ts = Object.entries(tsDrafts || {}).some(([id, v]) => { const c = tsResolved(id); return c && ["font", "size", "lh", "w", "tr"].some(k => String(v[k]) !== String(c[k])); });
  const sg = Object.entries(sgDrafts || {}).some(([id, v]) => { const it = sgDef(id); return it && it.props.some(p => String(v[p.k]) !== String(sgVal(it, p))); });
  return tok || ts || sg || !!(scDraft && String(scDraft.v) !== String(scaleNums(scDraft.k)[scDraft.i]));
}
/* Run fn with every unapplied edit in place, then restore the saved state. */
function withDrafts(fn) {
  const keep = { tokens: S.tokens, ts: S.typeStyles, cs: S.compStyles };
  try {
    S.tokens = JSON.parse(JSON.stringify(S.tokens || seedTokens()));
    Object.entries(sysDrafts || {}).forEach(([k, d]) => {
      const t = S.tokens.find(x => x.k === k); if (!t || !d || !String(d.v || "").trim()) return;
      if (t.type === "color" && !/^#[0-9a-f]{6}$/i.test(d.v)) return;
      t.v = t.type === "color" ? d.v.toUpperCase() : d.v;
    });
    if (scDraft && scDraft.v !== "" && Number.isFinite(+scDraft.v)) { const t = S.tokens.find(x => x.k === scDraft.k); if (t) t.v = scaleWith(scDraft.k, scDraft.i, +scDraft.v); }
    S.typeStyles = { ...(S.typeStyles || {}) };
    Object.entries(tsDrafts || {}).forEach(([id, v]) => {
      const b = tsBase(id); if (!b) return; const out = {};
      if (v.font && v.font !== b.font) out.font = v.font;
      [["size", 8, 160], ["lh", 0.8, 3], ["w", 100, 900], ["tr", -5, 10]].forEach(([k, lo, hi]) => { const n = +v[k]; if (v[k] !== "" && Number.isFinite(n) && n >= lo && n <= hi && n !== b[k]) out[k] = n; });
      if (Object.keys(out).length) S.typeStyles[id] = out; else delete S.typeStyles[id];
    });
    S.compStyles = { ...(S.compStyles || {}) };
    Object.entries(sgDrafts || {}).forEach(([id, v]) => {
      const it = sgDef(id); if (!it) return; const out = {};
      it.props.forEach(p => { const val = p.opts ? v[p.k] : +v[p.k]; if (!p.opts && (v[p.k] === "" || !Number.isFinite(val) || val < p.min || val > p.max)) return; if (String(val) !== String(sgBase(it, p))) out[p.k] = val; });
      if (Object.keys(out).length) S.compStyles[id] = out; else delete S.compStyles[id];
    });
    return fn();
  } finally { S.tokens = keep.tokens; S.typeStyles = keep.ts; S.compStyles = keep.cs; }
}
let livePending = false;
/* Called by every editor on input and on Cancel. Redraws only the preview page. */
function sysLivePreview() {
  if (livePending) return; livePending = true;
  requestAnimationFrame(() => {
    livePending = false;
    if (S.view !== "system" || S.sysView === "tokens" || S.sysSection === "base") return;
    const c = $("#sysCenter"), fr = c && $(".sysprev-frame", c); if (!fr) return;
    fr.innerHTML = withDrafts(() => sysSpecimenHTML(S.sysSection));
    wireSysPreview(c, S.sysSection);
  });
}

/* ---------- 2. highlights over the page ---------- */
/* One label per colour role, each placed where it covers nothing:
   "gap" sits in the page margin under the nav, "tr" above an element's right edge,
   the default above its left edge. */
const OV_COLOR = [
  [".site", "Background", "color.ground", "gap"], [".nav .btn", "Accent", "color.accent", "tr"],
  [".sx-blk h2.sec", "Text", "color.ink"], [".sx-form .sx-field.sx-err i", "Signal", "color.heat", "tr"],
  [".cards .card", "Background, lighter", "color.ground"],
];
const OV_SPACE_PAD = [".nav", ".card .b"];
const OV_SPACE_GAP = [".cards", ".hero"];
function ovRect(el, fr) { const a = el.getBoundingClientRect(), b = fr.getBoundingClientRect(); return { x: a.left - b.left + fr.scrollLeft, y: a.top - b.top + fr.scrollTop, w: a.width, h: a.height }; }
function ovStepName(px) {
  const n = scaleNums("space.scale"); const i = n.indexOf(Math.round(px));
  return i >= 0 ? `${Math.round(px)}px · step ${i + 1}` : `${Math.round(px)}px`;
}
function sysOverlay(c, sec) {
  const fr = $(".sysprev-frame", c); if (!fr) return;
  let lay = $(".sx-ov", fr); if (lay) lay.remove();
  lay = document.createElement("div"); lay.className = "sx-ov"; lay.setAttribute("aria-hidden", "true"); fr.appendChild(lay);
  const add = (r, cls, txt) => { const d = document.createElement("div"); d.className = cls; Object.assign(d.style, { left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px" }); if (txt) d.innerHTML = `<span>${esc(txt)}</span>`; lay.appendChild(d); return d; };
  const site = $(".site", fr); if (!site) return;
  if (sec === "color") {
    const seen = new Set();
    OV_COLOR.forEach(([q, name, k, pos]) => {
      const el = q === ".site" ? site : $(q, site); if (!el || seen.has(q)) return; seen.add(q);
      const r = ovRect(el, fr), v = String(tv(k) || "").toUpperCase();
      const tag = document.createElement("div"); tag.className = "sx-ovtag";
      tag.innerHTML = `<i style="background:${esc(v)}"></i>${esc(name)}`;
      const nav = $(".nav", site), nr = nav ? ovRect(nav, fr) : r;
      Object.assign(tag.style, pos === "gap" ? { left: (r.x + 6) + "px", top: (nr.y + nr.h + 1) + "px" }
        : pos === "tr" ? { left: (r.x + r.w) + "px", top: Math.max(0, r.y - 21) + "px", transform: "translateX(-100%)" }
        : { left: (r.x + 4) + "px", top: Math.max(0, r.y - 11) + "px" });
      lay.appendChild(tag);
    });
  }
  if (sec === "space") {
    OV_SPACE_PAD.forEach(q => $$(q, site).slice(0, q === ".card .b" ? 1 : 1).forEach(el => {
      const r = ovRect(el, fr), cs = getComputedStyle(el); const pt = parseFloat(cs.paddingTop), pl = parseFloat(cs.paddingLeft);
      if (pt > 0) add({ x: r.x, y: r.y, w: r.w, h: pt }, "sx-ovpad", ovStepName(pt));
      if (pl > 0) add({ x: r.x, y: r.y + pt, w: pl, h: Math.max(0, r.h - pt * 2) }, "sx-ovpad");
    }));
    OV_SPACE_GAP.forEach(q => $$(q, site).slice(0, 1).forEach(el => {
      const kids = [...el.children].filter(k => k.offsetParent !== null);
      for (let i = 0; i + 1 < kids.length; i++) {
        const a = ovRect(kids[i], fr), b = ovRect(kids[i + 1], fr);
        const top = Math.max(a.y, b.y), bot = Math.min(a.y + a.h, b.y + b.h);
        if (b.x > a.x + a.w && bot > top) add({ x: a.x + a.w, y: top, w: b.x - (a.x + a.w), h: bot - top }, "sx-ovgap", i === 0 ? ovStepName(b.x - (a.x + a.w)) : "");
      }
    }));
  }
  if (sec === "type") {
    const tip = document.createElement("div"); tip.className = "sx-ovtip"; tip.hidden = true; lay.appendChild(tip);
    fr.onmouseover = e => {
      const el = e.target.closest("[data-sp]"); const p = el && pickById(el.dataset.sp);
      if (!p || !p.ts) { tip.hidden = true; return; }
      const st = withDrafts(() => tsResolved(p.ts)), def = tsDef(p.ts);
      const wn = (TS_WEIGHTS.find(x => x[0] === st.w) || [st.w, ""])[1];
      tip.textContent = `${def.name} · ${st.size}px · ${wn} ${st.w}`;
      const b = ovRect(el, fr); tip.hidden = false; tip.style.left = b.x + "px"; tip.style.top = Math.max(0, b.y - 26) + "px";
    };
    fr.onmouseleave = () => { tip.hidden = true; };
  } else { fr.onmouseover = null; fr.onmouseleave = null; }
}

/* ---------- 3. the content switch, and the status line ---------- */
function sysPreviewBar() {
  const mine = S.sysContent === "mine";
  return `<div class="sys-prevbar"><div class="sys-scope" role="status" id="sysScopeText"></div><div class="seg seg-sm" role="group" aria-label="Preview content"><button type="button" data-pcontent="placeholder" class="${mine ? "" : "on"}" aria-pressed="${!mine}">Placeholder</button><button type="button" data-pcontent="mine" class="${mine ? "on" : ""}" aria-pressed="${mine}">My content</button></div></div>`;
}
function sysPreviewExtras(c, sec) {
  $$("[data-pcontent]", c).forEach(b => b.onclick = () => { S.sysContent = b.dataset.pcontent; save(); renderSystem(); });
  const st = $("#sysScopeText", c);
  if (st && sysHasDrafts()) st.innerHTML = `<b class="live-t">Previewing an unapplied change</b> · Apply to keep it or Cancel to drop it.`;
  /* the overlay measures the laid-out page, so it waits for the browser to lay it out */
  requestAnimationFrame(() => sysOverlay(c, sec));
}
