/* Multi-project store, landing page, new-project form. Overrides load()/save(). */
/* ============================ PROJECTS: landing, storage, new-project flow ============================ */
var STORE;
var PTYPES;
function _ptypes(){return {
  restaurant:{legacy:true,name:"Restaurant website",icon:"restaurant",desc:"Menu, ordering, story",assume:[["Brand name and tagline follow category clichés","common in AI-generated sites"],["Cultural identity shown through national symbols and stereotypes","common default"],["Hero features the cuisine's best-known dish, not the owners' own","category default"],["Decorative patterns borrowed from a generic “homey” style","stock cue"],["Primary action pushes ordering over browsing the menu","most AI layouts"]]},
  ecommerce:{legacy:true,name:"Online store",icon:"storefront",desc:"Products, cart, checkout",assume:[["Hero relies on rotating lifestyle imagery","common in AI-generated stores"],["Primary action is a generic “Shop now”","category default"],["Uniform product grid that ignores how customers actually choose","layout default"],["Marketing interruptions (pop-ups, banners) on first visit","common default"],["Minimal monochrome look regardless of the brand","template trope"],["Upbeat direct-to-consumer tone regardless of audience","copy default"]]},
  webapp:{name:"Web or desktop application",icon:"desktop_windows",desc:"Runs in a browser or on a computer",assume:[["Navigation copied from generic dashboards","common in AI-generated apps"],["Summary metrics lead, whatever users actually come to do","layout default"],["Framework default colors and type","template default"],["Charts used by default for any data","common default"],["Extra features added by default (themes, widgets)","AI add-on"]]},
  portfolio:{legacy:true,name:"Portfolio / studio",icon:"brush",desc:"Work, process, contact",assume:[["Dark, dramatic look by default","common in AI-generated portfolios"],["The maker's name dominates over the work","layout default"],["Uniform grid regardless of the work's shape","template default"],["Generic call to collaborate","copy trope"],["Decorative motion over content","AI flourish"]]},
  mobile:{name:"Native mobile app",icon:"smartphone",desc:"iOS or Android",assume:[["Standard tab-bar navigation regardless of the tasks","common default"],["Onboarding tour before the app shows any value","common default"],["Decorative splash and branding screens","trope"],["Default platform components left unchanged","template default"]]},
  nonprofit:{legacy:true,name:"Nonprofit / campaign",icon:"volunteer_activism",desc:"Mission, impact, donate",assume:[["Urgency-driven donation prompts everywhere","common default"],["Imagery that relies on pity rather than dignity","trope"],["Large impact numbers without context","common default"],["Soft, generic “caring” palette and icons","trope"]]},
  other:{name:"Something else",icon:"category",desc:"Describe it in the brief",assume:[["Generic centered hero on a gradient","common default"],["Feature cards with icons","common default"],["Social proof added by default","common default"]]}
}}
PTYPES=PTYPES||_ptypes();
const STEP_ORDER=["research","inspiration","system","review"];
const STEP_NAME={research:"Research",inspiration:"Inspiration",system:"Design system",review:"Review"};
function blankState(m,fixed){PTYPES=PTYPES||_ptypes();const k=fixed||"";const base=SEED();
  const st={...base,pid:m.id,type:m.type,project:m.name,brief:m.brief||"",view:m.view||"research",
    sources:m.sources||[],themes:m.themes||[],principles:m.principles||[],tiles:m.tiles||[],locked:!!m.locked,sysBuilt:false,tokens:null,elements:{},history:[],log:[],sel:null,userImgs:[],
    assume:(m.assume||PTYPES[m.type].assume.map((a,i)=>({id:"a"+k+i,label:a[0],from:a[1],rej:false})))};
  return st}
function makeSeedStore(){let mali=null;try{const j=localStorage.getItem("traceform-v1");mali=j?JSON.parse(j):null}catch{}
  mali=mali||SEED();Object.assign(mali,{pid:"p-mali",type:"restaurant",brief:mali.brief||"Website for Mali's Table, a family-run northern Thai restaurant in Minneapolis. Menu, ordering for pickup and delivery, and the family's story. Must feel like Mali's family, not generic “Thailand”.",view:mali.view||"review",sysBuilt:true,tokens:mali.tokens||seedTokens()});
  if(!(mali.design&&mali.design.html))mali.design=MALI_DESIGN();
  const coop=blankState({id:"p-coop",type:"ecommerce",name:"Riverbend Food Co-op",view:"research",brief:"Online ordering for pickup at a member-owned grocery in Duluth, MN. 3,100 members, many over 60. Weekly local produce changes; staff update stock by hand.",
    sources:[{id:"cs1",name:"member_survey_2026.csv",kind:"survey",star:true,text:"n=212. Shop online if available: 58%. Biggest worry: substitutions (41%), finding local items (33%). 64% are over 55."},{id:"cs2",name:"interview_produce_manager.pdf",kind:"interview",star:false,text:"'People want to know which farm it came from.' 'Stock changes Tuesday and Friday.'"},{id:"cs3",name:"project_brief.md",kind:"notes",star:false,text:"Online ordering for pickup; must work for older members; local farms first."}],
    themes:[{id:"ct1",name:"Where it's from",cards:[{id:"cc1",text:"Members choose by farm, not brand.",quote:"“People want to know which farm it came from” — produce manager",src:"cs2",conf:"high"}]},{id:"ct2",name:"Trust",cards:[{id:"cc2",text:"Substitutions are the top worry (41%); staff want flexibility.",quote:"member_survey_2026.csv · n=212",src:"cs1",conf:"medium"}]}],
    principles:[{id:"cp1",text:"Show the farm on every product.",hard:false}]},"c");
  const studio=blankState({id:"p-studio",type:"portfolio",name:"Hollis & Wren Ceramics",view:"inspiration",locked:true,brief:"Studio site for two potters in Asheville: shop drops, wholesale inquiries, and studio classes.",
    sources:[{id:"ss1",name:"owner_interview.pdf",kind:"interview",star:true,text:"'Our glazes are the brand.' 'Drops sell out in an hour; people need to know when.' 'Wholesale is 60% of revenue.'"},{id:"ss2",name:"instagram_insights.csv",kind:"survey",star:false,text:"Top posts: glaze close-ups (3.4x avg), kiln openings (2.8x)."}],
    themes:[{id:"st1",name:"Glaze is the brand",cards:[{id:"sc1",text:"Glaze close-ups outperform every other post 3.4x.",quote:"instagram_insights.csv",src:"ss2",conf:"high"}]}],
    principles:[{id:"sp1",text:"Lead with glaze, not the makers' faces.",hard:false},{id:"sp2",text:"Never hide the next drop date.",hard:true}],
    tiles:[{id:"sr1",type:"site",kind:"packet",title:"Celadon glaze close-ups",borrow:"palette",why:"sc1",imgk:"celadon"}]},"s");
  const clinic=blankState({id:"p-clinic",type:"webapp",name:"Parkside Clinic patient portal",view:"inspiration",locked:true,brief:"Patient portal for a community clinic: appointments, messages, test results. Many patients use phones and screen readers; three languages.",
    sources:[{id:"ks1",name:"patient_interviews (8).pdf",kind:"interview",star:true,text:"'I can't find my results.' 'The text is too small.' Spanish and Somali speakers need the portal in their language."},{id:"ks2",name:"support_tickets_Q3.csv",kind:"survey",star:false,text:"412 tickets. Password reset 38%, can't find results 22%, language 11%."}],
    themes:[{id:"kt1",name:"Finding results",cards:[{id:"kc1",text:"22% of support tickets are about finding test results.",quote:"support_tickets_Q3.csv",src:"ks2",conf:"high"}]}],
    principles:[{id:"kp1",text:"Results are one tap from the home screen.",hard:false},{id:"kp2",text:"Never below 18px body text.",hard:true}]},"k");
  const now=Date.now();
  return{current:"p-mali",list:[
    {id:"p-mali",name:mali.project,type:"restaurant",client:"Mali & Pim",updated:now-36e5*2,thumb:"overhead"},
    {id:"p-coop",name:coop.project,type:"ecommerce",client:"Riverbend Co-op",updated:now-864e5*1,thumb:"herbs"},
    {id:"p-studio",name:studio.project,type:"portfolio",client:"Hollis & Wren",updated:now-864e5*3,thumb:"celadon"},
    {id:"p-clinic",name:clinic.project,type:"webapp",client:"Parkside Clinic",updated:now-864e5*6,thumb:null}],
   states:{"p-mali":mali,"p-coop":coop,"p-studio":studio,"p-clinic":clinic}}}
/* ---- recently deleted ----
   A deleted project keeps its full state in STORE.trash so it can be put back
   exactly as it was. Entries expire after TRASH_DAYS, and the list is capped so
   localStorage can't fill up with abandoned projects. */
const TRASH_DAYS=30, TRASH_MAX=20;
function trashList(){if(!STORE.trash)STORE.trash=[];
  const cut=Date.now()-TRASH_DAYS*864e5;
  const before=STORE.trash.length;
  STORE.trash=STORE.trash.filter(e=>e&&e.at>cut).slice(0,TRASH_MAX);
  if(STORE.trash.length!==before)storeWrite();
  return STORE.trash}
function trashProject(id){const meta=STORE.list.find(p=>p.id===id);if(!meta)return null;
  const entry={at:Date.now(),meta:JSON.parse(JSON.stringify(meta)),state:JSON.parse(JSON.stringify(STORE.states[id]||{}))};
  trashList().unshift(entry);
  STORE.list=STORE.list.filter(p=>p.id!==id);delete STORE.states[id];
  if(STORE.current===id){STORE.current=STORE.list[0]?STORE.list[0].id:null;
    if(STORE.current)S=JSON.parse(JSON.stringify(STORE.states[STORE.current]))}
  storeWrite();return entry}
function restoreProject(id){const t=trashList();const i=t.findIndex(e=>e.meta.id===id);if(i<0)return false;
  const e=t.splice(i,1)[0];
  // A project created since the delete could have taken the id; give the restore a fresh one.
  let nid=e.meta.id;if(STORE.states[nid]){nid="p-"+Math.random().toString(36).slice(2,8);e.meta.id=nid;e.state.pid=nid}
  STORE.states[nid]=e.state;e.meta.updated=Date.now();STORE.list.push(e.meta);
  if(!STORE.current){STORE.current=nid;S=JSON.parse(JSON.stringify(e.state))}
  storeWrite();toast(`“${e.meta.name}” restored`);return true}
function purgeProject(id){const t=trashList();const i=t.findIndex(e=>e.meta.id===id);if(i<0)return false;
  t.splice(i,1);storeWrite();return true}
/* Seeded demo projects are defined in code, so one deleted long ago (or wiped with
   browser data) can always be rebuilt even when it is no longer in the trash. */
function missingSeeds(){const have=new Set(STORE.list.map(p=>p.id));
  // Something sitting in the trash is already offered there; don't list it twice.
  trashList().forEach(e=>have.add(e.meta.id));
  return makeSeedStore().list.filter(m=>!have.has(m.id))}
function rebuildSeed(id){const seed=makeSeedStore();const meta=seed.list.find(m=>m.id===id);if(!meta||STORE.states[id])return false;
  STORE.states[id]=seed.states[id];meta.updated=Date.now();STORE.list.push(meta);
  if(!STORE.current){STORE.current=id;S=JSON.parse(JSON.stringify(seed.states[id]))}
  storeWrite();toast(`“${meta.name}” rebuilt from the sample data`);return true}
/* A toast with one action. Deleting should be undoable without hunting for a menu. */
function toastUndo(msg,fn){const t=$("#toast");t.innerHTML="";
  t.append(msg+" ");
  const b=document.createElement("button");b.textContent="Undo";b.className="toast-act";
  b.onclick=()=>{t.classList.remove("on");fn()};
  t.append(b);t.classList.add("on");clearTimeout(toast.t);
  toast.t=setTimeout(()=>{t.classList.remove("on");t.textContent=""},8000)}
function storeRead(){try{const j=localStorage.getItem("traceform-projects");return j?JSON.parse(j):null}catch{return null}}
var storeWriteWarned=false;
function storeWrite(){try{localStorage.setItem("traceform-projects",JSON.stringify(STORE));storeWriteWarned=false}
  catch(e){
    // Silently swallowing this lost every later change without telling anyone.
    if(!storeWriteWarned){storeWriteWarned=true;
      try{toast(/quota/i.test(e.name||"")?"Out of browser storage \u2014 recent changes are not being saved":"Could not save to this browser")}catch{}
      try{console.error("traceform: save failed",e)}catch{}}
  }}
function oldAssumeRe(){return /Mama's|Mom makes|Pad Thai|gingham|lotus|elephant|turmeric|Tone: warm|lifestyle carousel|“Shop now”|4-column|Newsletter pop-up|black, white, one accent|emoji in headlines|Left sidebar|four KPI|#3B82F6|Inter everywhere|donut|Dark-mode toggle|Dark background|Huge name|Masonry|work together|Cursor-follow|five tabs|Three-screen onboarding|Gradient splash|Floating action|Donate now|close-up of a child|10k\+|hand icon|gradient$|Three feature cards|Testimonials carousel/i}
function migrateAssumptions(){if(!STORE||STORE.assumeV===2)return;PTYPES=PTYPES||_ptypes();const seed=SEED().assume;
  Object.values(STORE.states).forEach(st=>{if(!st||!Array.isArray(st.assume))return;const old=st.assume.filter(a=>oldAssumeRe().test(a.label));if(!old.length)return;const kept=st.assume.filter(a=>!oldAssumeRe().test(a.label));
    const fresh=st.pid==="p-mali"?seed:(PTYPES[st.type]||PTYPES.other).assume.map((a,i)=>({id:"g"+i+Math.random().toString(36).slice(2,5),label:a[0],from:a[1],rej:false}));st.assume=[...fresh,...kept]});
  STORE.assumeV=2;storeWrite()}
/* Saves made before Mali's Table shipped with a designed page get it too, so the
   example opens on the current Review page. A design already there is kept. */
function migrateMaliDesign(){const m=STORE&&STORE.states&&STORE.states["p-mali"];
  if(m&&!(m.design&&m.design.html)){m.design=MALI_DESIGN();storeWrite()}}
function load(){PTYPES=PTYPES||_ptypes();STORE=storeRead()||makeSeedStore();migrateAssumptions();migrateMaliDesign();const id=STORE.states[STORE.current]?STORE.current:STORE.list[0].id;STORE.current=id;return JSON.parse(JSON.stringify(STORE.states[id]))}
function save(){if(!STORE||!S)return;
  // Image data goes to IndexedDB (see 07-imagestore.js); localStorage keeps the key.
  try{adoptLooseImages()}catch{}
  const c={...S,
    tiles:S.tiles.map(t=>({...t,img:undefined})),
    userImgs:(S.userImgs||[]).map(u=>u.imgKey?{...u,src:undefined}:u),
    history:(S.history||[]).slice(-30)};
  STORE.states[S.pid]=c;const m=STORE.list.find(x=>x.id===S.pid);if(m){m.name=S.project;m.updated=Date.now()}storeWrite()}
function ago(t){const d=(Date.now()-t)/1000;if(d<60)return"just now";if(d<3600)return Math.round(d/60)+" min ago";if(d<86400)return Math.round(d/3600)+" h ago";return Math.round(d/86400)+" d ago"}

/* ---- landing ---- */
function showLanding(){save();document.body.classList.add("on-landing");$("#landing").hidden=false;$(".shell").hidden=true;$("#projChip").hidden=true;$("#exportBtn").parentElement.hidden=true;try{history.replaceState(null,"","#projects")}catch{}renderLanding()}
function showApp(){document.body.classList.remove("on-landing");$("#landing").hidden=true;$(".shell").hidden=false;$("#projChip").hidden=false;$("#exportBtn").parentElement.hidden=false}
function renderLanding(){const list=[...STORE.list].sort((a,b)=>b.updated-a.updated);
  $("#landFilters").innerHTML=`<span class="body-s osv">${list.length} projects · sorted by last edited</span>`;
  renderTrash();
  $("#projGrid").innerHTML=`<button class="pcard new" id="newProj2"><span class="ms" style="font-size:36px">add_circle</span><span class="title-m">New project</span><span class="body-s">Tell us what you're building</span></button>`+list.map(m=>{const st=STORE.states[m.id]||{};const t=PTYPES[m.type]||PTYPES.other;const vv=["trending","reference"].includes(st.view)?"inspiration":(st.view||"research");const si=STEP_ORDER.indexOf(vv);const cards=(st.themes||[]).reduce((n,x)=>n+x.cards.length,0);
    return`<div class="pcard" data-open="${m.id}" tabindex="0" role="button" aria-label="Open ${esc(m.name)}"><div class="pth">${m.thumb&&IMG[m.thumb]?`<img src="${IMG[m.thumb]}" alt="">`:`<div class="ptile" style="background:linear-gradient(135deg,var(--primary-container),var(--tertiary-container));color:var(--on-primary-container)"><span class="ms" style="font-size:52px">${t.icon}</span></div>`}<span class="badge p ty"><span class="ms" style="font-size:14px;margin-right:var(--sp-1)">${t.icon}</span>${esc(t.name)}</span></div>
      <div class="pb"><div class="row" style="flex-wrap:nowrap"><span class="title-m" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.name)}</span><div style="position:relative"><button class="icon-btn" data-pmenu="${m.id}" aria-label="Project options" style="width:32px;height:32px"><span class="ms">more_vert</span></button></div></div>
      <div class="body-s osv">${esc(m.client||"")}${m.client?" · ":""}edited ${ago(m.updated)}</div>
      <div class="steps5" aria-label="Step ${si+1} of 4">${STEP_ORDER.map((s,i)=>`<i class="${i<=si?"on":""}"></i>`).join("")}</div>
      <div class="row body-s"><span><b>${STEP_NAME[vv]}</b></span><span class="spacer"></span><span class="osv">${(st.sources||[]).length} artifact${(st.sources||[]).length===1?"":"s"} · ${cards} card${cards===1?"":"s"}</span></div></div></div>`}).join("");
  $("#newProj2").onclick=openWizard;
  $$("[data-open]").forEach(el=>{el.onclick=e=>{if(e.target.closest("[data-pmenu],.menu"))return;openProject(el.dataset.open)};el.onkeydown=e=>{if(e.key==="Enter"&&e.target===el)openProject(el.dataset.open)}});
  $$("[data-pmenu]").forEach(b=>b.onclick=e=>{e.stopPropagation();$$(".pmenu").forEach(m=>m.remove());const id=b.dataset.pmenu;const m=document.createElement("div");m.className="menu pmenu";m.innerHTML=`<button data-pa="open"><span class="ms">open_in_new</span>Open</button><button data-pa="details"><span class="ms">tune</span>Edit details</button><button data-pa="rename"><span class="ms">edit</span>Rename</button><button data-pa="dup"><span class="ms">content_copy</span>Duplicate</button><button data-pa="del"><span class="ms">delete</span>Delete</button>`;document.body.appendChild(m);placeMenu(m,b);
    $$("[data-pa]",m).forEach(x=>x.onclick=ev=>{ev.stopPropagation();m.remove();const a=x.dataset.pa;const meta=STORE.list.find(p=>p.id===id);
      if(a==="open")openProject(id);
      else if(a==="details")openWizard(id);
      else if(a==="rename")dialog(`<span class="headline-s">Rename project</span><div class="field"><label for="rnIn">Name</label><input id="rnIn" value="${esc(meta.name)}"></div>`,[["Cancel","text",()=>{}],["Rename","filled",()=>{const v=$("#rnIn").value.trim();if(!v)return;meta.name=v;STORE.states[id].project=v;if(S.pid===id)S.project=v;storeWrite();renderLanding()}]]);
      else if(a==="dup"){const nid="p-"+Math.random().toString(36).slice(2,8);const copy=JSON.parse(JSON.stringify(STORE.states[id]));copy.pid=nid;copy.project=meta.name+" (copy)";STORE.states[nid]=copy;STORE.list.push({...meta,id:nid,name:copy.project,updated:Date.now()});storeWrite();renderLanding();toast("Duplicated")}
      else if(a==="del")dialog(`<span class="headline-s">Delete “${esc(meta.name)}”?</span><div class="body-m">It moves to Recently deleted, where you can put it back for the next ${TRASH_DAYS} days.</div>`,[["Cancel","text",()=>{}],["Delete","filled",()=>{trashProject(id);renderLanding();toastUndo(`“${meta.name}” deleted`,()=>{restoreProject(id);renderLanding()})}]])})});
}
/* Position a card menu under its button, flipping up or clamping so it stays on screen. */
function placeMenu(m,btn){const b=btn.getBoundingClientRect();const mh=m.offsetHeight,mw=m.offsetWidth;const vh=innerHeight,vw=innerWidth;
  let top=b.bottom+4;if(top+mh>vh-8)top=Math.max(8,b.top-4-mh);
  let left=b.right-mw;left=Math.max(8,Math.min(left,vw-mw-8));
  m.style.top=top+"px";m.style.left=left+"px"}
document.addEventListener("click",()=>$$(".pmenu").forEach(m=>m.remove()));
/* Recently deleted + any sample project that is missing entirely. */
function renderTrash(){const t=trashList();const miss=missingSeeds();
  let host=$("#trashBar");
  if(!t.length&&!miss.length){if(host)host.remove();return}
  if(!host){host=document.createElement("div");host.id="trashBar";host.className="trashbar";
    $("#projGrid").parentElement.appendChild(host)}
  host.innerHTML=`${t.length?`<div class="row" style="flex-wrap:nowrap;gap:var(--sp-2)"><span class="ms">delete_outline</span><span class="title-s" style="flex:1">Recently deleted (${t.length})</span></div>
    <div class="col" style="gap:0">${t.map(e=>`<div class="shelfrow"><span class="ms osv">folder</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.meta.name)}</span><span class="body-s osv" style="margin-right:var(--sp-2)">deleted ${ago(e.at)}</span><button class="btn text sm" data-undel="${esc(e.meta.id)}"><span class="ms">restore_from_trash</span>Put back</button><button class="x" data-purge="${esc(e.meta.id)}" aria-label="Delete ${esc(e.meta.name)} permanently"><span class="ms" style="font-size:18px">delete_forever</span></button></div>`).join("")}</div>`:""}
    ${miss.length?`<div class="row" style="flex-wrap:nowrap;gap:var(--sp-2);margin-top:${t.length?"10px":"0"}"><span class="ms">auto_awesome</span><span class="title-s" style="flex:1">Sample projects not in this browser</span></div>
    <div class="col" style="gap:0">${miss.map(m=>`<div class="shelfrow"><span class="ms osv">folder_special</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.name)}</span><button class="btn text sm" data-reseed="${esc(m.id)}"><span class="ms">refresh</span>Rebuild</button></div>`).join("")}</div>
    <div class="body-s osv" style="margin-top:var(--sp-2)">Rebuilt from the sample data in the code, so any edits you made to them are not included.</div>`:""}`;
  $$("[data-undel]",host).forEach(b=>b.onclick=()=>{restoreProject(b.dataset.undel);renderLanding()});
  $$("[data-reseed]",host).forEach(b=>b.onclick=()=>{rebuildSeed(b.dataset.reseed);renderLanding()});
  $$("[data-purge]",host).forEach(b=>b.onclick=()=>{const e=trashList().find(x=>x.meta.id===b.dataset.purge);
    dialog(`<span class="headline-s">Delete “${esc(e.meta.name)}” permanently?</span><div class="body-m">This removes it from this browser for good. It cannot be undone.</div>`,[["Cancel","text",()=>{}],["Delete permanently","filled",()=>{purgeProject(b.dataset.purge);renderLanding();toast("Deleted permanently")}]])});
}
function openProject(id){const sv=STORE.states[id];if(sv&&["trending","reference"].includes(sv.view))sv.view="inspiration";if(S&&S.pid&&S.pid!==id)save();STORE.current=id;S=JSON.parse(JSON.stringify(STORE.states[id]));if(!S.tokens&&S.type==="restaurant")S.tokens=seedTokens();
  try{rTurns=[];pTurns=[];previewVer=null}catch{}storeWrite();showApp();setProjChip();go(S.view||"research");hydrateAndRender()}
function setProjChip(){const t=PTYPES[S.type]||PTYPES.restaurant;$("#projChip").innerHTML=`<span class="ms" style="font-size:16px">${t.icon}</span>${esc(S.project)}`;$("#projChip").title="Switch project";}

/* ---- new project wizard ---- */
function openWizard(editId){const ed=editId?STORE.states[editId]:null;const ec=ed?projectContext(ed):null;
  const W={step:1,type:"",typeChoice:ed?ed.type:"auto",what:ec?ec.what:"",name:ed?ed.project:"",client:"",audience:ec?ec.audience:"",goal:"",brief:ec?ec.context:"",avoid:ec?ec.avoid:"",platform:"Web",files:[],aiAssume:!!sample};
  const d=document.createElement("div");d.className="dialog";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-labelledby","wzT");document.body.appendChild(d);
  const close=()=>d.remove();d.onclick=e=>{if(e.target===d)close()};d.onkeydown=e=>{if(e.key==="Escape")close()};
  const draw=()=>{
    d.innerHTML=`<div class="box" style="width:min(640px,100%)"><span class="headline-s" id="wzT">${ed?"Project details":"New project"}</span>${ed?`<div class="body-s osv">The AI uses these details, with your research, at every stage. Regenerate a stage to apply changes.</div>`:""}
      <div class="field"><label for="wzWhat">What are you building? *</label><textarea id="wzWhat" rows="4" placeholder="e.g. an online ordering site for a neighborhood food co-op">${esc(W.what)}</textarea></div>
      <div class="field"><label for="wzType">What kind of project is it? *</label><select id="wzType"><option value="auto" ${W.typeChoice==="auto"?"selected":""}>Decide from my description${W.what?` (${(PTYPES[guessType(W.what+" "+W.brief)]||PTYPES.other).name})`:""}</option>${Object.entries(PTYPES).filter(([k,t])=>!t.legacy||W.typeChoice===k).map(([k,t])=>`<option value="${k}" ${W.typeChoice===k?"selected":""}>${esc(t.name)}</option>`).join("")}</select></div>
      <div class="field"><label for="wzName">Project name *</label><input id="wzName" value="${esc(W.name)}" placeholder="e.g. Riverbend Food Co-op"></div>
      <div class="field"><label for="wzWho">Who is it for? *</label><input id="wzWho" value="${esc(W.audience)}" placeholder="e.g. members over 55, mostly on phones"></div>
      <div class="field"><label for="wzBrief">Add context *</label><textarea id="wzBrief" rows="4" placeholder="Background, constraints, what you already know about the people you're designing for.">${esc(W.brief)}</textarea></div>
      
      <div class="row" style="justify-content:flex-end"><button class="btn text" id="wzCancel">Cancel</button><button class="btn filled" id="wzNext">${ed?"Save details":"Create project"}</button></div></div>`;
    $("#wzCancel",d).onclick=close;
    $("#wzType",d).onchange=e=>{W.typeChoice=e.target.value};
    $("#wzNext",d).onclick=()=>{grab();const need=[["#wzWhat",W.what,"Say what you're building"],["#wzName",W.name,"Give the project a name"],["#wzWho",W.audience,"Say who it's for"],["#wzBrief",W.brief,"Add some context"]];for(const[sel,val,msg]of need){if(!String(val||"").trim()){$(sel,d)?.focus();toast(msg);return}}if(!W.typeChoice){$("#wzType",d)?.focus();toast("Pick a kind of project");return}
      W.type=W.typeChoice&&W.typeChoice!=="auto"?W.typeChoice:guessType(W.what+" "+W.brief);if(ed){saveDetails(editId,W);close();return}create()};
    setTimeout(()=>$("#wzWhat",d)?.focus(),0)};
  const grab=()=>{const v=id=>$(id,d)?.value;W.typeChoice=v("#wzType")??W.typeChoice;W.what=v("#wzWhat")??W.what;W.name=v("#wzName")??W.name;W.audience=v("#wzWho")??W.audience;W.brief=v("#wzBrief")??W.brief;W.avoid=v("#wzAvoid")??W.avoid};
  const create=async()=>{const id="p-"+Math.random().toString(36).slice(2,8);
    const briefText=[`Building: ${W.what}`,W.goal&&`Goal: ${W.goal}`,W.client&&`Client: ${W.client}`,W.audience&&`Audience: ${W.audience}`,W.brief&&`Context: ${W.brief}`,W.avoid&&`Must never feel like: ${W.avoid}`].filter(Boolean).join("\n");
    const st=blankState({id,type:W.type,name:W.name.trim(),brief:briefText,sources:[{id:uid("s"),name:"project_brief.md",kind:"notes",star:true,text:briefText},...W.files.map(f=>({id:uid("s"),name:f.name,kind:/csv/i.test(f.name)?"survey":"notes",star:false,text:f.text}))],
      principles:W.avoid?[{id:uid("p"),text:`Never feel like ${W.avoid.replace(/\.$/,"")}.`,hard:true,fromAvoid:true}]:[]},id.slice(2));
    st.context={what:W.what.trim(),audience:W.audience.trim(),context:W.brief.trim(),avoid:W.avoid.trim()};
    STORE.states[id]=st;STORE.list.push({id,name:st.project,type:W.type,client:W.client,updated:Date.now(),thumb:null});storeWrite();close();openProject(id);toast("Project created · start by reviewing the assumptions");
    afterProjectCreated()};
  draw()}

function guessType(t){t=t.toLowerCase();if(/\b(ios|android|native app|mobile app|phone app|app store|play store|swiftui|react native|flutter)\b/.test(t))return"mobile";if(/\b(website|web app|web-app|webapp|site|portal|dashboard|desktop|saas|platform|store|shop|browser)\b/.test(t))return"webapp";return"other"}
/* Structured project context. New projects store it; older ones are parsed from the brief. */
function projectContext(st){st=st||S;const b=st.brief||"";const line=re=>(b.match(re)||[])[1]||"";
  if(!st.context&&st.pid==="p-mali")st.context={what:"A website for Mali's Table, a family-run northern Thai restaurant in Minneapolis: menu, pickup and delivery ordering, and the family's story",audience:"Regulars and neighbors, mostly ordering pickup on their phones",context:"Mali cooks; her daughter Pim runs the front and wants it to feel modern, Mali wants it to feel like home. Survey: 81% look at photos first, 62% order online.",avoid:"generic “Thailand”: elephants, gold, temples"};
  const first=(b.split(/(?<=\.)\s/)[0]||"").trim();
  const c=st.context||{what:line(/Building:\s*(.+)/)||first,audience:line(/Audience:\s*(.+)/),context:line(/Context:\s*([\s\S]+?)(?:\n[A-Z][a-z ]+:|$)/)||(!/^(Building|Goal|Client|Audience|Context|Must never feel like):/m.test(b)?b:""),avoid:line(/Must never feel like:\s*(.+)/)};
  return{...c,type:st.type,typeName:(PTYPES[st.type]||PTYPES.other).name}}
function saveDetails(id,W){const st=STORE.states[id]||S;const live=S.pid===id?S:st;
  live.context={what:W.what.trim(),audience:W.audience.trim(),context:W.brief.trim(),avoid:W.avoid.trim()};live.type=W.type;if(W.name.trim())live.project=W.name.trim();
  live.brief=[`Building: ${live.context.what}`,live.context.audience&&`Audience: ${live.context.audience}`,live.context.context&&`Context: ${live.context.context}`,live.context.avoid&&`Must never feel like: ${live.context.avoid}`].filter(Boolean).join("\n");
  const src=live.sources.find(x=>x.name==="project_brief.md");if(src)src.text=live.brief;else live.sources.unshift({id:uid("s"),name:"project_brief.md",kind:"notes",star:true,text:live.brief});
  live.principles=live.principles.filter(p=>!p.fromAvoid);if(live.context.avoid)live.principles.unshift({id:uid("p"),text:`Never feel like ${live.context.avoid.replace(/\.$/,"")}.`,hard:true,fromAvoid:true});
  const meta=STORE.list.find(p=>p.id===id);if(meta){meta.name=live.project;meta.type=live.type;meta.updated=Date.now()}
  if(S.pid===id){save()}else{STORE.states[id]=live;storeWrite()}
  if(!$("#landing").hidden)renderLanding();else renderAll();toast("Details saved · regenerate a stage to use them")}
/* ---- wiring ---- */
$("#newProj").onclick=openWizard;
$("#homeBtn").onclick=showLanding;$("#homeTtl").onclick=showLanding;$("#homeTtl").onkeydown=e=>{if(e.key==="Enter")showLanding()};
$("#projChip").style.cursor="pointer";$("#projChip").onclick=showLanding;
window.addEventListener("hashchange",()=>{if(location.hash==="#projects")showLanding()});
(function landingBoot(){setProjChip();const h=location.hash.replace("#","");if(STEP_ORDER.includes(h)){showApp()}else showLanding()})();
