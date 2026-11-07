/* State (seed data, persistence helpers), research page, AI context. */
/* ============================ STATE ============================ */
const SEED=()=>({
  project:"Mali's Table",view:"research",
  sources:[
    {id:"s1",name:"interview_mali.pdf",kind:"interview",star:true,text:"Mali grew up in Chiang Mai. 'This is their version of Thai food, not Thailand.' 'The kind of food you would eat together at home.' 'I don't want to put an elephant in the logo.' Signature dishes: khao soi, som tam. Mentions mortar and pestle, herbs from the garden, homemade ceramics from her mother."},
    {id:"s2",name:"interview_pim.pdf",kind:"interview",star:false,text:"Pim (daughter): the place should feel warm, energetic, casual, very human. Customers are regulars and families. Spice levels are a frequent question. Pim thinks the site should feel 'modern'; Mali wants it to feel 'like home'."},
    {id:"s3",name:"survey_results.csv",kind:"survey",star:true,text:"n=47. First thing you look at on a restaurant site: photos 81%, menu 14%, story 3%. Want to read the family story: yes 47%, maybe 38%, no 15%. Order online? yes 62%."},
    {id:"s4",name:"kitchen_photos/ (6)",kind:"photos",star:false,text:"Overhead table with five dishes; Mali's hands pounding som tam; a shelf of glazed ceramic bowls; the old menu board; herbs on a board; the front door."},
    {id:"s5",name:"malis_affinity (FigJam)",kind:"figjam",star:false,text:"Themes: Food first · Shared table · Avoid · Memory objects · Modern vs home."}
  ],
  sort:"star",
  themes:[
    {id:"t1",name:"Food first",cards:[
      {id:"c1",text:"Photos beat story: 81% look at photos first, 3% at the story.",quote:"survey_results.csv · n=47",quotes:["“I always scroll the pictures first, then decide.” — survey respondent #12", "“If the food looks good I don’t need the story.” — survey respondent #31", "81% of 47 respondents look at photos first; 3% at the story"],src:"s3",conf:"high"},
      {id:"c2",text:"Signature dishes are khao soi and som tam, not Pad Thai.",quote:"“their version of Thai food” — Mali",quotes:["“This is our version of Thai food, from where I grew up.” — Mali", "“People ask for Pad Thai, but khao soi is what we’re proud of.” — Pim"],src:"s1",conf:"high"}]},
    {id:"t2",name:"Shared table",cards:[
      {id:"c3",text:"Several dishes on one table, eaten together.",quote:"“the kind of food you would eat together at home” — Mali",quotes:["“The kind of food you would eat together at home.” — Mali", "“We order four or five things and share everything.” — regular customer"],src:"s1",conf:"high"},
      {id:"c4",text:"Warm, energetic, casual, very human.",quote:"Pim",quotes:["“It should feel warm, a bit loud, like the dining room on a Friday.” — Pim"],src:"s2",conf:"medium"}]},
    {id:"t3",name:"Avoid",cards:[
      {id:"c5",text:"No elephants, gold patterns, temple imagery.",quote:"“I don't want to put an elephant in the logo” — Mali",quotes:["“I don’t want to put an elephant in the logo.” — Mali", "“No gold, no temples. That’s not us.” — Mali"],src:"s1",conf:"hard"}]},
    {id:"t4",name:"Memory objects",cards:[
      {id:"c7",text:"Mortar & pestle, garden herbs, homemade ceramics.",quote:"interview_mali.pdf · kitchen_photos",quotes:["“My mother’s mortar is still in the kitchen.” — Mali", "Kitchen photos: herb planters, hand-thrown plates"],src:"s1",conf:"medium"},
      {id:"c8",text:"Hometown Chiang Mai → northern dishes.",quote:"interview_mali.pdf p.1",quotes:["“I’m from Chiang Mai, so the menu leans north.” — Mali"],src:"s1",conf:"high"}]},
    {id:"t5",name:"Modern vs. home",cards:[
      {id:"c9",text:"Pim wants “modern”; Mali wants “like home”. Not yet reconciled.",quote:"interview_pim.pdf · interview_mali.pdf",quotes:["“I want it to feel modern, not like an old menu.” — Pim", "“It should feel like home.” — Mali"],src:"s2",conf:"low"}]}
  ],
  assume:[
    {id:"a1",label:"Brand name and tagline follow category clichés",from:"common in AI-generated restaurant sites",rej:true},
    {id:"a2",label:"Cultural identity shown through national symbols and stereotypes",from:"common default; not how the owners describe themselves",rej:true},
    {id:"a3",label:"Hero features the cuisine's best-known dish, not the owners' own",from:"category default",rej:true},
    {id:"a4",label:"Decorative patterns and textures borrowed from a generic “homey” style",from:"stock “home cooking” cue",rej:true},
    {id:"a5",label:"Story told as generic “authentic family recipes” copy",from:"common AI copy pattern",rej:true},
    {id:"a6",label:"Palette taken from stereotypical cuisine colors",from:"category default",rej:false},
    {id:"a7",label:"Warm, casual tone of voice",from:"consistent with the interviews",rej:false}
  ],
  principles:[
    {id:"p1",text:"Menu and photos lead; story in small pieces.",hard:false},
    {id:"p2",text:"Feels like Mali's family, not “Thailand”.",hard:false},
    {id:"p3",text:"Never elephants, gold, temples, lotus.",hard:true}
  ],
  locked:false,
  tiles:[
    {id:"r1",type:"site",kind:"packet",title:"Mali's kitchen — mortar & pestle, worn bowls",borrow:"overhead angle, glaze colors",why:"the real family; weight highest",imgk:"hands"},
    {id:"r2",type:"site",kind:"packet",title:"Family dinner, five dishes on one table",borrow:"composition: several dishes, one table",why:"c3 “eat together”",imgk:"overhead"},
    {id:"r3",type:"vibe",kind:"packet",title:"“warm, energetic, casual, very human” — Pim",borrow:"tone of voice",why:"interview_pim",ph:"text"},
    {id:"r4",type:"palette",kind:"yours",title:"Glaze palette from Mali's bowls",borrow:"ground, accent, heat",why:"pulled from r1",colors:["#F2EFE9","#4F6F8F","#8FAFA3","#B5533C","#1F1F1F"]},
    {id:"r5",type:"type",kind:"yours",title:"Old menu board, Mali's mother's stall",borrow:"lettering for one display line",why:"uploaded",imgk:"board"},
    {id:"r6",type:"site",kind:"yours",title:"Celadon glaze, northern Thai pottery",borrow:"palette + one repeat pattern",why:"c8 Chiang Mai",imgk:"celadon"},
    {id:"r9",type:"type",kind:"yours",title:"Soft humanist serif sample",borrow:"display face direction",why:"c4 “very human”",ph:"typeS"},
    {id:"r8",type:"palette",kind:"yours",title:"Turmeric & chili (the common one)",borrow:"nothing — kept as a comparison",why:"assumption a6; 78% of AI sites",colors:["#F4C430","#C8372D","#2B2B2B","#FFFFFF"]}
  ],
  refFilter:"all",
  baseSystem:"custom",
  tokens:null,sysSection:"base",sysBuilt:false,
  page:"home",device:"desk",overlays:{receipts:true,prev:true,gaps:false},
  elements:{},history:[],log:[],sel:null,trend:"similar"
});
let S=load()||SEED();
function load(){try{const j=localStorage.getItem("traceform-v1");return j?JSON.parse(j):null}catch{return null}}
function save(){try{const c={...S,tiles:S.tiles.map(t=>({...t,img:undefined})),history:S.history.slice(-30)};localStorage.setItem("traceform-v1",JSON.stringify(c))}catch{}}
const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
const uid=p=>p+Math.random().toString(36).slice(2,7);
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),2400)}
function snapshot(what){S.history.push({t:Date.now(),what,tokens:JSON.parse(JSON.stringify(S.tokens||seedTokens())),elements:JSON.parse(JSON.stringify(S.elements)),principles:JSON.parse(JSON.stringify(S.principles)),site:S.site?JSON.parse(JSON.stringify(S.site)):null,review:S.review?JSON.parse(JSON.stringify(S.review)):null});if(S.history.length>40)S.history.shift();S.log.push({t:Date.now(),what})}
function restore(i){const h=S.history[i];if(!h)return;S.tokens=JSON.parse(JSON.stringify(h.tokens));S.elements=JSON.parse(JSON.stringify(h.elements));if(h.site)S.site=JSON.parse(JSON.stringify(h.site));if("review" in h)S.review=h.review;S.history=S.history.slice(0,i+1);save();renderAll();toast("Restored: "+h.what)}
function avoidList(){const a=S.assume.filter(x=>x.rej).map(x=>x.label.replace(/^[^:]+:\s*/,"").replace(/[“”]/g,""));S.principles.filter(p=>p.hard).forEach(p=>a.push(p.text.replace(/^Never\s*/i,"").replace(/\.$/,"")));return a}
const AVOID_WORDS=["elephant","gold","temple","lotus","gingham","pad thai","mama"];
function conflicts(t){t=(t||"").toLowerCase();return AVOID_WORDS.filter(w=>t.includes(w))}
function hexToRgb(h){h=h.replace("#","");if(h.length===3)h=h.split("").map(c=>c+c).join("");const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]}
function lum(h){const[r,g,b]=hexToRgb(h).map(c=>{c/=255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b}
function ratio(a,b){try{const l1=lum(a),l2=lum(b);return(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)}catch{return 0}}
const r1=x=>Math.round(x*10)/10;
function shade(hex,amt){const[r,g,b]=hexToRgb(hex).map(c=>Math.max(0,Math.min(255,c+amt)));return"#"+[r,g,b].map(c=>c.toString(16).padStart(2,"0")).join("")}

/* ============================ TOKENS ============================ */
const FONTS={display:["Fraunces","Georgia","Roboto","Nunito Sans"],body:["Nunito Sans","Roboto","Georgia"]};
const BASES={
  custom:{name:"Custom (from research)",desc:"Drafted from your principles and shelf",sws:["#F2EFE9","#4F6F8F","#B5533C"],note:"Every token carries a why and a NOT."},
  m3:{name:"Material 3",desc:"Google · tonal palettes, type scale, shape",sws:["#6750A4","#EADDFF","#FEF7FF"],note:"Use for app-like surfaces; warm it with the research palette."},
  hig:{name:"Human Interface",desc:"Apple · system type, vibrancy, SF Symbols",sws:["#007AFF","#F2F2F7","#1C1C1E"],note:"Strong on platform conventions; neutral on brand."},
  carbon:{name:"Carbon",desc:"IBM · grid, tokens, data density",sws:["#0F62FE","#F4F4F4","#161616"],note:"Dense; better for dashboards than a restaurant."},
  polaris:{name:"Polaris",desc:"Shopify · commerce components",sws:["#008060","#F6F6F7","#202223"],note:"Good ordering flow; generic storefront look."},
  upload:{name:"Upload your own",desc:"tokens.json · Figma variables export",sws:["#999","#CCC","#EEE"],note:"Drop a tokens.json; keys are mapped to the sections."}
};
function seedTokens(){return[
  {sec:"color",k:"color.ground",type:"color",v:"#F2EFE9",why:"“not yelling”; photos carry color (c1, 81% photo-first)",not:"cream + gold; dark “night market”",prev:[["warm off-white",41],["dark charcoal",33],["pure white",22]],mine:"warm off-white"},
  {sec:"color",k:"color.accent",type:"color",v:"#4F6F8F",why:"shelf r1/r4: Mali's bowls, celadon glaze",not:"turmeric / chili (the 78% default, r8)",prev:[["turmeric / chili",78],["red / black",12],["blue / ceramic",7]],mine:"blue / ceramic"},
  {sec:"color",k:"color.heat",type:"color",v:"#B5533C",why:"heat scale only; spice is a frequent question (s2)",not:"buttons, headlines",prev:[["red for everything",64],["red for heat only",28]],mine:"red for heat only"},
  {sec:"color",k:"color.ink",type:"color",v:"#1F1F1F",why:"body text ≥ 4.5:1 on ground",not:"grey-on-white",prev:[["near-black",70],["grey",30]],mine:"near-black"},
  {sec:"type",k:"type.display",type:"font",v:"Fraunces",why:"“warm, casual, very human” (c4)",not:"a “Thai-style” display face",prev:[["classic serif",64],["soft humanist serif",27],["hand-lettered",6]],mine:"soft humanist serif"},
  {sec:"type",k:"type.body",type:"font",v:"Nunito Sans",why:"a11y: body ≥ 16px",not:"grey-on-white",prev:[["neutral sans",88],["serif body",12]],mine:"neutral sans"},
  {sec:"type",k:"type.scale",type:"text",v:"40 / 28 / 20 / 16 / 13",why:"four steps; headline ≥ 2.5× body",not:"nine-step scale nobody uses",prev:[["3–4 steps",55],["5+ steps",45]],mine:"3–4 steps"},
  {sec:"type",k:"type.accentLine",type:"text",v:"one hand-lettered line, max",why:"shelf r5: mother's menu board",not:"handwriting everywhere",prev:[["none",80],["one line",14],["everywhere",6]],mine:"one line"},
  {sec:"space",k:"space.scale",type:"text",v:"8 · 16 · 24 · 40 · 64",why:"“food on a table” — roomy",not:"dense ordering-app grid",prev:[["tight 4/8",58],["roomy 8/16+",42]],mine:"roomy 8/16+"},
  {sec:"space",k:"shape.radius",type:"text",v:"4 / 8 / 12",why:"ceramic edges are soft but not pill-shaped",not:"fully rounded 999px everywhere",prev:[["pill 999",61],["4–12 px",31],["square",8]],mine:"4–12 px"},
  {sec:"imagery",k:"imagery",type:"text",v:"overhead, several plates, hands in frame",why:"shelf r1–r2; c3 “eat together”",not:"single hero bowl; stock street food",prev:[["single centered bowl",71],["overhead several plates",34],["hands in frame",6]],mine:"hands in frame"},
  {sec:"imagery",k:"motif",type:"text",v:"glaze pattern · mortar line icon",why:"memory objects (c7)",not:"elephants, gold, temples, lotus",prev:[["lotus / elephant",52],["none",41],["object from the family",7]],mine:"object from the family"},
  {sec:"components",k:"comp.dishCard",type:"text",v:"photo · name · one-line story · heat pips",why:"c1 photos; 47% want story in small doses",not:"price-first card",prev:[["price-first card",72],["story card",19]],mine:"story card"},
  {sec:"components",k:"comp.cta",type:"text",v:"“See the menu” (tonal), “Order” secondary",why:"principle 1: menu leads",not:"“Order Now” centered",prev:[["“Order Now” centered",74],["“See the menu”",18]],mine:"“See the menu”"},
  {sec:"components",k:"comp.heat",type:"text",v:"three pips in color.heat",why:"spice is a frequent question (s2)",not:"chili emoji",prev:[["chili emoji",61],["pips",22],["none",17]],mine:"pips"}
]}
const SECTION_REASON={
  base:"The base is custom: a prebuilt system would give you consistency but not Mali's. Material 3 is offered as a reference for components and the a11y scale; the research decides color, type, imagery and voice.",
  color:"Ground is a warm off-white so the photos carry the color (c1: 81% look at photos first). Accent is the glaze blue from Mali's bowls (r1, r4), chosen over the turmeric/chili pair that 78% of AI restaurant sites use (r8). Heat red is reserved for the spice scale because spice is the most frequent customer question (s2).",
  type:"A soft humanist serif for display reads “warm, casual, very human” (c4) without the classic-serif look 64% of AI sites use. Body is a neutral sans at 16px+ for WCAG. One hand-lettered line, from the mother's menu board (r5), and no more.",
  space:"Roomy spacing because the table is the metaphor (c3); radii stay 4–12px like ceramic edges, not the pill shapes 61% of AI sites default to.",
  imagery:"Overhead, several plates, hands in frame: that is the only composition that shows “eating together” (c3). Motifs come from memory objects (c7); the avoid list rules out the lotus/elephant that 52% of AI sites reach for.",
  components:"Dish cards lead with the photo and a one-line story (c1, 47% want the story in small doses). The primary action is “See the menu”, not “Order Now”, because principle 1 says the menu leads."
};
function T(k){return(S.tokens||seedTokens()).find(t=>t.k===k)}
function tv(k){return T(k)?.v}
function setToken(k,v,why,not){if(!S.tokens)S.tokens=seedTokens();const t=S.tokens.find(x=>x.k===k);if(!t)return;snapshot(`token ${k} → ${v}`);t.v=v;if(why)t.why=why;if(not)t.not=not;t.edited=true;if(typeof mineLabel==="function")t.mine=mineLabel(t);save();renderSystem();if(S.view==="review")renderReview()}

/* ============================ AI ============================ */
let sample=null;
(async()=>{try{sample=await TraceformAI.connect()}catch{sample=null}
  const el=$("#aiState");if(sample){el.innerHTML='<span class="ai-dot live"></span>AI live';$("#aiNote").textContent="AI calls go through the provider configured on the server (or the viewer's Claude account inside Claude)."}else{el.innerHTML='<span class="ai-dot"></span>AI offline · connect a provider';$("#aiNote").textContent="Connect an AI provider (see README) to regenerate the design system with AI."}})();
const RULES=`You are the design assistant inside Traceform, a research-first design tool. Help the designer keep an AI-generated website grounded in research and distinct from generic AI output. Answer in 2-5 short sentences, plain language, no headings. Cite research (card id, quote, survey number, shelf tile) when justifying a choice. Never propose anything on the avoid list. When asked to change the selected thing, use the tools then say what changed in one sentence; when asked a question, answer without changing anything. Typicality percentages are estimates; say so if asked.`;
function ctxSummary(){const toks=(S.tokens||seedTokens()).map(t=>`${t.k}=${t.v} | why: ${t.why} | not: ${t.not}`).join("\n");const cards=S.themes.map(t=>`[${t.name}] `+t.cards.map(c=>`${c.id}: ${c.text} (${c.quote})`).join(" ; ")).join("\n");const princ=S.principles.map((p,i)=>`${i+1}. ${p.text}${p.hard?" (hard)":""}`).join("\n");const shelf=S.tiles.map(t=>`${t.id} [${t.type}/${t.kind}${t.flag?", flagged":""}] ${t.title} — borrow: ${t.borrow}`).join("\n");return`${typeof projectHeader==="function"?projectHeader():"PROJECT: "+S.project}\nPRINCIPLES:\n${princ}\nAVOID: ${avoidList().join("; ")}\nCARDS:\n${cards}\nSHELF:\n${shelf}\nTOKENS:\n${toks}\nELEMENT OVERRIDES: ${JSON.stringify(S.elements)}`}

/* ============================ RESEARCH ============================ */
function findCard(id){for(const t of S.themes){const c=t.cards.find(c=>c.id===id);if(c)return c}return null}
const KICON={interview:"record_voice_over",survey:"poll",photos:"photo_camera",figjam:"dashboard",notes:"description"};
function renderSources(){
  const list=[...S.sources].sort((a,b)=>S.sort==="star"?(b.star-a.star)||a.name.localeCompare(b.name):a.name.localeCompare(b.name));
  $("#srcList").innerHTML=list.map(s=>`<div class="list-item ${S.sel?.kind==="source"&&S.sel.id===s.id?"sel":""}" data-src="${s.id}" tabindex="0"><span class="ms">${KICON[s.kind]||"description"}</span><div class="t"><div>${esc(s.name)}</div><div class="s">${esc(s.kind)} · ${s.text.length} chars</div></div><button class="icon-btn" data-star="${s.id}" aria-label="Star" style="width:32px;height:32px"><span class="ms star ${s.star?"on":""}">star</span></button></div>`).join("");
  $("#srcCount").textContent=`${S.sources.length} artifacts · ${S.sources.filter(s=>s.star).length} starred (starred artifacts are weighted first when drafting)`;
  $$("[data-src]").forEach(el=>el.onclick=e=>{if(e.target.closest("[data-star]"))return;const same=S.sel?.kind==="source"&&S.sel.id===el.dataset.src;select(same?null:{kind:"source",id:el.dataset.src});renderSources();renderResearchAsk()});
  $$("[data-star]").forEach(b=>b.onclick=()=>{const s=S.sources.find(x=>x.id===b.dataset.star);s.star=!s.star;save();renderSources()});
  $$("[data-sort]").forEach(b=>{b.classList.toggle("on",b.dataset.sort===S.sort);b.onclick=()=>{S.sort=b.dataset.sort;save();renderSources()}});
}
function renderResearch(){
  renderSources();
  $("#themes").innerHTML=S.themes.map(t=>`<div class="theme" data-t="${t.id}">
    <div class="hd"><input class="inl" value="${esc(t.name)}" data-tn="${t.id}" aria-label="Theme name"><button class="x" data-dt="${t.id}" aria-label="Delete theme"><span class="ms" style="font-size:18px">close</span></button></div>
    ${t.cards.map(c=>{const qs=cardQuotes(c);return`<div class="ic ${S.sel?.kind==="card"&&S.sel.id===c.id?"sel":""}" data-c="${c.id}" tabindex="0" role="button" aria-label="Open insight: ${esc(c.text)}">
      <div class="body-m ictext">${esc(c.text)}</div>
      <div class="q">${qs.length?esc(qs[0]):"No quotes yet"}</div>
      ${qs.length>1?`<div class="label-s osv">+${qs.length-1} more quote${qs.length>2?"s":""}</div>`:""}</div>`}).join("")}
    <button class="btn text sm" data-ac="${t.id}"><span class="ms">add</span>Card</button></div>`).join("");
  $("#assume").innerHTML=S.assume.map(a=>`<div class="arow ${a.rej?"rej":""}"><button class="icon-btn" style="width:32px;height:32px;flex:none" data-a="${a.id}" aria-label="${a.rej?"Keep this assumption":"Reject this assumption"}" title="${a.rej?"Rejected — click to keep":"Kept — click to reject"}"><span class="ms ${a.rej?"bad-t":"ok-t"}">${a.rej?"block":"check_circle"}</span></button><div class="lbl"><input class="inl" value="${esc(a.label)}" data-al="${a.id}" aria-label="Assumption"><input class="inl body-s osv" value="${esc(a.from)}" data-af="${a.id}" aria-label="Why the AI assumes this"></div><button class="x" data-ad="${a.id}" aria-label="Delete assumption"><span class="ms" style="font-size:16px">close</span></button></div>`).join("")||'<div class="note">No assumptions yet. Add one, or ask below.</div>';
  if($("#principles"))$("#principles").innerHTML=S.principles.map((p,i)=>`<div class="princ ${p.hard?"hard":""}"><span class="n">${i+1}</span><textarea class="inl" data-pt="${p.id}" style="flex:1">${esc(p.text)}</textarea><button class="x" data-ph="${p.id}" title="Toggle hard constraint">${p.hard?"●":"○"}</button><button class="x" data-dp="${p.id}" aria-label="Delete"><span class="ms" style="font-size:16px">close</span></button></div>`).join("");
  
  $$("[data-tn]").forEach(i=>i.onchange=()=>{S.themes.find(t=>t.id===i.dataset.tn).name=i.value;save()});
  $$("[data-dt]").forEach(b=>b.onclick=()=>{S.themes=S.themes.filter(t=>t.id!==b.dataset.dt);save();renderResearch()});
  $$("[data-ct]").forEach(i=>i.onchange=()=>{findCard(i.dataset.ct).text=i.value;save();renderResearch()});
  $$("[data-cq]").forEach(i=>i.onchange=()=>{findCard(i.dataset.cq).quote=i.value;save()});
  $$("[data-dc]").forEach(b=>b.onclick=e=>{e.stopPropagation();S.themes.forEach(t=>t.cards=t.cards.filter(c=>c.id!==b.dataset.dc));save();renderResearch()});
  $$("[data-ac]").forEach(b=>b.onclick=()=>{const c={id:uid("c"),text:"New insight",quote:"",quotes:[],src:"",conf:"medium"};S.themes.find(t=>t.id===b.dataset.ac).cards.push(c);save();renderResearch();cardModal(c.id,true)});
  $$("#themes [data-c]").forEach(el=>{el.onclick=()=>cardModal(el.dataset.c);el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();cardModal(el.dataset.c)}}});
  $$("[data-pr]").forEach(b=>b.onclick=e=>{e.stopPropagation();const c=findCard(b.dataset.pr);S.principles.push({id:uid("p"),text:c.text,hard:c.conf==="hard"});save();renderResearch();toast("Added as principle")});
  $$(".ic").forEach(el=>el.addEventListener("click",e=>{if(e.target.closest("textarea,input,button"))return;select({kind:"card",id:el.dataset.c});renderResearch()}));
  $$("[data-a]").forEach(b=>b.onclick=()=>{const a=S.assume.find(x=>x.id===b.dataset.a);a.rej=!a.rej;save();renderResearch();renderReference()});
  $$("[data-al]").forEach(i=>i.onchange=()=>{S.assume.find(x=>x.id===i.dataset.al).label=i.value;save()});
  $$("[data-af]").forEach(i=>i.onchange=()=>{S.assume.find(x=>x.id===i.dataset.af).from=i.value;save()});
  $$("[data-ad]").forEach(b=>b.onclick=()=>{S.assume=S.assume.filter(x=>x.id!==b.dataset.ad);save();renderResearch()});
  renderResearchAsk();
  $$("[data-pt]").forEach(i=>i.onchange=()=>{S.principles.find(p=>p.id===i.dataset.pt).text=i.value;save()});
  $$("[data-ph]").forEach(b=>b.onclick=()=>{const p=S.principles.find(p=>p.id===b.dataset.ph);p.hard=!p.hard;save();renderResearch()});
  $$("[data-dp]").forEach(b=>b.onclick=()=>{S.principles=S.principles.filter(p=>p.id!==b.dataset.dp);save();renderResearch()});
}
/* research prompting */
let rTurns=[],rBusy=false;
function renderResearchAsk(){const n=$("#rNote");if(!n)return;n.textContent=sample?"Traceform adds it to your artifacts, then turns it into insight cards and assumptions where it can.":"Traceform adds it to your artifacts as context notes. Connect an AI provider to also turn it into cards and assumptions.";
  $("#rOut").innerHTML=rTurns.map(t=>`<div class="msg ${t.role==="user"?"me":""}">${esc(t.content)}</div>`).join("");}
$("#rIn").onkeydown=e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey)){e.preventDefault();$("#rForm").requestSubmit()}};
$("#rForm").onsubmit=async e=>{e.preventDefault();if(rBusy)return;const q=$("#rIn").value.trim();if(!q)return;$("#rIn").value="";
  let cn=S.sources.find(x=>x.name==="context_notes.md");if(!cn){cn={id:uid("s"),name:"context_notes.md",kind:"notes",star:true,text:""};S.sources.push(cn)}cn.text=(cn.text?cn.text+"\n\n":"")+`[${new Date().toLocaleDateString()}] ${q}`;save();renderSources();rTurns.push({role:"user",content:q});const out=$("#rOut");out.insertAdjacentHTML("beforeend",`<div class="msg me">${esc(q)}</div><div class="msg" id="rPending">Thinking…</div>`);out.scrollTop=out.scrollHeight;rBusy=true;
  try{let text;
    if(sample){const scope="The designer just added this context to the project. Add insight cards and assumptions it supports, then reply in one or two sentences saying what you added. Do not add anything the context doesn't support.";
      const src=S.sources.map(x=>`### ${x.name}${x.star?" (starred)":""}\n${x.text}`).join("\n\n").slice(0,24000);
      const tools=[
        {name:"add_insight_card",description:"Add an insight card to a theme (by name; created if new).",inputSchema:{type:"object",properties:{theme:{type:"string"},text:{type:"string"},quote:{type:"string"},conf:{type:"string",enum:["high","medium","low"]}},required:["theme","text"]},execute:({theme,text,quote,conf})=>{let th=S.themes.find(x=>x.name.toLowerCase()===String(theme).toLowerCase());if(!th){th={id:uid("t"),name:String(theme),cards:[]};S.themes.push(th)}th.cards.push({id:uid("c"),text:String(text),quote:String(quote||"AI-suggested · verify"),src:"",conf:String(conf||"low")});save();renderResearch();return{ok:true}}},
        {name:"add_assumption",description:"Add an assumption the AI would make by default for this project, and why.",inputSchema:{type:"object",properties:{label:{type:"string"},why:{type:"string"},reject:{type:"boolean"}},required:["label"]},execute:({label,why,reject})=>{S.assume.push({id:uid("a"),label:String(label),from:String(why||"AI default"),rej:!!reject});save();renderResearch();return{ok:true}}},
        {name:"add_principle",description:"Add a design principle; hard=true for a never/always rule.",inputSchema:{type:"object",properties:{text:{type:"string"},hard:{type:"boolean"}},required:["text"]},execute:({text,hard})=>{S.principles.push({id:uid("p"),text:String(text),hard:!!hard});save();renderResearch();return{ok:true}}}];
      const lim=await sample.limits().catch(()=>null);const opts={cache:false,modelTier:"default",onText:({text})=>{const p=$("#rPending");if(p)p.textContent=text}};if(lim?.tools)opts.tools=tools;
      const r=await sample([{role:"user",content:`${RULES}\n\nCONTEXT:\n${ctxSummary()}\n\nPROJECT BRIEF: ${S.brief||"(none)"}\n\nRESEARCH ARTIFACTS:\n${src}\n\nSCOPE: ${scope}`},...rTurns.slice(-10)],opts);text=r.text}
    else text=offlineResearch(q);
    rTurns.push({role:"assistant",content:text});const p=$("#rPending");if(p){p.id="";p.textContent=text}}
  catch(err){const p=$("#rPending");if(p){p.id="";p.classList.add("sys");p.textContent=err.text||({not_granted:"Claude isn't allowed for this page, or the AI provider rejected the request.",rate_limited:"Too many requests; try again in a minute."}[err.code]||"Couldn't reach the AI ("+(err.code||"error")+").")}}
  rBusy=false;out.scrollTop=out.scrollHeight};
function describeSel(){if(S.sel?.kind==="card"){const c=findCard(S.sel.id);return`insight card ${c.id}: "${c.text}" (${c.quote}), confidence ${c.conf}`}const x=S.sources.find(s=>s.id===S.sel.id);return`artifact ${x.name}: ${x.text.slice(0,1500)}`}
function offlineResearch(q){const t=q.trim();let m;
  if(m=t.match(/^add (?:a )?card:?\s*(.+)/i)){(S.themes[0]||(S.themes.push({id:uid("t"),name:"Unsorted",cards:[]}),S.themes[0])).cards.push({id:uid("c"),text:m[1],quote:"added by you · attach a source",src:"",conf:"low"});save();renderResearch();return`Added a card to “${S.themes[0].name}”. Attach a source to raise its confidence.`}
  if(m=t.match(/^assume:?\s*(.+)/i)){S.assume.push({id:uid("a"),label:m[1],from:"added by you",rej:false});save();renderResearch();return"Added to the assumptions panel."}
  if(m=t.match(/^principle:?\s*(.+)/i)){S.principles.push({id:uid("p"),text:m[1],hard:/^(never|always|no )/i.test(m[1])});save();renderResearch();return"Added a principle."}
  if(false)return`${S.themes.length} themes: `+S.themes.map(x=>`${x.name} (${x.cards.length} cards, ${x.mode})`).join("; ")+".";
  if(false){const k=S.assume.filter(a=>!a.rej);return k.length?`Still kept: ${k.map(a=>a.label).join("; ")}. Check each against an artifact before keeping it.`:"Every assumption has been rejected."}
  return"Added to context_notes.md in your artifacts. Connect an AI provider (see README) to turn it into cards and assumptions automatically."}
$("#addTheme").onclick=()=>{S.themes.push({id:uid("t"),name:"New theme",cards:[]});save();renderResearch()};
$("#addAssume").onclick=()=>{S.assume.push({id:uid("a"),label:"New assumption",from:"AI default",rej:false});save();renderResearch()};
if($("#princForm"))$("#princForm").onsubmit=e=>{e.preventDefault();const v=$("#princInput").value.trim();if(!v)return;S.principles.push({id:uid("p"),text:v,hard:/never|no /i.test(v)});$("#princInput").value="";save();renderResearch()};
$("#lockBtn").onclick=()=>{S.locked=true;snapshot("research locked");save();go("inspiration");toast(`Research saved · avoid-list: ${avoidList().length} items`)};
$("#pickSrc").onclick=()=>$("#srcFile").click();
$("#srcFile").onchange=e=>addSourceFiles(e.target.files);
function addSourceFiles(files){[...files].forEach(f=>{const rd=new FileReader();rd.onload=()=>{S.sources.push({id:uid("s"),name:f.name,kind:/csv/i.test(f.name)?"survey":"notes",star:false,text:String(rd.result).slice(0,20000)});save();renderSources();toast(`Added ${f.name}`)};rd.readAsText(f)})}
function dragDrop(el,fn){el.addEventListener("dragover",e=>{e.preventDefault();el.classList.add("over")});el.addEventListener("dragleave",()=>el.classList.remove("over"));el.addEventListener("drop",e=>{e.preventDefault();el.classList.remove("over");fn(e.dataTransfer.files)})}
dragDrop($("#dropSrc"),addSourceFiles);
$("#pasteSrc").onclick=()=>dialog(`<span class="headline-s">Paste research text</span><div class="field"><textarea id="pasteTA" rows="8" placeholder="Interview notes, a transcript, survey answers…"></textarea></div>`,[["Cancel","text",()=>{}],["Add artifact","filled",()=>{const v=$("#pasteTA").value.trim();if(v){S.sources.push({id:uid("s"),name:"pasted_notes.txt",kind:"notes",star:false,text:v.slice(0,20000)});save();renderSources()}}]]);
const FIGJAM_BOARDS=[{name:"malis_affinity",stickies:23,themes:["Food first","Shared table","Avoid","Memory objects","Modern vs home"]},{name:"Prebuilt · Restaurant discovery (template)",stickies:31,themes:["Why people choose","What they fear","Ordering friction","Trust signals"]},{name:"Prebuilt · Small-business brand (template)",stickies:18,themes:["Owner's story","Customer language","Competitor tropes","Non-negotiables"]}];
$("#figjamBtn").onclick=()=>dialog(`<span class="headline-s">Import from FigJam</span><div class="note">Connect reads your FigJam boards. Prebuilt affinity maps are templates you can start from; their stickies become cards marked “low confidence” until you attach a source.</div><div class="col" id="fjList">${FIGJAM_BOARDS.map((b,i)=>`<label class="list-item" style="cursor:pointer"><input type="radio" name="fj" value="${i}" ${i===0?"checked":""}><span class="ms">dashboard</span><div class="t"><div>${esc(b.name)}</div><div class="s">${b.stickies} stickies · ${b.themes.join(" · ")}</div></div></label>`).join("")}</div>`,[["Cancel","text",()=>{}],["Import themes","filled",()=>{const i=+($("input[name=fj]:checked")?.value||0);const b=FIGJAM_BOARDS[i];b.themes.forEach(n=>{if(!S.themes.some(t=>t.name===n))S.themes.push({id:uid("t"),name:n,cards:[{id:uid("c"),text:`Sticky from “${b.name}”: ${n} — attach a source`,quote:"FigJam import · unsourced",src:"",conf:"low"}]})});if(!S.sources.some(s=>s.name.startsWith(b.name)))S.sources.push({id:uid("s"),name:b.name+" (FigJam)",kind:"figjam",star:false,text:"Themes: "+b.themes.join(" · ")});save();renderResearch();toast(`Imported ${b.themes.length} themes from FigJam`)}]]);

/* ============================ REFERENCE ============================ */
const PH={typeS:"#f1ede4",ceramic:"linear-gradient(135deg,#6b7f8f,#3e5a6e 60%,#2b3f4d)",table:"radial-gradient(circle at 30% 40%,#c99a63 0 14%,transparent 15%),radial-gradient(circle at 65% 60%,#8a4a3a 0 16%,transparent 17%),radial-gradient(circle at 70% 25%,#6d8a4a 0 11%,transparent 12%),#e9e2d6",text:"#ece9e2",board:"linear-gradient(#2b2b2b,#1f1f1f)",glaze:"radial-gradient(circle at 40% 40%,#9fc3b5,#5f8f82 50%,#3e6b60)",gold:"repeating-linear-gradient(45deg,#c9a227 0 6px,#8c6d12 6px 12px)",ai:"linear-gradient(135deg,#d9d6cf,#bfbbb2)"};
function tileFlag(t){return false}
function renderReference(){
  const f=S.refFilter;const list=S.tiles.filter(t=>f==="all"||t.type===f);
  $("#tiles").innerHTML=list.map(t=>{const fl=tileFlag(t);return`<div class="tile ${fl?"flag":""} ${S.sel?.kind==="tile"&&S.sel.id===t.id?"sel":""}" data-tile="${t.id}" tabindex="0" style="position:relative"><button class="btn tonal sm rm" data-rmtile="${t.id}" aria-label="Remove ${esc(t.title)}"><span class="ms">delete</span>Remove</button>
    <div class="img" style="${t.img||t.imgk||t.colors?"":"background:"+(PH[t.ph]||PH.ai)}">${t.img||t.imgk?`<img src="${t.img||IMG[t.imgk]}" alt="${esc(t.title)}">`:t.colors?`<div class="pal">${t.colors.map(c=>`<i style="background:${esc(c)}"></i>`).join("")}</div>`:t.ph==="text"?`<span class="mono" style="padding:10px">${esc(t.title)}</span>`:t.ph==="board"?`<span style="font-family:Fraunces,serif;font-style:italic;color:#eee;font-size:16px">khao soi · som tam · greens</span>`:t.ph==="typeS"?`<span style="font-family:Fraunces,Georgia,serif;font-size:26px;color:#222">Mali's Table</span>`:""}</div>
    <div class="cap"><div class="row"><span class="badge ${t.type==="palette"?"p":t.type==="vibe"?"t":""}">${t.type}</span><span class="badge">${t.kind==="packet"?"from research":"uploaded"}</span>${fl?'<span class="badge e">flagged</span>':""}<span class="spacer"></span><button class="x" data-dtile="${t.id}" aria-label="Remove"><span class="ms" style="font-size:16px">close</span></button></div>
      <input class="inl" value="${esc(t.title)}" data-tt="${t.id}" aria-label="Title" style="font-weight:500">
      <div class="body-s"><span class="osv">Borrow:</span> <input class="inl" style="display:inline;width:auto;max-width:72%" value="${esc(t.borrow)}" data-tb="${t.id}" aria-label="Borrow"></div>
      <div class="body-s osv">Why: ${esc(t.why)}</div></div></div>`}).join("")+`<div class="tile add" id="addTile"><span class="ms" style="font-size:28px">add_photo_alternate</span><span>Add reference</span></div>`;
  $$("[data-tile]").forEach(el=>el.addEventListener("click",e=>{if(e.target.closest("input,button"))return;select({kind:"tile",id:el.dataset.tile});renderReference()}));
  $$("[data-dtile],[data-rmtile]").forEach(b=>b.onclick=e=>{e.stopPropagation();removeTile(b.dataset.dtile||b.dataset.rmtile)});
  $$("[data-tt]").forEach(i=>i.onchange=()=>{S.tiles.find(t=>t.id===i.dataset.tt).title=i.value;save();renderReference()});
  $$("[data-tb]").forEach(i=>i.onchange=()=>{S.tiles.find(t=>t.id===i.dataset.tb).borrow=i.value;save();renderReference()});
  $("#addTile").onclick=()=>$("#refFile").click();
  const n=k=>S.tiles.filter(t=>t.type===k).length;$("#shelfSum").innerHTML=`<div class="body-m">${S.tiles.length} references · ${n("palette")} palettes · ${n("type")} type · ${n("vibe")} vibes · ${n("site")} designs</div><div class="col" style="margin-top:8px;gap:0">${S.tiles.map(t=>`<div class="shelfrow">${t.colors?`<span class="sw4" style="background:linear-gradient(90deg,${t.colors.join(",")})"></span>`:t.img||t.imgk?`<img src="${t.img||IMG[t.imgk]}" alt="">`:`<span class="sw4" style="background:var(--surface-container-highest)"></span>`}<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.title)}</span><button class="x" data-rmtile="${t.id}" aria-label="Remove ${esc(t.title)}"><span class="ms" style="font-size:18px">delete</span></button></div>`).join("")||'<div class="note">The shelf is empty. Add references from Trending or upload them here.</div>'}</div>${S.tiles.length?`<button class="btn text sm" id="clearShelf" style="margin-top:6px"><span class="ms">delete_sweep</span>Remove all</button>`:""}`;
  $$("#shelfSum [data-rmtile]").forEach(b=>b.onclick=()=>removeTile(b.dataset.rmtile));
  $("#clearShelf")&&($("#clearShelf").onclick=()=>dialog(`<span class="headline-s">Remove all ${S.tiles.length} references?</span><div class="body-m">The design system won't draw on them anymore. This can't be undone.</div>`,[["Cancel","text",()=>{}],["Remove all","filled",()=>{snapshot("cleared shelf");S.tiles=[];save();renderReference();toast("Shelf cleared")}]]));
  $$("#refFilters [data-f]").forEach(b=>{b.classList.toggle("on",b.dataset.f===f);b.onclick=()=>{S.refFilter=b.dataset.f;renderReference()}});
}
$("#pickRef").onclick=()=>$("#refFile").click();$("#refFile").onchange=e=>addRefFiles(e.target.files);dragDrop($("#dropRef"),addRefFiles);
let lastRemoved=null;
function removeTile(id){const i=S.tiles.findIndex(t=>t.id===id);if(i<0)return;lastRemoved={tile:S.tiles[i],i};S.tiles.splice(i,1);if(S.sel?.id===id)S.sel=null;snapshot("removed reference");save();renderReference();if(typeof renderTrending==="function"&&S.view==="trending")renderTrending();undoToast(`Removed “${lastRemoved.tile.title.slice(0,40)}”`,()=>{if(!lastRemoved)return;S.tiles.splice(lastRemoved.i,0,lastRemoved.tile);lastRemoved=null;save();renderReference()})}
function undoToast(msg,fn){const t=$("#toast");t.innerHTML=`${esc(msg)} <button class="btn text sm" id="toastUndo" style="color:var(--inverse-on-surface);margin-left:8px;pointer-events:auto">Undo</button>`;t.style.pointerEvents="auto";t.classList.add("on");$("#toastUndo").onclick=()=>{fn();t.classList.remove("on");t.style.pointerEvents="none"};clearTimeout(toast.t);toast.t=setTimeout(()=>{t.classList.remove("on");t.style.pointerEvents="none"},5000)}
function addRefFiles(files){[...files].forEach(f=>{if(!f.type.startsWith("image/"))return;const rd=new FileReader();rd.onload=()=>{S.tiles.push({id:uid("r"),type:"site",kind:"yours",title:f.name.replace(/\.[^.]+$/,""),borrow:"(say what to borrow)",why:"uploaded",img:rd.result});save();renderReference();toast("Added (image kept for this session)")};rd.readAsDataURL(f)})}
$("#palForm").onsubmit=e=>{e.preventDefault();const cs=($("#palInput").value.match(/#[0-9a-f]{3,6}/gi)||[]);if(!cs.length){toast("Enter hex colors like #4F6F8F");return}S.tiles.push({id:uid("r"),type:"palette",kind:"yours",title:"Palette "+cs.join(" "),borrow:"colors",why:"uploaded scheme",colors:cs});$("#palInput").value="";save();renderReference()};
$("#quoteForm").onsubmit=e=>{e.preventDefault();const v=$("#quoteInput").value.trim();if(!v)return;S.tiles.push({id:uid("r"),type:"vibe",kind:"yours",title:v,borrow:"tone of voice",why:"vibe note",ph:"text"});$("#quoteInput").value="";save();renderReference()};
$("#buildSysBtn").onclick=()=>{if(!S.tokens)S.tokens=seedTokens();S.sysBuilt=true;snapshot("design system drafted");save();go("system");toast("Design system drafted from research + shelf")};

function cardQuotes(c){if(!Array.isArray(c.quotes))c.quotes=c.quote?[c.quote]:[];return c.quotes}
function cardModal(id,isNew){const c=findCard(id);if(!c)return;const th=S.themes.find(t=>t.cards.includes(c));let qs=[...cardQuotes(c)];
  const srcOpts='<option value="">No linked artifact</option>'+S.sources.map(s=>`<option value="${s.id}" ${s.id===c.src?"selected":""}>${esc(s.name)}</option>`).join("");
  const d=modalShell(`<div class="row" style="align-items:flex-start"><div style="flex:1"><div class="label-m osv">${esc(th?th.name:"Insight")}</div><span class="headline-s">${isNew?"New insight":"Insight"}</span></div><button class="icon-btn" data-cm-x aria-label="Close"><span class="ms">close</span></button></div>
    <div class="field"><label for="cmText">Insight</label><textarea id="cmText" rows="2">${esc(c.text)}</textarea></div>
    <div><div class="row" style="margin-bottom:6px"><span class="title-s">Quotes &amp; evidence</span><span class="spacer"></span><button class="btn text sm" id="cmAdd"><span class="ms">add</span>Add quote</button></div><div id="cmQuotes" class="col" style="gap:8px"></div></div>
    <div class="field"><label for="cmSrc">Linked artifact</label><select id="cmSrc">${srcOpts}</select></div>
    <div class="row"><button class="btn text" id="cmDel" style="color:var(--error)"><span class="ms">delete</span>Delete card</button><span class="spacer"></span><button class="btn text" id="cmCancel">Cancel</button><button class="btn filled" id="cmSave">Save</button></div>`);
  const draw=()=>{$("#cmQuotes",d).innerHTML=qs.map((q,i)=>`<div class="cmq"><span class="ms osv" style="font-size:18px;margin-top:8px">format_quote</span><textarea rows="2" data-qi="${i}" aria-label="Quote ${i+1}">${esc(q)}</textarea><button class="icon-btn" data-qx="${i}" aria-label="Remove quote ${i+1}"><span class="ms" style="font-size:18px">close</span></button></div>`).join("")||'<div class="note">No quotes yet. Add what participants actually said.</div>';
    $$("[data-qi]",d).forEach(t=>t.oninput=()=>qs[+t.dataset.qi]=t.value);$$("[data-qx]",d).forEach(b=>b.onclick=()=>{qs.splice(+b.dataset.qx,1);draw()})};
  draw();
  $("#cmAdd",d).onclick=()=>{qs.push("");draw();const all=$$("[data-qi]",d);all[all.length-1].focus()};
  const close=()=>d.remove();$("[data-cm-x]",d).onclick=close;$("#cmCancel",d).onclick=close;
  $("#cmSave",d).onclick=()=>{snapshot("Edit insight card");c.text=$("#cmText",d).value.trim()||c.text;c.quotes=qs.map(q=>q.trim()).filter(Boolean);c.quote=c.quotes[0]||"";c.src=$("#cmSrc",d).value;save();close();renderResearch();toast("Insight saved")};
  $("#cmDel",d).onclick=()=>{snapshot("Delete insight card");S.themes.forEach(t=>t.cards=t.cards.filter(x=>x.id!==c.id));save();close();renderResearch();toast("Card deleted")};
  setTimeout(()=>$("#cmText",d).focus(),0)}
