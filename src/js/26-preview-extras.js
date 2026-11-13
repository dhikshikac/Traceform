/* System page Preview: live edits.

   1. Live edits. Every editor in the side panel keeps a draft until Apply
      (sysDrafts, tsDrafts, sgDrafts, scDraft). The Preview is drawn with those
      drafts applied for the moment it takes to build the HTML, then the real state
      is put back, so Cancel simply redraws without them. */

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
    S.tokens = JSON.parse(JSON.stringify(S.tokens || defaultTokens()));
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

/* ---------- 2. the status line ---------- */
function sysPreviewBar() { return `<div class="sys-scope" role="status" id="sysScopeText"></div>`; }
function sysPreviewExtras(c, sec) {
  const st = $("#sysScopeText", c);
  if (st && sysHasDrafts()) st.innerHTML = `<b class="live-t">Previewing an unapplied change</b> · Apply to keep it or Cancel to drop it.`;
}
