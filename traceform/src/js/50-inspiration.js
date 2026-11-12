/* Inspiration page (saved references, annotations, explore). */
/* ============================ INSPIRATION (replaces Trending + Reference) ============================ */
function exploreList(){return[
  ...TREND.similar.map(x=>({id:x.id,name:x.title.split(" — ")[0],desc:x.title.split(" — ")[1]||"",mock:x.o})),
  ...TREND.featured.map(x=>({id:x.id,name:x.title.split(" — ")[0],desc:x.title.split(" — ")[1]||"",mock:x.o})),
  {id:"ph-overhead",name:"Editorial food photography",desc:"Overhead, several plates, hands in frame",imgk:"overhead"},
  {id:"ph-hands",name:"People-first storytelling",desc:"Hands at work, process over product",imgk:"hands"},
  {id:"ph-celadon",name:"Celadon ceramics",desc:"Glaze palette and soft shapes",imgk:"celadon"},
  {id:"ph-board",name:"Hand-lettered menu board",desc:"One expressive display line",imgk:"board"},
  {id:"ph-herbs",name:"Garden herbs",desc:"Texture and natural greens",imgk:"herbs"}]}
function refThumb(r,big){const ex=r.from?exploreList().find(e=>e.id===r.from):null;const m=r.mock||ex?.mock;
  if(r.img||r.imgk||(!m&&ex?.imgk))return`<img src="${r.img||IMG[r.imgk||ex.imgk]}" alt="${esc(r.title||r.name||"")}" draggable="false">`;
  if(m)return mock(m,big);
  if(r.colors)return`<div class="pal" style="display:flex;width:100%;height:100%">${r.colors.map(c=>`<i style="flex:1;background:${esc(c)}"></i>`).join("")}</div>`;
  return`<div style="display:grid;place-items:center;height:100%;padding:12px;text-align:center;background:var(--surface-container-highest)"><span class="mono">${esc(r.title||"")}</span></div>`}
function annoRect(a,i){return`<span class="arect" style="left:${a.selection.x*100}%;top:${a.selection.y*100}%;width:${a.selection.w*100}%;height:${a.selection.h*100}%"><b>${i+1}</b></span>`}
function annoRects(r){return(r.annotations||[]).map(annoRect).join("")}
function syncBorrow(t){const notes=(t.annotations||[]).map(a=>a.note);t.borrow=t.whole?"the entire reference"+(notes.length?"; especially: "+notes.join("; "):""):notes.length?notes.join("; "):"(not yet chosen)"}
function savedFromExplore(id){return S.tiles.find(t=>t.from===id)}
function renderInspiration(){const root=$("#inspBody"),rail=$("#rail-inspiration");if(!root||!rail)return;const saved=S.tiles;
  const annotated=saved.flatMap(t=>(t.annotations||[]).map((a,i)=>({t,a,i})));
  const savedCard=t=>`<div class="refcard" data-ref="${t.id}"><div class="refthumb">${refThumb(t)}${annoRects(t)}<button class="btn tonal sm rmref" data-rmref="${t.id}" aria-label="Remove ${esc(t.title)}"><span class="ms">delete</span>Remove</button></div><div class="refinfo"><div class="row" style="flex-wrap:nowrap"><span class="title-s" style="flex:1;min-width:0">${esc(t.title)}</span><span class="badge ok">Saved</span></div>
    ${t.whole?`<span class="badge ok" style="align-self:flex-start"><span class="ms" style="font-size:14px;margin-right:4px">done_all</span>Borrowing entire reference</span>`:""}
    ${(t.annotations||[]).map((a,i)=>`<div class="annonote"><b>${i+1}</b><span style="flex:1">${esc(a.note)}</span><button class="x" data-rmanno="${t.id}:${i}" aria-label="Remove annotation ${i+1}"><span class="ms" style="font-size:16px">close</span></button></div>`).join("")}
    ${!t.whole&&!(t.annotations||[]).length?`<div class="body-s osv">Nothing chosen yet. Select a part or borrow everything.</div>`:""}
    <div class="refactions"><button class="btn tonal sm" data-part="saved:${t.id}"><span class="ms">crop</span>Select part & annotate</button><button class="btn ${t.whole?"outlined":"tonal"} sm" data-whole="saved:${t.id}"><span class="ms">${t.whole?"remove_done":"done_all"}</span>${t.whole?"Borrowing all ✓":"Borrow everything"}</button></div></div></div>`;
  const annoCard=({t,a,i})=>`<article class="insp-anno"><div class="insp-anno-preview">${refThumb(t)}${annoRect(a,i)}</div><div class="insp-anno-meta"><span class="title-s">${esc(t.title)}</span><div class="annonote"><b>${i+1}</b><span style="flex:1">${esc(a.note)}</span></div><button class="btn text sm insp-anno-remove" data-rmanno="${t.id}:${i}" aria-label="Remove annotated part ${i+1} from ${esc(t.title)}"><span class="ms">close</span>Remove</button></div></article>`;
  const exCard=e=>{const s=savedFromExplore(e.id);return`<div class="refcard"><div class="refthumb">${e.mock?mock(e.mock):`<img src="${IMG[e.imgk]}" alt="${esc(e.name)}" draggable="false">`}</div><div class="refinfo"><div class="row" style="flex-wrap:nowrap"><span class="title-s" style="flex:1;min-width:0">${esc(e.name)}</span>${s?`<span class="badge ok">Saved</span>`:""}</div><div class="body-s osv">${esc(e.desc)}</div><div class="refactions"><button class="btn tonal sm" data-part="explore:${e.id}"><span class="ms">crop</span>Select part & annotate</button><button class="btn tonal sm" data-whole="explore:${e.id}" ${s&&s.whole?"disabled":""}><span class="ms">done_all</span>${s&&s.whole?"Borrowing everything":"Borrow everything"}</button></div></div></div>`};
  root.innerHTML=`<div class="insp-hd"><div><div class="label-m osv">02 / FIND YOUR DIRECTION</div><h1 class="headline-s" style="margin:4px 0">Inspiration, all in one place.</h1><p class="body-m osv" style="margin:0;max-width:64ch">Collect your own references or explore examples. Choose a specific part and describe what to borrow, or borrow the entire reference.</p></div><button class="btn filled" id="addRefBtn"><span class="ms">add</span>Add reference</button></div>
    <section class="card outlined insp-sec"><div class="pane-hd"><div><span class="title-l">Inspirations <span class="badge p">${saved.length}</span></span><div class="body-s osv">Your uploaded and saved references appear here.</div></div><span class="spacer"></span><button class="btn text sm" id="addRefBtn2"><span class="ms">add</span>Add reference</button></div>
      ${saved.length?`<div class="refgrid">${saved.map(savedCard).join("")}</div>`:`<div class="drop" style="padding:40px"><span class="title-s">Your inspiration collection is empty.</span><br><span class="body-s">Upload a reference or borrow something from Explore below.</span></div>`}</section>
    <section class="card outlined insp-sec"><div class="pane-hd"><div><span class="title-l">Explore</span><div class="body-s osv">Browse references and choose what you'd like to borrow.</div></div></div><div class="refgrid">${exploreList().map(exCard).join("")}</div></section>
    <div class="row" style="justify-content:space-between;margin:4px 0 24px"><span class="body-s osv">Only selected references and annotations inform your design choices.</span><button class="btn filled" id="toSystem"><span class="ms">arrow_forward</span>Continue to Design system</button></div>`;
  rail.innerHTML=`<div class="pane-hd"><div><span class="title-m">Selected parts</span> <span class="badge p">${annotated.length}</span><div class="body-s osv">Parts you chose to borrow.</div></div></div>
    ${annotated.length?`<div class="insp-anno-list">${annotated.map(annoCard).join("")}</div>`:`<div class="insp-anno-empty body-s osv">No annotated parts yet. Select a part from a reference to add it here.</div>`}`;
  $("#addRefBtn").onclick=$("#addRefBtn2").onclick=addReferenceModal;
  $$("[data-rmref]",root).forEach(b=>b.onclick=()=>removeTile(b.dataset.rmref));
  [root,rail].forEach(container=>$$("[data-rmanno]",container).forEach(b=>b.onclick=()=>{const[id,i]=b.dataset.rmanno.split(":");const t=S.tiles.find(x=>x.id===id);t.annotations.splice(+i,1);syncBorrow(t);snapshot("removed annotation");save();renderInspiration()}));
  $$("[data-whole]",root).forEach(b=>b.onclick=()=>{const[o,id]=b.dataset.whole.split(":");borrowAll(o,id)});
  $$("[data-part]",root).forEach(b=>b.onclick=()=>{const[o,id]=b.dataset.part.split(":");selectPartModal(o,id)});
  $("#toSystem").onclick=()=>{if(!S.tokens)S.tokens=seedTokens();S.sysBuilt=true;snapshot("design system drafted");save();go("system");toast(`Design system drafted from research + ${S.tiles.length} inspiration${S.tiles.length===1?"":"s"}`)};
}
function exploreToTile(e,extra){const t={id:uid("r"),type:"site",kind:"yours",from:e.id,title:e.name,why:"from Explore",annotations:[],whole:false,...(e.imgk?{imgk:e.imgk}:{}),...(e.mock?{mock:e.mock}:{}),...(e.ai?{why:e.desc}:{}),...extra};syncBorrow(t);S.tiles.unshift(t);return t}
function borrowAll(origin,id){if(origin==="explore"){const e=exploreList().find(x=>x.id===id);let t=savedFromExplore(id);if(t)t.whole=true;else t=exploreToTile(e,{whole:true});syncBorrow(t)}else{const t=S.tiles.find(x=>x.id===id);t.whole=!t.whole;syncBorrow(t)}
  snapshot(origin==="explore"?"borrowed an entire reference":"changed borrow-everything");save();renderInspiration();toast(origin==="explore"?"Entire reference saved to Inspirations":"Updated")}
function modalShell(html){const d=document.createElement("div");d.className="dialog";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.innerHTML=`<div class="box" style="width:min(760px,100%)">${html}</div>`;document.body.appendChild(d);d.onclick=e=>{if(e.target===d)d.remove()};d.onkeydown=e=>{if(e.key==="Escape")d.remove()};return d}
function addReferenceModal(){const d=modalShell(`<span class="headline-s">Add reference</span><div class="body-m osv">Upload an image or screenshot. It will appear at the top of the Inspiration page.</div>
  <div class="drop" id="arDrop"><span class="ms" style="font-size:28px">add_photo_alternate</span><br>Drop an image or <button class="btn text sm" id="arPick" type="button">choose a file</button><input type="file" id="arFile" accept="image/*" hidden><div id="arPrev" style="margin-top:8px"></div></div>
  <div class="field"><label for="arName">Reference name</label><input id="arName" placeholder="e.g. Restaurant website I like"></div>
  <div class="row" style="justify-content:flex-end"><button class="btn text" id="arCancel">Cancel</button><button class="btn filled" id="arSave">Add to Inspirations</button></div>`);
  let data=null,fname="";const take=f=>{if(!f||!f.type.startsWith("image/")){toast("Choose an image file");return}if(f.size>3*1024*1024){toast("Choose an image under 3 MB");return}const rd=new FileReader();rd.onload=()=>{data=rd.result;fname=f.name.replace(/\.[^.]+$/,"");$("#arPrev",d).innerHTML=`<img src="${data}" alt="" style="max-height:160px;border-radius:8px;display:inline-block;width:auto">`;if(!$("#arName",d).value)$("#arName",d).value=fname};rd.readAsDataURL(f)};
  $("#arPick",d).onclick=()=>$("#arFile",d).click();$("#arFile",d).onchange=e=>take(e.target.files[0]);dragDrop($("#arDrop",d),fs=>take(fs[0]));
  $("#arCancel",d).onclick=()=>d.remove();
  $("#arSave",d).onclick=()=>{if(!data){toast("Choose an image to upload");return}const t={id:uid("r"),type:"site",kind:"yours",title:$("#arName",d).value.trim()||fname,why:"uploaded",img:data,annotations:[],whole:false};syncBorrow(t);S.tiles.unshift(t);snapshot("added reference");save();d.remove();renderInspiration();toast("Reference added to Inspirations")}}
function selectPartModal(origin,id){const e=origin==="explore"?exploreList().find(x=>x.id===id):null;const t=origin==="saved"?S.tiles.find(x=>x.id===id):null;const src=t||{...e,title:e.name};let sel=null,start=null;
  const d=modalShell(`<span class="headline-s">Select a part to borrow</span><div class="body-m osv">Drag across the reference to mark a specific area, then describe what you'd like to borrow from it.</div>
  <div class="selarea" id="selArea">${t?refThumb(t,true):e.mock?mock(e.mock,true):`<img src="${IMG[e.imgk]}" alt="" draggable="false">`}${t?annoRects(t).replace(/class="arect"/g,'class="arect old"'):""}<div class="selrect" id="selRect"></div></div>
  <div class="field"><label for="partNote">What do you want to borrow from this part?</label><textarea id="partNote" rows="3" placeholder="e.g. The loose editorial spacing and warm muted colors, not the navigation."></textarea></div>
  <div class="row" style="justify-content:flex-end"><button class="btn text" id="spCancel">Cancel</button><button class="btn filled" id="spSave">Save annotated part</button></div>`);
  const area=$("#selArea",d),rect=$("#selRect",d);const pos=ev=>{const b=area.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(ev.clientX-b.left)/b.width)),y:Math.max(0,Math.min(1,(ev.clientY-b.top)/b.height))}};
  area.addEventListener("pointerdown",ev=>{ev.preventDefault();start=pos(ev);area.setPointerCapture(ev.pointerId)});
  area.addEventListener("pointermove",ev=>{if(!start)return;const p=pos(ev);sel={x:Math.min(p.x,start.x),y:Math.min(p.y,start.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)};Object.assign(rect.style,{display:"block",left:sel.x*100+"%",top:sel.y*100+"%",width:sel.w*100+"%",height:sel.h*100+"%"})});
  area.addEventListener("pointerup",()=>{start=null});
  $("#spCancel",d).onclick=()=>d.remove();
  $("#spSave",d).onclick=()=>{const note=$("#partNote",d).value.trim();if(!sel||sel.w<.02||sel.h<.02){toast("Drag to select a part of the reference first");return}if(!note){toast("Add a note describing what to borrow");$("#partNote",d).focus();return}
    let tile=t;if(!tile){tile=savedFromExplore(id)||exploreToTile(e,{})}tile.annotations=tile.annotations||[];tile.annotations.push({selection:sel,note});syncBorrow(tile);snapshot("annotated a reference");save();d.remove();renderInspiration();toast("Part and annotation saved to Inspirations")}}
/* route the old page renderers to Inspiration */
function renderReference(){renderInspiration()}
function renderTrending(){renderInspiration()}
function renderTrendRail(){}
