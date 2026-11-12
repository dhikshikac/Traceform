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
/* Research page: artifacts on the left, insight cards grouped by theme in the middle,
   assumptions and "add context" on the right.
   Every quote on a card is checked against the text of the uploaded artifacts (verifyQuote),
   so the designer can see which evidence is really in the research and which the AI
   paraphrased or made up. The check is plain string matching; it needs no AI. */
function findCard(id){for(const t of S.themes){const c=t.cards.find(c=>c.id===id);if(c)return c}return null}
const KICON={interview:"record_voice_over",survey:"poll",photos:"photo_camera",figjam:"dashboard",notes:"description"};
const KNAME={interview:"Interview",survey:"Survey",photos:"Photo notes",figjam:"Affinity map",notes:"Notes"};
const CONF_LABEL={high:"High",medium:"Medium",low:"Low",hard:"Rule"};
function guessKind(name,text){if(/\.csv$/i.test(name)||/survey|poll/i.test(name))return"survey";if(/interview|transcript|intercept/i.test(name)||/^\s*(Q|H|I|Interviewer)\s*:/m.test(text||""))return"interview";return"notes"}
function wordCount(t){return(String(t||"").match(/\S+/g)||[]).length}
function sourceOrder(){return[...S.sources].sort((a,b)=>(!!b.star-!!a.star)||a.name.localeCompare(b.name))}
/* free AI tiers sometimes return "busy" (503) for a moment; retry research calls twice before giving up */
async function aiRetry(fn,tries=3){for(let i=0;;i++){try{return await fn()}catch(e){if(i>=tries-1||!["provider_error","rate_limited","network"].includes(e.code))throw e;await new Promise(r=>setTimeout(r,2500*(i+1)))}}}
function cardQuotes(c){if(!Array.isArray(c.quotes))c.quotes=c.quote?[c.quote]:[];return c.quotes}

/* ---- quote verification ---- */
const normQ=s=>String(s||"").toLowerCase().replace(/[’‘`´]/g,"'").replace(/[^\p{L}\p{N}%]+/gu," ").trim();
/* the part of a quote that should appear in the source: the text inside quote marks,
   or the whole line minus a trailing "— who said it" */
function quoteParts(q){q=String(q||"").trim();const inQ=[...q.matchAll(/[“"]([^”"]{4,})[”"]/g)].map(m=>m[1]);
  if(inQ.length)return inQ;return[q.replace(/\s+(?:—|–|--?)\s+[^—–]{1,60}$/,"")]}
const _norm=new Map();
function srcNorm(s){const k=s.text||"";let v=_norm.get(k);if(v==null){v=" "+normQ(k)+" ";if(_norm.size>60)_norm.clear();_norm.set(k,v)}return v}
/* -> {st:"ok"|"close"|"missing"|"none", src} */
function verifyQuote(q,prefer){const parts=quoteParts(q).map(normQ).filter(p=>p.length>=6);if(!parts.length)return{st:"none"};
  const srcs=[...S.sources].sort((a,b)=>(b.id===prefer)-(a.id===prefer));
  for(const s of srcs){const t=srcNorm(s);if(parts.every(p=>t.includes(" "+p+" ")))return{st:"ok",src:s.id}}
  const ws=parts.join(" ").split(" ").filter(w=>w.length>2||/\d/.test(w));
  for(const s of srcs){const set=new Set(srcNorm(s).split(" "));const hit=ws.filter(w=>set.has(w)).length;
    if(ws.length>=3&&hit/ws.length>=.8&&ws.filter(w=>/\d/.test(w)).every(w=>set.has(w)))return{st:"close",src:s.id}}
  return{st:"missing"}}
function cardEvidence(c){const qs=cardQuotes(c);const r=qs.map(q=>verifyQuote(q,c.src));const n=st=>r.filter(x=>x.st===st).length;
  const ok=n("ok"),close=n("close"),miss=n("missing")+n("none");let e;
  if(!qs.length)e={tone:"bad",icon:"help",label:"No evidence",title:"No quotes yet. Open the card and add what participants said."};
  else if(miss)e={tone:"bad",icon:"error",label:`${miss} not in sources`,title:`${miss} of ${qs.length} quotes can't be found in your artifacts. Check them before relying on this card.`};
  else if(close)e={tone:"warn",icon:"change_history",label:"Paraphrased",title:"The words are in your artifacts, but not in this exact order."};
  else e={tone:"ok",icon:"check_circle",label:qs.length>1?`${ok} quotes found`:"Quote found",title:"Every quote appears word for word in your artifacts."};
  return{...e,qs,r,ok,close,miss,check:!qs.length||miss>0}}

/* ---- left: artifacts ---- */
function renderSources(){
  const cited=id=>S.themes.reduce((n,t)=>n+t.cards.filter(c=>c.src===id).length,0);
  $("#srcList").innerHTML=sourceOrder().map(s=>{const n=cited(s.id);return`<div class="list-item src" data-src="${s.id}" tabindex="0" role="button" aria-label="Open ${esc(s.name)}"><span class="ms">${KICON[s.kind]||"description"}</span><div class="t"><div class="nm">${esc(s.name)}</div><div class="s">${esc(KNAME[s.kind]||"Notes")} · ${wordCount(s.text).toLocaleString()} words${n?` · cited ${n}×`:""}</div></div><button class="icon-btn" data-star="${s.id}" aria-label="${s.star?"Unstar":"Star"} ${esc(s.name)}" title="${s.star?"Starred: read first":"Star to have the AI read it first"}" style="width:32px;height:32px"><span class="ms star ${s.star?"on":""}">star</span></button></div>`}).join("")||'<div class="note">No artifacts yet.</div>';
  $$("[data-src]").forEach(el=>{el.onclick=e=>{if(e.target.closest("[data-star]"))return;openSource(el.dataset.src)};el.onkeydown=e=>{if((e.key==="Enter"||e.key===" ")&&e.target===el){e.preventDefault();openSource(el.dataset.src)}}});
  $$("[data-star]").forEach(b=>b.onclick=()=>{const s=S.sources.find(x=>x.id===b.dataset.star);s.star=!s.star;save();renderSources()});
}
function addSource(name,text,kind){const s={id:uid("s"),name,kind:kind||guessKind(name,text),star:false,text:String(text).slice(0,20000)};S.sources.push(s);return s}
function afterSourcesAdded(n,label){save();renderResearch();toast(S.themes.length?`Added ${label}. Regenerate to include it in the insights.`:`Added ${label}. Generate to draft insights from it.`)}
function addSourceFiles(files){const fs=[...files].filter(f=>!/^image\//.test(f.type));if(!fs.length){toast("Upload text files: .txt, .md or .csv");return}
  let left=fs.length;fs.forEach(f=>{const rd=new FileReader();rd.onload=()=>{addSource(f.name,rd.result);if(--left===0)afterSourcesAdded(fs.length,fs.length===1?f.name:`${fs.length} files`)};rd.readAsText(f)})}
function highlightCited(s){const text=s.text||"";const ranges=[];
  S.themes.forEach(t=>t.cards.forEach(c=>cardQuotes(c).forEach(q=>{if(verifyQuote(q,c.src).src!==s.id)return;
    quoteParts(q).forEach(p=>{const ws=normQ(p).split(" ").filter(Boolean);if(ws.length<2)return;
      const re=new RegExp(ws.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/'/g,"[^\\p{L}\\p{N}%]*")).join("[^\\p{L}\\p{N}%]+"),"giu");let m;while((m=re.exec(text))){ranges.push([m.index,m.index+m[0].length]);if(!m[0].length)re.lastIndex++}})})));
  ranges.sort((a,b)=>a[0]-b[0]);const merged=[];ranges.forEach(r=>{const l=merged[merged.length-1];if(l&&r[0]<=l[1])l[1]=Math.max(l[1],r[1]);else merged.push([...r])});
  let out="",i=0;merged.forEach(([a,b])=>{out+=esc(text.slice(i,a))+`<mark>${esc(text.slice(a,b))}</mark>`;i=b});return{html:out+esc(text.slice(i)),n:merged.length}}
function openSource(id){const s=S.sources.find(x=>x.id===id);if(!s)return;
  const cards=[];S.themes.forEach(t=>t.cards.forEach(c=>{if(c.src===s.id||cardQuotes(c).some(q=>verifyQuote(q,c.src).src===s.id))cards.push(c)}));
  const hl=highlightCited(s);
  const d=modalShell(`<div class="row" style="align-items:flex-start;flex-wrap:nowrap"><span class="ms" style="font-size:28px;color:var(--primary);margin-top:2px">${KICON[s.kind]||"description"}</span><div style="flex:1;min-width:0"><input class="inl headline-s" id="svName" value="${esc(s.name)}" aria-label="Artifact name"><div class="body-s osv">${wordCount(s.text).toLocaleString()} words${hl.n?` · ${hl.n} passage${hl.n===1?"":"s"} cited by insights, highlighted below`:""}</div></div><button class="icon-btn" data-sv-x aria-label="Close"><span class="ms">close</span></button></div>
    <div class="row"><label class="body-s osv" for="svKind">Type</label><select id="svKind" class="chip sm">${Object.entries(KNAME).map(([k,n])=>`<option value="${k}" ${k===s.kind?"selected":""}>${n}</option>`).join("")}</select><button class="chip sm ${s.star?"on":""}" id="svStar"><span class="ms ${s.star?"fill":""}" style="font-size:16px">star</span>${s.star?"Starred":"Star"}</button></div>
    <div class="srcview" tabindex="0" aria-label="Artifact text">${hl.html||'<span class="osv">This artifact is empty.</span>'}</div>
    ${cards.length?`<div><div class="title-s" style="margin-bottom:6px">Insights that cite this artifact</div><div class="col" style="gap:4px">${cards.map(c=>`<button class="svcard" data-svc="${c.id}"><span class="conf ${esc(c.conf)}"></span><span>${esc(c.text)}</span></button>`).join("")}</div></div>`:'<div class="note">No insight cites this artifact yet.</div>'}
    <div class="row"><button class="btn text" id="svDel" style="color:var(--error)"><span class="ms">delete</span>Remove artifact</button><span class="spacer"></span><button class="btn filled" id="svDone">Done</button></div>`);
  const close=()=>{const v=$("#svName",d).value.trim();if(v&&v!==s.name){s.name=v;save()}d.remove();renderSources()};
  $("[data-sv-x]",d).onclick=close;$("#svDone",d).onclick=close;
  $("#svKind",d).onchange=e=>{s.kind=e.target.value;save()};
  $("#svStar",d).onclick=e=>{s.star=!s.star;save();const b=e.currentTarget;b.classList.toggle("on",s.star);b.innerHTML=`<span class="ms ${s.star?"fill":""}" style="font-size:16px">star</span>${s.star?"Starred":"Star"}`};
  $$("[data-svc]",d).forEach(b=>b.onclick=()=>{close();cardModal(b.dataset.svc)});
  $("#svDel",d).onclick=()=>{const i=S.sources.indexOf(s);const linked=[];S.themes.forEach(t=>t.cards.forEach(c=>{if(c.src===s.id){linked.push(c);c.src=""}}));S.sources.splice(i,1);save();d.remove();renderResearch();
    undoToast(`Removed ${s.name.slice(0,40)}`,()=>{S.sources.splice(i,0,s);linked.forEach(c=>c.src=s.id);save();renderResearch()})}}

/* ---- center: themes and insight cards ---- */
let rCheckOnly=false;
function cardHTML(c){const ev=cardEvidence(c);const s=S.sources.find(x=>x.id===c.src);
  return`<div class="ic ${ev.check?"check":""}" data-c="${c.id}" tabindex="0" role="button" aria-label="Open insight: ${esc(c.text)}">
    <div class="body-m ictext">${esc(c.text)}</div>
    ${ev.qs.length?`<div class="q">${esc(ev.qs[0])}</div>`:""}
    <div class="icmeta"><span class="conf ${esc(c.conf)}" title="Confidence: ${esc(c.conf)}">${CONF_LABEL[c.conf]||"Medium"}</span><span class="vst ${ev.tone}" title="${esc(ev.title)}"><span class="ms">${ev.icon}</span>${esc(ev.label)}</span>${s?`<span class="icsrc" title="${esc(s.name)}">${esc(s.name)}</span>`:""}</div></div>`}
/* repair research data saved by older versions (missing fields, quotes stored as objects) */
function normalizeResearch(){const str=v=>v==null?"":typeof v==="object"?String(v.text||v.quote||v.label||""):String(v);
  if(!Array.isArray(S.sources))S.sources=[];S.sources=S.sources.filter(Boolean);S.sources.forEach(s=>{s.id=s.id||uid("s");s.name=str(s.name)||"untitled";s.text=str(s.text);s.kind=KNAME[s.kind]?s.kind:"notes"});
  if(!Array.isArray(S.themes))S.themes=[];S.themes=S.themes.filter(Boolean);S.themes.forEach(t=>{t.id=t.id||uid("t");t.name=str(t.name);if(!Array.isArray(t.cards))t.cards=[];t.cards=t.cards.filter(Boolean);
    t.cards.forEach(c=>{c.id=c.id||uid("c");c.text=str(c.text);c.quotes=(Array.isArray(c.quotes)?c.quotes:c.quote?[c.quote]:[]).map(str).filter(Boolean);c.quote=c.quotes[0]||"";c.conf=CONF_LABEL[c.conf]?c.conf:"medium"})});
  if(!Array.isArray(S.assume))S.assume=[];S.assume=S.assume.filter(Boolean);S.assume.forEach(a=>{a.id=a.id||uid("a");a.label=str(a.label);a.from=str(a.from)})}
/* Rendering never throws: renderResearch runs during boot, before 60-projects.js wires the logo and
   project switching, so an error here would leave the whole app stuck on this page. */
function renderResearch(){try{renderResearchUnsafe()}catch(e){console.error("Research page render failed:",e);const th=$("#themes");if(th)th.innerHTML=`<div class="rempty"><span class="ms">error</span><div class="title-m">Couldn't show this project's research</div><div class="body-m osv">${esc(e.message||e)}. Your data is still saved. Try another project from the home page.</div></div>`}}
function renderResearchUnsafe(){
  normalizeResearch();
  renderSources();
  const all=S.themes.flatMap(t=>t.cards);const nCheck=all.map(cardEvidence).filter(e=>e.check).length;
  if(!nCheck)rCheckOnly=false;
  $("#rSum").innerHTML=all.length?`${nCheck?`<span class="spacer"></span><button class="chip sm ${rCheckOnly?"on":""}" id="rCheck"><span class="ms" style="font-size:16px">${rCheckOnly?"close":"error"}</span>${rCheckOnly?"Show all":`${nCheck} to check`}</button>`:""}`:"";
  $("#rCheck")&&($("#rCheck").onclick=()=>{rCheckOnly=!rCheckOnly;renderResearch()});
  $("#themes").innerHTML=S.themes.map(t=>{const cards=t.cards.filter(c=>!rCheckOnly||cardEvidence(c).check);if(rCheckOnly&&!cards.length)return"";
    return`<div class="theme" data-t="${t.id}">
    <div class="hd"><input class="inl" value="${esc(t.name)}" data-tn="${t.id}" aria-label="Theme name"><span class="tcount">${t.cards.length}</span><button class="x" data-dt="${t.id}" aria-label="Delete theme ${esc(t.name)}"><span class="ms" style="font-size:18px">close</span></button></div>
    ${cards.map(cardHTML).join("")}
    ${rCheckOnly?"":`<button class="btn text sm addc" data-ac="${t.id}"><span class="ms">add</span>Add insight</button>`}</div>`}).join("")||(S.sources.length?"":`<div class="rempty"><span class="ms">upload_file</span><div class="title-m">No research yet</div></div>`);
  $("#assume").innerHTML=S.assume.map(a=>`<div class="arow ${a.rej?"rej":""}"><button class="icon-btn" style="width:32px;height:32px;flex:none" data-a="${a.id}" aria-label="${a.rej?"Keep this assumption":"Reject this assumption"}" title="${a.rej?"Rejected. Click to keep it.":"Kept. Click to reject it."}"><span class="ms ${a.rej?"bad-t":"ok-t"}">${a.rej?"block":"check_circle"}</span></button><div class="lbl"><textarea class="inl" rows="1" data-al="${a.id}" aria-label="Assumption">${esc(a.label)}</textarea><textarea class="inl body-s osv" rows="1" data-af="${a.id}" aria-label="Why the AI assumes this">${esc(a.from)}</textarea></div><button class="x" data-ad="${a.id}" aria-label="Delete assumption"><span class="ms" style="font-size:16px">close</span></button></div>`).join("")||'<div class="note">No assumptions yet.</div>';
  $$("[data-tn]").forEach(i=>i.onchange=()=>{S.themes.find(t=>t.id===i.dataset.tn).name=i.value.trim()||"Untitled theme";save()});
  $$("[data-dt]").forEach(b=>b.onclick=()=>{const i=S.themes.findIndex(t=>t.id===b.dataset.dt);const th=S.themes[i];S.themes.splice(i,1);save();renderResearch();undoToast(`Deleted “${th.name}” and its ${th.cards.length} card${th.cards.length===1?"":"s"}`,()=>{S.themes.splice(i,0,th);save();renderResearch()})});
  $$("[data-ac]").forEach(b=>b.onclick=()=>{const c={id:uid("c"),text:"",quote:"",quotes:[],src:"",conf:"medium"};S.themes.find(t=>t.id===b.dataset.ac).cards.push(c);cardModal(c.id,true)});
  $$("#themes [data-c]").forEach(el=>{el.onclick=()=>cardModal(el.dataset.c);el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();cardModal(el.dataset.c)}}});
  $$("[data-a]").forEach(b=>b.onclick=()=>{const a=S.assume.find(x=>x.id===b.dataset.a);a.rej=!a.rej;save();renderResearch()});
  $$("[data-al]").forEach(i=>i.onchange=()=>{S.assume.find(x=>x.id===i.dataset.al).label=i.value;save()});
  $$("[data-af]").forEach(i=>i.onchange=()=>{S.assume.find(x=>x.id===i.dataset.af).from=i.value;save()});
  $$("[data-ad]").forEach(b=>b.onclick=()=>{const i=S.assume.findIndex(x=>x.id===b.dataset.ad);const a=S.assume[i];S.assume.splice(i,1);save();renderResearch();undoToast("Assumption deleted",()=>{S.assume.splice(i,0,a);save();renderResearch()})});
  renderResearchAsk();
}

/* ---- insight card editor ---- */
function cardModal(id,isNew){const c=findCard(id);if(!c)return;const th=S.themes.find(t=>t.cards.includes(c));let qs=[...cardQuotes(c)];
  const srcOpts=()=>'<option value="">No linked artifact</option>'+sourceOrder().map(s=>`<option value="${s.id}" ${s.id===c.src?"selected":""}>${esc(s.name)}</option>`).join("");
  const d=modalShell(`<div class="row" style="align-items:flex-start"><div style="flex:1"><div class="label-m osv">${esc(th?th.name:"Insight")}</div><span class="headline-s">${isNew?"New insight":"Insight"}</span></div><button class="icon-btn" data-cm-x aria-label="Close"><span class="ms">close</span></button></div>
    <div class="field"><label for="cmText">What did you learn?</label><textarea id="cmText" rows="2" placeholder="One sentence a designer can act on">${esc(c.text)}</textarea></div>
    <div><div class="row" style="margin-bottom:6px"><span class="title-s">Evidence</span><span class="spacer"></span><button class="btn text sm" id="cmAdd"><span class="ms">add</span>Add quote</button></div><div id="cmQuotes" class="col" style="gap:8px"></div></div>
    <div class="row" style="gap:12px;align-items:flex-end"><div class="field" style="flex:2;min-width:200px"><label for="cmSrc">Linked artifact</label><select id="cmSrc">${srcOpts()}</select></div><div class="field" style="flex:1;min-width:140px"><label for="cmConf">Confidence</label><select id="cmConf">${["high","medium","low","hard"].map(k=>`<option value="${k}" ${c.conf===k?"selected":""}>${{high:"High: sources agree",medium:"Medium: one strong source",low:"Low: one person or conflicting",hard:"Rule: never break this"}[k]}</option>`).join("")}</select></div><button class="btn text sm" id="cmOpen" ${c.src?"":"disabled"}><span class="ms">open_in_new</span>Open artifact</button></div>
    <div class="row"><button class="btn text" id="cmDel" style="color:var(--error)"><span class="ms">delete</span>Delete card</button><span class="spacer"></span><button class="btn text" id="cmCancel">Cancel</button><button class="btn filled" id="cmSave">Save</button></div>`);
  const stHTML=(q)=>{if(!q.trim())return"";const v=verifyQuote(q,$("#cmSrc",d)?.value||c.src);const s=S.sources.find(x=>x.id===v.src);
    return v.st==="ok"?`<span class="vst ok"><span class="ms">check_circle</span>Found in ${esc(s.name)}</span>`:v.st==="close"?`<span class="vst warn"><span class="ms">change_history</span>Paraphrased from ${esc(s.name)}</span>`:`<span class="vst bad"><span class="ms">error</span>Not found in any artifact</span>`};
  const draw=()=>{$("#cmQuotes",d).innerHTML=qs.map((q,i)=>`<div class="cmq"><span class="ms osv" style="font-size:18px;margin-top:8px">format_quote</span><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px"><textarea rows="2" data-qi="${i}" aria-label="Quote ${i+1}" placeholder="“What they said” — who said it">${esc(q)}</textarea><div class="body-s" data-qs="${i}">${stHTML(q)}</div></div><button class="icon-btn" data-qx="${i}" aria-label="Remove quote ${i+1}"><span class="ms" style="font-size:18px">close</span></button></div>`).join("")||'<div class="note">No quotes yet. Paste what a participant actually said, or a survey number.</div>';
    $$("[data-qi]",d).forEach(t=>{t.oninput=()=>{qs[+t.dataset.qi]=t.value;clearTimeout(t._v);t._v=setTimeout(()=>{$(`[data-qs="${t.dataset.qi}"]`,d).innerHTML=stHTML(t.value)},250)}});
    $$("[data-qx]",d).forEach(b=>b.onclick=()=>{qs.splice(+b.dataset.qx,1);draw()})};
  draw();
  $("#cmSrc",d).onchange=e=>{$("#cmOpen",d).disabled=!e.target.value;draw()};
  $("#cmOpen",d).onclick=()=>{const v=$("#cmSrc",d).value;if(v){close();openSource(v)}};
  $("#cmAdd",d).onclick=()=>{qs.push("");draw();const all=$$("[data-qi]",d);all[all.length-1].focus()};
  const drop=()=>{if(isNew&&!c.text&&!cardQuotes(c).length)S.themes.forEach(t=>t.cards=t.cards.filter(x=>x.id!==c.id))};
  const close=()=>{drop();d.remove();renderResearch()};$("[data-cm-x]",d).onclick=close;$("#cmCancel",d).onclick=close;
  const _esc=d.onkeydown;d.onkeydown=e=>{if(e.key==="Escape"){drop();renderResearch()}_esc&&_esc(e)};
  const _bg=d.onclick;d.onclick=e=>{if(e.target===d){drop();renderResearch()}_bg&&_bg(e)};
  $("#cmSave",d).onclick=()=>{const text=$("#cmText",d).value.trim();if(!text){$("#cmText",d).focus();toast("Write the insight first");return}
    snapshot("Edit insight card");c.text=text;c.quotes=qs.map(q=>q.trim()).filter(Boolean);c.quote=c.quotes[0]||"";c.src=$("#cmSrc",d).value;c.conf=$("#cmConf",d).value;
    if(!c.src){const v=c.quotes.map(q=>verifyQuote(q)).find(v=>v.src);if(v)c.src=v.src}
    save();d.remove();renderResearch();toast("Insight saved")};
  $("#cmDel",d).onclick=()=>{let ti=-1,ci=-1;S.themes.forEach((t,i)=>{const j=t.cards.indexOf(c);if(j>=0){ti=i;ci=j}});snapshot("Delete insight card");S.themes.forEach(t=>t.cards=t.cards.filter(x=>x.id!==c.id));save();d.remove();renderResearch();
    if(!isNew&&ti>=0)undoToast("Card deleted",()=>{S.themes[ti]&&S.themes[ti].cards.splice(ci,0,c);save();renderResearch()})};
  setTimeout(()=>$("#cmText",d).focus(),0)}

/* ---- right: add context (AI turns it into cards and assumptions) ---- */
let rTurns=[],rBusy=false;
function renderResearchAsk(){const i=$("#rIn");if(!i)return;i.placeholder="A client call, a constraint, who it's for, something to avoid…";
  $("#rOut").innerHTML=rTurns.map(t=>`<div class="msg ${t.role==="user"?"me":""}">${esc(t.content)}</div>`).join("");$("#rOut").hidden=!rTurns.length}
$("#rIn").onkeydown=e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey)){e.preventDefault();$("#rForm").requestSubmit()}};
$("#rForm").onsubmit=async e=>{e.preventDefault();if(rBusy)return;const q=$("#rIn").value.trim();if(!q)return;$("#rIn").value="";
  let cn=S.sources.find(x=>x.name==="context_notes.md");if(!cn){cn={id:uid("s"),name:"context_notes.md",kind:"notes",star:true,text:""};S.sources.push(cn)}cn.text=(cn.text?cn.text+"\n\n":"")+`[${new Date().toLocaleDateString()}] ${q}`;save();renderSources();rTurns.push({role:"user",content:q});const out=$("#rOut");out.hidden=false;out.insertAdjacentHTML("beforeend",`<div class="msg me">${esc(q)}</div><div class="msg" id="rPending">Reading your research…</div>`);out.scrollTop=out.scrollHeight;rBusy=true;$("#rForm button").disabled=true;
  try{let text;
    if(sample){/* one JSON request (no tool round trips), so it works with any provider, including Gemini's free tier */
      const themes=S.themes.map(t=>t.name).join("; ")||"(none yet)";
      const out=await aiRetry(()=>sample.json(`${projectHeader()}\n\nCURRENT THEMES: ${themes}\nCURRENT ASSUMPTIONS: ${S.assume.map(a=>a.label).join("; ")||"(none)"}\n\nTHE DESIGNER JUST ADDED THIS NOTE TO THE RESEARCH:\n"""${q}"""\n\nTurn the note into insight cards and assumptions, only where the note supports them.\n- cards: 0–3. text is one plain sentence a designer can act on. quote is copied EXACTLY from the note (word for word, it is checked). theme is an existing theme name when one fits, otherwise a short new one. conf is "low" unless the note says many people agree.\n- assumptions: 0–2 default choices an AI design tool would make for this project that the note contradicts.\n- reply: one or two plain sentences telling the designer what you added, or that the note adds nothing new.\nJSON: {"cards":[{"theme":string,"text":string,"quote":string,"conf":"high"|"medium"|"low"}],"assumptions":[{"label":string,"why":string}],"reply":string}`,{modelTier:"default"}));
      let added=0;(out.cards||[]).filter(c=>c&&c.text).slice(0,3).forEach(c=>{let th=S.themes.find(x=>x.name.toLowerCase()===String(c.theme||"").toLowerCase());if(!th){th={id:uid("t"),name:String(c.theme||"From your notes"),cards:[]};S.themes.push(th)}const qs=c.quote?[String(c.quote)]:[];th.cards.push({id:uid("c"),text:String(c.text),quotes:qs,quote:qs[0]||"",src:cn.id,conf:["high","medium","low"].includes(c.conf)?c.conf:"low",ai:true});added++});
      (out.assumptions||[]).filter(a=>a&&a.label).slice(0,2).forEach(a=>{S.assume.push({id:uid("a"),label:String(a.label),from:String(a.why||"contradicted by your note"),rej:true,ai:true});added++});
      if(added){snapshot("AI added context");save();renderResearch()}
      text=String(out.reply||(added?`Added ${added} item${added===1?"":"s"}.`:"Saved. Nothing new to add from this note."))}
    else text=offlineContext(q);
    rTurns.push({role:"assistant",content:text});const p=$("#rPending");if(p){p.id="";p.textContent=text}}
  catch(err){const p=$("#rPending");if(p){p.id="";p.classList.add("sys");p.textContent=err.text||({not_granted:"The AI provider rejected the request.",rate_limited:"Too many requests; try again in a minute.",network:"Couldn't reach the Traceform server."}[err.code]||"Couldn't reach the AI ("+(err.code||"error")+"). Your note is still saved.")}}
  rBusy=false;$("#rForm button").disabled=false;out.scrollTop=out.scrollHeight};
/* offline: the note is saved; "card:" and "assume:" add one directly. (Named so it can't collide with
   the offline research generator in 70-generate.js.) */
function offlineContext(q){const t=q.trim();let m;
  if(m=t.match(/^(?:add (?:a )?)?card:?\s+(.+)/i)){const th=S.themes[0]||(S.themes.push({id:uid("t"),name:"Unsorted",cards:[]}),S.themes[0]);th.cards.push({id:uid("c"),text:m[1],quotes:[],quote:"",src:"",conf:"low"});save();renderResearch();return`Added a card to “${th.name}”. Open it to add the quote that backs it up.`}
  if(m=t.match(/^assume:?\s+(.+)/i)){S.assume.push({id:uid("a"),label:m[1],from:"added by you",rej:false});save();renderResearch();return"Added to the assumptions."}
  return"Saved to context_notes.md. Generate or regenerate the insights to include it."}

$("#addTheme").onclick=()=>{S.themes.push({id:uid("t"),name:"New theme",cards:[]});save();renderResearch();const ins=$$("[data-tn]");const last=ins[ins.length-1];if(last){last.focus();last.select()}};
$("#lockBtn").onclick=()=>{S.locked=true;snapshot("research locked");save();go("inspiration");toast(`Research saved. ${avoidList().length} things to avoid passed on.`)};
$("#pickSrc2").onclick=()=>$("#srcFile").click();
$("#srcFile").onchange=e=>{addSourceFiles(e.target.files);e.target.value=""};
function dragDrop(el,fn){el.addEventListener("dragover",e=>{e.preventDefault();el.classList.add("over")});el.addEventListener("dragleave",()=>el.classList.remove("over"));el.addEventListener("drop",e=>{e.preventDefault();el.classList.remove("over");fn(e.dataTransfer.files)})}
dragDrop($("#dropSrc"),addSourceFiles);
$("#pasteSrc").onclick=()=>dialog(`<span class="headline-s">Paste research</span><div class="row" style="gap:12px"><div class="field" style="flex:2;min-width:180px"><label for="pasteName">Name</label><input id="pasteName" placeholder="e.g. interview_owner.txt"></div><div class="field" style="flex:1;min-width:120px"><label for="pasteKind">Type</label><select id="pasteKind">${Object.entries(KNAME).filter(([k])=>k!=="figjam").map(([k,n])=>`<option value="${k}">${n}</option>`).join("")}</select></div></div><div class="field"><label for="pasteTA">Text</label><textarea id="pasteTA" rows="10" placeholder="Interview notes, a transcript, survey answers…"></textarea></div>`,[["Cancel","text",()=>{}],["Add artifact","filled",()=>{const v=$("#pasteTA").value.trim();if(!v)return;const nm=$("#pasteName").value.trim()||`pasted_notes_${S.sources.length+1}.txt`;addSource(nm,v,$("#pasteKind").value);afterSourcesAdded(1,nm)}]]);

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
