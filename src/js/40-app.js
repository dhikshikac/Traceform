/* System + Review pages, WCAG audit, version history, prompting, export, routing, boot. */
/* ============================ SYSTEM ============================ */
/* per-base token defaults, applied when a base system is chosen */
const BASE_TOKENS={
  m3:{"color.ground":"#FEF7FF","color.accent":"#6750A4","color.ink":"#1D1B20","type.display":"Roboto","type.body":"Roboto","type.scale":"57 / 45 / 36 / 24 / 16 / 14 / 12","space.scale":"4 · 8 · 12 · 16 · 24 · 32","shape.radius":"8 / 12 / 28","comp.cta":"“Order” (filled, full radius)"},
  hig:{"color.ground":"#F2F2F7","color.accent":"#007AFF","color.ink":"#1C1C1E","type.display":"Roboto","type.body":"Roboto","type.scale":"34 / 28 / 22 / 17 / 15 / 13","space.scale":"4 · 8 · 16 · 20 · 32","shape.radius":"6 / 10 / 14","comp.cta":"“Order” (tinted)"},
  carbon:{"color.ground":"#F4F4F4","color.accent":"#0F62FE","color.ink":"#161616","type.display":"Roboto","type.body":"Roboto","type.scale":"42 / 32 / 20 / 16 / 14 / 12","space.scale":"2 · 4 · 8 · 16 · 24 · 32 · 48","shape.radius":"0 / 0 / 0","comp.cta":"“Order now” (primary, square)"},
  polaris:{"color.ground":"#F6F6F7","color.accent":"#008060","color.ink":"#202223","type.display":"Roboto","type.body":"Roboto","type.scale":"28 / 20 / 16 / 14 / 13","space.scale":"4 · 8 · 12 · 16 · 20 · 32","shape.radius":"4 / 8 / 12","comp.cta":"“Add to cart”"}
};
const BASE_PREV={ // what AI-generated sites built on each base typically look like; "mine" label tracks the current value
  m3:{"color.accent":"baseline purple","type.display":"Roboto","shape.radius":"8 / 12 / 28 (M3 shape)","comp.cta":"“Order” filled"},
  hig:{"color.accent":"system blue","type.display":"SF-style sans","shape.radius":"6–14 px","comp.cta":"tinted button"},
  carbon:{"color.accent":"IBM blue","type.display":"Plex-style sans","shape.radius":"square","comp.cta":"“Order now” square"},
  polaris:{"color.accent":"commerce green","type.display":"system sans","shape.radius":"4–12 px","comp.cta":"“Add to cart”"}
};
function mineLabel(t){ // describe the CURRENT value of a token in the vocabulary of its prevalence list
  const v=String(t.v).toLowerCase();
  if(t.type==="color"){const [r,g,b]=hexToRgb(t.v);const l=lum(t.v);const hue=(()=>{const mx=Math.max(r,g,b),mn=Math.min(r,g,b);if(mx-mn<18)return l>.6?"neutral light":l<.08?"near-black":"grey";if(r>=g&&r>=b)return g>150?"turmeric / amber":"red / clay";if(g>=r&&g>=b)return"green";return b>r?"blue / ceramic":"purple"})();return hue}
  if(t.k==="type.display"){return /roboto|inter|nunito|sans/.test(v)?"neutral sans":/fraunces/.test(v)?"soft humanist serif":/georgia/.test(v)?"classic serif":v}
  if(t.k==="shape.radius"){return /^0/.test(v)?"square":/28|999/.test(v)?"pill 999":"4–12 px"}
  return t.mine}
function prevFor(t){const lbl=mineLabel(t);let p=t.prev.find(x=>x[0]===lbl);if(!p){const fallback={"neutral light":38,"near-black":70,"grey":30,"turmeric / amber":78,"red / clay":12,"green":9,"blue / ceramic":7,"purple":24,"neutral sans":64,"square":8}[lbl];p=[lbl,fallback??20]}return p}

function siteVars(){return`--g:${tv("color.ground")};--a:${tv("color.accent")};--h:${tv("color.heat")};--i:${tv("color.ink")};--fd:'${tv("type.display")}',Georgia,serif;--fb:'${tv("type.body")}',system-ui,sans-serif`}
/* ===== System page: decisions in the center, inspector on the right =====
   Every token is a design decision: what it is, why (research it cites), what it is NOT,
   who made it (AI / you / a base system), and how typical it is of AI output.
   Locked decisions are never changed by regenerating or switching the base system. */
const DEC_NAME={"color.ground":"Background","color.accent":"Accent","color.heat":"Signal / heat","color.ink":"Text",
  "type.display":"Display font","type.body":"Body font","type.scale":"Type scale","type.accentLine":"Accent line",
  "space.scale":"Spacing scale","shape.radius":"Corner radius","imagery":"Photography","motif":"Motifs & icons",
  "comp.dishCard":"Item card","comp.cta":"Primary action","comp.heat":"Heat indicator"};
const SEC_NAME={base:"Start from a base",color:"Color",type:"Text styles",space:"Spacing & shape",imagery:"Imagery & motif",components:"Components"};
const SEC_ICON={imagery:"image",motif:"interests",components:"widgets"};
const decName=t=>DEC_NAME[t.k]||t.k;
/* research a decision cites: c# insight cards, s# sources, r# references, p# principles */
function citeInfo(code){
  for(const th of S.themes||[]){const c=th.cards.find(x=>x.id===code);if(c)return{kind:"Insight",icon:"lightbulb",text:c.text,open:()=>cardModal(code)}}
  const s=(S.sources||[]).find(x=>x.id===code);if(s)return{kind:"Source",icon:"description",text:s.name,open:()=>openSource(code)};
  const r=(S.tiles||[]).find(x=>x.id===code);if(r)return{kind:"Reference",icon:"collections_bookmark",text:r.title,open:()=>{const src=r.src||(r.imgk&&IMG[r.imgk]);
    dialog(`<span class="label-m osv">Reference · ${esc(code)}</span><span class="headline-s">${esc(r.title)}</span>${src?`<img src="${esc(src)}" alt="" style="width:100%;max-height:260px;object-fit:cover;border-radius:12px">`:r.colors?`<div class="row" style="gap:0;border-radius:12px;overflow:hidden">${r.colors.map(c=>`<i style="flex:1;height:56px;background:${esc(c)}"></i>`).join("")}</div>`:""}${r.borrow?`<div class="kv"><span>What to borrow</span><b>${esc(r.borrow)}</b></div>`:""}${r.why?`<div class="kv"><span>Why it was saved</span><b>${esc(r.why)}</b></div>`:""}`,[["Open Inspiration","text",()=>go("inspiration")],["Done","filled",()=>{}]])}};
  const p=(S.principles||[]).find(x=>x.id===code);if(p)return{kind:"Principle",icon:"flag",text:p.text,open:()=>dialog(`<span class="label-m osv">${p.hard?"Hard rule":"Principle"} · ${esc(code)}</span><span class="headline-s">${esc(p.text)}</span>`,[["Open Research","text",()=>go("research")],["Done","filled",()=>{}]])};
  return null}
function cites(text){const seen=new Set();return String(text||"").match(/\b[a-z]{1,3}\d{1,3}\b/g)?.filter(c=>{if(seen.has(c))return false;seen.add(c);return!!citeInfo(c)})||[]}
function whyHTML(text){return esc(text).replace(/\b[a-z]{1,3}\d{1,3}\b/g,m=>{const i=citeInfo(m);return i?`<button class="cite" data-cite="${m}" title="${esc(i.kind)}: ${esc(i.text)}">${m}</button>`:m})}
function origin(t){
  if(t.edited&&t.why==="imported")return["Imported","t"];
  if(t.edited&&/ default$/.test(t.why||""))return["From "+t.why.replace(/ default$/,""),"t"];
  if(t.edited)return["Edited by you","p"];
  if(t.ai||S.pid==="p-mali")return["AI draft",""];
  return["Template",""]}
function typical(t){const top=[...t.prev].sort((a,b)=>b[1]-a[1])[0];const me=prevFor(t);
  if(top&&me[0]===top[0])return{label:"Most common AI choice",cls:"e",pct:me[1],top};
  return me[1]>40?{label:`Fairly common · ${me[1]}%`,cls:"w",pct:me[1],top}:{label:`Distinct · ${me[1]}% of AI sites`,cls:"ok",pct:me[1],top}}
function needsLook(t){return typical(t).cls==="e"||!cites(t.why).length}
function decSample(t){
  if(t.type==="color")return`<span class="dec-sw" style="background:${esc(t.v)}"></span>`;
  if(t.type==="font")return`<span class="dec-aa" style="font-family:'${esc(t.v)}',${t.k==="type.display"?"Georgia,serif":"system-ui,sans-serif"}">Aa</span>`;
  if(t.k==="shape.radius"){const r=String(t.v).split(/[\/,\s]+/).map(Number).filter(n=>!isNaN(n));return`<span class="dec-rad"><i style="border-radius:${r[r.length-1]||8}px"></i></span>`}
  if(t.k==="space.scale"){const s=String(t.v).split(/[·,\s]+/).map(Number).filter(Boolean).slice(0,5);return`<span class="dec-sp">${s.map(n=>`<i style="width:${Math.max(3,Math.min(40,n/1.6))}px"></i>`).join("")}</span>`}
  if(t.k==="type.scale")return`<span class="dec-aa" style="font-size:14px;letter-spacing:-.5px"><b style="font-size:22px">A</b>a<small>a</small></span>`;
  return`<span class="dec-ic"><span class="ms">${SEC_ICON[t.k]||SEC_ICON[t.sec]||"tune"}</span></span>`}
function keepLocked(old){(old||[]).filter(t=>t.locked).forEach(o=>{const i=S.tokens.findIndex(t=>t.k===o.k);if(i>=0)S.tokens[i]=o})}
function wireCites(root){$$("[data-cite]",root).forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();citeInfo(b.dataset.cite)?.open()})}
/* Inspectable parts of the live homepage. Each part is bound to the shared decisions it uses,
   so selecting one shows every other part that changes with the same decision.
   Ordered general → specific: when selectors overlap, the more specific part wins. */
const SYS_PICK=[
  {id:"page",name:"Page background",sel:"&",tok:["color.ground","color.ink","type.body","space.scale"]},
  {id:"navbar",name:"Navigation bar",sel:".nav",tok:["color.ground","space.scale"]},
  {id:"footer",name:"Footer",sel:".foot",tok:["color.ground","color.ink","type.body","space.scale"]},
  {id:"heroBlock",name:"Hero section",sel:".hero",tok:["space.scale"]},
  {id:"cardGroup",name:"Item cards",sel:".cards",tok:["comp.dishCard","space.scale"]},
  {id:"bundleGroup",name:"Bundle cards",sel:".bund",tok:["comp.dishCard","space.scale"]},
  {id:"card",name:"Item card",sel:".card",tok:["color.ground","shape.radius","comp.dishCard"]},
  {id:"brand",name:"Site name",sel:".brand",tok:["type.display","color.ink"]},
  {id:"brandMark",name:"Logo mark",sel:".brand i",tok:["color.accent","motif"]},
  {id:"navLinks",name:"Navigation links",sel:".links>a:not(.btn)",tok:["type.body","color.ink"]},
  {id:"action",name:"Primary action",sel:".btn",tok:["color.accent","shape.radius","comp.cta","type.body"]},
  {id:"heroPhoto",name:"Hero photo",sel:".hero .ph",tok:["imagery","shape.radius"]},
  {id:"heroHeadline",name:"Hero headline",sel:".hero .ov h1",tok:["type.display","type.scale"]},
  {id:"heroSub",name:"Hero description",sel:".hero .ov p",tok:["type.body","type.scale"]},
  {id:"sidePhoto",name:"Second photo",sel:".hero .side .im",tok:["imagery","shape.radius"]},
  {id:"infoCard",name:"Hours card",sel:".hcard",tok:["color.ground","color.ink","type.body","shape.radius"]},
  {id:"lead",name:"Intro text",sel:".lead p",tok:["type.body","type.scale","color.ink"]},
  {id:"secHead",name:"Section heading",sel:"h2.sec",tok:["type.display","type.scale","color.ink"]},
  {id:"secSub",name:"Section description",sel:"p.secsub",tok:["type.body","color.ink"]},
  {id:"cardPhoto",name:"Card photo",sel:".card .im",tok:["imagery"]},
  {id:"cardTitle",name:"Card title",sel:".card h3",tok:["type.display","type.scale","color.ink"]},
  {id:"cardText",name:"Card description",sel:".card .b>p",tok:["type.body","color.ink"]},
  {id:"heat",name:"Heat indicator",sel:".heat",tok:["color.heat","comp.heat"]},
  {id:"tag",name:"Dietary tag",sel:".tag",tok:["shape.radius","color.ink"]},
  {id:"storyPhoto",name:"Story photo",sel:".story .im",tok:["imagery","shape.radius"]},
  {id:"storyQuote",name:"Story quote",sel:".story .q",tok:["type.display","type.accentLine","color.ink"]},
  {id:"storyBody",name:"Story text",sel:".story p:not(.q)",tok:["type.body","color.ink"]},
  {id:"map",name:"Map",sel:".hours .map",tok:["shape.radius","motif"]}
];
const pickById=id=>SYS_PICK.find(p=>p.id===id);
/* Plain-language explanations for the System inspector. The stored "why" stays terse (it feeds the AI and other pages);
   here it is shown as a readable sentence, and research codes become named sources. */
const SYS_PLAIN={
  "color.ground":"A calm, warm off-white background lets the food photos stand out. Most customers (81%) look at the photos first, and the owner asked for a site that is “not yelling.”",
  "color.accent":"The blue comes from the glaze on Mali’s own bowls. It avoids the turmeric-and-chili colors that most AI-made restaurant sites use.",
  "color.heat":"Red is saved for showing how spicy a dish is, because spice is one of the questions customers ask most.",
  "color.ink":"Dark text on the light background keeps everything easy to read.",
  "type.display":"A soft, friendly serif for headings, because the owners describe the place as “warm, casual, very human.”",
  "type.body":"A plain, clear font for body text, kept at 16px or larger so it is easy to read.",
  "type.scale":"Four text sizes are enough. Headlines are at least 2.5 times the body size, so the page is easy to scan.",
  "type.accentLine":"At most one handwritten line, inspired by Mali’s mother’s menu board, so it stays special.",
  "space.scale":"Roomy spacing, like food laid out on a shared table, instead of a crowded ordering-app layout.",
  "shape.radius":"Slightly rounded corners, like the edges of ceramic bowls, rather than fully rounded pill shapes.",
  "imagery":"Photos from above, with several plates and hands in the frame, show people eating together.",
  "motif":"Icons and patterns come from objects the family cares about, like the bowl glaze and the mortar and pestle.",
  "comp.dishCard":"Each dish card leads with a photo and a one-line story, because customers look at photos first and like the story in small doses.",
  "comp.cta":"The main button says “See the menu” instead of a generic “Order Now,” because the menu should lead.",
  "comp.heat":"Spice level is shown as three dots in the heat color, because spice is a frequent question."
};
function plainWhy(t){
  if(SYS_PLAIN[t.k]&&seedTokens().find(x=>x.k===t.k)?.why===t.why)return SYS_PLAIN[t.k];
  let w=String(t.why||"").replace(/\b[a-z]{1,3}\d{1,3}\b/g,m=>citeInfo(m)?"":m)
    .replace(/\(\s*[,/–\-\s]*\)/g,"").replace(/\(\s*[,/\s]+/g,"(").replace(/[,/\s]+\)/g,")").replace(/\bshelf\b/gi,"").replace(/(^|\s)[/–\-]+(?=[\s:,]|$)/g,"$1").replace(/\s{2,}/g," ").replace(/\s+([,.;:])/g,"$1").replace(/^[\s:;,/–\-]+/,"").trim();
  if(!w)return"";w=w[0].toUpperCase()+w.slice(1);return/[.!?”"]$/.test(w)?w:w+"."}
function basedOnHTML(codes){return codes.map(code=>{const i=citeInfo(code);const txt=i.text.length>70?i.text.slice(0,68).trim()+"…":i.text;return`<button type="button" class="sys-src" data-cite="${code}">${esc(i.kind)}: ${esc(txt)}</button>`}).join("")}
/* Unapplied edits per decision; they survive switching between decisions, not projects. */
let sysDrafts={},sysDraftOwner=null;
function syncSysDrafts(){if(sysDraftOwner!==S){sysDraftOwner=S;sysDrafts={}}}
function sysDirty(t){const d=sysDrafts[t.k];return!!d&&(d.v!==t.v||d.why!==(t.why||"")||d.not!==(t.not||""))}
function sysSecToks(sec){return S.tokens.filter(t=>t.sec===sec)}
function sysPickToks(p,sec){return p.tok.filter(k=>{const t=T(k);return t&&t.sec===sec})}
function renderSystem(){
  if(!S.tokens)S.tokens=seedTokens();
  syncSysDrafts();
  if(!SEC_NAME[S.sysSection]||S.sysSection==="base")S.sysSection="color";
  if(S.sel?.kind==="token"){const tk=T(S.sel.id);if(!tk)S.sel=null;else if(tk.sec!==S.sysSection)S.sysSection=tk.sec}
  const sec=S.sysSection,view=S.sysView==="tokens"?"tokens":"preview";
  $$("#secnav button").forEach(b=>b.classList.toggle("on",b.dataset.s===sec));
  const c=$("#sysCenter"),toks=sysSecToks(sec),name=SEC_NAME[sec];
  c.innerHTML=`<div class="pane-hd sys-hd"><div><span class="title-l">${name}</span><div class="body-s osv">Select an element to edit its style. Highlighted elements share the same setting.</div></div></div>
  <div class="sys-toolbar"><div class="seg" role="group" aria-label="System view"><button data-sysview="preview" class="${view==="preview"?"on":""}" aria-pressed="${view==="preview"}">Preview</button><button data-sysview="tokens" class="${view==="tokens"?"on":""}" aria-pressed="${view==="tokens"}">Tokens</button></div></div>
  ${view==="preview"?sysPreviewHTML():sysTokenGrid(toks)}
  <details class="sys-why"><summary><span class="title-s">About these ${esc(name.toLowerCase())} settings</span></summary><div class="sys-why-b"><div class="body-m">${whyHTML(reason(sec))}</div><form id="sysNotes" class="col" style="gap:8px"><div class="field"><label for="sysNotesTA">Category notes</label><textarea id="sysNotesTA" rows="4">${esc(reason(sec))}</textarea></div><button class="btn outlined sm" type="submit" style="align-self:flex-start">Save notes</button></form></div></details>`;
  $$("[data-sysview]",c).forEach(b=>b.onclick=()=>{S.sysView=b.dataset.sysview;save();renderSystem()});
  $$("[data-tok]",c).forEach(r=>r.onclick=()=>{select({kind:"token",id:r.dataset.tok});renderSystem()});
  $("#sysNotes",c).onsubmit=e=>{e.preventDefault();S.reasons=S.reasons||{};S.reasons[sec]=$("#sysNotesTA").value.trim();snapshot(`${sec} notes`);save();renderSystem();$(".sys-why",c)?.setAttribute("open","");toast(`${name} notes saved`)};
  wireCites(c);wireSysPreview(c,sec);photoFill();
  renderSystemRail();
}
/* Tokens view: every decision in the section as a selectable card. */
function sysTokenGrid(toks){const selK=S.sel?.kind==="token"?S.sel.id:null;
  return`<section class="tokgrid" aria-label="Tokens">${toks.map(t=>`<button class="tokcard ${selK===t.k?"sel":""}" data-tok="${t.k}" aria-pressed="${selK===t.k}"><span class="tokcard-s">${decSample(t)}</span><span class="title-s">${esc(decName(t))}</span><span class="mono osv">${esc(t.k)}</span><span class="body-s tokcard-v">${esc(t.v)}</span>${sysDirty(t)?'<span class="body-s warn-t">Unapplied edits</span>':""}</button>`).join("")}</section>`}
/* Live website preview: the homepage rendered from the current tokens; click a part to inspect it. */
function sysPreviewHTML(){
  let site_="";const keep={page:S.page,sel:S.sel,device:S.device,overlays:S.overlays};
  try{S.page="home";S.sel=null;S.device="desk";S.overlays={...S.overlays,receipts:false};if(typeof syncEL==="function")syncEL();site_=pageHTML()}
  finally{Object.assign(S,keep)}
  return`<section class="sysprev" aria-label="${esc(SEC_NAME[S.sysSection])} preview"><div class="sysprev-hd"><span class="title-s">${esc(SEC_NAME[S.sysSection])} preview</span></div>
  <div class="sys-scope" role="status" id="sysScopeText"></div>
  <div class="sysprev-canvas"><div class="sysprev-frame inspect">${site_}</div></div></section>`}
function wireSysPreview(c,sec){
  const frame=$(".sysprev-frame.inspect",c);if(!frame)return;
  const root=$(".site",frame);if(!root)return;
  const selK=S.sel?.kind==="token"?S.sel.id:null,selP=S.sel?.kind==="token"?S.sel.pick:null;
  /* tag the parts that use a decision from this section; specific parts overwrite general ones */
  SYS_PICK.forEach(p=>{if(!sysPickToks(p,sec).length)return;(p.sel==="&"?[root]:$$(p.sel,root)).forEach(el=>{el.dataset.sp=p.id})});
  let n=0;
  $$("[data-sp]",frame).forEach(el=>{const p=pickById(el.dataset.sp);
    el.tabIndex=0;el.setAttribute("role","button");el.setAttribute("aria-label","Inspect "+p.name);el.title=p.name;
    const picked=selP===p.id,shared=!!selK&&p.tok.includes(selK);if(picked||shared)n++;
    el.classList.toggle("sp-sel",picked);el.classList.toggle("sp-shared",shared&&!picked)});
  const pick=id=>{const p=pickById(id),keys=sysPickToks(p,sec);const k=keys.includes(selK)?selK:keys[0];select({kind:"token",id:k,pick:id});renderSystem()};
  frame.onclick=e=>{e.preventDefault();const el=e.target.closest("[data-sp]");if(!el||!frame.contains(el))return;e.stopPropagation();pick(el.dataset.sp)};
  frame.onkeydown=e=>{const el=e.target.closest("[data-sp]");if(el&&e.target===el&&(e.key==="Enter"||e.key===" ")){e.preventDefault();pick(el.dataset.sp)}};
  const st=$("#sysScopeText",c);if(st)st.textContent=selK?`Changes apply to ${n} element${n===1?"":"s"}.`:`Click an element to see which others share its ${sec==="color"?"color":"setting"}.`;
}
/* Inspector: the selected element, its property, the value, and why. */
function renderSystemRail(){
  const r=$("#rail-system"),sec=S.sysSection;
  const t=S.sel?.kind==="token"?T(S.sel.id):null;
  if(!t){
    const toks=sysSecToks(sec);
    r.innerHTML=`<div class="pane-hd"><span class="title-m">${esc(SEC_NAME[sec])}</span></div>
    ${toks.length>1?`<div class="field"><label for="tkProp">Property</label><select id="tkProp"><option value="" disabled selected>Choose a property</option>${toks.map(x=>`<option value="${x.k}">${esc(decName(x))}</option>`).join("")}</select></div>`:""}
    <div class="insp-empty"><span class="ms">ads_click</span><div><div class="title-s">Select an element</div><div class="body-s osv">Choose an element in Preview or a property in Tokens.</div></div></div>`;
    const prop=$("#tkProp",r);if(prop)prop.onchange=()=>{select({kind:"token",id:prop.value});renderSystem()};
    return}
  const p=S.sel.pick?pickById(S.sel.pick):null,keys=p?sysPickToks(p,t.sec):sysSecToks(t.sec).map(x=>x.k);
  const d=sysDrafts[t.k]||{v:t.v,why:t.why||"",not:t.not||""};
  const isC=t.type==="color",o=origin(t),cs=cites(t.why);
  const valOk=v=>!isC||/^#[0-9a-f]{6}$/i.test(v);
  r.innerHTML=`<div class="rhead"><div class="title-m" style="min-width:0">${esc(p?p.name:decName(t))}</div><span class="spacer"></span><button class="icon-btn" data-closesel aria-label="Clear selection"><span class="ms">close</span></button></div>
  ${keys.length>1?`<div class="field"><label for="tkProp">Property</label><select id="tkProp">${keys.map(k=>`<option value="${k}" ${k===t.k?"selected":""}>${esc(decName(T(k)))}</option>`).join("")}</select></div>`:""}
  <form class="sys-editor" id="tkForm" novalidate>
    <div class="field"><label for="${isC?"tkHex":t.type==="font"?"tkFont":"tkVal"}">${isC?"Color":esc(decName(t))}</label><div class="row" style="flex-wrap:nowrap">${isC?`<input type="color" id="tkColor" value="${esc(valOk(d.v)?d.v:t.v)}" aria-label="Color picker" class="sys-color"><input type="text" id="tkHex" value="${esc(d.v)}" spellcheck="false" autocomplete="off">`:t.type==="font"?`<select id="tkFont">${(t.k==="type.display"?FONTS.display:FONTS.body).map(f=>`<option ${f===d.v?"selected":""}>${esc(f)}</option>`).join("")}</select>`:`<input type="text" id="tkVal" value="${esc(d.v)}">`}</div></div>
    <section class="sys-whybox"><span class="title-s">Why this setting?</span><div class="body-m">${esc(plainWhy(t))||'<span class="osv">No explanation added.</span>'}</div>${cs.length?`<div class="sys-based"><span class="body-s osv">Based on</span>${basedOnHTML(cs)}</div>`:`<span class="body-s osv">${o[0]==="AI draft"?"Suggested by AI":esc(o[0])} · not linked to research yet</span>`}</section>
    <details class="sys-sub" id="tkMore"><summary>More details</summary><div class="col" style="gap:12px;padding-top:8px">
      <div class="col" style="gap:6px"><span class="title-s">Evidence</span>${cs.length?cs.map(code=>{const i=citeInfo(code);return`<button type="button" class="evi" data-cite="${code}"><span class="ms">${i.icon}</span><span class="evi-m"><span class="label-m osv">${esc(i.kind)} · ${code}</span><span class="body-s">${esc(i.text)}</span></span><span class="ms osv">open_in_new</span></button>`}).join(""):`<div class="body-s osv">No research cited.</div>`}</div>
      <div class="field"><label for="tkNot">What to avoid</label><textarea id="tkNot" rows="2">${esc(d.not)}</textarea></div>
      <div class="col" style="gap:6px"><span class="title-s">How common is this in AI designs?</span>${(()=>{const me=prevFor(t);const list=t.prev.some(x=>x[0]===me[0])?t.prev:[...t.prev,me];return list.map(x=>`<div class="pr ${x[0]===me[0]?"me":""}"><span>${esc(x[0])}${x[0]===me[0]?" <b>(yours)</b>":""}</span><div class="bar"><i style="width:${x[1]}%"></i></div><span class="mono">${x[1]}%</span></div>`).join("")})()}</div>
    </div></details>
    <p class="body-s bad-t" id="tkErr" role="alert"></p>
    <div class="row sys-apply" id="tkActions" ${sysDirty(t)?"":"hidden"}><span class="spacer"></span><button type="button" class="btn text sm" id="tkCancel">Cancel</button><button type="submit" class="btn filled sm">Apply change</button></div>
  </form>
  ${promptBox(t.k,`token ${t.k} = ${t.v} (why: ${t.why}; not: ${t.not})`)}`;
  const val=()=>isC?$("#tkHex").value.trim():t.type==="font"?$("#tkFont").value:$("#tkVal").value;
  const draft=()=>{sysDrafts[t.k]={v:val(),why:t.why||"",not:$("#tkNot").value};$("#tkActions").hidden=!sysDirty(t);$("#tkErr").textContent=""};
  if(isC){$("#tkColor").oninput=()=>{$("#tkHex").value=$("#tkColor").value.toUpperCase();draft()};$("#tkHex").oninput=()=>{const v=$("#tkHex").value.trim();if(valOk(v))$("#tkColor").value=v;draft()}}
  const f=$("#tkForm");f.addEventListener("input",draft);f.addEventListener("change",draft);
  f.onsubmit=e=>{e.preventDefault();const v=val();if(!valOk(v)){$("#tkErr").textContent="Use a six-digit hex color, such as #4F6F8F.";return}if(!v.trim()){$("#tkErr").textContent="Enter a value.";return}
    snapshot(`token ${t.k} → ${v}`);t.v=isC?v.toUpperCase():v;t.not=$("#tkNot").value.trim();t.edited=true;t.mine=mineLabel(t);delete sysDrafts[t.k];save();renderSystem();if(S.view==="review")renderReview();toast(`${decName(t)} updated across the website`)};
  $("#tkCancel").onclick=()=>{delete sysDrafts[t.k];renderSystemRail()};
  const prop=$("#tkProp");if(prop)prop.onchange=()=>{select({kind:"token",id:prop.value,pick:S.sel.pick});renderSystem()};
  wirePrompt(r,{kind:"token",id:t.k},`token ${t.k} = ${t.v} (why: ${t.why}; not: ${t.not})`);
  wireCites(r);
  $$("[data-closesel]",r).forEach(b=>b.onclick=clearSel);
}
$$("#secnav button").forEach(b=>b.onclick=()=>{S.sysSection=b.dataset.s;select(null);save();renderSystem()});

/* user imagery: upload + how-to-use (typed or AI-written) */
function wireUserImgs(c){S.userImgs=S.userImgs||[];
  const add=files=>{[...files].forEach(f=>{if(!f.type.startsWith("image/"))return;const rd=new FileReader();rd.onload=()=>{S.userImgs.push({name:f.name.replace(/\.[^.]+$/,"").replace(/[-_]/g," "),src:rd.result,use:""});snapshot("uploaded image");save();renderSystem();toast("Image added · write or generate a usage note")};rd.readAsDataURL(f)})};
  const fi=$("#uiFile",c);if(fi)fi.onchange=e=>add(e.target.files);
  const drop=$(".icard.add",c);if(drop){drop.addEventListener("dragover",e=>{e.preventDefault();drop.style.borderColor="var(--primary)"});drop.addEventListener("dragleave",()=>drop.style.borderColor="");drop.addEventListener("drop",e=>{e.preventDefault();add(e.dataTransfer.files)})}
  $$("[data-uiname]",c).forEach(i=>i.onchange=()=>{S.userImgs[+i.dataset.uiname].name=i.value;save()});
  $$("[data-uiuse]",c).forEach(i=>i.onchange=()=>{S.userImgs[+i.dataset.uiuse].use=i.value;save()});
  $$("[data-uidel]",c).forEach(b=>b.onclick=e=>{e.preventDefault();const i=+b.dataset.uidel;const u=S.userImgs[i];if(u.slot)setEl(u.slot==="story"?"storyhero":u.slot,{img:null});S.userImgs.splice(i,1);snapshot("removed image");save();renderSystem()});
  $$("[data-uislot]",c).forEach(sel=>sel.onchange=()=>{const i=+sel.dataset.uislot;const u=S.userImgs[i];const slot=sel.value;S.userImgs.forEach(x=>{if(x!==u&&x.slot===slot)x.slot=""});u.slot=slot;const id=slot==="story"?"storyhero":slot;if(id)setEl(id,{img:"user:"+i});save();renderSystem();if(slot)toast(`Used as ${sel.options[sel.selectedIndex].text.toLowerCase()} · see Review`)});
  $$("[data-uiai]",c).forEach(b=>b.onclick=async()=>{const i=+b.dataset.uiai;const u=S.userImgs[i];b.disabled=true;
    try{let text;
      if(sample){const lim=await sample.limits().catch(()=>null);const prompt=`${RULES}\n\nCONTEXT:\n${ctxSummary()}\n\nThe designer uploaded an image named "${u.name}"${u.use?` with this draft note: "${u.use}"`:""}. Write a usage note for the design system in 2-3 short sentences: where on the site it belongs (hero, second photo, dish card, story page), how to crop or treat it, and what it must not be used for. Cite the research (card ids, principles). Plain text only.`;
        const r=await sample(prompt,{modelTier:"quick",cache:false,...(lim?.images&&u.src?{images:[await (await fetch(u.src)).blob()]}:{})});text=r.text.trim()}
      else text=`Use as the second photo on Home or a story-page image; crop to keep hands and the food in frame (c3, c7). Never as a single centered dish on a dark ground (the 71% default).`;
      u.use=text;snapshot("AI usage note");save();renderSystem();toast("Usage note written")}
    catch(e){toast("Couldn't write the note ("+(e.code||"error")+")")}b.disabled=false});
}
function userImg(ref){if(!ref||!String(ref).startsWith("user:"))return null;const u=(S.userImgs||[])[+String(ref).slice(5)];return u?.src||null}
/* ============================ TRENDING ============================ */
// Each example is decomposed into PARTS with a typicality % (how often AI-generated restaurant sites make the same choice).
const PARTS=["hero","nav","cta","palette","type","sections"];
const PART_LABEL={hero:"Hero",nav:"Navigation",cta:"Primary action",palette:"Palette",type:"Type",sections:"Sections"};
const TREND={
  similar:[
    {id:"sim1",title:"Nong's — family-run Lao kitchen, Minneapolis",tags:["family-run","overhead","menu-first"],note:"Overhead table photography, story in one line, menu leads the nav. Closest to Mali's brief.",
      o:{bg:"#F4F0E6",fg:"#222",name:"Nong's",font:"Georgia",img:"overhead",heroCap:"the Saturday table",card:"#e6dfd0",cta:"#4F6F8F",ctaText:"See the menu",headline:"We cook what we eat at home.",sub:"Lao food from Nong\u2019s kitchen, Minneapolis.",heroInk:"#222",nav:"Menu · Order · Us",dishes:[["Laap","13","larb"],["Tam mak hoong","9","somtam"],["Khao niao","4","rice"]]},
      parts:{hero:["overhead, several plates",34,"imagery","overhead, several plates, hands in frame"],nav:["menu first",22,null,null],cta:["“See the menu”",18,"comp.cta","“See the menu”"],palette:["warm off-white + slate blue",9,"color.accent","#4F6F8F"],type:["classic serif",64,"type.display","Georgia"],sections:["hero · dishes · one-line story",21,null,null]}},
    {id:"sim2",title:"Casa Lupe — mother-and-daughter Oaxacan place",tags:["family-run","hands","hand-lettered"],note:"Hands-at-work hero, clay accent, one hand-lettered line. Story-led without an About block.",
      o:{bg:"#F6F1EA",fg:"#2a2420",name:"Casa Lupe",font:"'Patrick Hand',cursive",img:"hands",heroCap:"Lupe's hands, 6am",card:"#eadfce",cta:"#B5533C",ctaText:"Today's menu",headline:"Made by two of us.",sub:"Oaxacan, from Lupe and her daughter.",heroInk:"#222",nav:"Menu · Pedidos · Nosotras",dishes:[["Mole negro","16","mole"],["Tlayuda","12","greens"],["Memela","6","rice"]]},
      parts:{hero:["hands at work",12,"imagery","hands at work, close crop"],nav:["bilingual labels",6,null,null],cta:["“Today's menu”",11,"comp.cta","“Today's menu”"],palette:["cream + clay",23,"color.accent","#B5533C"],type:["hand-lettered display",6,"type.display","Fraunces"],sections:["hero · dishes · makers",14,null,null]}},
    {id:"sim3",title:"Lanna Table — northern Thai pop-up, Melbourne",tags:["northern Thai","celadon","grouped by eating"],note:"Celadon palette from ceramics; dishes grouped by how they're eaten instead of starters/mains.",
      o:{bg:"#EEF2EF",fg:"#1f2a26",name:"Lanna Table",font:"Georgia",img:"celadon",heroCap:"celadon bowls, Chiang Mai",card:"#d9e3dd",cta:"#3e6b60",ctaText:"What we cook",headline:"Northern Thai, to share.",sub:"To share · to pound · from the north",nav:"What we cook · Book",dishes:[["Khao soi","18","khaosoi"],["Nam prik ong","11","curry"],["Sai ua","14","larb"]]},
      parts:{hero:["object close-up (ceramics)",8,"imagery","ceramic bowls, close-up"],nav:["two items only",9,null,null],cta:["“What we cook”",7,"comp.cta","“What we cook”"],palette:["celadon + moss",5,"color.accent","#3E6B60"],type:["classic serif",64,"type.display","Georgia"],sections:["hero · groups · booking",10,null,null]}},
    {id:"sim4",title:"Bà Nội — Vietnamese grandmother's kitchen, Houston",tags:["family-run","story-led","photo-first"],note:"Photo-first grid, the grandmother's recipe cards as a motif, no cart (call to order).",
      o:{bg:"#FBF7F0",fg:"#222",name:"Bà Nội",font:"Georgia",img:"herbs",heroCap:"recipe card no. 12",card:"#ecdfc8",cta:"#2f5d4a",ctaText:"Call to order",headline:"Grandmother\u2019s kitchen.",sub:"(713) 555-0142 · Houston",heroInk:"#222",nav:"Menu · Hours",dishes:[["Pho ga","13","pho"],["Bun cha","14","greens"],["Banh xeo","12","curry"]]},
      parts:{hero:["object close-up (recipe card)",8,"imagery","handwritten recipe card"],nav:["menu + hours only",12,null,null],cta:["call to order",9,"comp.cta","“Call to order”"],palette:["cream + forest",14,"color.accent","#2F5D4A"],type:["classic serif",64,"type.display","Georgia"],sections:["hero · photo grid · hours",17,null,null]}}
  ],
  featured:[
    {id:"f1",title:"Ember — editorial pick: photography-led",tags:["editorial","dark","reservations"],note:"Strong photography, almost no copy. Dark ground works because the photos are lit for it.",
      o:{bg:"#101010",fg:"#eee",name:"Ember",font:"Georgia",img:"ember",heroCap:"coal, 900°",card:"#2a2320",cta:"#D98B2B",ctaText:"Reserve",headline:"Fire, salt, time.",sub:"Tasting menu · Thu–Sat",nav:"Menu · Reserve",dishes:[["Beef rib","48","ember"],["Leeks","16","greens"],["Bread","8","bread"]]},
      parts:{hero:["full-bleed dark photo",33,"imagery","full-bleed dark photo"],nav:["two items",9,null,null],cta:["“Reserve”",28,"comp.cta","“Reserve”"],palette:["near-black + amber",33,"color.ground","#101010"],type:["classic serif",64,"type.display","Georgia"],sections:["hero · menu · reserve",30,null,null]}},
    {id:"f2",title:"Pane & Co — editorial pick: ordering that doesn't feel like an app",tags:["editorial","ordering","bundles"],note:"“Order for the table” bundles and a visible kitchen schedule instead of a cart.",
      o:{bg:"#FFFDF8",fg:"#222",name:"Pane & Co",font:"Georgia",img:"bread",heroCap:"this week's bake",card:"#f0e8d8",cta:"#2B6E63",ctaText:"Order for the table",headline:"Bread for the table.",sub:"Baked Wed & Sat · pick up 8–11",heroInk:"#222",nav:"Bread · Order · Schedule",dishes:[["Country loaf","9","bread"],["Focaccia","7","bread"],["Rye","10","bread"]]},
      parts:{hero:["product close-up",41,"imagery","product close-up"],nav:["schedule in nav",4,null,null],cta:["“Order for the table”",7,"comp.cta","“Order for the table”"],palette:["white + teal",11,"color.accent","#2B6E63"],type:["classic serif",64,"type.display","Georgia"],sections:["hero · bundles · schedule",6,null,null]}},
    {id:"f3",title:"Soba Ichi — editorial pick: one page, one dish",tags:["editorial","minimal","single-dish"],note:"One dish, one page, one photo. The extreme of “menu leads”.",
      o:{bg:"#F7F5F0",fg:"#1b1b1b",name:"Soba Ichi",font:"Georgia",img:"soba",heroCap:"today's soba",card:"#e3ded3",cta:"#1b1b1b",ctaText:"Hours",headline:"One dish. Soba.",sub:"Handmade daily until it runs out.",heroInk:"#222",nav:"Hours",dishes:[["Zaru soba","14","soba"]]},
      parts:{hero:["single centered bowl",71,"imagery","single centered bowl"],nav:["none",3,null,null],cta:["“Hours”",5,"comp.cta","“Hours”"],palette:["off-white + ink",18,"color.accent","#1B1B1B"],type:["classic serif",64,"type.display","Georgia"],sections:["hero · hours",2,null,null]}}
  ],
  baseline:[
    {id:"b1",title:"“Mama's Table” — what a one-line prompt returns",tags:["baseline","71%"],note:"Dark hero with a single bowl, turmeric/chili palette, “Order Now” centered, “Just like Mom makes it”, three “popular dishes”.",
      o:{bg:"#2B2B2B",fg:"#F2EFE9",name:"Mama's Table",font:"Georgia",hero:"radial-gradient(circle at 50% 50%,#8a4a3a 0 26%,transparent 27%),#1a1a1a",heroCap:"",card:"#3a3a3a",cta:"#D98B2B",ctaText:"Order Now",ctaPos:"center",r:20,headline:"Authentic Thai Cuisine",sub:"Just like Mom makes it",nav:"Home · Menu · About · Contact",dishes:[["Pad Thai","14"],["Green Curry","15"],["Spring Rolls","8"]],foot:"© Mama\u2019s Table · All rights reserved"},
      parts:{hero:["single centered bowl, dark",71,null,null],nav:["Home · Menu · About · Contact",83,null,null],cta:["“Order Now”, centered, pill",74,null,null],palette:["charcoal + turmeric/chili",78,null,null],type:["classic serif + neutral sans",64,null,null],sections:["hero · popular dishes · about · contact",80,null,null]}},
    {id:"b2",title:"“Thai Garden” — the light-mode default",tags:["baseline","64%"],note:"Lotus icon, gold accents, gingham footer, “Experience authentic flavors”.",
      o:{bg:"#FFF8EC",fg:"#2a2a2a",name:"Thai Garden",font:"Georgia",hero:"repeating-linear-gradient(45deg,#c9a227 0 6px,#e8cf7a 6px 12px)",heroCap:"",card:"#f3e7c9",cta:"#C8372D",ctaText:"Order Now",ctaPos:"center",r:20,headline:"Experience authentic flavors",sub:"A taste of Thailand",heroInk:"#222",nav:"Home · Menu · Gallery · Contact",dishes:[["Pad Thai","14"],["Tom Yum","12"],["Mango Sticky Rice","9"]],foot:"© Thai Garden · Follow us"},
      parts:{hero:["pattern banner + tagline",44,null,null],nav:["Home · Menu · Gallery · Contact",79,null,null],cta:["“Order Now”, centered, pill",74,null,null],palette:["cream + gold + chili",61,null,null],type:["classic serif",64,null,null],sections:["hero · dishes · gallery · about",72,null,null]}}
  ]
};
const SNIPPETS=[
  {id:"sn1",title:"Heat scale as pips",pct:22,where:"dish cards, menu rows",tok:"comp.heat",val:"three pips in color.heat",code:"<span class=\"heat\" aria-label=\"medium\">●●○ <small>medium</small></span>",prev:()=>`<span style="color:${tv("color.heat")};font-size:20px;letter-spacing:2px">●●○</span><span class="body-s" style="margin-left:6px">medium</span>`},
  {id:"sn2",title:"Story strip, one line",pct:24,where:"under the dishes, instead of an About block",tok:"comp.storyStrip",val:"one muted line",code:"<p class=\"story\">Why we make it: this is our version of Thai food, not Thailand's.</p>",prev:()=>`<div style="background:color-mix(in srgb,${tv("color.ink")} 6%,transparent);border-radius:4px;padding:8px 10px;font-size:12px;width:100%">Why we make it: this is our version of Thai food, not Thailand's.</div>`},
  {id:"sn3",title:"“Order for the table” bundle",pct:7,where:"order page",tok:"comp.bundle",val:"host-suggested bundle with a quote",code:"<section class=\"bundle\"><q>For four, I'd do khao soi, som tam and the greens.</q><button>Add the table</button></section>",prev:()=>`<div style="font-size:12px;display:flex;flex-direction:column;gap:6px"><i style="opacity:.8">“For four, I'd do khao soi, som tam and the greens.” — Mali</i><span style="background:${tv("color.accent")};color:#fff;padding:4px 10px;border-radius:4px;width:max-content">Add the table</span></div>`},
  {id:"sn4",title:"Menu grouped by how it's eaten",pct:9,where:"menu page",tok:"comp.tabs",val:"To share · To pound · From the north · Sweet",code:"<nav class=\"groups\"><a>To share</a><a>To pound</a><a>From the north</a><a>Sweet</a></nav>",prev:()=>`<div style="display:flex;gap:12px;font-size:12px;border-bottom:1px solid #ccc;padding-bottom:4px"><b style="box-shadow:inset 0 -2px 0 ${tv("color.accent")}">To share</b><span>To pound</span><span>From the north</span><span>Sweet</span></div>`},
  {id:"sn5",title:"Menu board as hero",pct:3,where:"story page (not home)",tok:"imagery.hero.board",val:"hand-lettered board, no photo",code:"<header class=\"board\"><h1>today: khao soi · som tam · greens</h1></header>",prev:()=>`<div style="background:#1f1f1f;color:#eee;border-radius:6px;padding:10px 14px;font-family:'Patrick Hand',cursive;font-size:16px;width:100%">today: khao soi · som tam · greens</div>`},
  {id:"sn6",title:"Visible research gap",pct:1,where:"anywhere the packet is silent",tok:"comp.gap",val:"[ASK MALI] placeholder stays visible",code:"<div class=\"gap\">[ASK MALI] third signature dish</div>",prev:()=>`<div style="border:1px dashed #999;border-radius:4px;padding:8px;font-size:12px;opacity:.75">[ASK MALI] third dish</div>`}
];
const ALL_TAGS=["family-run","overhead","hands","menu-first","story-led","photo-first","ordering","editorial","minimal","dark"];
function myParts(){const hv=elState("hero").variant||"default";const heroP={default:["overhead, several plates, hands",6],crop:["tight crop on hands",5],hands:["one bowl, hands",9],after:["the table, after",2],board:["menu board",3],single:["single centered bowl",71]}[hv];const ctaT=(tv("comp.cta")||"").match(/“([^”]+)”/)?.[1]||"See the menu";const ctaP=EL.cta.prev.find(p=>p[0].includes(ctaT))?.[1]||10;return{hero:heroP,nav:["Menu · Order · Our story",41],cta:[`“${ctaT}”`,ctaP],palette:[`${tv("color.ground")} + ${tv("color.accent")}`,T("color.accent").prev.find(p=>p[0]===T("color.accent").mine)?.[1]||7],type:[tv("type.display")+" + "+tv("type.body"),T("type.display").prev.find(p=>p[0]===T("type.display").mine)?.[1]||27],sections:["hero · dishes · bundles · story",elState("bundles").hidden?21:62]}}
function typicality(parts){const v=Object.values(parts).map(p=>p[1]);return Math.round(v.reduce((a,b)=>a+b,0)/v.length)}
function ring(n){const col=n>50?"var(--error)":n>25?"var(--warn)":"var(--ok)";return`<div class="ring" style="background:conic-gradient(${col} ${n*3.6}deg,var(--surface-container-highest) 0);"><span style="background:var(--surface-container-lowest);width:42px;height:42px;border-radius:50%;display:grid;place-items:center">${n}%</span></div>`}
function addTrendRef(id){const all=[...TREND.similar,...TREND.featured,...TREND.baseline];const x=all.find(y=>y.id===id);const sn=SNIPPETS.find(y=>y.id===id);
  if(S.tiles.some(t=>t.from===id)){toast("Already on the reference shelf");return}
  if(x){const base=TREND.baseline.includes(x);S.tiles.push({id:uid("r"),type:"site",kind:"yours",from:id,title:x.title,borrow:base?"nothing — kept as a counter-example":x.note,why:base?"Typical AI baseline, for comparison":"from Trending",imgk:x.o.img||"overhead"})}
  else if(sn){S.tiles.push({id:uid("r"),type:"site",kind:"yours",from:id,title:"Snippet · "+sn.title,borrow:sn.val,why:`from Trending · ${sn.pct}% of AI sites`,imgk:{sn5:"board",sn3:"overhead"}[sn.id]||"khaosoi"})}
  snapshot("added reference from Trending");save();renderReference();renderTrending();toast("Added to the reference shelf")}
function onShelf(id){return S.tiles.some(t=>t.from===id)}
function addPartRef(id,part){const all=[...TREND.similar,...TREND.featured,...TREND.baseline];const x=all.find(y=>y.id===id);if(!x)return;const key=id+":"+part;if(S.tiles.some(t=>t.from===key)){toast("Already on the shelf");return}
  const p=x.parts[part];const base=TREND.baseline.includes(x);
  const tile={id:uid("r"),kind:"yours",from:key,title:`${x.o.name} · ${PART_LABEL[part].toLowerCase()}`,borrow:base?"nothing — counter-example":p[0],why:`from Trending · ${p[1]}% of AI sites`};
  if(part==="palette")Object.assign(tile,{type:"palette",colors:[x.o.bg,x.o.cta,x.o.card,x.o.fg]});
  else if(part==="type")Object.assign(tile,{type:"type",ph:"typeS"});
  else if(part==="hero")Object.assign(tile,{type:"site",imgk:x.o.img||"overhead"});
  else Object.assign(tile,{type:"site",imgk:x.o.img||"overhead"});
  S.tiles.push(tile);snapshot("added part reference");save();renderReference();renderTrendRail();toast(`Added ${PART_LABEL[part].toLowerCase()} as a reference`)}
function renderTrending(){if(S.type&&S.type!=="restaurant"){$("#trendBody").innerHTML=notBuiltFor("trending");wireNotBuilt($("#trendBody"));$("#rail-trending").innerHTML="";return}
  $$("#trendSeg button,#baselinePill").forEach(b=>b.classList.toggle("on",b.dataset.t===S.trend));
  const f="all";
  const body=$("#trendBody");
  if(S.trend==="snippets"){body.innerHTML=`<div class="col">${SNIPPETS.map(s=>`<div class="snip ${S.sel?.kind==="trend"&&S.sel.id===s.id?"sel":""}" data-tr="${s.id}" tabindex="0"><div class="sp" style="${siteVars()};color:${tv("color.ink")};background:${tv("color.ground")}">${s.prev()}</div><div class="col"><div class="row"><span class="title-s">${esc(s.title)}</span><span class="badge ${s.pct>50?"e":"p"}">${s.pct}% of AI sites</span><span class="spacer"></span><button class="btn text sm" data-addref="${s.id}"><span class="ms">${onShelf(s.id)?"check":"bookmark_add"}</span>${onShelf(s.id)?"On shelf":"Add as reference"}</button><button class="btn tonal sm" data-usesnip="${s.id}">Use</button></div><div class="body-s osv">Where: ${esc(s.where)} · token: <span class="mono">${esc(s.tok)}</span></div><pre>${esc(s.code)}</pre></div></div>`).join("")}</div>`;
    $$("[data-usesnip]").forEach(b=>b.onclick=e=>{e.stopPropagation();const s=SNIPPETS.find(x=>x.id===b.dataset.usesnip);const t=T(s.tok);if(t){setToken(s.tok,s.val,`snippet “${s.title}” from Trending`)}else{if(!S.tokens)S.tokens=seedTokens();S.tokens.push({sec:"components",k:s.tok,type:"text",v:s.val,why:`snippet “${s.title}” from Trending`,not:"",prev:[[s.title,s.pct]],mine:s.title,edited:true});snapshot(`added ${s.tok}`);save()}if(s.id==="sn5")setEl("hero",{variant:"board"});if(s.id==="sn3")setEl("bundles",{hidden:false,caption:"host suggests"});toast(`Added ${s.tok} to the design system`)});
    $$("[data-addref]",body).forEach(b=>b.onclick=e=>{e.stopPropagation();addTrendRef(b.dataset.addref)});
    $$("[data-tr]").forEach(el=>el.onclick=e=>{if(e.target.closest("[data-addref],[data-usesnip]"))return;const same=S.sel?.kind==="trend"&&S.sel.id===el.dataset.tr;select(same?null:{kind:"trend",id:el.dataset.tr});renderTrending()});renderTrendRail();return}
  if(S.trend==="baseline"){const x=TREND.baseline.find(y=>y.id===(S.sel?.kind==="trend"&&TREND.baseline.some(z=>z.id===S.sel.id)?S.sel.id:"b1"));
    body.innerHTML=`<div class="row"><span class="body-s osv">What Claude Design or Figma Make return for “make a website for a Thai restaurant” with no research attached.</span></div><div class="row">${TREND.baseline.map(y=>`<button class="chip sm ${y.id===x.id?"on":""}" data-tr="${y.id}">${esc(y.o.name)}</button>`).join("")}<span class="spacer"></span><button class="btn ${onShelf(x.id)?"text":"tonal"} sm" data-addref="${x.id}"><span class="ms">${onShelf(x.id)?"check":"bookmark_add"}</span>${onShelf(x.id)?"On shelf":"Add as counter-example"}</button><span class="body-s osv">overall typicality</span>${ring(typicality(x.parts))}</div>
      <div class="tshot" style="cursor:default"><div style="position:relative">${baselineHTML(x.id)}${[["hero","2%","30%"],["nav","40%","1%"],["cta","70%","46%"],["palette","2%","13%"],["sections","2%","60%"]].map(([k,l,t])=>`<div class="anno" style="left:${l};top:${t}"><b>${x.parts[k][1]}%</b>${esc(PART_LABEL[k])}: ${esc(x.parts[k][0])}</div>`).join("")}</div></div>
`;
    $$("[data-addref]",body).forEach(b=>b.onclick=e=>{e.stopPropagation();addTrendRef(b.dataset.addref)});
    $$("[data-tr]").forEach(el=>el.onclick=e=>{if(e.target.closest("[data-addref],[data-usesnip]"))return;const same=S.sel?.kind==="trend"&&S.sel.id===el.dataset.tr;select(same?null:{kind:"trend",id:el.dataset.tr});renderTrending()});renderTrendRail();return}
  let list=TREND[S.trend].filter(x=>f==="all"||x.tags.includes(f));list=[...list].sort((a,b)=>typicality(a.parts)-typicality(b.parts));
  body.innerHTML=`<div class="gal">${list.map(x=>`<div class="tshot ${S.sel?.kind==="trend"&&S.sel.id===x.id?"sel":""}" data-tr="${x.id}" tabindex="0"><div class="thumb">${mock(x.o)}<button class="btn ${onShelf(x.id)?"tonal":"filled"} sm refbtn" data-addref="${x.id}" aria-label="Add ${esc(x.title)} as a reference"><span class="ms">${onShelf(x.id)?"check":"bookmark_add"}</span>${onShelf(x.id)?"On shelf":"Add as reference"}</button></div><div class="cap"><div class="row"><span class="title-s" style="flex:1;min-width:0">${esc(x.title)}</span><span class="badge ${typicality(x.parts)>50?"e":typicality(x.parts)>25?"w":"ok"}">${typicality(x.parts)}% typical</span></div><div class="body-s osv">${esc(x.note)}</div><div class="row">${x.tags.map(t=>`<span class="badge">${esc(t)}</span>`).join("")}</div></div></div>`).join("")||'<div class="note">Nothing here yet.</div>'}</div>`;
  $$("[data-addref]",body).forEach(b=>b.onclick=e=>{e.stopPropagation();addTrendRef(b.dataset.addref)});
  $$("[data-tr]").forEach(el=>el.onclick=e=>{if(e.target.closest("[data-addref],[data-usesnip]"))return;const same=S.sel?.kind==="trend"&&S.sel.id===el.dataset.tr;select(same?null:{kind:"trend",id:el.dataset.tr});renderTrending()});
  renderTrendRail();
}
function renderTrendRail(){setTimeout(()=>$$("#rail-trending [data-closesel]").forEach(b=>b.onclick=clearSel),0);
  const r=$("#rail-trending");
  const all=[...TREND.similar,...TREND.featured,...TREND.baseline];const x=S.sel?.kind==="trend"?all.find(y=>y.id===S.sel.id):null;const isBase=x?TREND.baseline.includes(x):false;const sn=S.sel?.kind==="trend"?SNIPPETS.find(y=>y.id===S.sel.id):null;
  const mine=myParts();
  if(sn){r.innerHTML=`<div class="pane-hd"><span class="title-m" style="flex:1">${esc(sn.title)}</span><button class="icon-btn" data-closesel aria-label="Close"><span class="ms">close</span></button></div><div class="card outlined" style="${siteVars()};background:${tv("color.ground")};color:${tv("color.ink")}">${sn.prev()}</div><div class="body-m">${esc(sn.where)}</div><div class="kv"><span>Typicality</span><b>${sn.pct}% of AI sites</b></div><div class="kv"><span>Token</span><span class="mono">${esc(sn.tok)}</span></div><div class="kv"><span>Value</span><span>${esc(sn.val)}</span></div><div class="row"><button class="btn filled" id="useSnip"><span class="ms">add</span>Use this snippet</button><button class="btn tonal" id="snipRef"><span class="ms">bookmark_add</span>${onShelf(sn.id)?"On the shelf":"Add as reference"}</button></div>`;$("#useSnip").onclick=()=>$(`[data-usesnip="${sn.id}"]`)?.click();$("#snipRef").onclick=()=>addTrendRef(sn.id);return}
  if(!x){r.innerHTML=`<div class="pane-hd"><span class="title-m">How to use Trending</span></div><div class="note">Your pages haven't been generated yet. Use this step to collect what you like before building the shelf: open an example to see how typical each part is in AI output, then add it to the reference shelf. Baselines can go on the shelf as counter-examples.</div><div class="rsec"><span>On the shelf from Trending</span><span>${S.tiles.filter(t=>t.from).length}</span></div>${S.tiles.filter(t=>t.from).map(t=>`<div class="rline">${esc(t.title)}</div>`).join("")||'<div class="note">Nothing yet.</div>'}`;return}
  const isBase0=TREND.baseline.includes(x);
  r.innerHTML=`<div class="pane-hd"><span class="title-m" style="flex:1;min-width:0">${esc(x.title)}</span><button class="icon-btn" data-closesel aria-label="Close"><span class="ms">close</span></button></div><div class="tshot" style="cursor:default"><div class="thumb">${isBase?`<div style="position:absolute;inset:0;overflow:hidden"><div style="width:300%;transform:scale(.3333);transform-origin:0 0">${baselineHTML(x.id)}</div></div>`:mock(x.o)}</div></div><div class="dist">${ring(typicality(x.parts))}<div class="body-s">${esc(x.note)}</div></div>
  <div class="parts" style="margin-top:8px"><div class="h">part</div><div class="h">theirs</div><div class="h">%</div><div class="h"></div>${PARTS.map(k=>{const p=x.parts[k];const on=S.tiles.some(t=>t.from===x.id+":"+k);return`<div>${PART_LABEL[k]}</div><div class="body-s">${esc(p[0])}</div><div class="${p[1]>50?"bad-t":""}">${p[1]}</div><div><button class="btn text sm" data-partref="${k}" ${on?"disabled":""} aria-label="Add ${PART_LABEL[k]} as a reference">${on?"Added":"+ Ref"}</button></div>`}).join("")}</div>
  ${isBase?`<div class="card err body-s">This is the baseline. Its parts aren't borrowable, but you can keep it on the shelf as a counter-example.</div>`:""}<div class="row" style="margin-top:8px"><button class="btn tonal sm" id="toShelf"><span class="ms">${onShelf(x.id)?"check":"bookmark_add"}</span>${onShelf(x.id)?"Whole site on the shelf":"Add whole site as reference"}</button><span class="body-s osv">or add single parts above</span></div>`;
  $$("[data-borrow]",r).forEach(b=>b.onclick=()=>{const p=x.parts[b.dataset.borrow];if(p[2]==="imagery"){setToken("imagery",p[3],`borrowed from “${x.title}”`)}else setToken(p[2],p[3],`borrowed from “${x.title}”`);toast(`Borrowed ${PART_LABEL[b.dataset.borrow].toLowerCase()} · ${p[2]} updated`);renderTrending()});
  $("#toShelf",r)&&($("#toShelf",r).onclick=()=>addTrendRef(x.id));$$("[data-partref]",r).forEach(b=>b.onclick=()=>addPartRef(x.id,b.dataset.partref));
}
$$("#trendSeg button,#baselinePill").forEach(b=>b.onclick=()=>{S.trend=b.dataset.t;select(null);save();renderTrending()});
let previewVer=null;
function verLabel(w){const m=String(w).match(/^element (\w+) (\{.*\})$/);if(!m)return w;let o={};try{o=JSON.parse(m[2])}catch{}const n=EL[m[1]]?.name||m[1];const parts=Object.entries(o).map(([k,v])=>k==="hidden"?(v?"removed":"restored"):k==="variant"?`→ ${v}`:k==="caption"?`copy → “${String(v).slice(0,28)}”`:k==="img"?(v?"image swapped":"image reset"):`${k} → ${v}`);return`${n} ${parts.join(", ")}`}
// each history entry stores the state BEFORE its change; the state "at that point" (after the change) is the next entry, or current.
function stateAfter(i){const n=S.history[i+1];return n?{tokens:n.tokens,elements:n.elements,site:n.site||S.site,review:"review" in n?n.review:S.review}:{tokens:S.tokens||seedTokens(),elements:S.elements,site:S.site,review:S.review}}
function verList(){return S.history.length?[...S.history].reverse().slice(0,20).map((h,i)=>{const idx=S.history.length-1-i;const cur=idx===S.history.length-1;const on=previewVer===idx||(previewVer===null&&cur);return`<div class="ver ${on?"on":""}" data-ver="${idx}" tabindex="0" role="button" aria-pressed="${on}"><span class="d"></span><span style="flex:1;min-width:0">${esc(verLabel(h.what))}${cur?' <span class="badge p">current</span>':""}</span><span class="mono osv">${new Date(h.t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>${cur?"":`<button class="btn text sm" data-restore="${idx}">Restore</button>`}</div>`}).join(""):`<div class="note">No versions yet. Every change creates one.</div>`}
function wireVer(r){$$("[data-ver]",r).forEach(v=>{const go=()=>{const i=+v.dataset.ver;previewVer=(i===S.history.length-1)?null:i;renderReview()};v.onclick=e=>{if(e.target.closest("[data-restore]"))return;go()};v.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}}});
  $$("[data-restore]",r).forEach(b=>b.onclick=e=>{e.stopPropagation();const i=+b.dataset.restore;const st=stateAfter(i);snapshot("restored “"+S.history[i].what+"”");S.tokens=JSON.parse(JSON.stringify(st.tokens));S.elements=JSON.parse(JSON.stringify(st.elements));S.site=st.site?JSON.parse(JSON.stringify(st.site)):S.site;S.review=st.review;previewVer=null;save();renderAll();toast("Restored that version")})}

/* ============================ REVIEW ============================ */
const EL={
  brand:{name:"Site name",page:"*",receipt:"Real name “Mali's Table” ← principle 2; rejected a1 “Mama's Table”",prev:[["generic “Mama's / Thai Garden”",71],["the real name",29]],mine:"the real name",pin:1},
  hero:{name:"Hero photo",page:"home",receipt:"Overhead, several plates, hands ← c3 + c1 (81% photo-first)",prev:[["single centered bowl",71],["overhead, several plates",34],["hands in frame",6]],mine:"hands in frame",pin:2,gaps:["[PHOTO] real overhead shot — packet has one table photo"]},
  side:{name:"Second photo",page:"home",receipt:"Mali's hands pounding som tam ← c7",prev:[["interior / storefront",58],["chef portrait",30],["hands at work",12]],mine:"hands at work",pin:3},
  cards:{name:"Dish cards",page:"home",receipt:"Signature dishes, one-line stories ← c2; 47% want story in small doses",prev:[["“popular dishes” grid",80],["signature dishes w/ story",17]],mine:"signature dishes w/ story",pin:4,gaps:["[SPICE] heat per dish — ask Mali for a scale","[ASK MALI] third signature dish"]},
  bundles:{name:"Order for the table",page:"home",receipt:"",prev:[["bundle cards + Add",62],["family-meal banner",28],["host suggests",7],["no section",3]],mine:"bundle cards + Add",pin:5,q:true},
  story:{name:"Story strip",page:"home",receipt:"Muted one-liner ← c1: story 3% first-look; 47% want it, small",prev:[["long “Our Story” block",66],["one muted line",24]],mine:"one muted line",pin:6},
  cta:{name:"Primary button",page:"*",receipt:"“See the menu” ← principle 1",prev:[["“Order Now” centered",74],["“See the menu”",18]],mine:"“See the menu”",pin:7},
  menuhead:{name:"Menu header",page:"menu",receipt:"Grouped the way the family eats ← c8",prev:[["Starters/Mains/Desserts",83],["by how the family eats",9]],mine:"by how the family eats",pin:8},
  heat:{name:"Heat pips",page:"menu",receipt:"color.heat only ← s2 spice questions",prev:[["chili emoji",61],["pips",22],["none",17]],mine:"pips",pin:9},
  orderflow:{name:"Order flow",page:"order",receipt:"",prev:[["cart + checkout",88],["call / message to order",9]],mine:"cart + checkout",pin:10,q:true},
  hours:{name:"Today card",page:"home",receipt:"Open-now + pickup time beside the hero ← s2: regulars ask hours and spice first",prev:[["hours in footer only",77],["open-now card near the top",14]],mine:"open-now card near the top",pin:12,gaps:["[HOURS] delivery hours — not in the packet; ask Mali"]},
  footer:{name:"Footer",page:"*",receipt:"Address, hours, weekly-menu signup ← s3: 62% order online; regulars",prev:[["4-column footer with social icons",82],["hours + address + signup",21]],mine:"hours + address + signup",pin:13},
  storyhero:{name:"Story page hero",page:"story",receipt:"Mother's menu board ← r5",prev:[["family portrait",64],["old photo / object",21]],mine:"old photo / object",pin:11}
};
function setEl(id,p){snapshot(`element ${id} ${JSON.stringify(p)}`);S.elements[id]={...(S.elements[id]||{}),...p};save();renderReview()}
function elState(id){return S.elements[id]||{}}
const PRINCIPLES=[["P","Perceivable"],["O","Operable"],["U","Understandable"],["R","Robust"]];
function audit(){const g=tv("color.ground"),a=tv("color.accent"),i=tv("color.ink"),h=tv("color.heat");const F=S.a11yFix||{};const heatV=elState("heat").variant||"pips";const out=[];
  const add=(p,sc,name,ok,detail,fix,sev)=>out.push({p,sc,name,ok,t:detail,fix:ok?null:fix,sev:sev||"serious"});
  add("P","1.1.1","Non-text content",!!F.alt,F.alt?"Every image has alt text drawn from its design decision":"2 images have no alt text (hero, second image)","alt","critical");
  const hasHeat=(site().items.list||[]).some(d=>d.heat);add("P","1.4.1","Use of color",!hasHeat||heatV!=="pips",!hasHeat?"No information is shown by color alone":heatV!=="pips"?"Heat level has a text label as well as color":"Heat level is shown by color pips only","heat","serious");
  const cr=(sc,name,x,y,min,detail,fix)=>{const r=ratio(x,y);add("P",sc,name,r>=min,`${detail}: ${r1(r)}:1 (needs ${min}:1)`,fix,"serious")};
  cr("1.4.3","Contrast (minimum)",i,g,4.5,"Body text on page background","ink");
  cr("1.4.3","Contrast (minimum)","#ffffff",a,4.5,"Button text on accent","onaccent");
  cr("1.4.11","Non-text contrast",a,g,3,"Buttons and focus ring on background","accent");
  if(hasHeat)cr("1.4.11","Non-text contrast",h,g,3,"Heat pips on background","heat3");
  add("P","1.4.4","Resize text",true,"Text scales to 200% without loss of content");
  add("P","1.4.10","Reflow",true,"No horizontal scrolling at 320px wide");
  add("O","2.1.1","Keyboard",true,"Every control reachable and usable by keyboard");
  add("O","2.4.4","Link purpose (in context)",!!F.link,F.link?"The map link names the address it opens":"“Map” link doesn't say where it goes","link","moderate");
  add("O","2.4.7","Focus visible",true,"Focus ring visible on all controls (accent, 2px)");
  add("O","2.5.8","Target size (minimum)",true,"Buttons and links are at least 24×24px");
  add("U","3.1.1","Language of page",true,"Page language set to English");
  add("U","3.3.1","Error identification",true,"Form errors are described in text");
  add("U","3.3.2","Labels or instructions",true,"Every form field has a visible label");
  add("R","4.1.2","Name, role, value",!!F.steppers,F.steppers?`Quantity steppers announce “Increase ${(site().items.list[0]||{n:"item"}).n}”, etc.`:"Quantity − / + buttons have no accessible names","steppers","serious");
  add("R","4.1.3","Status messages",true,"“Added to order” is announced to screen readers");
  return out}
function wcagScore(){const au=audit();const w={critical:3,serious:2,moderate:1};const tot=au.reduce((s,x)=>s+(w[x.sev]||1),0);const got=au.reduce((s,x)=>s+(x.ok?(w[x.sev]||1):0),0);const total=Math.round(100*got/tot);
  const per=PRINCIPLES.map(([k,n])=>{const xs=au.filter(x=>x.p===k);return[n,Math.round(100*xs.filter(x=>x.ok).length/xs.length),xs.filter(x=>!x.ok).length,xs.length]});return{total,per,au}}
function patterns(){const p=[];const ground=tv("color.ground");const onPage=Object.entries(EL).filter(([id,e])=>(e.page==="*"||e.page===S.page)&&!elState(id).hidden);
  onPage.forEach(([id,e])=>{const pc=e.prev.find(x=>x[0]===e.mine)?.[1]||0;if(pc>50)p.push({lvl:"warn",t:`${e.name} is the most common AI version (${pc}%)`,id})});
  const W=site();const longest=[...(W.items.list||[])].sort((x,y)=>y.n.length-x.n.length)[0];
  if(longest&&longest.n.length>18)p.push({lvl:"edge",t:`Long names: “${longest.n}” may wrap to 3 lines in a card at 390px`,id:"cards"});
  p.push({lvl:"edge",t:`Empty state: the ${(W.catalog.title||"catalog").toLowerCase()} page with no items shows nothing; add a “coming soon” line`,id:"menuhead"});
  if((W.items.list||[]).some(d=>d.heat)&&(elState("heat").variant||"pips")==="pips")p.push({lvl:"edge",t:"Heat pips rely on color alone; add a text label (“mild / medium / hot”) for color-blind users",id:"heat"});
  if(!(W.footer?.contact))p.push({lvl:"edge",t:"No contact details in the footer",id:"footer"});
  return p}
function notBuiltFor(where){return`<div class="card" style="max-width:560px;margin:40px auto;text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center"><span class="ms" style="font-size:40px;color:var(--primary)">${where==="review"?"web":"trending_up"}</span><span class="title-l">${where==="review"?"No pages generated yet":"Examples coming for this project type"}</span><span class="body-m osv">${where==="review"?`Pages are generated from the design system once research, references and tokens are in place. In this prototype, page generation is built for restaurant projects; open Mali's Table to see a finished review.`:`This prototype's trending library covers restaurant sites. For a ${(PTYPES[S.type]||PTYPES.other).name.toLowerCase()}, add references by uploading them on the Inspiration page.`}</span><div class="row" style="justify-content:center"><button class="btn tonal" data-goview="inspiration">Go to Inspiration</button><button class="btn text" data-openmali>Open Mali's Table</button></div></div>`}
function wireNotBuilt(root){$$("[data-goview]",root).forEach(b=>b.onclick=()=>go(b.dataset.goview));$$("[data-openmali]",root).forEach(b=>b.onclick=()=>openProject("p-mali"))}
function renderReview(){syncEL();
  if(!S.tokens)S.tokens=seedTokens();
  $$("#pagetabs [data-p]").forEach(b=>b.classList.toggle("on",b.dataset.p===S.page));$$("#ovl [data-o]").forEach(b=>b.classList.toggle("on",!!S.overlays[b.dataset.o]));$("#device").value=S.device;
  const st=$("#stage");
  if(previewVer!==null&&S.history[previewVer]){const keep={tokens:S.tokens,elements:S.elements,sel:S.sel,site:S.site,review:S.review};const at=stateAfter(previewVer);S.tokens=at.tokens;S.elements=at.elements;S.site=at.site;S.review=at.review;S.sel=null;syncEL();
    const h=S.history[previewVer];st.innerHTML=`<div class="verbar"><span class="ms">history</span><span style="flex:1;min-width:0"><b>Previewing</b> · ${esc(verLabel(h.what))} · ${new Date(h.t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span><button class="btn text sm" id="vbBack">Back to current</button><button class="btn filled sm" id="vbRestore">Restore this version</button></div><div class="morph">${pageHTML()}</div>`;Object.assign(S,keep);
    $("#vbBack",st).onclick=()=>{previewVer=null;renderReview()};$("#vbRestore",st).onclick=()=>$(`[data-restore="${previewVer}"]`)?.click()||(()=>{const i=previewVer;const a=stateAfter(i);snapshot("restored “"+S.history[i].what+"”");S.tokens=JSON.parse(JSON.stringify(a.tokens));S.elements=JSON.parse(JSON.stringify(a.elements));S.site=a.site?JSON.parse(JSON.stringify(a.site)):S.site;S.review=a.review;previewVer=null;save();renderAll();toast("Restored that version")})();
    $$(".el",st).forEach(e=>{e.style.cursor="default"});renderReviewRail();return}
  st.innerHTML=`<div class="morph">${pageHTML()}</div>${photoCreditBar()}`;
  photoFill();
  $$(".el",st).forEach(e=>e.addEventListener("click",ev=>{ev.stopPropagation();const inner=ev.target.closest(".el");if(inner&&inner!==e)return;select({kind:"el",id:e.dataset.el});S.reviewTab="panel";renderReview()}));
  st.onclick=e=>{if(e.target===st||e.target.classList.contains("site")){select(null);renderReview()}};
  renderReviewRail();
}

/* ---- overall score: how this result compares to other websites ---- */
function erf(x){const t=1/(1+.3275911*Math.abs(x));const y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-x*x);return x>=0?y:-y}
const CORPUS={mean:54,sd:13,n:1200};
function pctile(v){return Math.round(100*.5*(1+erf((v-CORPUS.mean)/(CORPUS.sd*Math.SQRT2))))}
/* Photo credits. A photograph without its creator and licence is not traceable,
   and most CC licences require the attribution be shown. */
function photoCreditBar(){if(typeof photoCredits!=="function")return"";const c=photoCredits();if(!c.length)return"";
  return`<div class="note" id="photoCredits" style="margin-top:8px;font-size:12px">Photographs: ${c.map(p=>`<a href="${esc(p.source)}" target="_blank" rel="noopener">${esc(p.alt||"photo")}</a> by ${esc(p.creator)} (<a href="${esc(p.licenseUrl)}" target="_blank" rel="noopener">${esc(p.license)}</a>)`).join(" · ")} · via ${esc(c[0].provider)}</div>`}
/* Resolve any photo subjects the current site refers to but hasn't looked up yet. */
var photoFilling=false;
function photoFill(){if(photoFilling||typeof photoResolveAll!=="function")return;
  const want=sitePhotoSubjects().filter(q=>!photoGet(q)&&!IMG[q]&&!/^user:/.test(q));
  if(!want.length)return;photoFilling=true;
  photoResolveAll(want,()=>{if(S.view==="review")renderReview();else if(S.view==="system")renderSystem()}).finally(()=>{photoFilling=false})}
function siteScore(){const au=audit();const pf=patterns();
  const onPage=Object.entries(EL).filter(([id,e])=>(e.page==="*"||e.page===S.page)&&!elState(id).hidden);
  const gaps=Object.entries(EL).filter(([id,e])=>e.page==="*"||e.page===S.page).flatMap(([id,e])=>e.gaps||[]);
  const a11y=Math.round(100*au.filter(a=>a.ok).length/au.length);
  const distinct=Math.max(0,100-typicality(myParts()));
  const grounded=Math.round(100*onPage.filter(([i,e])=>e.receipt).length/Math.max(1,onPage.length));
  const complete=Math.max(0,100-gaps.length*12);
  const patterns_=Math.max(0,100-pf.filter(p=>p.lvl==="warn").length*15-pf.filter(p=>p.lvl!=="warn").length*6);
  const subs=[["Accessibility",a11y,.3],["Distinctiveness",distinct,.25],["Research grounding",grounded,.2],["Pattern health",patterns_,.15],["Completeness",complete,.1]];
  const total=Math.round(subs.reduce((s,x)=>s+x[1]*x[2],0));return{total,subs}}
const COMPARE=[["Mama's Table (AI baseline)",41],["Thai Garden (AI baseline)",37],["Nong's",72],["Casa Lupe",76],["Ember",63]];
const A11Y_CORPUS={mean:61,sd:15,n:1200};
function scoreCard(){const {total,per,au}=wcagScore();const pc=Math.round(100*.5*(1+erf((total-A11Y_CORPUS.mean)/(A11Y_CORPUS.sd*Math.SQRT2))));const fails=au.filter(x=>!x.ok);const col=total>=90?"var(--ok)":total>=70?"var(--warn)":"var(--error)";
  return`<div class="card high"><div class="score"><div class="big" style="background:conic-gradient(${col} ${total*3.6}deg,var(--surface-container-highest) 0)"><span><b>${total}</b><small>WCAG score</small></span></div><div style="flex:1;min-width:180px"><div class="title-m">More accessible than ${pc}% of sites</div><div class="body-s osv">WCAG 2.2 AA, compared with ${A11Y_CORPUS.n.toLocaleString()} restaurant sites</div><div class="row" style="margin-top:6px"><span class="badge ${fails.length?"e":"ok"}">${fails.length?`AA: ${fails.length} failure${fails.length>1?"s":""} to fix`:"AA conformant"}</span><span class="badge">${au.length-fails.length} of ${au.length} criteria pass</span></div></div></div>
  <div class="subs" style="margin-top:10px">${per.map(p=>`<div><div class="row" style="gap:6px"><span>${p[0]}</span><span class="osv" style="font-size:11px">${p[3]-p[2]} of ${p[3]}</span></div><div class="bar ${p[1]<75?"red":""}" style="margin-top:3px"><i style="width:${p[1]}%"></i></div></div><b class="${p[1]<75?"bad-t":p[1]<100?"warn-t":"ok-t"}" style="text-align:right">${p[1]}</b>`).join("")}</div>
  <div class="note" style="margin-top:6px">Score weights failures by severity (critical 3, serious 2, moderate 1). Comparison figures are placeholder data for the prototype.</div></div>`}
function renderReviewRail(){
  const r=$("#rail-review");
  const tab=S.reviewTab||"panel";const sel=S.sel?.kind==="el"?EL[S.sel.id]:null;
  const onPage=Object.entries(EL).filter(([id,e])=>(e.page==="*"||e.page===S.page)&&!elState(id).hidden);const common=onPage.filter(([id,e])=>(e.prev.find(x=>x[0]===e.mine)?.[1]||0)>50).length;const gaps=Object.entries(EL).filter(([id,e])=>e.page==="*"||e.page===S.page).flatMap(([id,e])=>(e.gaps||[]).map(g=>({id,g})));
  const au=audit();const pf=patterns();
  let body="";
  if(tab==="panel")body=`${sel?`<div class="card high"><div class="row"><span class="title-s" style="flex:1">${esc(sel.name)}</span><button class="icon-btn" data-closesel aria-label="Deselect"><span class="ms">close</span></button></div><div class="rsec"><span>Assumption / design decision</span></div><div class="body-s ${sel.receipt?"":"bad-t"}">${sel.receipt?esc(sel.receipt):"AI decided — no research behind it"}</div><div class="rsec"><span>Typicality · overused-pattern score</span><span>${sel.prev.find(x=>x[0]===sel.mine)?.[1]||"?"}%</span></div>${sel.prev.map(x=>`<div class="pr ${x[0]===sel.mine?"me":""}"><span>${esc(x[0])}</span><div class="bar ${x[0]===sel.mine&&x[1]>50?"red":""}"><i style="width:${x[1]}%"></i></div><span class="mono">${x[1]}%</span></div>`).join("")}<div class="rsec"><span>Gaps in AI · research not used</span></div>${(sel.gaps||[]).map(g=>`<div class="gap"><span class="mono">${esc(g.match(/^\[[^\]]+\]/)?.[0]||"")}</span><span>${esc(g.replace(/^\[[^\]]+\]\s*/,""))}</span></div>`).join("")||'<div class="body-s osv">none for this element</div>'}<div class="rsec"><span>Targeted edits & options</span></div>${optionsUI(S.sel.id)}${promptBox(sel.name,`page element "${sel.name}" (id ${S.sel.id}) on the ${S.page} page. Decision: ${sel.receipt||"none — AI decided"}. Overrides: ${JSON.stringify(S.elements[S.sel.id]||{})}`)}</div>`:`<div class="note">Click any part of the page. This panel shows the design decision behind it, how typical that choice is in AI output, which research wasn't used, and targeted edits and options for that component.</div>`}
    <div class="rsec"><span>Decisions backed by research</span><span>${onPage.filter(([i,e])=>e.receipt).length}</span></div>${onPage.filter(([i,e])=>e.receipt).map(([id,e])=>`<div class="rline"><span class="pin" style="position:static;flex:none">${e.pin}</span><span>${esc(e.name)} <span class="osv">← ${esc(e.receipt.split("←")[1]||e.receipt)}</span></span></div>`).join("")}
    <div class="rsec"><span>Decisions the AI made alone</span><span>${onPage.filter(([i,e])=>!e.receipt).length}</span></div>${onPage.filter(([i,e])=>!e.receipt).map(([id,e])=>`<div class="rline"><span class="pin q" style="position:static;flex:none">${e.pin}</span><span>${esc(e.name)} <span class="bad-t">· ${e.prev[0][1]}% of AI sites</span></span></div>`).join("")||'<div class="rline osv">none on this page</div>'}
    <div class="card" style="margin-top:8px"><span class="title-s">Page score</span><div class="body-s">${common} of ${onPage.length} elements are the most-common AI version · ${gaps.length} gaps · ${au.filter(a=>!a.ok).length} a11y issues · ${pf.filter(p=>p.lvl==="warn").length} pattern flags</div></div>
    <div class="rsec"><span>Pattern flags & edge cases</span><span>${pf.length}</span></div><div class="audit">${pf.map(p=>`<div class="it"><span class="ms ${p.lvl==="warn"?"warn-t":"osv"}">${p.lvl==="warn"?"flag":"rule"}</span><span>${esc(p.t)}</span><button class="btn text sm" data-go="${p.id}">Select</button></div>`).join("")}</div>`;
  else if(tab==="audit"){const W=wcagScore();body=`${scoreCard()}${PRINCIPLES.map(([k,n])=>{const xs=W.au.filter(x=>x.p===k);const bad=xs.filter(x=>!x.ok);return`<div class="rsec"><span>${n}</span><span>${bad.length?bad.length+" to fix":"all pass"}</span></div><div class="audit">${[...bad,...xs.filter(x=>x.ok)].map(x=>`<div class="it"><span class="ms ${x.ok?"ok-t":"bad-t"}">${x.ok?"check_circle":"error"}</span><span><b class="mono" style="font-size:11.5px">${x.sc}</b> ${esc(x.name)}${x.ok?"":` <span class="badge ${x.sev==="critical"?"e":x.sev==="serious"?"w":""}">${x.sev}</span>`}<br><span class="osv">${esc(x.t)}</span></span>${x.fix?`<button class="btn text sm" data-fix="${x.fix}">Fix</button>`:""}</div>`).join("")}</div>`}).join("")}`}
  else body=`<div class="row"><span class="title-s">Version history</span><span class="spacer"></span><span class="badge">${S.history.length}</span></div>${verList()}<div class="note">Every token edit, element change, and swap creates a version. Restore rolls tokens and element overrides back.</div>`;
  r.innerHTML=`<div class="tabs"><button class="${tab==="panel"?"on":""}" data-rt="panel">Panel</button><button class="${tab==="audit"?"on":""}" data-rt="audit">Audit</button><button class="${tab==="history"?"on":""}" data-rt="history">History</button></div><div class="pane" style="padding:12px 16px;flex:1">${body}</div>`;
  $$("[data-rt]",r).forEach(b=>b.onclick=()=>{S.reviewTab=b.dataset.rt;save();renderReviewRail()});
  $$("[data-closesel]",r).forEach(b=>b.onclick=clearSel);wireOptions(r);if(sel&&$("#pForm",r))wirePrompt(r,S.sel,`page element "${sel.name}" (id ${S.sel.id}) on the ${S.page} page. Decision: ${sel.receipt||"none — AI decided"}. Overrides: ${JSON.stringify(S.elements[S.sel.id]||{})}`);
  $$("[data-fix]",r).forEach(b=>b.onclick=()=>{const f=b.dataset.fix;const g=tv("color.ground");S.a11yFix=S.a11yFix||{};
    const dark=(k,min,vs)=>{let c=tv(k),n=0;while(ratio(c,vs||g)<min&&n<40){c=shade(c,-6);n++}if(c!==tv(k))setToken(k,c,"darkened to pass WCAG")};
    if(f==="alt"){S.a11yFix.alt=true;snapshot("alt text added to 2 images");toast("Alt text written from each image's design decision")}
    else if(f==="link"){S.a11yFix.link=true;snapshot("map link renamed");toast("Link now reads “Map of 412 Lyndale Ave S”")}
    else if(f==="steppers"){S.a11yFix.steppers=true;snapshot("stepper labels added");toast("Steppers now have accessible names")}
    else if(f==="heat"){setEl("heat",{variant:"pips + label"});toast("Heat now shows pips and a text label")}
    else if(f==="ink")dark("color.ink",4.5);else if(f==="accent")dark("color.accent",3);else if(f==="heat3")dark("color.heat",3);
    else if(f==="onaccent"){let c=tv("color.accent"),n=0;while(ratio("#fff",c)<4.5&&n<40){c=shade(c,-6);n++}setToken("color.accent",c,"darkened so white button text passes")}
    save();renderReview();S.reviewTab="audit";renderReviewRail()});
  $$("[data-go]",r).forEach(b=>b.onclick=()=>{const id=b.dataset.go;const e=EL[id];if(e.page!=="*"&&e.page!==S.page)S.page=e.page;select({kind:"el",id});S.reviewTab="panel";renderReview()});
  wireVer(r);
}
$$("#pagetabs [data-p]").forEach(b=>b.onclick=()=>{S.page=b.dataset.p;select(null);save();renderReview()});
$$("#ovl [data-o]").forEach(b=>b.onclick=()=>{S.overlays[b.dataset.o]=!S.overlays[b.dataset.o];save();renderReview()});
$("#device").onchange=e=>{S.device=e.target.value;save();renderReview()};
/* options for the selected component */
const HERO_OPTS=[["default","Overhead, three dishes, hands",6],["crop","Tight crop on hands",5],["hands","One bowl, hands reaching in",9],["after","The table, after",2],["board","Menu board as hero",3],["single","Single centered bowl (AI default)",71]];
function optionsUI(id){const st=elState(id);const e=EL[id];let o="";
  if(id==="hero"&&S.pid==="p-mali")o+=`<div class="body-s osv" style="margin-bottom:4px">Composition</div><div class="col">${HERO_OPTS.map(([v,l,p])=>`<button class="btn ${((st.variant||"default")===v)?"tonal":"outlined"} sm" style="justify-content:space-between" data-opt="${v}"><span>${l}</span><span class="badge ${p>50?"e":""}">${p}%</span></button>`).join("")}</div>`;
  if(id==="cta"&&S.pid==="p-mali")o+=`<div class="body-s osv" style="margin:6px 0 4px">Button label</div><div class="row">${["See the menu","Order","Order for the table","Order Now"].map(l=>`<button class="chip sm ${(tv("comp.cta")||"").includes(l)?"on":""}" data-cta="${l}">${l}</button>`).join("")}</div>`;
  if(id==="heat")o+=`<div class="body-s osv" style="margin:6px 0 4px">Heat indicator</div><div class="row">${["pips","pips + label","text only"].map(l=>`<button class="chip sm ${(st.variant||"pips")===l?"on":""}" data-heat="${l}">${l}</button>`).join("")}</div>`;
  o+=`<div class="row" style="margin-top:8px"><button class="btn outlined sm" id="peHide">${st.hidden?"Restore":"Remove"}</button>${e.q?`<button class="btn text sm" id="peKeep">Keep as taste decision</button>`:""}${Object.keys(st).length?`<button class="btn text sm" id="peReset">Reset element</button>`:""}</div>`;
  return o}
function wireOptions(r){const id=S.sel?.id;if(!id)return;
  $$("[data-opt]",r).forEach(b=>b.onclick=()=>{const v=b.dataset.opt;const o=HERO_OPTS.find(x=>x[0]===v);EL.hero.mine=o[1].toLowerCase();if(!EL.hero.prev.some(p=>p[0]===EL.hero.mine))EL.hero.prev.push([EL.hero.mine,o[2]]);setEl("hero",{variant:v})});
  $("#optCap",r)&&($("#optCap",r).onchange=e=>setEl(id,{caption:e.target.value}));
  $$("[data-cta]",r).forEach(b=>b.onclick=()=>setToken("comp.cta",`“${b.dataset.cta}”`,"targeted edit in Review"));
  $$("[data-heat]",r).forEach(b=>b.onclick=()=>setEl("heat",{variant:b.dataset.heat}));
  $("#peHide",r)&&($("#peHide",r).onclick=()=>setEl(id,{hidden:!elState(id).hidden}));
  $("#peKeep",r)&&($("#peKeep",r).onclick=()=>{EL[id].receipt="Kept as a taste decision by the designer (no research)";EL[id].q=false;snapshot(`${id} kept as taste`);renderReview()});
  $("#peReset",r)&&($("#peReset",r).onclick=()=>{snapshot(`reset ${id}`);delete S.elements[id];save();renderReview()});
}

/* ---- Prompt a specific part (runs on the viewer's Claude account; applies edits via page tools) ---- */
function promptBox(scopeLabel,scopeDesc){return`<div class="card outlined" style="margin-top:10px"><div class="row"><span class="title-s">Prompt this part</span><span class="badge p">${esc(scopeLabel)}</span></div><div class="note" style="margin:4px 0 6px">${sample?"Asks the AI with your research as context; edits apply only to this part.":"Connect an AI provider to prompt; offline, simple edits (color words, remove/restore, quoted captions) still work."}</div><div id="pOut" class="col" style="max-height:220px;overflow:auto"></div><form id="pForm" class="row" style="flex-wrap:nowrap;margin-top:6px"><input class="inl" id="pIn" style="border:1px solid var(--outline);height:40px;border-radius:20px;padding:0 14px" placeholder="e.g. “make this warmer” · “why this?” · “use the hands photo”"><button class="icon-btn on" aria-label="Send"><span class="ms">send</span></button></form></div>`}
let pTurns=[],pScope=null,pBusy=false;
function wirePrompt(r,scope,desc){if(pScope!==scope.kind+":"+scope.id){pTurns=[];pScope=scope.kind+":"+scope.id}const out=$("#pOut",r);out.innerHTML=pTurns.map(t=>`<div class="msg ${t.role==="user"?"me":""}">${esc(t.content)}</div>`).join("");
  $("#pForm",r).onsubmit=async e=>{e.preventDefault();if(pBusy)return;const q=$("#pIn",r).value.trim();if(!q)return;$("#pIn",r).value="";pTurns.push({role:"user",content:q});out.insertAdjacentHTML("beforeend",`<div class="msg me">${esc(q)}</div><div class="msg" id="pPending">Thinking…</div>`);out.scrollTop=out.scrollHeight;pBusy=true;
    try{let text;if(sample){const tools=[
        {name:"set_token",description:"Change a design token's value (and optionally why/not). Pages re-render.",inputSchema:{type:"object",properties:{key:{type:"string"},value:{type:"string"},why:{type:"string"},not:{type:"string"}},required:["key","value"]},execute:({key,value,why,not:n})=>{const t=T(String(key));if(!t)throw new Error("unknown token");setToken(t.k,String(value),why,n);return{ok:true}}},
        {name:"set_element",description:"Change a page element: hide/show, hero variant ('default'|'crop'|'hands'|'single'|'after'|'board'), heat variant ('pips'|'pips + label'|'text only'), or caption.",inputSchema:{type:"object",properties:{id:{type:"string"},hidden:{type:"boolean"},variant:{type:"string"},caption:{type:"string"}},required:["id"]},execute:({id,hidden,variant,caption})=>{if(!EL[String(id)])throw new Error("unknown element");const p={};if(hidden!==undefined)p.hidden=!!hidden;if(variant)p.variant=String(variant);if(caption)p.caption=String(caption);setEl(String(id),p);return{ok:true}}}];
        const lim=await sample.limits().catch(()=>null);const opts={cache:false,modelTier:"default",onText:({text})=>{const p=$("#pPending");if(p)p.textContent=text}};if(lim?.tools)opts.tools=tools;
        const res=await sample([{role:"user",content:RULES+"\n\nCONTEXT:\n"+ctxSummary()+"\n\nSELECTED: "+desc},...pTurns.slice(-10)],opts);text=res.text}
      else text=offlineEdit(q,scope);
      pTurns.push({role:"assistant",content:text});const p=$("#pPending");if(p){p.id="";p.textContent=text;if(scope.kind==="el")p.insertAdjacentHTML("beforeend",'<div class="acts"><button class="btn tonal sm" data-keep>Keep</button><button class="btn text sm" data-undo>Undo</button></div>');$("[data-keep]",p)&&($("[data-keep]",p).onclick=()=>toast("Kept"));$("[data-undo]",p)&&($("[data-undo]",p).onclick=()=>{if(S.history.length>1)restore(S.history.length-2)})}
      if(S.view==="review")renderReview();else renderSystem();}
    catch(err){const p=$("#pPending");if(p){p.id="";p.classList.add("sys");p.textContent=err.text||({not_granted:"Claude isn't allowed for this page, or the AI provider rejected the request.",rate_limited:"Too many requests; try again in a minute.",refused:"Claude declined that; try rephrasing."}[err.code]||"Couldn't reach the AI ("+(err.code||"error")+").")}}
    pBusy=false;const o2=$("#pOut");if(o2)o2.scrollTop=o2.scrollHeight}}
function offlineEdit(text,scope){const t=text.toLowerCase();const cw={green:"#4F8F6F",greener:"#4A7F72",blue:"#4F6F8F",bluer:"#3E6280",warm:"#8F6F4F",warmer:"#9A7250",red:"#B5533C",dark:"#2B2B2B",darker:"#1A1A1A",light:"#F2EFE9",lighter:"#F7F5F0",teal:"#2B6E63",clay:"#B5533C",charcoal:"#333333"};
  if(scope.kind==="token"){const tok=T(scope.id);const w=Object.keys(cw).find(x=>t.includes(x));if(tok?.type==="color"&&w){setToken(tok.k,cw[w]);return`Set ${tok.k} to ${cw[w]} (${w}). Contrast on ground: ${r1(ratio(cw[w],tv("color.ground")))}:1.`}if(t.includes("why"))return`${tok.k} is ${tok.v} because ${tok.why}. Not ${tok.not}.`;return"Offline: try a color word (“greener”, “darker”) or “why this?”."}
  const el=EL[scope.id];if(t.includes("remove")||t.includes("delete")){setEl(scope.id,{hidden:true});return`Removed “${el.name}”.`}if(t.includes("restore")){setEl(scope.id,{hidden:false});return`Restored “${el.name}”.`}if(scope.id==="hero"){const v=["crop","hands","after","board","single"].find(x=>t.includes(x));if(v){setEl("hero",{variant:v});return`Hero set to “${v}”.`}}if(t.includes("why"))return`${el.name}: ${el.receipt||"the AI decided this; no research behind it."}`;const m=text.match(/["“](.+?)["”]/);if(m){setEl(scope.id,{caption:m[1]});return`Caption set to “${m[1]}”.`}return"Offline: I can remove/restore, set a hero variant (crop, hands, after, board), set a quoted caption, or explain (“why this?”)."}
/* ============================ EXPORT / DIALOG / NAV ============================ */
function dialog(html,btns){const d=document.createElement("div");d.className="dialog";d.innerHTML=`<div class="box">${html}<div class="row" style="justify-content:flex-end">${btns.map((b,i)=>`<button class="btn ${b[1]}" data-db="${i}">${esc(b[0])}</button>`).join("")}</div></div>`;document.body.appendChild(d);$$("[data-db]",d).forEach(b=>b.onclick=()=>{btns[+b.dataset.db][2]();d.remove()});d.onclick=e=>{if(e.target===d)d.remove()}}
$("#exportBtn").onclick=e=>{e.stopPropagation();$("#exportMenu").hidden=!$("#exportMenu").hidden};document.addEventListener("click",()=>{$("#exportMenu").hidden=true});
$$("#exportMenu button").forEach(b=>b.onclick=()=>exportX(b.dataset.x));
function exportX(kind){let text="",label="";const toks=S.tokens||seedTokens();
  if(kind==="tokens-json"){text=JSON.stringify(Object.fromEntries(toks.map(t=>[t.k,{value:t.v,why:t.why,not:t.not}])),null,2);label="tokens.json"}
  if(kind==="tokens-css"){text=":root {\n"+toks.map(t=>`  --${t.k.replace(/\./g,"-")}: ${/^#/.test(t.v)?t.v:JSON.stringify(t.v)}; /* ${t.why} — not: ${t.not} */`).join("\n")+"\n}";label="tokens.css"}
  if(kind==="figma"){text=JSON.stringify({collections:[{name:"Traceform",modes:["default"],variables:toks.map(t=>({name:t.k.replace(/\./g,"/"),type:t.type==="color"?"COLOR":"STRING",value:t.v,description:`${t.why} | NOT: ${t.not}`}))}],frames:["Home","Menu","Order","Story"].map(p=>({name:`${S.project} / ${p}`,receipts:Object.entries(EL).filter(([i,e])=>e.page==="*"||e.page===p.toLowerCase()).map(([i,e])=>({layer:e.name,receipt:e.receipt||"AI decided",typicality:e.prev.find(x=>x[0]===e.mine)?.[1]||null}))}))},null,2);label="figma-push.json (variables + frames with receipts on layers)"}
  if(kind==="gaps"){const gaps=Object.entries(EL).flatMap(([id,e])=>(e.gaps||[]).map(g=>`- ${g}  (${e.name})`));text=`# Follow-up interview guide · ${S.project}\n\nOpen gaps:\n${gaps.join("\n")}\n\nRejected AI assumptions:\n${S.assume.filter(a=>a.rej).map(a=>"- "+a.label).join("\n")}\n\nDivergent themes to resolve:\n${S.themes.filter(t=>t.mode==="divergent").map(t=>"- "+t.name+": "+t.cards.map(c=>c.text).join("; ")).join("\n")}`;label="interview-guide.md"}
  if(kind==="receipts"){text=`# Receipts · ${S.project}\n\n`+Object.entries(EL).map(([id,e])=>`## ${e.pin}. ${e.name}${elState(id).hidden?" (removed)":""}\n${e.receipt||"_AI decided — no research_"}\nTypicality: ${e.prev.map(p=>`${p[0]} ${p[1]}%`).join(", ")} · yours: ${e.mine}`).join("\n\n")+`\n\n## Versions\n`+S.history.map(l=>`- ${new Date(l.t).toLocaleTimeString()} ${l.what}`).join("\n");label="receipts.md"}
  if(kind==="credits"){const c=typeof photoCredits==="function"?photoCredits():[];text=`# Photo credits \u00b7 ${S.project}\n\n`+(c.length?c.map(p=>`- **${p.alt||p.q}** \u2014 ${p.creator}, ${p.license}\n  ${p.source}`).join("\n"):"_No stock photographs in this site yet._");label="photo-credits.md"}
  if(kind==="reset"){localStorage.removeItem("of-m3-v2");S=SEED();renderAll();toast("Reset");return}
  dialog(`<span class="headline-s">${esc(label)}</span><div class="field"><textarea rows="14" readonly style="font-family:var(--mono);font-size:12px">${esc(text)}</textarea></div><div class="note">Downloads are blocked inside the viewer; copy and paste into a file, Figma's variable import, or your repo. “Push to Figma” would send this payload through the plugin.</div>`,[["Close","text",()=>{}],["Copy","filled",async()=>{try{await navigator.clipboard.writeText(text);toast("Copied")}catch{toast("Select the text and copy")}}]])}
$("#themeBtn").onclick=()=>{const cur=document.documentElement.getAttribute("data-theme");const dark=cur?cur==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.setAttribute("data-theme",dark?"light":"dark");$("#themeBtn .ms").textContent=dark?"dark_mode":"light_mode"};
function select(s){S.sel=s;save()}
function clearSel(){if(!S.sel)return;S.sel=null;save();const v=S.view;if(v==="research"){renderResearch()}else if(v==="inspiration")renderInspiration();else if(v==="system")renderSystem();else if(v==="review")renderReview()}
const ITEM_SEL="[data-tr],[data-c],[data-src],[data-tile],[data-tok],.el,.pop,button,a,input,textarea,select,label,[role=button],.snip,.tshot,.sheet .pick,.dialog,.menu,#rail-trending,#rail-reference,#rail-system,#rail-review,#rail-research";
document.addEventListener("click",e=>{if(!e.target.closest("main")||e.target.closest(ITEM_SEL))return;if(e.target.closest(".pane.center,.stage,#trendBody,#v-trending .pane"))clearSel()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!document.querySelector(".dialog"))clearSel()});
function go(v){S.view=v;$$(".view").forEach(x=>x.classList.toggle("on",x.id==="v-"+v));$$(".navrail .dest").forEach(b=>b.classList.toggle("on",b.dataset.v===v));save();renderAll();try{if(location.hash.replace("#","")!==v)history.replaceState(null,"","#"+v)}catch{}}
$$(".navrail .dest").forEach(b=>b.onclick=()=>go(b.dataset.v));
function renderAll(){if(typeof setProjChip==="function")setProjChip();else $("#projChip").innerHTML=`<span class="ms" style="font-size:16px">restaurant</span>${esc(S.project)}`;if(["trending","reference"].includes(S.view))S.view="inspiration";renderResearch();renderInspiration();if(S.view==="system")renderSystem();if(S.view==="review")renderReview()}
window.addEventListener("hashchange",()=>{const h=location.hash.replace("#","");if(["research","inspiration","system","review"].includes(h)&&h!==S.view)go(h)});
document.querySelector("main").addEventListener("scroll",e=>$("#appbar").classList.toggle("scrolled",e.target.scrollTop>4),true);
(function icons(){try{document.fonts.load('20px "Material Symbols Outlined"').then(fs=>{if(fs.length)document.documentElement.classList.add("icons")}).catch(()=>{})}catch{}})();
(function boot(){const h=location.hash.replace("#","");if(["research","inspiration","system","review"].includes(h))S.view=h;$$(".view").forEach(x=>x.classList.toggle("on",x.id==="v-"+S.view));$$(".navrail .dest").forEach(b=>b.classList.toggle("on",b.dataset.v===S.view));renderAll()})();
