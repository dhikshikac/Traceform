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
@media (max-width:700px){.s.spec .story,.s.spec .sx-form{grid-template-columns:1fr}}
${typeof tsSpecimenCSS==="function"?tsSpecimenCSS(".s.spec"):""}
${typeof sgCSS==="function"?sgCSS(".s.spec",true):""}
`;
}

/* A short placeholder website: one screen tall, or close to it. */
function sysSpecimenHTML() {
  const d = designTokens();
  const card = i => `<div class="card"><div class="im">${specPh("IMAGE")}</div><div class="b"><h3>Card title ${i}</h3><p>A short line describing the item.</p><div class="m"><span class="tags"><span class="tag">Tag</span>${i === 1 ? `<span class="heat" aria-label="Level 2 of 3">●●○</span>` : ""}</span><a class="btn s" href="#">Action</a></div></div></div>`;
  const field = (cls, lbl, val, msg) => `<div class="sx-field ${cls}"><span>${lbl}</span><i>${val}</i>${msg ? `<span class="sx-msg">${msg}</span>` : ""}</div>`;
  return `<style>${siteCSS()}${accentRules()}${SPEC_PH_CSS}${specimenCSS(d)}</style>
<div class="site s spec">
  <div class="nav"><div class="brand"><i><span class="ms" style="font-size:16px">star</span></i>Brand</div><div class="links"><a href="#">Link one</a><a href="#">Link two</a><a href="#">Link three</a><a class="btn" href="#">Primary action</a></div></div>
  <div class="hero"><div class="ph"><div class="phs" role="img" aria-label="Placeholder image"></div><div class="ov"><h1>Display headline</h1><p>Supporting text that introduces the site in a sentence or two.</p><div class="sx-cta"><a class="btn" href="#">Primary action</a><a class="btn o" href="#" style="border-color:#fff">Tertiary</a></div></div></div>
    <div class="side"><div class="im">${specPh("IMAGE")}</div><div class="hcard"><b>Info card</b><div class="l"><span>Label</span><span>Value</span></div><div class="l"><span>Label</span><span>Value</span></div></div></div></div>
  <div class="sx-blk"><h2 class="sec">Section heading</h2><p class="secsub">A short line that explains what this section holds.</p><div class="cards">${card(1)}${card(2)}${card(3)}</div></div>
  <div class="sx-blk"><div class="story"><div><p class="q">“A pull quote set in the display face.”</p><p>Body text at reading size, long enough to show line length and line height.</p></div>
    <div class="sx-form">${field("sx-focus", "Label", "Typed value")}${field("sx-err", "Label", "Typed value", "Helpful error message")}<a class="btn sx-2nd" href="#">Secondary</a><a class="btn" href="#">Primary action</a></div></div></div>
  <div class="foot"><b>Brand</b><span class="sx-fl"><a href="#">Link one</a><a href="#">Link two</a><a href="#">Link three</a></span><span class="sx-cp">© Brand · placeholder content</span></div>
</div>`;
}
