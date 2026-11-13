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
  const { t, s, r } = d;
  return `
.s.spec{--sd:${s[0]}px;--s1:${s[1]}px;--s2:${s[2]}px;--s3:${s[3]}px;--s4:${s[4]}px;font-family:var(--fb);background:var(--g);color:var(--i);font-size:${t.body}px;line-height:1.5}
.s.spec .hero .ov h1{font-size:${t.display}px}
.s.spec .hero .ov p{font-size:${t.body}px}
.s.spec h2.sec{font-size:${t.h2}px;margin:0 0 4px}
.s.spec p.secsub{margin:0 0 var(--s1);font-size:${t.small}px}
.s.spec .card h3{font-size:${t.h3}px}
.s.spec .card p{font-size:${t.small}px}
.s.spec .lead{padding:0}
.s.spec .lead p{font-size:${t.body}px}
.s.spec .sx-blk{padding:var(--s3) 28px 0}
.s.spec .sx-blk:last-of-type{padding-bottom:var(--s3)}
.s.spec .cards{padding:0}
.s.spec .story{padding:0}
.s.spec .sx-eyebrow{font-family:ui-monospace,monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;opacity:.6;margin-bottom:var(--sd)}
.s.spec .sx-pal{display:grid;grid-template-columns:repeat(4,1fr);gap:var(--s1)}
.s.spec .sx-sw{border-radius:var(--r2);overflow:hidden;border:1px solid color-mix(in srgb,var(--i) 12%,transparent);font-size:${t.small}px}
.s.spec .sx-sw .sx-c{height:72px;display:flex;align-items:flex-end;padding:8px 10px;font-weight:600}
.s.spec .sx-sw .sx-k{padding:8px 10px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 8px;background:color-mix(in srgb,var(--g) 60%,#fff)}
.s.spec .sx-sw .sx-k span:last-child{font-family:ui-monospace,monospace;opacity:.7}
.s.spec .sx-ramp{display:flex;flex-direction:column;gap:var(--s1)}
.s.spec .sx-tr{display:grid;grid-template-columns:120px 1fr;gap:var(--s1);align-items:baseline;padding-bottom:var(--s1);border-bottom:1px solid color-mix(in srgb,var(--i) 10%,transparent)}
.s.spec .sx-tr .sx-lb{font-family:ui-monospace,monospace;font-size:11px;opacity:.6}
.s.spec .sx-tr .sx-x{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.s.spec .sx-tr-d .sx-x{font-family:var(--fd);font-weight:600;line-height:1.15}
.s.spec .sx-tr-b .sx-x{font-family:var(--fb)}
.s.spec .sx-ctl{display:flex;flex-wrap:wrap;gap:var(--s1);align-items:center}
.s.spec .btn.sx-2nd{background:color-mix(in srgb,var(--a) 18%,var(--g));color:var(--i)}
.s.spec .btn.sx-dis{opacity:.4}
.s.spec .sx-forms{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--s1)}
.s.spec .sx-field{display:flex;flex-direction:column;gap:3px;margin:0}
.s.spec .sx-field i{height:38px;border:1px solid color-mix(in srgb,var(--i) 30%,transparent);border-radius:var(--r2);display:flex;align-items:center;padding:0 10px;font-style:normal}
.s.spec .sx-field label{font-size:${t.small}px}
.s.spec .sx-field i{background:color-mix(in srgb,var(--g) 60%,#fff)}
.s.spec .sx-field.sx-focus i{border:2px solid var(--a);opacity:1}
.s.spec .sx-field.sx-err i{border:2px solid var(--h);opacity:1}
.s.spec .sx-field .sx-msg{font-size:12px;color:var(--h)}
.s.spec .sx-sig{display:inline-flex;align-items:center;gap:8px;font-size:${t.small}px}
.s.spec .sx-steps{display:flex;align-items:flex-end;gap:var(--s2);flex-wrap:wrap}
.s.spec .sx-step{display:flex;flex-direction:column;align-items:center;gap:6px;font-family:ui-monospace,monospace;font-size:11px;opacity:.85}
.s.spec .sx-step i{display:block;background:color-mix(in srgb,var(--a) 35%,transparent);border:1px solid var(--a)}
.s.spec .sx-radii{display:flex;gap:var(--s2);flex-wrap:wrap}
.s.spec .sx-rad{display:flex;flex-direction:column;align-items:center;gap:6px;font-family:ui-monospace,monospace;font-size:11px;opacity:.85}
.s.spec .sx-rad i{display:block;width:64px;height:64px;border:2px solid var(--a);background:color-mix(in srgb,var(--a) 10%,transparent)}
.s.spec .sx-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--s3)}
.s.spec .foot{margin-top:var(--s3)}
@media (max-width:700px){.s.spec .sx-pal{grid-template-columns:repeat(2,1fr)}.s.spec .sx-forms,.s.spec .sx-two{grid-template-columns:1fr}.s.spec .sx-tr{grid-template-columns:1fr}}
`;
}

function sysSpecimenHTML() {
  const d = designTokens();
  const sw = [["color.ground", "Background", "sx-sw-g"], ["color.accent", "Accent", "sx-sw-a"], ["color.heat", "Signal", "sx-sw-h"], ["color.ink", "Text", "sx-sw-i"]]
    .map(([k, n, cls]) => { const v = String(tv(k) || ""); const ok = /^#[0-9a-f]{6}$/i.test(v); return `<div class="sx-sw ${cls}"><div class="sx-c" style="background:${ok ? v : "#ccc"};color:${ok ? onColor(v) : "#111"}">Aa</div><div class="sx-k"><span>${n}</span><span>${esc(v.toUpperCase())}</span></div></div>`; }).join("");
  const ramp = [["Display", "d", d.t.display, "Display headline"], ["Heading", "d", d.t.h2, "Section heading"], ["Subheading", "d", d.t.h3, "Subheading"], ["Body", "b", d.t.body, "Body text sets the reading rhythm for paragraphs."], ["Small", "b", d.t.small, "Small text for captions, meta and labels."]]
    .map(([n, f, sz, txt]) => `<div class="sx-tr sx-tr-${f}"><span class="sx-lb">${n} · ${sz}px</span><span class="sx-x" style="font-size:${sz}px">${txt}</span></div>`).join("");
  const card = i => `<div class="card"><div class="im">${specPh("4:3")}</div><div class="b"><h3>Card title ${i}</h3><p>A short description of the item goes here, one or two lines long.</p><div class="tags"><span class="tag">Tag</span><span class="tag">Tag</span></div><div class="m"><span>Meta</span><a class="btn s" href="#">Action</a></div></div></div>`;
  const field = (cls, lbl, val, msg) => `<div class="sx-field ${cls}"><label>${lbl}</label><i>${val}</i>${msg ? `<span class="sx-msg">${msg}</span>` : ""}</div>`;
  const cols = ["Column", "Column", "Column"].map(c => `<div><b>${c}</b>Link<br>Link<br>Link</div>`).join("");
  return `<style>${siteCSS()}${accentRules()}${SPEC_PH_CSS}${specimenCSS(d)}</style>
<div class="site s spec">
  <div class="nav"><div class="brand"><i><span class="ms" style="font-size:16px">star</span></i>Brand</div><div class="links"><a href="#">Link one</a><a href="#">Link two</a><a href="#">Link three</a><a class="btn" href="#">Primary action</a></div></div>
  <div class="hero"><div class="ph">${specPh("HERO IMAGE").replace('class="phs"','class="phs" style="justify-content:flex-start;padding-top:28px"')}<div class="ov"><h1>Display headline</h1><p>Supporting text that introduces the page in a sentence or two.</p></div></div>
    <div class="side"><div class="im">${specPh("IMAGE")}</div><div class="hcard"><b>Info card</b><div class="l"><span>Label</span><span>Value</span></div><div class="l"><span>Label</span><span>Value</span></div></div></div></div>
  <div class="sx-blk"><div class="sx-eyebrow">Colour</div><div class="sx-pal">${sw}</div></div>
  <div class="sx-blk"><div class="sx-eyebrow">Type</div><div class="sx-ramp">${ramp}</div></div>
  <div class="sx-blk"><div class="sx-eyebrow">Section</div><h2 class="sec">Section heading</h2><p class="secsub">A short line that explains what the section holds.</p><div class="lead"><p>Lead paragraph. Body copy at reading size, long enough to show line length and line height across the width of a column.</p></div></div>
  <div class="sx-blk"><div class="sx-eyebrow">Actions</div><div class="sx-ctl"><a class="btn" href="#">Primary action</a><a class="btn sx-2nd" href="#">Secondary</a><a class="btn o" href="#">Tertiary</a><a class="btn sx-dis" href="#" aria-disabled="true">Disabled</a><span class="tag">Chip</span><span class="tag">Chip</span><span class="sx-sig"><span class="heat" aria-label="Level 2 of 3">●●○</span>Signal · level 2 of 3</span></div></div>
  <div class="sx-blk"><div class="sx-eyebrow">Cards</div><div class="cards">${card(1)}${card(2)}${card(3)}</div></div>
  <div class="sx-blk"><div class="sx-eyebrow">Form</div><div class="sx-forms">${field("", "Label", "Placeholder")}${field("sx-focus", "Label · focus", "Typed value")}${field("sx-err", "Label · error", "Typed value", "Helpful error message")}</div></div>
  <div class="sx-blk"><div class="sx-eyebrow">Media &amp; quote</div><div class="story"><div class="im">${specPh("4:3")}</div><div><p class="q">“A pull quote set in the display face.”</p><p>Body text beside an image, the way a feature or story block would sit.</p><a class="btn o" href="#">Tertiary</a></div></div></div>
  <div class="sx-blk"><div class="sx-eyebrow">Spacing &amp; shape</div><div class="sx-two"><div class="sx-steps">${d.s.map((v, i) => `<div class="sx-step"><i style="width:${Math.min(v, 72)}px;height:${Math.min(v, 72)}px"></i>${v}px</div>`).join("")}</div><div class="sx-radii">${d.r.map((v, i) => `<div class="sx-rad"><i style="border-radius:${v}px"></i>${["small", "medium", "large"][i]} · ${v}px</div>`).join("")}</div></div></div>
  <div class="foot"><div><b>Brand</b>One line about the brand.<div class="nl"><i>Email address</i><a class="btn s" href="#">Sign up</a></div></div>${cols}<div class="c"><span>© Brand</span><span>Placeholder content</span></div></div>
</div>`;
}
