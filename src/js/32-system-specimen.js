/* Design-system preview for the System page.

   The System page used to preview the project's own home page, so the
   preview mixed two questions: "is the design system right?" and "is the
   copy and content right?". This specimen answers only the first. Every
   word and image here is a neutral placeholder; every value that styles it
   (colours, fonts, type sizes, spacing, radius, accent treatment) is the
   project's current token, however that token was chosen: drafted by the AI,
   backed by research or saved references, picked from a base system, or
   edited by hand.

   It reuses the site renderer's class names (.nav, .btn, .card, h2.sec ...)
   so the click-to-inspect map in SYS_PICK (40-app.js) works unchanged, and
   adds a few specimen-only parts (swatches, type ramp, field, spacing and
   radius samples) that SYS_PICK also lists. */

const SPEC_PH_CSS = `.s .phs{width:100%;height:100%;min-height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center;padding:12px;background:color-mix(in srgb,var(--a) 16%,var(--g));color:color-mix(in srgb,var(--i) 80%,transparent);font-size:12px}.s .phs span{font-family:ui-monospace,monospace;font-size:10.5px;letter-spacing:.12em;opacity:.7}.s .phs b{font-weight:500;max-width:32ch}`;

function specPh(label, ratio) {
  return `<div class="phs" role="img" aria-label="Placeholder image" ${ratio ? `style="aspect-ratio:${ratio}"` : ""}><span class="ms" style="font-size:22px;letter-spacing:0">image</span><span>${esc(label || "IMAGE")}</span></div>`;
}

function specimenCSS(d) {
  const { t, s } = d;
  return `
.s.spec{--sd:${s[0]}px;--s1:${s[1]}px;--s2:${s[2]}px;font-family:var(--fb);background:var(--g);color:var(--i);font-size:${t.body}px;line-height:1.5}
.s.spec .hero{padding:var(--s1) 28px 0;grid-template-columns:1.7fr 1fr}
.s.spec .hero .ph{aspect-ratio:auto;min-height:210px;display:flex;align-items:flex-end}
.s.spec .hero .ph>.ov{position:relative;width:100%}
.s.spec .hero .ph>.phs{position:absolute;inset:0;justify-content:flex-start;align-items:flex-end;padding:10px 12px}
.s.spec .hero .side .im{min-height:80px}
.s.spec .hcard{padding:var(--s1)}
.s.spec .sx-cta{display:flex;flex-wrap:wrap;gap:var(--sd);align-items:center;margin-top:var(--s1)}
.s.spec .sx-cta .btn{color:#fff}
.s.spec .btn.o{background:transparent}
.s.spec .sx-blk{padding:var(--s2) 28px 0}
.s.spec h2.sec{margin:0 0 2px}
.s.spec p.secsub{margin:0 0 var(--s1)}
.s.spec .cards{padding:0}
.s.spec .card .im{aspect-ratio:auto;height:72px}
.s.spec .card .im .phs{min-height:0}
.s.spec .card .b{padding:var(--s1)}
.s.spec .card p{flex:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.s.spec .card .m{flex-wrap:nowrap}
.s.spec .card{padding:0;gap:0}
.s.spec .card .tags{flex-wrap:nowrap;align-items:center;gap:6px}
.s.spec .card .heat{flex:none}
.s.spec .btn.sx-2nd{background:color-mix(in srgb,var(--a) 18%,var(--g));color:var(--i)}
.s.spec .story{padding:0;grid-template-columns:1fr 1.3fr;gap:var(--s2);align-items:start}
.s.spec .story .q{margin:0 0 6px}
.s.spec .sx-form{display:grid;grid-template-columns:1fr 1fr;gap:var(--sd) var(--s1);align-items:start}
.s.spec .sx-field{display:flex;flex-direction:column;gap:3px;font-size:${t.small}px}
.s.spec .sx-field i{height:38px;border:1px solid color-mix(in srgb,var(--i) 30%,transparent);border-radius:var(--r2);display:flex;align-items:center;padding:0 10px;font-style:normal;background:color-mix(in srgb,var(--g) 60%,#fff)}
.s.spec .sx-field.sx-focus i{border:2px solid var(--a)}
.s.spec .sx-field.sx-err i{border:2px solid var(--h)}
.s.spec .sx-field .sx-msg{font-size:12px;color:var(--h)}
.s.spec .foot{margin-top:var(--s2);padding:var(--s1) 28px;display:flex;flex-wrap:wrap;gap:6px var(--s2);align-items:baseline}
.s.spec .foot b{display:inline;margin:0}
.s.spec .foot .sx-fl{display:flex;gap:var(--s1);flex:1}
.s.spec .foot .sx-cp{opacity:.6;font-size:12px}
.s.spec .phs img{width:100%;height:100%;object-fit:cover;display:block}
.s.spec .sx-states{padding-top:var(--s1);padding-bottom:var(--s1);display:flex;flex-direction:column;gap:var(--s1);border-bottom:1px solid color-mix(in srgb,var(--i) 10%,transparent)}
.s.spec .sx-strow{display:flex;flex-wrap:wrap;gap:var(--s1);align-items:flex-start}
.s.spec .sx-st{display:flex;flex-direction:column;gap:4px;align-items:flex-start}
.s.spec .sx-stl{font-family:ui-monospace,monospace;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;opacity:.6}
.s.spec .sx-st .sx-field{width:120px}
.s.spec .btn.sx-hov{filter:brightness(.92)}
.s.spec .btn.sx-prs{filter:brightness(.84)}
.s.spec .btn.sx-foc{outline:2px solid var(--a);outline-offset:2px}
.s.spec .btn.sx-dis,.s.spec .sx-field.sx-off{opacity:.4}
@media (max-width:700px){.s.spec .story,.s.spec .sx-form{grid-template-columns:1fr}}
${typeof tsSpecimenCSS==="function"?tsSpecimenCSS(".s.spec"):""}
${typeof sgCSS==="function"?sgCSS(".s.spec",true):""}
`;
}

/* The words and images on the preview: placeholders by default, or the project's
   own content when "My content" is on (S.sysContent). Anything the project doesn't
   have yet falls back to its placeholder. */
function specContent() {
  const P = {
    brand: "Brand", nav: ["Link one", "Link two", "Link three"], cta: "Primary action", cta2: "Tertiary", cta3: "Secondary",
    h1: "Display headline", sub: "Supporting text that introduces the site in a sentence or two.", heroImg: null, sideImg: null,
    info: { title: "Info card", lines: [["Label", "Value"], ["Label", "Value"]] },
    secH: "Section heading", secSub: "A short line that explains what this section holds.",
    items: [1, 2, 3].map(i => ({ n: `Card title ${i}`, d: "A short line describing the item.", tags: ["Tag"], heat: i === 1 ? 2 : 0, img: null })),
    itemBtn: "Action", quote: "A pull quote set in the display face.", body: "Body text at reading size, long enough to show line length and line height.",
    fields: [["Label", "Typed value"], ["Label", "Typed value", "Helpful error message"]], foot: "© Brand · placeholder content",
  };
  if (S.sysContent !== "mine") return P;
  const W = typeof siteIsScaffold === "function" && !siteIsScaffold() ? site() : null;
  const k = typeof systemKit === "function" ? systemKit() : {};
  const pick = (...v) => v.find(x => x != null && String(x).trim() !== "" && !/^\[/.test(String(x)));
  const nav = (W && W.navLinks || k.nav || []).filter(Boolean).slice(0, 3);
  const list = (W && W.items && W.items.list || []).slice(0, 3);
  const items = list.length ? list.map(d => ({ n: d.n, d: d.d, tags: (d.tags || []).slice(0, 2), heat: d.heat || 0, img: d.img || null }))
    : (k.items || []).slice(0, 3).map(it => ({ n: it.name, d: it.detail || it.meta || "", tags: [], heat: 0, img: null }));
  const f = k.field;
  return {
    brand: pick(W && W.brand, S.project, P.brand), nav: nav.length ? nav.concat(P.nav).slice(0, 3) : P.nav,
    cta: pick(W && W.cta, k.label, P.cta), cta2: pick(W && W.lead && W.lead.button, W && W.story && W.story.button, P.cta2), cta3: pick(W && W.collections && W.collections.button, P.cta3),
    h1: pick(W && W.hero && W.hero.headline, k.headline, P.h1), sub: pick(W && W.hero && W.hero.sub, k.body, P.sub),
    heroImg: W && W.hero && W.hero.img || null, sideImg: W && W.side && W.side.img || null,
    info: W && W.info && (W.info.lines || []).length ? { title: pick(W.info.title, P.info.title), lines: W.info.lines.slice(0, 2) } : P.info,
    secH: pick(W && W.items && W.items.title, P.secH), secSub: pick(W && W.items && W.items.sub, P.secSub),
    items: items.length ? items.concat(P.items).slice(0, 3) : P.items, itemBtn: pick(W && W.items && W.items.button, P.itemBtn),
    quote: pick(W && W.story && W.story.quote, P.quote), body: pick(W && W.story && W.story.body, W && W.lead && W.lead.text, P.body),
    fields: f && f.label ? [[f.label, pick(f.placeholder, f.example, "Typed value")], [f.label, pick(f.placeholder, f.example, "Typed value"), pick(f.error, "Helpful error message")]] : P.fields,
    foot: `© ${pick(W && W.brand, S.project, "Brand")}${W && W.footer && W.footer.blurb ? " · " + W.footer.blurb : ""}`,
  };
}
function specImg(key, alt, label) { return key && S.sysContent === "mine" ? pic(key, alt) : specPh(label || "IMAGE"); }

/* A short website, one screen tall or close to it. On Components it starts with a
   strip of buttons and fields in each state. */
function sysSpecimenHTML(sec) {
  const d = designTokens(), C = specContent();
  const heatPips = n => n ? `<span class="heat" aria-label="Level ${n} of 3">${"●".repeat(n)}${"○".repeat(3 - n)}</span>` : "";
  const card = it => `<div class="card"><div class="im">${specImg(it.img, it.n)}</div><div class="b"><h3>${esc(it.n)}</h3><p>${esc(it.d)}</p><div class="m"><span class="tags">${(it.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join("")}${heatPips(it.heat)}</span><a class="btn s" href="#">${esc(C.itemBtn)}</a></div></div></div>`;
  const field = (cls, lbl, val, msg) => `<div class="sx-field ${cls}"><span>${esc(lbl)}</span><i>${esc(val)}</i>${msg ? `<span class="sx-msg">${esc(msg)}</span>` : ""}</div>`;
  const st = (lbl, h) => `<div class="sx-st">${h}<span class="sx-stl">${lbl}</span></div>`;
  const states = sec === "components" ? `<div class="sx-blk sx-states" aria-label="Component states">
    <div class="sx-strow">${[["Default", ""], ["Hover", "sx-hov"], ["Focus", "sx-foc"], ["Pressed", "sx-prs"], ["Disabled", "sx-dis"]].map(([l, c]) => st(l, `<a class="btn ${c}" href="#"${c === "sx-dis" ? ' aria-disabled="true"' : ""}>${esc(S.sysContent === "mine" ? C.cta : "Button")}</a>`)).join("")}</div>
    <div class="sx-strow">${st("Default", field("", C.fields[0][0], C.fields[0][1]))}${st("Focus", field("sx-focus", C.fields[0][0], C.fields[0][1]))}${st("Error", field("sx-err", C.fields[1][0], C.fields[1][1]))}${st("Disabled", field("sx-off", C.fields[0][0], C.fields[0][1]))}</div></div>` : "";
  return `<style>${siteCSS()}${accentRules()}${SPEC_PH_CSS}${specimenCSS(d)}</style>
<div class="site s spec">
  <div class="nav"><div class="brand"><i><span class="ms" style="font-size:16px">star</span></i>${esc(C.brand)}</div><div class="links">${C.nav.map(n => `<a href="#">${esc(n)}</a>`).join("")}<a class="btn" href="#">${esc(C.cta)}</a></div></div>
  ${states}
  <div class="hero"><div class="ph">${C.heroImg && S.sysContent === "mine" ? `<div class="phs" style="padding:0">${pic(C.heroImg, C.h1)}</div>` : `<div class="phs" role="img" aria-label="Placeholder image"></div>`}<div class="ov"><h1>${esc(C.h1)}</h1><p>${esc(C.sub)}</p><div class="sx-cta"><a class="btn" href="#">${esc(C.cta)}</a><a class="btn o" href="#" style="border-color:#fff">${esc(C.cta2)}</a></div></div></div>
    <div class="side"><div class="im">${specImg(C.sideImg, C.brand)}</div><div class="hcard"><b>${esc(C.info.title)}</b>${C.info.lines.map(l => `<div class="l"><span>${esc(l[0])}</span><span>${esc(l[1] || "")}</span></div>`).join("")}</div></div></div>
  <div class="sx-blk"><h2 class="sec">${esc(C.secH)}</h2><p class="secsub">${esc(C.secSub)}</p><div class="cards">${C.items.map(card).join("")}</div></div>
  <div class="sx-blk"><div class="story"><div><p class="q">“${esc(C.quote)}”</p><p>${esc(C.body)}</p></div>
    <div class="sx-form">${field("sx-focus", C.fields[0][0], C.fields[0][1])}${field("sx-err", C.fields[1][0], C.fields[1][1], C.fields[1][2])}<a class="btn sx-2nd" href="#">${esc(C.cta3)}</a><a class="btn" href="#">${esc(C.cta)}</a></div></div></div>
  <div class="foot"><b>${esc(C.brand)}</b><span class="sx-fl">${C.nav.map(n => `<a href="#">${esc(n)}</a>`).join("")}</span><span class="sx-cp">${esc(C.foot)}</span></div>
</div>`;
}
