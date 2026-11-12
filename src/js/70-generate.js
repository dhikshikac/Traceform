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
function genericTokens(){const v=vocab(S.type);return seedTokens().map(t=>{const o={...t,edited:false,prev:[],why:"Template default · generate from research to replace",not:""};
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
function insightDump(){return S.themes.map(t=>`[${t.name}] `+t.cards.map(c=>`${c.id}: ${c.text}${c.conf?` [${c.conf} confidence]`:""} (${(c.quotes||[c.quote]).filter(Boolean).join(" / ")})`).join(" ; ")).join("\n")||"(none yet)"}
/* The later stages were only told a reference's title, so the designer's actual
   annotations - the specific parts they chose and why - never reached the model.
   Send each annotated part, where on the reference it sits, and the concrete
   palette and type of anything borrowed from a direction. */
function inspirationDump(){
  if(!S.tiles.length)return"(none saved)";
  const where=sel=>{if(!sel)return"";const x=sel.x+sel.w/2,y=sel.y+sel.h/2;
    return` [${y<.34?"top":y>.66?"bottom":"middle"} ${x<.34?"left":x>.66?"right":"centre"} of the reference]`};
  return S.tiles.map(t=>{
    const lines=[`REFERENCE: ${t.title}${t.url?` (real site: ${t.url})`:""}`];
    if(t.whole)lines.push("  borrowing: THE ENTIRE REFERENCE");
    (t.annotations||[]).forEach((a,i)=>lines.push(`  part ${i+1}${where(a.selection)}: ${a.note}`));
    /* References saved before annotations existed (and the seeded ones) say what
       to take in "borrow"; that sentence used to be dropped, so they reached the
       model as "nothing chosen". A counter-example is kept, as something to avoid. */
    const legacy=!t.whole&&!(t.annotations||[]).length?String(t.borrow||"").trim():"";
    if(/^nothing\b/i.test(legacy))lines.push(`  COUNTER-EXAMPLE, do not imitate: ${t.why||t.desc||"kept for contrast"}`);
    else if(legacy&&!/^\(not yet chosen\)$/i.test(legacy))lines.push(`  borrow: ${legacy}${t.why&&!/^(from |uploaded)/i.test(t.why)?` (because: ${t.why})`:""}`);
    else if(!t.whole&&!(t.annotations||[]).length)lines.push("  (saved, but nothing chosen to borrow yet: take nothing from it)");
    if(t.whole&&t.desc)lines.push(`  what it is: ${t.desc}`);
    if(Array.isArray(t.colors)&&t.colors.length)lines.push(`  its colours: ${t.colors.join(", ")}`);
    const m=t.mock;
    if(m)lines.push(`  its palette: bg ${m.bg||"?"}, text ${m.fg||"?"}, accent ${m.cta||"?"}; display type ${String(m.font||"?").replace(/['"]/g,"")}`);
    if(t.siteBorrow)lines.push(`  take from the real site: ${t.siteBorrow}`);
    return lines.join("\n")}).join("\n")}
function tokenDump(){return(S.tokens||seedTokens()).map(t=>`${t.k}=${t.v}`).join("\n")}
function projectHeader(){const c=projectContext();const v=vocab(S.type);
  return[`PROJECT: ${S.project}`,
    `PROJECT TYPE: ${c.typeName}. Shape everything for this kind of project: typical pages here are ${v.pages.join(", ")}; the main things on offer are "${v.items.toLowerCase()}"; the primary action is usually "${v.cta}" (change it if the research points elsewhere).`,
    c.what&&`WHAT THEY'RE BUILDING: ${c.what}`,c.audience&&`WHO IT'S FOR: ${c.audience}`,c.context&&`DESIGNER'S CONTEXT: ${c.context}`,c.avoid&&`MUST NEVER LOOK OR FEEL LIKE: ${c.avoid}`,
    `AVOID-LIST (rejected assumptions and hard rules): ${avoidList().join("; ")||"(none)"}`,
    `HOW TO DECIDE: build what the project type and the designer's context call for (pages, sections, items, tone, primary action) and make every specific choice from the research. If the research contradicts the context, follow the research and say so. Write for the audience above.`].filter(Boolean).join("\n")}
const isHex=v=>/^#[0-9a-f]{6}$/i.test(String(v||""));
function imageKeyGuide(){return `Image slots: set "img" to a SHORT search phrase naming the SUBJECT of a real photograph: 2-4 plain nouns, no adjectives, no brand or person names. Say what the thing IS, not how it looks: "papaya salad mortar", "jewelers workbench", "nurse and patient", "potter at wheel". Adjectives like fresh, green, wooden or rustic match nothing and make the search worse. It is used to search a stock photo library, so describe what is IN the frame, not how it is shot. Base the subject on the research, not on the category. Put the reason the photo shows that, and any cropping or art direction, in "alt". Use "" for img only when no photograph belongs in that slot.`}

/* ---------- stage 1: research → themes, cards, assumptions ---------- */
async function aiResearch(){const names=S.sources.map(s=>JSON.stringify(s.name)).join(", ");
  const out=await aiRetry(()=>sample.json(`${projectHeader()}\n\nRESEARCH ARTIFACTS:\n${researchDump()}\n\nDo an affinity mapping of this research, the way a UX researcher would. THE RESEARCH DECIDES HOW MANY THEMES AND CARDS THERE ARE — as many as the findings genuinely support, and no more. A thin set of notes may yield two themes with one card each; a rich set may yield seven themes with several cards. Never pad to reach a number, never split one finding across two cards to make up the count, and never merge unrelated findings to reduce it. Every card must stand on its own evidence; if you cannot point to a quote for it, leave it out.\nEach card:\n- text: one plain sentence a designer can act on, specific to these people. No marketing language.\n- quotes: 1–3 pieces of evidence COPIED EXACTLY from the artifacts, character for character (do not fix grammar, shorten words or join sentences; under 30 words each), written as “exact words” — who said it. For a survey number, copy the line or row exactly. Every quote is checked against the artifact text and anything not found is flagged to the designer.\n- source: the artifact the first quote comes from, exactly one of: ${names||"(none)"}\n- conf: "high" if several sources or many respondents agree, "medium" if one strong source, "low" if one person or the sources disagree.\nUse only what is in the artifacts. Do not invent quotes, names or numbers. If two people disagree, make the disagreement its own card.\nAlso list 3–6 assumptions an AI design tool would make by default for this kind of project that this research does NOT support. Write each as a general pattern (e.g. "Hero features the category's best-known product"), never a single detail one person mentioned; "why" names the finding that contradicts it.\nJSON: {"themes":[{"name":string,"cards":[{"text":string,"quotes":[string],"source":string,"conf":"high"|"medium"|"low"}]}],"assumptions":[{"label":string,"why":string}]}`,{modelTier:"default"}));
  return out}
function applyResearch(out){
  const byName=n=>S.sources.find(s=>s.name.toLowerCase()===String(n||"").toLowerCase())||S.sources.find(s=>String(n||"").toLowerCase().includes(s.name.toLowerCase().replace(/\.[^.]+$/,"")));
  const qText=q=>q&&typeof q==="object"?`${q.text||q.quote||""}${q.who||q.speaker?" — "+(q.who||q.speaker):""}`:String(q||"");
  const themes=(out.themes||[]).filter(t=>t&&t.name).map(t=>({id:uid("t"),name:String(t.name),cards:(t.cards||[]).filter(c=>c&&c.text).map(c=>{const q=(Array.isArray(c.quotes)?c.quotes:[c.quote]).map(qText).map(s=>s.trim()).filter(Boolean);const src=byName(c.source)?.id||(typeof verifyQuote==="function"&&q[0]?verifyQuote(q[0]).src:"")||"";return{id:uid("c"),text:String(c.text),quotes:q,quote:q[0]||"",src,conf:["high","medium","low"].includes(c.conf)?c.conf:"medium",ai:true}})})).filter(t=>t.cards.length);
  if(!themes.length)throw Object.assign(new Error("empty"),{text:"The AI found no themes in the artifacts."});
  /* A pinned theme is the designer's own work: regeneration adds to it rather
     than replacing it. Anything the AI proposes under a name already pinned is
     dropped, so a regenerate cannot quietly duplicate a kept theme. */
  const pinned=(S.themes||[]).filter(t=>t.pinned);
  const taken=new Set(pinned.map(t=>String(t.name||"").trim().toLowerCase()));
  S.themes=[...pinned,...themes.filter(t=>!taken.has(String(t.name||"").trim().toLowerCase()))];
  const have=new Set(S.assume.map(a=>a.label.toLowerCase()));
  (out.assumptions||[]).forEach(a=>{if(a&&a.label&&!have.has(String(a.label).toLowerCase()))S.assume.push({id:uid("a"),label:String(a.label),from:String(a.why||"not supported by the research"),rej:true,ai:true})})}
function offlineResearch(){const themes=[];
  S.sources.filter(s=>(s.text||"").trim()).forEach(s=>{const sents=(s.text.match(/[^.!?\n]+[.!?]?/g)||[]).map(x=>x.trim()).filter(x=>x.length>20);const quotes=sents.filter(x=>/[“"]/.test(x));const cards=(quotes.length?quotes:sents).slice(0,3).map(x=>({id:uid("c"),text:x.replace(/[“”"]/g,"").slice(0,140),quotes:[x],quote:x,src:s.id,conf:"low"}));if(cards.length)themes.push({id:uid("t"),name:s.name.replace(/\.[^.]+$/,"").replace(/[_-]/g," "),cards})});
  if(themes.length)S.themes=themes}

/* ---------- stage 2: inspiration directions ---------- */
async function aiInspiration(){
  return aiRetry(()=>sample.json(`${projectHeader()}\n\nINSIGHTS:\n${insightDump()}\n\nSAVED REFERENCES:\n${inspirationDump()}\n\nPropose 3 distinct visual directions for this project's website, each grounded in a different insight above and none using anything on the avoid list. For each: a short name; one sentence describing it; what to borrow (layout, color, type, imagery or tone, concretely); which insight it comes from (cite the card id); a palette (bg, fg, accent, card as hex; fg on bg at least 4.5:1); a display font from [${FONTS.display.join(", ")}] and a body font from [${FONTS.body.join(", ")}]; a sample headline and subhead written for this project; a CTA label; three nav labels; three sample items (name, price or "").\n${imageKeyGuide()} Use "img" for the hero.\nJSON: {"directions":[{"name":string,"desc":string,"borrow":string,"why":string,"palette":{"bg":string,"fg":string,"accent":string,"card":string},"font":string,"body":string,"headline":string,"sub":string,"cta":string,"nav":[string],"items":[[string,string]],"img":string}]}`,{modelTier:"default"}))}
function directionFrom(d,i){const p=d.palette||{};const font=FONTS.display.includes(d.font)?d.font:"Fraunces";const body=FONTS.body.includes(d.body)?d.body:"Roboto";const fk=S.type==="restaurant"?["khaosoi","somtam","larb","curry","greens","rice","mango"]:[];
  return{id:"ai-"+uid(""),ai:true,site:String(d.site||"").slice(0,80),url:String(d.url||"").slice(0,300),siteBorrow:String(d.borrowFromSite||"").slice(0,200),name:String(d.name||`Direction ${i+1}`),desc:`${String(d.desc||"").trim().replace(/\.$/,"")}${d.desc?". ":""}${d.borrow?"Borrow: "+String(d.borrow).trim().replace(/\.$/,"")+".":""}${d.why?" ← "+d.why:""}`.trim(),
    mock:{name:S.project,bg:isHex(p.bg)?p.bg:"#FAFAF7",fg:isHex(p.fg)?p.fg:"#1C1C1C",card:isHex(p.card)?p.card:"#FFFFFF",cta:isHex(p.accent)?p.accent:"#3D5A80",font:`'${font}',Georgia,serif`,body:`'${body}',system-ui,sans-serif`,headline:String(d.headline||""),sub:String(d.sub||""),ctaText:String(d.cta||"Learn more"),nav:(d.nav||[]).slice(0,3).join(" · ")||undefined,img:IMG[d.img]?d.img:null,
      dishes:(d.items||[]).slice(0,3).map((x,j)=>[String(x[0]||x.name||""),String(x[1]||x.price||""),fk[(i+j)%fk.length]||""]),foot:(S.brief.match(/Audience:\s*(.+)/)||[])[1]||" "}}}
/* Asked together with everything else, the directions call produced JSON too long
   for a small model and came back truncated. Real-world references are a separate,
   much smaller request. */
async function aiRealSites(){const ds=S.directions||[];if(!ds.length)return;
  const list=ds.map((d,i)=>`${i}. ${d.name}: ${d.desc}`.slice(0,220)).join("\n");
  const out=await sample.json(`${projectHeader()}\n\nDIRECTIONS:\n${list}\n\nFor each direction above, name ONE real, currently live website that already does this well and that this project could learn from.\nRules: it must be a real organisation you are confident exists and can name the homepage of; relevant to this project's field; NOT a design gallery (no Awwwards, Dribbble, Behance, Pinterest) and not a generic platform (no Squarespace, Wix, Shopify). Prefer a specific independent business, studio, clinic or shop over a global brand. Give the plain homepage URL with no tracking parameters. "borrow" is one concrete clause saying what to take from it. If you are not confident the site exists, set "url" to "".\nJSON: {"sites":[{"i":number,"site":string,"url":string,"borrow":string}]}`,{modelTier:"default"});
  (out.sites||[]).forEach(x=>{const d=ds[Number(x.i)];if(!d)return;
    d.site=String(x.site||"").slice(0,80);d.url=String(x.url||"").slice(0,300);d.siteBorrow=String(x.borrow||"").slice(0,200)});
}
/* Three is enough to choose between; more turns Explore into a wall. */
const EXPLORE_MAX=3;
function applyInspiration(out){const ds=(out.directions||[]).filter(Boolean).slice(0,EXPLORE_MAX).map(directionFrom);if(!ds.length)throw Object.assign(new Error("empty"),{text:"The AI returned no directions."});S.directions=ds}
/* A model will invent a plausible URL, so nothing is presented as a real site
   until the server has confirmed it answers. Unverified ones keep the direction
   but lose the link, rather than sending anyone to a dead address. */
async function verifyDirectionSites(){const pid=currentPid();const ds=S.directions||[];const urls=ds.map(d=>d.url).filter(Boolean);
  if(!urls.length)return 0;
  let ok=new Map();
  try{
    const r=await fetch("/api/check-urls",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({urls})});
    if(!r.ok)throw new Error("check failed");
    (await r.json()).results.forEach(x=>ok.set(x.url,x));
  }catch{ds.forEach(d=>{d.urlChecked=false});return 0}
  if(!stillOnProject(pid))return 0;
  let live=0;
  ds.forEach(d=>{if(!d.url)return;
    // The checker reports the URL it ended on, so match on either form.
    const hit=ok.get(d.url)||[...ok.values()].find(x=>x.ok&&d.url&&x.url.startsWith(d.url.replace(/\/$/,"")));
    d.urlChecked=true;
    if(hit&&hit.ok){d.url=hit.url;d.urlHost=hit.host;live++}
    else{d.deadUrl=d.url;d.url=""}});
  save();return live}
function offlineInspiration(){const g=tv("color.ground"),i=tv("color.ink");const v=vocab(S.type);
  S.directions=[["Quiet and photographic","#F6F4EF","#1C1C1C","#3D5A80"],["Bold and graphic","#FFFFFF","#111111","#C2410C"],["Warm and editorial","#F3EDE3","#2A2520","#7A5C3E"]].map(([n,bg,fg,a],k)=>directionFrom({name:n,desc:"Template direction (AI offline).",palette:{bg,fg,accent:a,card:"#FFFFFF"},font:FONTS.display[k%FONTS.display.length],headline:S.project,sub:"",cta:v.cta,nav:v.nav.slice(0,3),items:[]},k))}

/* ---------- stage 3: design system ---------- */
async function aiSystem(){const toks=(S.tokens||genericTokens());
  return aiRetry(()=>sample.json(`${projectHeader()}\n\nINSIGHTS:\n${insightDump()}\n\nSAVED REFERENCES AND WHAT TO BORROW:\n${inspirationDump()}\n\nDraft this project's design tokens from the research and references. The saved references above are the designer's own choices: where a reference names a part to borrow, honour it concretely (a borrowed palette should show up in color.*, borrowed type in type.*, a borrowed layout or component idea in space.*/comp.*), and cite that reference by title in \"why\". Do not silently ignore a borrowed part; if one cannot be honoured, say why in the matching section of \"reasoning\". Keep exactly these keys and types:\n${toks.map(t=>`${t.k} (${t.type})`).join("\n")}\nRules: colors are hex; color.ink on color.ground at least 4.5:1; white text on color.accent at least 4.5:1; color.heat is a secondary signal color. type.display one of ${FONTS.display.join(", ")}; type.body one of ${FONTS.body.join(", ")}. comp.cta is the primary button label in curly quotes, e.g. “See the menu”. type.scale is font sizes in px, largest to smallest, as numbers only, e.g. "44 / 30 / 22 / 18 / 14" (the size nearest 16-18 is body text). space.scale is spacing steps in px, smallest to largest, numbers only, e.g. "8 / 16 / 24 / 40 / 64". shape.radius is three radii in px, small / medium / large, numbers only, e.g. "4 / 8 / 16". Put the reasoning for these in "why", never in the value. Other text tokens are short specs a developer can follow. A value never contains a card id or a citation; the evidence goes in "why". For each token give: why (cite the insight card id or reference), not (the generic choice it avoids), typical (the most common choice AI tools make for this token in this kind of project), typicalPct (your estimate, 0–100, of how often they make it) and minePct (your estimate of how often they make the choice you just made). Also one short paragraph of reasoning per section: base, color, type, space, imagery, components.\nJSON: {"tokens":[{"k":string,"v":string,"why":string,"not":string,"typical":string,"typicalPct":number,"minePct":number}],"reasoning":{"base":string,"color":string,"type":string,"space":string,"imagery":string,"components":string}}`,{modelTier:"default"}))}
/* What the design system's spec sheets show: sample copy and photographs for THIS
   project. Asked for separately, after the tokens: together the reply was long
   enough that a small model sometimes returned broken JSON, which failed the
   whole design system. On its own it is short, and if it fails the tokens stand. */
async function aiSystemKit(){const pick=k=>{const t=(S.tokens||[]).find(x=>x.k===k);return t?t.v:""};
  return aiRetry(()=>sample.json(`${projectHeader()}\n\nINSIGHTS:\n${insightDump()}\n\nSAVED REFERENCES AND WHAT TO BORROW:\n${inspirationDump()}\n\nDESIGN SYSTEM DECISIONS ALREADY MADE:\nimagery: ${pick("imagery")}\nmotif: ${pick("motif")}\nprimary button: ${pick("comp.cta")}\nitem card: ${pick("comp.dishCard")}\n\nSPEC SHEET CONTENT. Draft what this project's design-system spec sheets will show, so they illustrate THIS project and nothing generic.\nimagery.show: 3-4 photographs the site should use, following the imagery decision above. Each has "subject" (a stock-library search phrase: 2-4 plain nouns, no adjectives, no names), "what" (one line saying what the photo shows) and "why" (the finding or saved reference behind it, said in words, never a card id).\nimagery.avoid: 2-3 kinds of image this site must not use, each with why (draw on the rejected assumptions and the research).\nsamples is real copy in this organisation's own words, used to show the components: a headline; one body sentence; 3-4 nav labels; 2-3 of the main things on offer, each with a name, a one-line detail, and a price, date or status (or ""); one form field this site would really have (label, an example value, the error message); and 3-4 tags or filters these people would really use. No placeholders, and nothing invented: use only names, places, prices and facts that appear in the research above; where the research gives none, say it generally ("a local farm", no price) rather than making one up.\nJSON: {"imagery":{"show":[{"subject":string,"what":string,"why":string}],"avoid":[{"what":string,"why":string}]},"samples":{"headline":string,"body":string,"nav":[string],"items":[{"name":string,"detail":string,"meta":string}],"field":{"label":string,"example":string,"error":string},"chips":[string]}}`,{modelTier:"default"}))}
function applySystem(out){const old=S.tokens;const base=S.pid==="p-mali"?seedTokens():genericTokens();const got=new Map((out.tokens||[]).filter(o=>o&&o.k).map(o=>[o.k,o]));
  S.tokens=base.map(t=>{const o=got.get(t.k);if(!o)return t;let v=String(o.v??t.v);
    if(t.type==="color"&&!isHex(v))v=t.v;
    /* The scales drive the page's CSS, so they have to be numbers. A model that
       answers in prose ("18px base, generous") is read for the number it meant. */
    if(["type.scale","space.scale","shape.radius"].includes(t.k)){const n=(v.match(/\d+(?:\.\d+)?/g)||[]).map(Number).filter(x=>x<=200);const px=x=>Math.round(x);
      if(t.k==="type.scale"){const s=n.filter(x=>x>=9);if(s.length<3){const b=s[0]&&s[0]<=24?s[0]:16;v=[b*2.6,b*1.8,b*1.3,b,b*0.82].map(px).join(" / ")}}
      if(t.k==="space.scale"){const s=n.filter(x=>x>0);if(s.length<3){const b=s[0]&&s[0]<=16?s[0]:8;v=[b,b*2,b*3,b*5,b*8].map(px).join(" / ")}}
      if(t.k==="shape.radius"&&n.length<3){const b=n.length?n[0]:8;v=n.length===0&&/square|sharp|none/i.test(v)?"0 / 0 / 0":[b/2,b,b*1.5].map(px).join(" / ")}}if(t.type==="font"&&!(t.k==="type.display"?FONTS.display:FONTS.body).includes(v))v=t.v;
    const n={...t,v,why:String(o.why||t.why),not:String(o.not||""),edited:false,ai:true};if(o.typical){n.prev=[[String(o.typical),Math.max(0,Math.min(100,+o.typicalPct||50))]];
      // The AI's own estimate for the choice it made, when it gave one and the choice differs from the common one.
      const mp=Math.round(+o.minePct);if(mp>0&&mp<=100&&String(o.typical).trim().toLowerCase()!==v.trim().toLowerCase())n.prev.push([v,mp])}
    n.mine=mineLabel(n);return n});
  const T_=k=>S.tokens.find(t=>t.k===k);
  if(ratio(T_("color.ink").v,T_("color.ground").v)<4.5)T_("color.ink").v=ratio("#111111",T_("color.ground").v)>=4.5?"#111111":"#FFFFFF";
  if(ratio("#ffffff",T_("color.accent").v)<4.5){/* darken accent until white text passes */let c=T_("color.accent").v;for(let k=0;k<12&&ratio("#ffffff",c)<4.5;k++)c="#"+c.slice(1).match(/../g).map(h=>Math.round(parseInt(h,16)*0.88).toString(16).padStart(2,"0")).join("");T_("color.accent").v=c}
  S.reasons=out.reasoning&&typeof out.reasoning==="object"?Object.fromEntries(Object.entries(out.reasoning).map(([k,v])=>[k,String(v)])):S.reasons;
  // What "Reset to draft" on the Design system page goes back to.
  S.draftTokens=JSON.parse(JSON.stringify(S.tokens));
  if(typeof keepLocked==="function")keepLocked(old);
  S.baseSystem="custom";S.sysBuilt=true;S.tokensTemplated=true}
/* Sample copy and imagery for the spec sheets. Checked for shape; a system that
   came back without them simply has no kit, and the sheets fall back to what the
   project already has. */
function cleanKit(o){const im=o&&o.imagery,sm=o&&o.samples;if(!im&&!sm)return null;
  const s=(x,n)=>String(x==null?"":x).trim().slice(0,n||200);const arr=a=>Array.isArray(a)?a:[];const I=im||{},M=sm||{};
  return{imagery:{show:arr(I.show).filter(x=>x&&x.subject).slice(0,4).map(x=>({subject:s(x.subject,60).toLowerCase(),what:s(x.what),why:s(x.why)})),
      avoid:arr(I.avoid).filter(x=>x&&x.what).slice(0,4).map(x=>({what:s(x.what),why:s(x.why)}))},
    samples:{headline:s(M.headline,120),body:s(M.body,240),nav:arr(M.nav).map(x=>s(x,24)).filter(Boolean).slice(0,4),
      items:arr(M.items).filter(x=>x&&x.name).slice(0,3).map(x=>({name:s(x.name,60),detail:s(x.detail,140),meta:s(x.meta,40)})),
      field:M.field&&M.field.label?{label:s(M.field.label,90),example:s(M.field.example,80),error:s(M.field.error,140)}:null,
      chips:arr(M.chips).map(x=>s(x,28)).filter(Boolean).slice(0,4)}}}
function offlineSystem(){S.tokens=S.pid==="p-mali"?seedTokens():genericTokens();S.tokensTemplated=true;S.sysBuilt=true;S.kit=null;S.draftTokens=null}

/* ---------- stage 4: site content + review decisions ---------- */
function siteSchema(){return`{"brand":string,"pages":{"home":string,"menu":string,"order":string,"story":string},"navLinks":[4 strings],"cta":string,
"hero":{"headline":string,"sub":string,"caption":string,"img":string,"alt":string},
"side":{"img":string,"alt":string},   // a SECOND photo, a sibling of hero - never nested inside it
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
  return aiRetry(()=>sample.json(`${projectHeader()}\n\nINSIGHTS:\n${insightDump()}\n\nREFERENCES:\n${inspirationDump()}\n\nDESIGN TOKENS:\n${tokenDump()}\n\nWrite all content for this project's website as a FINISHED product ready to ship, not a skeleton to fill in later: real, specific copy drawn from the research (names, places, products, quotes), not generic marketing language, and nothing on the avoid list. Every field must carry real content. Never return a bracketed stand-in like [ITEM 1] or [DESCRIPTION]; the only brackets allowed are a genuine research gap, written as [ASK <who>] or [<FACT> - ask the owner], and at most one of those on the whole site. Write the way this particular organisation would speak: concrete nouns, the words the research shows these people actually use, and specifics (a dish, a farm, a clinic hour) over adjectives. Item descriptions run one or two real sentences, never a label. Headlines say something only this project could say. The site has four pages: home, a catalog page (key "menu"; e.g. ${v.pages[1]}), an action page (key "order"; e.g. ${v.pages[2]}) and an about page (key "story"). "items" are the main things on offer (5–8). "collections" are optional bundles or groups (0–3; empty list if they don't fit). "heat" is only for spice levels on food; otherwise 0. Where the research doesn't give a fact (price, hours, address), make up a plausible placeholder but wrap anything truly unknown in square brackets like [HOURS — ask the owner]. "items.gap" names one important missing item in brackets, or "". ${imageKeyGuide()}\nJSON (no extra keys): ${siteSchema()}`,{modelTier:"default"}))}
async function aiReview(){const W=site();const ids=Object.entries(elBase()).map(([id,e])=>`${id} (${genericElNames()[id]}, page ${e.page})`).join("\n");
  return aiRetry(()=>sample.json(`${projectHeader()}\n\nINSIGHTS:\n${insightDump()}\n\nSAVED REFERENCES AND WHAT TO BORROW:\n${inspirationDump()}\n\nTOKENS:\n${tokenDump()}\n\nSITE CONTENT:\n${JSON.stringify(W).slice(0,9000)}\n\nFor each page element below, write the design decision record a reviewer will see. receipt: "what was decided ← evidence" citing the insight card id, the quote, or the saved reference by title (and which annotated part, when that part drove the decision); use "" when neither the research nor a saved reference supports it (the AI decided alone). Where an element reflects something the designer chose to borrow, name that reference rather than the research alone. gaps: research that is missing or unused for this element, each starting with a [TAG] like "[PHOTO] real photo of the shop". typical: 2–3 options with your estimated % of AI-generated sites of this kind that choose each, the last one being this design's choice; mine: the label of this design's choice. name: a short element name for this project.\nELEMENTS:\n${ids}\nJSON: {"review":{"<element id>":{"name":string,"receipt":string,"gaps":[string],"typical":[[string,number]],"mine":string}}}`,{modelTier:"default"}))}
function mergeShape(base,ai){if(ai==null)return base;if(Array.isArray(base))return Array.isArray(ai)&&ai.length?ai:base;
  if(base&&typeof base==="object"){if(typeof ai!=="object"||Array.isArray(ai))return base;const o={...base};Object.keys(ai).forEach(k=>{o[k]=k in base?mergeShape(base[k],ai[k]):ai[k]});return o}
  return typeof ai===typeof base||(typeof base==="string"&&typeof ai==="number")?(typeof base==="string"?String(ai):ai):base}
/* The model occasionally nests a top-level section inside another (usually "side"
   inside "hero"). Left alone, that section keeps its template text and the page
   renders "[ART DIRECTION]" to the user. Lift any stray section back out. */
const SITE_SECTIONS=["side","info","lead","items","collections","story","location","footer","catalog","action","about"];
function hoistSections(out){if(!out||typeof out!=="object")return out;
  SITE_SECTIONS.forEach(k=>{
    if(out[k]&&!(k==="side"&&!out[k].img))return;
    for(const host of ["hero","side","story","about","items"]){
      const h=out[host];
      if(h&&typeof h==="object"&&h[k]&&typeof h[k]==="object"){out[k]=h[k];delete h[k];break}
    }
  });
  return out}
/* templateSite() seeds every field with a bracketed stand-in so an offline draft
   still renders. mergeShape keeps that stand-in wherever the AI omitted a field,
   which is why finished pages showed "[ITEM 1]" and "[DESCRIPTION - generate from
   research]" as if they were content. Those are stripped here.
   A research gap the AI was asked to flag - "[ASK MALI] third dish" - is a real
   finding and is deliberately kept. */
const TEMPLATE_RESIDUE=/\[(ITEM \d+|DESCRIPTION|ONE-LINE DESCRIPTION|LEAD SENTENCE|SHORT STORY|STORY|KEY FACT|DETAIL|ADDRESS OR LINK|A REAL QUOTE FROM THE RESEARCH|ART DIRECTION)\b/i;
const isResidue=v=>typeof v==="string"&&(TEMPLATE_RESIDUE.test(v)||/generate from research/i.test(v));
function stripResidue(o){
  if(Array.isArray(o))return o.map(stripResidue).filter(x=>!(typeof x==="string"&&!x)&&!(x&&typeof x==="object"&&!Object.keys(x).length));
  if(o&&typeof o==="object"){const r={};Object.keys(o).forEach(k=>{r[k]=stripResidue(o[k])});return r}
  return isResidue(o)?"":o}
function cleanSite(W){
  const C=stripResidue(W);
  // An item with no name is residue, not a product.
  C.items.list=(C.items.list||[]).filter(d=>String(d.n||"").trim());
  C.collections.list=(C.collections.list||[]).filter(b=>String(b.n||"").trim());
  C.info.lines=(C.info.lines||[]).filter(l=>String(l[0]||"").trim()||String(l[1]||"").trim());
  C.location.lines=(C.location.lines||[]).filter(l=>String(l[0]||"").trim()||String(l[1]||"").trim());
  C.about.paragraphs=(C.about.paragraphs||[]).filter(x=>String(x||"").trim());
  return C}
function applySite(out){out=hoistSections(out);const base=templateSite();const W=mergeShape(base,out||{});
  // A page name is a nav label. The model sometimes writes a sentence there.
  Object.keys(base.pages).forEach(k=>{const v=String(W.pages[k]||"").trim();W.pages[k]=v&&v.length<=24?v:base.pages[k]});const okImg=k=>{k=String(k||"").trim();if(!k)return"";if(IMG[k]||/^user:\d+$/.test(k))return k;return k.length>2&&k.length<=120?k.toLowerCase():""};
  W.hero.img=okImg(W.hero.img);W.side.img=okImg(W.side.img);W.story.img=okImg(W.story.img);W.about.img=okImg(W.about.img);W.location.img=okImg(W.location.img);W.location.map=S.pid==="p-mali";
  W.items.list=(W.items.list||[]).map(d=>({n:String(d.n||""),d:String(d.d||""),p:String(d.p??""),tags:(d.tags||[]).map(String).slice(0,3),img:okImg(d.img),alt:String(d.alt||d.n||""),group:String(d.group||W.catalog.title),heat:S.type==="restaurant"?Math.max(0,Math.min(3,+d.heat||0)):0})).filter(d=>d.n);
  W.collections.list=(W.collections.list||[]).map(b=>({n:String(b.n||""),i:String(b.i||""),p:String(b.p??""),img:okImg(b.img),alt:String(b.alt||b.n||"")})).filter(b=>b.n);
  W.about.photos=(W.about.photos||[]).map(p=>Array.isArray(p)?[okImg(p[0]),String(p[1]||"")]:[ "",String(p)]);
  W.items.show=Math.min(3,Math.max(2,+W.items.show||3));
  S.site=cleanSite(W);S.siteBuilt=true;const ct=S.tokens&&S.tokens.find(t=>t.k==="comp.cta");if(ct&&W.cta&&!(S.design&&S.design.html))ct.v=`“${W.cta}”`;S.elements={}}
function applyReview(out){const r=out&&out.review;if(!r||typeof r!=="object")return;S.review={};Object.keys(elBase()).forEach(id=>{if(r[id])S.review[id]=r[id]})}
function offlineSite(){S.site=templateSite();S.review=null}

/* ---------- runner ---------- */
function stageFns(){return{
  research:{ai:async()=>applyResearch(await aiResearch()),off:offlineResearch,done:"Themes and cards generated from your artifacts"},
  inspiration:{ai:async()=>{applyInspiration(await aiInspiration());try{await aiRealSites();await verifyDirectionSites()}catch(e){}},off:offlineInspiration,done:"Inspiration directions generated · save the ones you like"},
  system:{ai:async()=>{
    // One malformed reply is worth a second ask before the stage is called failed.
    let out;try{out=await aiSystem()}catch(e){if(e.code!=="bad_json")throw e;out=await aiSystem()}
    applySystem(out);
    S.kit=null;try{S.kit=cleanKit(await aiSystemKit())}catch(e){try{S.kit=cleanKit(await aiSystemKit())}catch(e2){}}},off:offlineSystem,done:"Design system generated from research + inspiration"},
  site:{ai:async()=>{
    /* The page is designed outright (75-design-page.js) rather than poured into a
       fixed layout, and it is the whole of what the Review page shows. */
    applyHomePage(await aiHomePage());
    /* The older content model still feeds the exports, so it is refreshed too -
       but after the page is on screen, not before: waiting on two more requests
       kept a finished design hidden behind "Generating". Photos resolve in the
       background as well, once the frame is up. */
    const pid=S.pid;
    (async()=>{try{const site=await aiSite();if(S.pid!==pid)return;applySite(site);save();
      const rev=await aiReview();if(S.pid!==pid)return;applyReview(rev);syncEL();save()}catch(e){}})();
    },off:offlineSite,done:"Home page designed from your research, inspiration and design system"}}}
async function runStage(stage,opts={}){const G=gen();if(G.busy)return false;const pid=S.pid;const f=stageFns()[stage];
  // Saved inspiration is the designer's own work, never the AI's to replace.
  const keptTiles=JSON.parse(JSON.stringify(S.tiles||[]));
  const restoreTiles=()=>{const have=new Set((S.tiles||[]).map(x=>x.id));keptTiles.forEach(k=>{if(!have.has(k.id))(S.tiles=S.tiles||[]).push(k)})};
  G.busy=stage;refreshGenUI();let ok=true;
  try{
    if(sample){snapshot(`before AI generated ${stage}`);await f.ai()}else{f.off()}
    if(S.pid!==pid)return false;
    restoreTiles();
    S.gen=S.gen||{};S.gen[stage]=sample?"done":"template";save();
    if(!opts.quiet)toast(sample?f.done:`AI offline: filled ${stage} with a template. Connect an AI to generate from research.`);
  }catch(e){ok=false;if(S.pid===pid){restoreTiles();toast("Couldn't generate "+stage+": "+(e.text||e.code||e.message||"error"))}}
  finally{G.busy=null;if(S.pid===pid){syncEL();renderAll()}}
  return ok}
/* Build a stage on everything before it. Generating only the stage asked for
   meant a site drafted from template tokens - the same generic look for every
   project, whatever the research said - whenever the design system had never
   been generated. Stages that already exist are the designer's and are kept. */
function stageChain(){return["research","inspiration","system","site"]}
async function generateFrom(stage){
  if(gen().busy)return false;
  const chain=stageChain();const upto=chain.indexOf(stage);const pid=S.pid;
  if(sample&&S.themes.length)for(const st of chain.slice(1,Math.max(1,upto))){
    if(genState(st)!=="none")continue;
    const ok=await runStage(st,{quiet:true});
    if(!ok||S.pid!==pid)return false;      // a failure stops the chain rather than
  }                                        // building later stages on nothing
  return runStage(stage)}
function confirmRegen(stage,fn){const labels=Object.fromEntries(stages());const nPin=(S.themes||[]).filter(t=>t.pinned).length;
  const keeps=stage==="research"&&nPin?`<div class="body-m" style="margin-top:var(--sp-2)"><b>Your ${nPin} pinned theme${nPin===1?"":"s"} ${nPin===1?"is":"are"} kept.</b> Only unpinned themes are replaced.</div>`:stage==="inspiration"&&S.tiles.length?`<div class="body-m" style="margin-top:var(--sp-2)"><b>Your ${S.tiles.length} saved inspiration${S.tiles.length===1?"":"s"} and ${S.tiles.reduce((n,x)=>n+(x.annotations||[]).length,0)} annotated part${S.tiles.reduce((n,x)=>n+(x.annotations||[]).length,0)===1?"":"s"} are kept.</b> Only the Explore suggestions are redrawn.</div>`:"";dialog(`<span class="headline-s">Regenerate ${labels[stage]}?</span><div class="body-m">The AI reads your current research${stage!=="research"?" and earlier stages":""} and replaces the ${labels[stage]}. Your edits to ${labels[stage]} will be replaced${stage==="research"?"":"; you can restore the old version from History on the Review page"}.</div>${keeps}`,[["Cancel","text",()=>{}],["Regenerate","filled",fn]])}

/* ---------- banners ---------- */
function genBanner(stage){const G=gen();const st=genState(stage);const label=Object.fromEntries(stages())[stage];
  if(G.busy===stage)return`<div class="genbar busy" role="status"><span class="spin" aria-hidden="true"></span><div><b>Generating ${label}…</b><div class="body-s osv">The AI is reading your ${stage==="research"?"artifacts":"research and earlier stages"}.</div></div></div>`;
  const prior={research:"your uploaded artifacts",inspiration:"your themes, cards and assumptions",system:"your research and saved inspiration",site:"your research, inspiration and design system"}[stage];
  const extra="";   // the bar carries one action; project details live beside the artifacts
  if(st==="none")return`<div class="genbar"><span class="ms">auto_awesome</span><div style="flex:1;min-width:200px"><b>Generate ${label}</b><div class="body-s osv">AI drafts this from ${prior}. Everything it makes stays editable.</div></div><div class="row">${extra}<button class="btn filled sm" data-gen="${stage}" ${G.busy?"disabled":""}><span class="ms">auto_awesome</span>Generate</button></div></div>`;
  if(st==="template")return`<div class="genbar warn"><span class="ms">info</span><div style="flex:1;min-width:200px"><b>Template draft</b><div class="body-s osv">The AI was offline, so this is a fill-in template. Connect an AI provider and generate again to draft it from ${prior}.</div></div><div class="row">${extra}<button class="btn tonal sm" data-gen="${stage}" ${G.busy?"disabled":""}>Generate again</button></div></div>`;
  return`<div class="genbar done"><span class="ms">auto_awesome</span><div style="flex:1;min-width:200px" class="body-s">${!(S.gen&&S.gen[stage])?"Pre-generated sample":"Generated by AI"} from ${prior}${stage==="site"&&S.design&&S.design.html?" · click a section to see why":" · edit anything"}</div><div class="row">${extra}<button class="btn text sm" data-regen="${stage}" ${G.busy?"disabled":""}><span class="ms">refresh</span>Regenerate</button></div></div>`}
function wireBanner(root){if(!root)return;
  $$("[data-gen]",root).forEach(b=>b.onclick=()=>generateFrom(b.dataset.gen));
  $$("[data-regen]",root).forEach(b=>b.onclick=()=>confirmRegen(b.dataset.regen,()=>generateFrom(b.dataset.regen)));
  $$("[data-details]",root).forEach(b=>b.onclick=()=>openWizard(S.pid));
}
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
  const _research=renderResearch;renderResearch=function(){_research.apply(this,arguments);const s=$("#genslot-research");if(s){s.innerHTML=genBanner("research");wireBanner(s)}};
  const _insp=renderInspiration;renderInspiration=function(){ensureProjectDefaults();_insp.apply(this,arguments);const hd=$("#inspBody .insp-hd");if(hd){hd.insertAdjacentHTML("afterend",slot("inspiration"));wireBanner($("#inspBody"))}
    const ex=$$("#inspBody .insp-sec")[1];if(ex&&!exploreList().length)ex.querySelector(".refgrid").innerHTML=`<div class="note" style="grid-column:1/-1">No directions yet. Generate them above from your research.</div>`};
  const _sys=renderSystem;renderSystem=function(){ensureProjectDefaults();_sys.apply(this,arguments);const c=$("#sysCenter");if(c){c.insertAdjacentHTML("afterbegin",slot("system"));wireBanner(c)}};
  const _rev=renderReview;renderReview=function(){ensureProjectDefaults();_rev.apply(this,arguments);/* The generate bar sits in its own row above the page, as on the other stages,
     rather than inside the preview. It steps aside while an old version is previewed. */
    const gs=$("#genslot-review");if(gs){gs.innerHTML=previewVer===null?genBanner("site"):"";wireBanner(gs)}};
  const _rail=renderReviewRail;renderReviewRail=function(){_rail.apply(this,arguments);const r=$("#rail-review");const id=S.sel&&S.sel.kind==="el"?S.sel.id:null;if(!id||(S.design&&S.design.html)||(S.reviewTab||"panel")!=="panel")return;const card=$(".card.high",r);if(!card)return;
    card.querySelector(".row").insertAdjacentHTML("afterend",editorHTML(id));wireEditor(r,id)};
  const _ex=exploreList;exploreList=function(){if(S.directions&&S.directions.length)return S.directions;return S.pid==="p-mali"?_ex():[]};
  /* auto-run the next stage when the user moves forward and it hasn't been generated yet */
  const lock=$("#lockBtn");const _lock=lock.onclick;lock.onclick=e=>{_lock(e);if(genState("inspiration")==="none")runStage("inspiration")};
  /* Opening a stage builds it from everything decided so far. Previously only the
     Continue buttons did this, so reaching a stage from the nav rail showed the
     empty scaffold - a site of "[ITEM 1]" and stock nav labels with nothing to do
     with the project - and looked like broken generation rather than a stage that
     had simply never been run. */
  /* Opening a stage builds everything it rests on, in order. Generating only the
     stage you landed on meant a site drafted from template tokens and no saved
     inspiration - the same generic look for every project, whatever the research
     said - because the design system and inspiration stages had never run. */
  async function autoGenerate(stage){
    if(!sample||!stage)return;
    if(gen().busy)return;
    if(!S.themes.length)return;          // nothing to build from yet
    if(stageChain().indexOf(stage)<1||genState(stage)!=="none")return;
    await generateFrom(stage);
  }
  // The Review view is backed by the "site" stage; the other views match by name.
  const VIEW_STAGE={research:"research",inspiration:"inspiration",system:"system",review:"site"};
  const _go=go;go=function(v){_go.apply(this,arguments);setTimeout(()=>autoGenerate(VIEW_STAGE[v]),0)};
  document.addEventListener("click",e=>{const b=e.target.closest("#toSystem,#genBtn");if(!b)return;
    setTimeout(()=>{if(b.id==="toSystem")autoGenerate("system");if(b.id==="genBtn")autoGenerate("site")},0)},true);
  const _redraft=$("#redraftBtn");if(_redraft)_redraft.onclick=()=>confirmRegen("system",()=>generateFrom("system"));
})();

/* new projects: generate research as soon as the project opens */
function afterProjectCreated(){if(S.sources.some(s=>(s.text||"").trim()))runStage("research")}

/* styles for this file */
document.head.insertAdjacentHTML("beforeend",`<style>
.genbar{display:flex;gap:var(--sp-3);align-items:center;flex-wrap:wrap;padding:var(--sp-3) var(--sp-4);border-radius:12px;background:var(--primary-container);color:var(--on-primary-container);margin:0 0 var(--sp-3)}
.genbar>.ms{font-size:22px}.genbar .row{gap:var(--sp-2);flex-wrap:wrap}
.genbar.done{background:var(--surface-container);color:var(--on-surface);padding:var(--sp-2) var(--sp-2) var(--sp-2) var(--sp-4)}.genbar.done>.ms{font-size:18px;color:var(--primary)}
.genbar.warn{background:var(--tertiary-container,var(--surface-container-high));color:var(--on-tertiary-container,var(--on-surface))}
.genbar.busy{background:var(--surface-container-high);color:var(--on-surface)}
.spin{width:22px;height:22px;border-radius:50%;border:3px solid var(--outline-variant);border-top-color:var(--primary);animation:spin 0.9s linear infinite;flex:none}
@keyframes spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.spin{animation-duration:3s}}
.cedit{border-top:1px solid var(--outline-variant);padding-top:var(--sp-2);margin-top:var(--sp-2)}.cedit summary{cursor:pointer;padding:var(--sp-1) 0}.cedit .field{margin-top:var(--sp-2)}
.cedit textarea,.cedit input{width:100%;box-sizing:border-box;font:inherit;font-size:13.5px}
</style>`);
try{if(S&&S.pid){syncEL();renderAll()}}catch(e){console.error(e)}
