/* AI generation pipeline.
 *
 *   research artifacts ──▶ themes + insight cards + assumptions      (Research)
 *                      ──▶ inspiration directions                     (Inspiration)
 *                      ──▶ design tokens + reasoning                  (Design system)
 *                      ──▶ site content + per-element decisions       (Review)
 *
 * Each stage reads everything before it, writes plain state the user can edit, and records
 * S.gen[stage] = "done" (AI) or "template" (offline fallback). Mali's Table ships pre-generated.
 *
 * NOTE: this file is concatenated after 40-app.js, whose boot() already ran renderAll().
 * Anything boot might reach (syncEL, site, templateSite) must not depend on top-level
 * const/let/var values from this file, so lookups below are functions, not constants.
 */

/* ---------- element catalogue per project ---------- */
var EL_BASE;
function elBase(){if(!EL_BASE)EL_BASE=JSON.parse(JSON.stringify(EL));return EL_BASE}
function genericElNames(){return{brand:"Site name",hero:"Hero",side:"Second image",cards:"Item cards",bundles:"Collections",story:"Story strip",cta:"Primary button",menuhead:"Catalog header",heat:"Indicator",orderflow:"Action flow",hours:"Info card",footer:"Footer",storyhero:"About page hero"}}
function syncEL(){const base=elBase();const mali=S.pid==="p-mali";const W=site();const names=genericElNames();
  Object.keys(base).forEach(id=>{const b=JSON.parse(JSON.stringify(base[id]));
    const e=mali?b:{name:names[id]||b.name,page:b.page,pin:b.pin,receipt:"",prev:[["most common AI version",60],["this version",20]],mine:"this version",gaps:[],q:!S.review};
    const r=S.review&&S.review[id];
    if(r){if(r.name)e.name=r.name;if(r.receipt!=null)e.receipt=String(r.receipt);if(Array.isArray(r.gaps))e.gaps=r.gaps.map(String);
      if(Array.isArray(r.typical)&&r.typical.length){e.prev=r.typical.map(x=>[String(x[0]),Math.max(0,Math.min(100,+x[1]||0))]);e.mine=r.mine&&e.prev.some(p=>p[0]===r.mine)?r.mine:e.prev[e.prev.length-1][0]}
      e.q=!e.receipt}
    if(id==="heat"&&!(W.items.list||[]).some(d=>d.heat))e.page="none";
    if(id==="bundles"&&!(W.collections&&W.collections.list||[]).length)e.page="none";
    EL[id]=e})}

/* ---------- vocabulary + templates (offline fallback, and the shape the AI fills in) ---------- */
function vocab(type){return({
  restaurant:{pages:["Home","Menu","Order","Story"],nav:["Menu","Order","Our story","Hours"],cta:"See the menu",items:"What we cook",action:"Order",about:"Our story",add:"Add",info:"Today"},
  ecommerce:{pages:["Home","Shop","Cart","About"],nav:["Shop","How it works","About","Visit"],cta:"Start shopping",items:"This week",action:"Your order",about:"About us",add:"Add",info:"This week"},
  webapp:{pages:["Home","Features","Sign in","About"],nav:["Features","Pricing","About","Help"],cta:"Get started",items:"What you can do",action:"Sign in",about:"About",add:"Open",info:"Status"},
  portfolio:{pages:["Home","Work","Contact","About"],nav:["Work","Process","About","Contact"],cta:"See the work",items:"Selected work",action:"Get in touch",about:"About",add:"View",info:"Now"},
  mobile:{pages:["Home","Features","Get the app","About"],nav:["Features","How it works","About","Support"],cta:"Get the app",items:"What it does",action:"Get the app",about:"About",add:"Learn more",info:"Available"},
  nonprofit:{pages:["Home","Programs","Give","About"],nav:["Programs","Impact","About","Get involved"],cta:"Get involved",items:"What we do",action:"Give",about:"Our story",add:"Learn more",info:"This month"},
  other:{pages:["Home","Offerings","Contact","About"],nav:["Offerings","About","Contact","FAQ"],cta:"Learn more",items:"What we offer",action:"Contact us",about:"About",add:"Learn more",info:"Details"}
})[type]||vocab("other")}
function briefLine(re){const m=(S.brief||"").match(re);return m?m[1].trim():""}
function templateSite(){const v=vocab(S.type);const name=S.project||"Project";const ctx=briefLine(/Context:\s*(.+)/)||briefLine(/Building:\s*(.+)/)||"[ONE-LINE DESCRIPTION — generate from research]";
  const it=i=>({n:`[ITEM ${i}]`,d:"[DESCRIPTION — generate from research]",p:"",tags:[],img:"",alt:`Image for item ${i}`,group:v.items});
  return{brand:name,pages:{home:v.pages[0],menu:v.pages[1],order:v.pages[2],story:v.pages[3]},navLinks:v.nav,cta:v.cta,
    hero:{headline:name,sub:ctx.split(/(?<=\.)\s/)[0],caption:"",img:"",alt:"Hero image: [ART DIRECTION — generate from research]"},
    side:{img:"",alt:"Second image: [ART DIRECTION]"},info:{title:v.info,lines:[["[KEY FACT]","[DETAIL]"],["[ADDRESS OR LINK]","Map"]]},
    lead:{text:"[LEAD SENTENCE — generate from research]",button:v.nav[0]},
    items:{title:v.items,sub:"",button:v.add,show:3,gap:"",list:[it(1),it(2),it(3)]},
    collections:{title:"",sub:"",button:"",list:[]},
    story:{quote:"[A REAL QUOTE FROM THE RESEARCH]",body:"[SHORT STORY — generate from research]",img:"",alt:"Story image: [ART DIRECTION]",button:v.about},
    location:{title:"Contact",map:false,img:"",alt:"Location or contact image",lines:[["[ADDRESS]",""],["[PHONE]","[EMAIL]"]]},
    footer:{blurb:ctx.split(/(?<=\.)\s/)[0],address:"[ADDRESS]",contact:"[PHONE] · [EMAIL]",signup:"",cols:[{title:v.nav[0],lines:[v.items]},{title:"About",lines:[v.about]},{title:"Contact",lines:["[EMAIL]"]}],legal:`© 2026 ${name}`},
    catalog:{title:v.items,sub:"",gap:""},
    action:{title:v.action,sub:"",cartTitle:"Your selection",addTitle:"",formTitle:"Your details",options:[],fields:[["Name",""],["Email",""]],submit:v.action,note:""},
    about:{title:v.about,img:"",alt:"About image: [ART DIRECTION]",paragraphs:["[STORY — generate from research]"],photos:[],people:[]}}}
function genericTokens(){const v=vocab(S.type);return seedTokens().map(t=>{const o={...t,edited:false,prev:[["common AI default",55]],why:"Template default · generate from research to replace",not:""};
  const val={"color.ground":"#FAFAF7","color.accent":"#3D5A80","color.heat":"#B5533C","color.ink":"#1C1C1C","type.display":"Fraunces","type.body":"Roboto","type.scale":"40 / 28 / 20 / 16 / 13","type.accentLine":"none","space.scale":"8 · 16 · 24 · 40 · 64","shape.radius":"4 / 8 / 12","imagery":"[from research]","motif":"none","comp.cta":`“${v.cta}”`}[t.k];
  if(val!==undefined)o.v=val;else if(t.type==="text")o.v="[from research]";o.mine=typeof mineLabel==="function"?mineLabel(o):o.mine;return o})}
function ensureProjectDefaults(){if(S.pid==="p-mali")return;if(!S.tokensTemplated&&!(S.gen&&S.gen.system)){S.tokens=genericTokens();S.tokensTemplated=true}site()}
function reason(sec){return(S.reasons&&S.reasons[sec])||(S.pid==="p-mali"?SECTION_REASON[sec]:"Template values. Generate the design system to get choices and reasoning drawn from this project's research.")}

/* ---------- state helpers ---------- */
var GEN;
function gen(){return GEN||(GEN={busy:null})}
function genState(stage){if(S.pid==="p-mali"&&!(S.gen&&S.gen[stage]))return"done";if(stage==="research"&&!(S.gen&&S.gen.research)&&S.themes.length)return"done";return(S.gen&&S.gen[stage])||"none"}
function stages(){return[["research","themes and insight cards"],["inspiration","inspiration directions"],["system","design system"],["site","site and review"]]}
function researchDump(max=60000){const src=[...S.sources].sort((a,b)=>(b.star?1:0)-(a.star?1:0));let out="";for(const s of src){const room=max-out.length-200;if(room<500)break;const t=`### ${s.name}${s.star?" (starred: weight first)":""}\n${(s.text||"").slice(0,Math.min(20000,room))}\n\n`;out+=t}return out||"(no artifacts uploaded yet; use the brief)"}
function insightDump(){return S.themes.map(t=>`[${t.name}] `+t.cards.map(c=>`${c.id}: ${c.text} (${(c.quotes||[c.quote]).filter(Boolean).join(" / ")})`).join(" ; ")).join("\n")||"(none yet)"}
function inspirationDump(){return S.tiles.map(t=>`${t.title}: borrow ${t.borrow||"(nothing chosen)"}`).join("\n")||"(none saved)"}
function tokenDump(){return(S.tokens||seedTokens()).map(t=>`${t.k}=${t.v}`).join("\n")}
function projectHeader(){const c=projectContext();const v=vocab(S.type);
  return[`PROJECT: ${S.project}`,
    `PROJECT TYPE: ${c.typeName}. Shape everything for this kind of project: typical pages here are ${v.pages.join(", ")}; the main things on offer are "${v.items.toLowerCase()}"; the primary action is usually "${v.cta}" (change it if the research points elsewhere).`,
    c.what&&`WHAT THEY'RE BUILDING: ${c.what}`,c.audience&&`WHO IT'S FOR: ${c.audience}`,c.context&&`DESIGNER'S CONTEXT: ${c.context}`,c.avoid&&`MUST NEVER LOOK OR FEEL LIKE: ${c.avoid}`,
    `AVOID-LIST (rejected assumptions and hard rules): ${avoidList().join("; ")||"(none)"}`,
    `HOW TO DECIDE: build what the project type and the designer's context call for (pages, sections, items, tone, primary action) and make every specific choice from the research. If the research contradicts the context, follow the research and say so. Write for the audience above.`].filter(Boolean).join("\n")}
const isHex=v=>/^#[0-9a-f]{6}$/i.test(String(v||""));
function imageKeyGuide(){return S.type==="restaurant"?`Image slots: use one of these demo photo keys when it fits, otherwise "" (a placeholder with your art direction is shown): overhead (several dishes from above), hands (hands pounding in a mortar), after (the table after a meal), board (handwritten menu board), celadon (blue-green ceramic bowls), herbs (fresh herbs), khaosoi (curry noodle bowl), somtam (papaya salad), larb (minced meat salad), rice (sticky rice basket), greens (stir-fried greens), curry (pork curry), mango (mango sticky rice), storefront (small restaurant front).`:`Image slots: set "img" to "" and put art direction for the photo to shoot or source in "alt" (what it shows and why, from the research).`}

/* ---------- stage 1: research → themes, cards, assumptions ---------- */
async function aiResearch(){const names=S.sources.map(s=>JSON.stringify(s.name)).join(", ");
  const out=await aiRetry(()=>sample.json(`${projectHeader()}\n\nRESEARCH ARTIFACTS:\n${researchDump()}\n\nDo an affinity mapping of this research, the way a UX researcher would. Group the findings into 3–6 themes; each theme has 1–4 insight cards.\nEach card:\n- text: one plain sentence a designer can act on, specific to these people. No marketing language.\n- quotes: 1–3 pieces of evidence COPIED EXACTLY from the artifacts, character for character (do not fix grammar, shorten words or join sentences; under 30 words each), written as “exact words” — who said it. For a survey number, copy the line or row exactly. Every quote is checked against the artifact text and anything not found is flagged to the designer.\n- source: the artifact the first quote comes from, exactly one of: ${names||"(none)"}\n- conf: "high" if several sources or many respondents agree, "medium" if one strong source, "low" if one person or the sources disagree.\nUse only what is in the artifacts. Do not invent quotes, names or numbers. If two people disagree, make the disagreement its own card.\nAlso list 3–6 assumptions an AI design tool would make by default for this kind of project that this research does NOT support. Write each as a general pattern (e.g. "Hero features the category's best-known product"), never a single detail one person mentioned; "why" names the finding that contradicts it.\nJSON: {"themes":[{"name":string,"cards":[{"text":string,"quotes":[string],"source":string,"conf":"high"|"medium"|"low"}]}],"assumptions":[{"label":string,"why":string}]}`,{modelTier:"default"}));
  return out}
function applyResearch(out){
  const byName=n=>S.sources.find(s=>s.name.toLowerCase()===String(n||"").toLowerCase())||S.sources.find(s=>String(n||"").toLowerCase().includes(s.name.toLowerCase().replace(/\.[^.]+$/,"")));
  const qText=q=>q&&typeof q==="object"?`${q.text||q.quote||""}${q.who||q.speaker?" — "+(q.who||q.speaker):""}`:String(q||"");
  const themes=(out.themes||[]).filter(t=>t&&t.name).map(t=>({id:uid("t"),name:String(t.name),cards:(t.cards||[]).filter(c=>c&&c.text).map(c=>{const q=(Array.isArray(c.quotes)?c.quotes:[c.quote]).map(qText).map(s=>s.trim()).filter(Boolean);const src=byName(c.source)?.id||(typeof verifyQuote==="function"&&q[0]?verifyQuote(q[0]).src:"")||"";return{id:uid("c"),text:String(c.text),quotes:q,quote:q[0]||"",src,conf:["high","medium","low"].includes(c.conf)?c.conf:"medium",ai:true}})})).filter(t=>t.cards.length);
  if(!themes.length)throw Object.assign(new Error("empty"),{text:"The AI found no themes in the artifacts."});
  S.themes=themes;
  const have=new Set(S.assume.map(a=>a.label.toLowerCase()));
  (out.assumptions||[]).forEach(a=>{if(a&&a.label&&!have.has(String(a.label).toLowerCase()))S.assume.push({id:uid("a"),label:String(a.label),from:String(a.why||"not supported by the research"),rej:true,ai:true})})}
function offlineResearch(){const themes=[];
  S.sources.filter(s=>(s.text||"").trim()).forEach(s=>{const sents=(s.text.match(/[^.!?\n]+[.!?]?/g)||[]).map(x=>x.trim()).filter(x=>x.length>20);const quotes=sents.filter(x=>/[“"]/.test(x));const cards=(quotes.length?quotes:sents).slice(0,3).map(x=>({id:uid("c"),text:x.replace(/[“”"]/g,"").slice(0,140),quotes:[x],quote:x,src:s.id,conf:"low"}));if(cards.length)themes.push({id:uid("t"),name:s.name.replace(/\.[^.]+$/,"").replace(/[_-]/g," "),cards})});
  if(themes.length)S.themes=themes}

/* ---------- stage 2: inspiration directions ---------- */
async function aiInspiration(){
  return sample.json(`${projectHeader()}\n\nINSIGHTS:\n${insightDump()}\n\nSAVED REFERENCES:\n${inspirationDump()}\n\nPropose 4 distinct visual directions for this project's website, each grounded in a different insight above and none using anything on the avoid list. For each: a short name; one sentence describing it; what to borrow (layout, color, type, imagery or tone, concretely); which insight it comes from (cite the card id); a palette (bg, fg, accent, card as hex; fg on bg at least 4.5:1); a display font from [${FONTS.display.join(", ")}] and a body font from [${FONTS.body.join(", ")}]; a sample headline and subhead written for this project; a CTA label; three nav labels; three sample items (name, price or "").\n${imageKeyGuide()} Use "img" for the hero.\nJSON: {"directions":[{"name":string,"desc":string,"borrow":string,"why":string,"palette":{"bg":string,"fg":string,"accent":string,"card":string},"font":string,"body":string,"headline":string,"sub":string,"cta":string,"nav":[string],"items":[[string,string]],"img":string}]}`,{modelTier:"default"})}
function directionFrom(d,i){const p=d.palette||{};const font=FONTS.display.includes(d.font)?d.font:"Fraunces";const body=FONTS.body.includes(d.body)?d.body:"Roboto";const fk=S.type==="restaurant"?["khaosoi","somtam","larb","curry","greens","rice","mango"]:[];
  return{id:"ai-"+uid(""),ai:true,name:String(d.name||`Direction ${i+1}`),desc:`${d.desc||""}${d.borrow?" Borrow: "+d.borrow+".":""}${d.why?" ← "+d.why:""}`.trim(),
    mock:{name:S.project,bg:isHex(p.bg)?p.bg:"#FAFAF7",fg:isHex(p.fg)?p.fg:"#1C1C1C",card:isHex(p.card)?p.card:"#FFFFFF",cta:isHex(p.accent)?p.accent:"#3D5A80",font:`'${font}',Georgia,serif`,body:`'${body}',system-ui,sans-serif`,headline:String(d.headline||""),sub:String(d.sub||""),ctaText:String(d.cta||"Learn more"),nav:(d.nav||[]).slice(0,3).join(" · ")||undefined,img:IMG[d.img]?d.img:null,
      dishes:(d.items||[]).slice(0,3).map((x,j)=>[String(x[0]||x.name||""),String(x[1]||x.price||""),fk[(i+j)%fk.length]||""]),foot:(S.brief.match(/Audience:\s*(.+)/)||[])[1]||" "}}}
function applyInspiration(out){const ds=(out.directions||[]).filter(Boolean).slice(0,6).map(directionFrom);if(!ds.length)throw Object.assign(new Error("empty"),{text:"The AI returned no directions."});S.directions=ds}
function offlineInspiration(){const g=tv("color.ground"),i=tv("color.ink");const v=vocab(S.type);
  S.directions=[["Quiet and photographic","#F6F4EF","#1C1C1C","#3D5A80"],["Bold and graphic","#FFFFFF","#111111","#C2410C"],["Warm and editorial","#F3EDE3","#2A2520","#7A5C3E"]].map(([n,bg,fg,a],k)=>directionFrom({name:n,desc:"Template direction (AI offline).",palette:{bg,fg,accent:a,card:"#FFFFFF"},font:FONTS.display[k%FONTS.display.length],headline:S.project,sub:"",cta:v.cta,nav:v.nav.slice(0,3),items:[]},k))}

/* ---------- stage 3: design system ---------- */
async function aiSystem(){const toks=(S.tokens||genericTokens());
  return sample.json(`${projectHeader()}\n\nINSIGHTS:\n${insightDump()}\n\nSAVED REFERENCES AND WHAT TO BORROW:\n${inspirationDump()}\n\nDraft this project's design tokens from the research and references. Keep exactly these keys and types:\n${toks.map(t=>`${t.k} (${t.type})`).join("\n")}\nRules: colors are hex; color.ink on color.ground at least 4.5:1; white text on color.accent at least 4.5:1; color.heat is a secondary signal color. type.display one of ${FONTS.display.join(", ")}; type.body one of ${FONTS.body.join(", ")}. comp.cta is the primary button label in curly quotes, e.g. “See the menu”. Text tokens are short specs a developer can follow. For each token give: why (cite the insight card id or reference), not (the generic choice it avoids), typical (the most common choice AI tools make for this token in this kind of project) and typicalPct (your estimate, 0–100). Also one short paragraph of reasoning per section: base, color, type, space, imagery, components.\nJSON: {"tokens":[{"k":string,"v":string,"why":string,"not":string,"typical":string,"typicalPct":number}],"reasoning":{"base":string,"color":string,"type":string,"space":string,"imagery":string,"components":string}}`,{modelTier:"default"})}
function applySystem(out){const base=S.pid==="p-mali"?seedTokens():genericTokens();const got=new Map((out.tokens||[]).filter(o=>o&&o.k).map(o=>[o.k,o]));
  S.tokens=base.map(t=>{const o=got.get(t.k);if(!o)return t;let v=String(o.v??t.v);
    if(t.type==="color"&&!isHex(v))v=t.v;if(t.type==="font"&&!(t.k==="type.display"?FONTS.display:FONTS.body).includes(v))v=t.v;
    const n={...t,v,why:String(o.why||t.why),not:String(o.not||""),edited:false,ai:true};if(o.typical)n.prev=[[String(o.typical),Math.max(0,Math.min(100,+o.typicalPct||50))]];n.mine=mineLabel(n);return n});
  const T_=k=>S.tokens.find(t=>t.k===k);
  if(ratio(T_("color.ink").v,T_("color.ground").v)<4.5)T_("color.ink").v=ratio("#111111",T_("color.ground").v)>=4.5?"#111111":"#FFFFFF";
  if(ratio("#ffffff",T_("color.accent").v)<4.5){/* darken accent until white text passes */let c=T_("color.accent").v;for(let k=0;k<12&&ratio("#ffffff",c)<4.5;k++)c="#"+c.slice(1).match(/../g).map(h=>Math.round(parseInt(h,16)*0.88).toString(16).padStart(2,"0")).join("");T_("color.accent").v=c}
  S.reasons=out.reasoning&&typeof out.reasoning==="object"?Object.fromEntries(Object.entries(out.reasoning).map(([k,v])=>[k,String(v)])):S.reasons;
  S.baseSystem="custom";S.sysBuilt=true;S.tokensTemplated=true}
function offlineSystem(){S.tokens=S.pid==="p-mali"?seedTokens():genericTokens();S.tokensTemplated=true;S.sysBuilt=true}

/* ---------- stage 4: site content + review decisions ---------- */
function siteSchema(){return`{"brand":string,"pages":{"home":string,"menu":string,"order":string,"story":string},"navLinks":[4 strings],"cta":string,
"hero":{"headline":string,"sub":string,"caption":string,"img":string,"alt":string},"side":{"img":string,"alt":string},
"info":{"title":string,"lines":[[string,string]]},"lead":{"text":string,"button":string},
"items":{"title":string,"sub":string,"button":string,"show":2|3,"gap":string,"list":[{"n":string,"d":string,"p":string,"tags":[string],"img":string,"alt":string,"group":string,"heat":0|1|2|3}]},
"collections":{"title":string,"sub":string,"button":string,"list":[{"n":string,"i":string,"p":string,"img":string,"alt":string}]},
"story":{"quote":string,"body":string,"img":string,"alt":string,"button":string},
"location":{"title":string,"lines":[[string,string]],"img":string,"alt":string},
"footer":{"blurb":string,"address":string,"contact":string,"signup":string,"cols":[{"title":string,"lines":[string]}],"legal":string},
"catalog":{"title":string,"sub":string,"gap":string},
"action":{"title":string,"sub":string,"cartTitle":string,"addTitle":string,"formTitle":string,"options":[string],"fields":[[string,string]],"submit":string,"note":string},
"about":{"title":string,"img":string,"alt":string,"paragraphs":[string],"photos":[[imgKey,alt]],"people":[[name,bio]]}}`}
async function aiSite(){const v=vocab(S.type);
  return sample.json(`${projectHeader()}\n\nINSIGHTS:\n${insightDump()}\n\nREFERENCES:\n${inspirationDump()}\n\nDESIGN TOKENS:\n${tokenDump()}\n\nWrite all content for this project's website as it would look just before handoff to developers: real, specific copy drawn from the research (names, places, products, quotes), not generic marketing language, and nothing on the avoid list. The site has four pages: home, a catalog page (key "menu"; e.g. ${v.pages[1]}), an action page (key "order"; e.g. ${v.pages[2]}) and an about page (key "story"). "items" are the main things on offer (5–8). "collections" are optional bundles or groups (0–3; empty list if they don't fit). "heat" is only for spice levels on food; otherwise 0. Where the research doesn't give a fact (price, hours, address), make up a plausible placeholder but wrap anything truly unknown in square brackets like [HOURS — ask the owner]. "items.gap" names one important missing item in brackets, or "". ${imageKeyGuide()}\nJSON (no extra keys): ${siteSchema()}`,{modelTier:"default"})}
async function aiReview(){const W=site();const ids=Object.entries(elBase()).map(([id,e])=>`${id} (${genericElNames()[id]}, page ${e.page})`).join("\n");
  return sample.json(`${projectHeader()}\n\nINSIGHTS:\n${insightDump()}\n\nTOKENS:\n${tokenDump()}\n\nSITE CONTENT:\n${JSON.stringify(W).slice(0,9000)}\n\nFor each page element below, write the design decision record a reviewer will see. receipt: "what was decided ← evidence" citing the insight card id, quote or reference; use "" when no research supports it (the AI decided alone). gaps: research that is missing or unused for this element, each starting with a [TAG] like "[PHOTO] real photo of the shop". typical: 2–3 options with your estimated % of AI-generated sites of this kind that choose each, the last one being this design's choice; mine: the label of this design's choice. name: a short element name for this project.\nELEMENTS:\n${ids}\nJSON: {"review":{"<element id>":{"name":string,"receipt":string,"gaps":[string],"typical":[[string,number]],"mine":string}}}`,{modelTier:"default"})}
function mergeShape(base,ai){if(ai==null)return base;if(Array.isArray(base))return Array.isArray(ai)&&ai.length?ai:base;
  if(base&&typeof base==="object"){if(typeof ai!=="object"||Array.isArray(ai))return base;const o={...base};Object.keys(ai).forEach(k=>{o[k]=k in base?mergeShape(base[k],ai[k]):ai[k]});return o}
  return typeof ai===typeof base||(typeof base==="string"&&typeof ai==="number")?(typeof base==="string"?String(ai):ai):base}
function applySite(out){const base=templateSite();const W=mergeShape(base,out||{});const okImg=k=>(k&&IMG[k]&&S.type==="restaurant")?k:"";
  W.hero.img=okImg(W.hero.img);W.side.img=okImg(W.side.img);W.story.img=okImg(W.story.img);W.about.img=okImg(W.about.img);W.location.img=okImg(W.location.img);W.location.map=S.pid==="p-mali";
  W.items.list=(W.items.list||[]).map(d=>({n:String(d.n||""),d:String(d.d||""),p:String(d.p??""),tags:(d.tags||[]).map(String).slice(0,3),img:okImg(d.img),alt:String(d.alt||d.n||""),group:String(d.group||W.catalog.title),heat:S.type==="restaurant"?Math.max(0,Math.min(3,+d.heat||0)):0})).filter(d=>d.n);
  W.collections.list=(W.collections.list||[]).map(b=>({n:String(b.n||""),i:String(b.i||""),p:String(b.p??""),img:okImg(b.img),alt:String(b.alt||b.n||"")})).filter(b=>b.n);
  W.about.photos=(W.about.photos||[]).map(p=>Array.isArray(p)?[okImg(p[0]),String(p[1]||"")]:[ "",String(p)]);
  W.items.show=Math.min(3,Math.max(2,+W.items.show||3));
  S.site=W;const ct=S.tokens&&S.tokens.find(t=>t.k==="comp.cta");if(ct&&W.cta)ct.v=`“${W.cta}”`;S.elements={}}
function applyReview(out){const r=out&&out.review;if(!r||typeof r!=="object")return;S.review={};Object.keys(elBase()).forEach(id=>{if(r[id])S.review[id]=r[id]})}
function offlineSite(){S.site=templateSite();S.review=null}

/* ---------- runner ---------- */
function stageFns(){return{
  research:{ai:async()=>applyResearch(await aiResearch()),off:offlineResearch,done:"Themes and cards generated from your artifacts"},
  inspiration:{ai:async()=>applyInspiration(await aiInspiration()),off:offlineInspiration,done:"Inspiration directions generated · save the ones you like"},
  system:{ai:async()=>applySystem(await aiSystem()),off:offlineSystem,done:"Design system generated from research + inspiration"},
  site:{ai:async()=>{applySite(await aiSite());try{applyReview(await aiReview())}catch(e){S.review=null}},off:offlineSite,done:"Site and review generated · click any part to edit"}}}
async function runStage(stage,opts={}){const G=gen();if(G.busy)return false;const pid=S.pid;const f=stageFns()[stage];
  G.busy=stage;refreshGenUI();let ok=true;
  try{
    if(sample){snapshot(`before AI generated ${stage}`);await f.ai()}else{f.off()}
    if(S.pid!==pid)return false;
    S.gen=S.gen||{};S.gen[stage]=sample?"done":"template";save();
    if(!opts.quiet)toast(sample?f.done:`AI offline: filled ${stage} with a template. Connect an AI to generate from research.`);
  }catch(e){ok=false;if(S.pid===pid)toast("Couldn't generate "+stage+": "+(e.text||e.code||e.message||"error"))}
  finally{G.busy=null;if(S.pid===pid){syncEL();renderAll()}}
  return ok}
async function runFrom(stage){const order=stages().map(s=>s[0]);for(const s of order.slice(order.indexOf(stage))){const ok=await runStage(s,{quiet:true});if(!ok)return}toast(sample?"Built from your research: inspiration, design system, site":"AI offline: every stage filled with templates");go("review")}
function confirmRegen(stage,fn){const labels=Object.fromEntries(stages());dialog(`<span class="headline-s">Regenerate ${labels[stage]}?</span><div class="body-m">The AI reads your current research${stage!=="research"?" and earlier stages":""} and replaces the ${labels[stage]}. Your edits to ${labels[stage]} will be replaced${stage==="research"?"":"; you can restore the old version from History on the Review page"}.</div>`,[["Cancel","text",()=>{}],["Regenerate","filled",fn]])}

/* ---------- banners ---------- */
function genBanner(stage){const G=gen();const st=genState(stage);const label=Object.fromEntries(stages())[stage];
  if(stage==="research")return researchBanner(G,st,label);
  if(G.busy===stage)return`<div class="genbar busy" role="status"><span class="spin" aria-hidden="true"></span><div><b>Generating ${label}…</b><div class="body-s osv">The AI is reading your ${stage==="research"?"artifacts":"research and earlier stages"}.</div></div></div>`;
  const prior={research:"your uploaded artifacts",inspiration:"your themes, cards and assumptions",system:"your research and saved inspiration",site:"your research, inspiration and design system"}[stage];
  const extra=stage==="research"?`<button class="btn text sm" data-details><span class="ms">tune</span>Project details</button><button class="btn outlined sm" data-genall ${G.busy?"disabled":""}><span class="ms">bolt</span>Build everything from research</button>`:"";
  if(st==="none")return`<div class="genbar"><span class="ms">auto_awesome</span><div style="flex:1;min-width:200px"><b>Generate ${label}</b><div class="body-s osv">AI drafts this from ${prior}. Everything it makes stays editable.</div></div><div class="row">${extra}<button class="btn filled sm" data-gen="${stage}" ${G.busy?"disabled":""}><span class="ms">auto_awesome</span>Generate</button></div></div>`;
  if(st==="template")return`<div class="genbar warn"><span class="ms">info</span><div style="flex:1;min-width:200px"><b>Template draft</b><div class="body-s osv">The AI was offline, so this is a fill-in template. Connect an AI provider and generate again to draft it from ${prior}.</div></div><div class="row">${extra}<button class="btn tonal sm" data-gen="${stage}" ${G.busy?"disabled":""}>Generate again</button></div></div>`;
  return`<div class="genbar done"><span class="ms">auto_awesome</span><div style="flex:1;min-width:200px" class="body-s">${!(S.gen&&S.gen[stage])?"Pre-generated sample":"Generated by AI"} from ${prior} · edit anything</div><div class="row">${extra}<button class="btn text sm" data-regen="${stage}" ${G.busy?"disabled":""}><span class="ms">refresh</span>Regenerate</button></div></div>`}
/* research tab: buttons only, no explanatory copy */
function researchBanner(G,st,label){const dis=G.busy?"disabled":"";
  if(G.busy==="research")return`<div class="genbar busy" role="status"><span class="spin" aria-hidden="true"></span><b>Generating ${label}…</b></div>`;
  const main=st==="none"?`<button class="btn filled sm" data-gen="research" ${dis}><span class="ms">auto_awesome</span>Generate</button>`:st==="template"?`<button class="btn tonal sm" data-gen="research" ${dis}>Generate again</button>`:`<button class="btn text sm" data-regen="research" ${dis}><span class="ms">refresh</span>Regenerate</button>`;
  return`<div class="genbar ${st==="template"?"warn":st==="none"?"":"done"}"><div class="row"><button class="btn text sm" data-details><span class="ms">tune</span>Project details</button><button class="btn outlined sm" data-genall ${dis}><span class="ms">bolt</span>Build everything from research</button>${main}</div></div>`}
function wireBanner(root){if(!root)return;
  $$("[data-gen]",root).forEach(b=>b.onclick=()=>runStage(b.dataset.gen));
  $$("[data-regen]",root).forEach(b=>b.onclick=()=>confirmRegen(b.dataset.regen,()=>runStage(b.dataset.regen)));
  $$("[data-details]",root).forEach(b=>b.onclick=()=>openWizard(S.pid));
  $$("[data-genall]",root).forEach(b=>b.onclick=()=>runFrom(S.themes.length&&genState("research")!=="none"?"inspiration":"research"))}
function refreshGenUI(){$$("[data-genslot]").forEach(el=>{el.innerHTML=genBanner(el.dataset.genslot);wireBanner(el)})}
function slot(stage){return`<div data-genslot="${stage}">${genBanner(stage)}</div>`}

/* ---------- content + decision editors (Review side panel) ---------- */
function contentFields(){return{
  brand:[["brand","Site name"]],cta:[["cta","Button label"]],
  hero:[["hero.headline","Headline"],["hero.sub","Supporting line","area"],["hero.caption","Photo caption"],["hero.alt","Image description / art direction","area"]],
  side:[["side.alt","Image description / art direction","area"]],
  hours:[["info.title","Title"],["info.lines","Lines (left | right)","pairs"]],
  cards:[["items.title","Section title"],["items.sub","Section subtitle"],["items.list","Items (name | description | price)","items"]],
  bundles:[["collections.title","Section title"],["collections.sub","Subtitle"],["collections.list","Collections (name | includes | price)","bundles"]],
  story:[["story.quote","Quote"],["story.body","Body","area"],["story.alt","Image description","area"]],
  menuhead:[["catalog.title","Title"],["catalog.sub","Intro","area"]],
  orderflow:[["action.title","Title"],["action.sub","Intro","area"],["action.fields","Form fields (label | example)","pairs"],["action.submit","Submit button"],["action.note","Note under the button","area"]],
  footer:[["footer.blurb","Blurb"],["footer.address","Address"],["footer.contact","Contact"],["footer.signup","Signup button"],["footer.legal","Legal line"]],
  storyhero:[["about.title","Title"],["about.paragraphs","Paragraphs (blank line between)","paras"],["about.people","People (name | bio)","pairs"]]}}
function getPath(o,p){return p.split(".").reduce((a,k)=>a==null?a:a[k],o)}
function setPath(o,p,v){const ks=p.split(".");const last=ks.pop();const t=ks.reduce((a,k)=>a[k]=a[k]||{},o);t[last]=v}
function toText(type,v){if(type==="pairs")return(v||[]).map(x=>x.filter(Boolean).join(" | ")).join("\n");if(type==="items")return(v||[]).map(d=>[d.n,d.d,d.p].join(" | ")).join("\n");if(type==="bundles")return(v||[]).map(d=>[d.n,d.i,d.p].join(" | ")).join("\n");if(type==="paras")return(v||[]).join("\n\n");return v??""}
function fromText(type,txt,old){const lines=String(txt).split("\n").map(l=>l.trim()).filter(Boolean);const parts=l=>l.split("|").map(x=>x.trim());
  if(type==="pairs")return lines.map(l=>{const p=parts(l);return[p[0]||"",p.slice(1).join(" | ")]});
  if(type==="items")return lines.map((l,i)=>{const p=parts(l);return{...(old&&old[i]||{tags:[],img:"",group:""}),n:p[0]||"",d:p[1]||"",p:p[2]||""}});
  if(type==="bundles")return lines.map((l,i)=>{const p=parts(l);return{...(old&&old[i]||{img:""}),n:p[0]||"",i:p[1]||"",p:p[2]||""}});
  if(type==="paras")return String(txt).split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);return String(txt)}
function editorHTML(id){const fs=contentFields()[id]||[];const W=site();const e=EL[id];const r=(S.review&&S.review[id])||{};
  const content=fs.length?`<details class="cedit" open><summary class="title-s">Edit content</summary>${fs.map(([p,l,t],i)=>{const v=toText(t,getPath(W,p));const big=t&&t!=="text";return`<div class="field"><label for="ce${i}">${esc(l)}</label>${big?`<textarea id="ce${i}" data-cp="${p}" data-ct="${t}" rows="${t==="area"?3:Math.min(8,Math.max(3,String(v).split("\n").length+1))}">${esc(v)}</textarea>`:`<input id="ce${i}" data-cp="${p}" data-ct="text" value="${esc(v)}">`}</div>`}).join("")}<div class="row"><button class="btn filled sm" id="ceSave">Save content</button></div></details>`:"";
  return`${content}<details class="cedit"><summary class="title-s">Edit decision record</summary><div class="field"><label for="deR">Decision ← evidence</label><textarea id="deR" rows="3" placeholder="e.g. Real name, not a generic one ← card c2">${esc(e.receipt||"")}</textarea></div><div class="field"><label for="deG">Gaps (one per line, start with a [TAG])</label><textarea id="deG" rows="3">${esc((e.gaps||[]).join("\n"))}</textarea></div><div class="row"><button class="btn tonal sm" id="deSave">Save decision</button></div></details>`}
function wireEditor(r,id){const W=site();
  $("#ceSave",r)&&($("#ceSave",r).onclick=()=>{snapshot(`edited content · ${EL[id].name}`);$$("[data-cp]",r).forEach(f=>{const p=f.dataset.cp;setPath(W,p,fromText(f.dataset.ct,f.value,getPath(W,p)))});
    const st=S.elements[id];if(st)delete st.caption;if(id==="hero"&&S.elements.tag)delete S.elements.tag.caption;if(id==="story"&&S.elements.story)delete S.elements.story.caption;
    if(id==="cta"){const t=S.tokens&&S.tokens.find(x=>x.k==="comp.cta");if(t)t.v=`“${W.cta}”`}save();renderReview();toast("Content saved")});
  $("#deSave",r)&&($("#deSave",r).onclick=()=>{snapshot(`edited decision · ${EL[id].name}`);S.review=S.review||{};const cur=EL[id];S.review[id]={...(S.review[id]||{}),name:cur.name,receipt:$("#deR",r).value.trim(),gaps:$("#deG",r).value.split("\n").map(x=>x.trim()).filter(Boolean)};if(!S.review[id].typical)S.review[id].typical=cur.prev,S.review[id].mine=cur.mine;save();renderReview();toast("Decision saved")})}

/* ---------- hook into the existing pages ---------- */
(function wrap(){
  const _research=renderResearch;renderResearch=function(){_research.apply(this,arguments);const th=$("#themes");if(th){let s=$("#genslot-research");if(!s){s=document.createElement("div");s.id="genslot-research";s.dataset.genslot="research";th.parentNode.insertBefore(s,th)}s.innerHTML=genBanner("research");wireBanner(s)}};
  const _insp=renderInspiration;renderInspiration=function(){ensureProjectDefaults();_insp.apply(this,arguments);const hd=$("#inspBody .insp-hd");if(hd){hd.insertAdjacentHTML("afterend",slot("inspiration"));wireBanner($("#inspBody"))}
    const ex=$$("#inspBody .insp-sec")[1];if(ex&&!exploreList().length)ex.querySelector(".refgrid").innerHTML=`<div class="note" style="grid-column:1/-1">No directions yet. Generate them above from your research.</div>`};
  const _sys=renderSystem;renderSystem=function(){ensureProjectDefaults();_sys.apply(this,arguments);const c=$("#sysCenter");if(c){c.insertAdjacentHTML("afterbegin",slot("system"));wireBanner(c)}};
  const _rev=renderReview;renderReview=function(){ensureProjectDefaults();_rev.apply(this,arguments);const st=$("#stage");if(st&&previewVer===null){st.insertAdjacentHTML("afterbegin",slot("site"));wireBanner(st)}
    const P=site().pages||{};$$("#pagetabs [data-p]").forEach(b=>{if(P[b.dataset.p])b.textContent=P[b.dataset.p]})};
  const _rail=renderReviewRail;renderReviewRail=function(){_rail.apply(this,arguments);const r=$("#rail-review");const id=S.sel&&S.sel.kind==="el"?S.sel.id:null;if(!id||(S.reviewTab||"panel")!=="panel")return;const card=$(".card.high",r);if(!card)return;
    card.querySelector(".row").insertAdjacentHTML("afterend",editorHTML(id));wireEditor(r,id)};
  const _ex=exploreList;exploreList=function(){if(S.directions&&S.directions.length)return S.directions;return S.pid==="p-mali"?_ex():[]};
  /* auto-run the next stage when the user moves forward and it hasn't been generated yet */
  const lock=$("#lockBtn");const _lock=lock.onclick;lock.onclick=e=>{_lock(e);if(genState("inspiration")==="none")runStage("inspiration")};
  document.addEventListener("click",e=>{const b=e.target.closest("#toSystem,#genBtn");if(!b)return;
    setTimeout(()=>{if(b.id==="toSystem"&&genState("system")==="none")runStage("system");if(b.id==="genBtn"&&genState("site")==="none")runStage("site")},0)},true);
  const _redraft=$("#redraftBtn");if(_redraft)_redraft.onclick=()=>confirmRegen("system",()=>runStage("system"));
})();

/* new projects: generate research as soon as the project opens */
function afterProjectCreated(){if(S.sources.some(s=>(s.text||"").trim()))runStage("research")}

/* styles for this file */
document.head.insertAdjacentHTML("beforeend",`<style>
.genbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:12px 16px;border-radius:12px;background:var(--primary-container);color:var(--on-primary-container);margin:0 0 12px}
.genbar>.ms{font-size:22px}.genbar .row{gap:8px;flex-wrap:wrap}
.genbar.done{background:var(--surface-container);color:var(--on-surface);padding:6px 6px 6px 14px}.genbar.done>.ms{font-size:18px;color:var(--primary)}
.genbar.warn{background:var(--tertiary-container,var(--surface-container-high));color:var(--on-tertiary-container,var(--on-surface))}
.genbar.busy{background:var(--surface-container-high);color:var(--on-surface)}
.spin{width:22px;height:22px;border-radius:50%;border:3px solid var(--outline-variant);border-top-color:var(--primary);animation:spin 0.9s linear infinite;flex:none}
@keyframes spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.spin{animation-duration:3s}}
.cedit{border-top:1px solid var(--outline-variant);padding-top:8px;margin-top:8px}.cedit summary{cursor:pointer;padding:4px 0}.cedit .field{margin-top:8px}
.cedit textarea,.cedit input{width:100%;box-sizing:border-box;font:inherit;font-size:13.5px}
#stage>[data-genslot]{margin:0 0 12px}
</style>`);
try{if(S&&S.pid){syncEL();renderAll()}}catch(e){console.error(e)}
