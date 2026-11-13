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
/* A screenshot of the real site, falling back to the generated mock if the
   service is unavailable or the capture fails. The fallback sits in the DOM from
   the start and is revealed by the image's own onerror, so a failure never
   leaves an empty frame. */
/* The direction's own "Borrow:" sentence and the advice for its real-world
   reference are often the same words; showing both just repeats the card. */
function sameAdvice(desc,advice){const n=t=>String(t||"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
  const a=n(advice);if(!a)return true;const d=n(desc);
  if(d.includes(a)||a.includes(d)||d.includes(a.slice(0,Math.min(40,a.length))))return true;
  // The same advice reworded: most of its content words are already in the description.
  const w=t=>new Set(t.split(" ").filter(x=>x.length>3));const aw=w(a),dw=w(d);if(!aw.size)return true;
  let k=0;aw.forEach(x=>{if(dw.has(x))k++});return k/aw.size>=.5}
/* A suggestion's text can end "← Derived from insight c2g7ox": the id means
   nothing to the reader, so it is split off and the insight is named instead. */
function splitDerived(desc){const m=/\s*(?:←|<-)\s*Derived from\s+(?:insights?|cards?)\s*(.*)$/i.exec(String(desc||""));
  if(!m)return{text:String(desc||""),from:[]};
  const cards=typeof dzCards==="function"?dzCards():[];
  const from=cards.filter(c=>new RegExp(`(^|[^A-Za-z0-9])${c.id}(?![A-Za-z0-9])`).test(m[1])).map(c=>c.text.length>80?c.text.slice(0,79).trimEnd()+"…":c.text);
  return{text:String(desc).slice(0,m.index).trim(),from}}
/* When a real site cannot be captured, say so. Showing this project's own
   generated mock in its place reads as if the mock were the reference. */
function noPreview(label){return`<div class="nopreview"><span class="ms">image_not_supported</span><b>${esc(label||"No preview")}</b><span class="body-s">No screenshot \u2014 the site may block automated capture. Open it to see the design.</span></div>`}
function shotSrc(u,w){return`/api/shot?url=${encodeURIComponent(u)}&w=${w||1200}`}
function shotThumb(u,fallbackHTML,big){
  return`<div class="shotwrap"><img class="shot" src="${esc(shotSrc(u,big?1400:1000))}" alt="" draggable="false" onerror="this.closest('.shotwrap').classList.add('failed')"><div class="shotfb">${fallbackHTML}</div></div>`}
function refThumb(r,big){const ex=(r.mock||r.img||r.imgk)?null:(r.from?exploreList().find(e=>e.id===r.from):null);const m=r.mock||ex?.mock;
  // An uploaded image is the designer's own and always wins over a screenshot.
  if(r.url&&!r.img)return shotThumb(r.url,noPreview(r.site||r.title),big);
  if(r.img||r.imgk||(!m&&ex?.imgk))return`<img src="${r.img||IMG[r.imgk||ex.imgk]}" alt="${esc(r.title||r.name||"")}" draggable="false">`;
  if(m)return mock(m,big);
  if(r.colors)return`<div class="pal" style="display:flex;width:100%;height:100%">${r.colors.map(c=>`<i style="flex:1;background:${esc(c)}"></i>`).join("")}</div>`;
  return(r.why==="uploaded"||r.kind==="yours")&&!r.mock?`<div class="nopreview"><span class="ms">broken_image</span><b>${esc(r.title||"")}</b><span class="body-s">Image not saved \u2014 remove this and upload it again.</span></div>`:`<div style="display:grid;place-items:center;height:100%;padding:var(--sp-3);text-align:center;background:var(--surface-container-highest)"><span class="mono">${esc(r.title||"")}</span></div>`}
/* Crop a reference down to one annotated region: the wrapper is blown up to
   1/selection size and shifted so that region fills the frame. */
/* An uploaded reference whose image was not kept: nothing to show or crop. */
function refMissing(t){return!(t.url||t.img||t.imgk||t.mock||t.colors||t.from)}
function zoomThumb(t,a){const s=a&&a.selection;
  // Nothing to crop when the image itself is gone: zooming the "not saved" note just garbles it.
  if(refMissing(t))return`<div class="nopreview" title="Image not saved"><span class="ms">broken_image</span></div>`;
  if(!s)return fitLayer(refThumb(t));
  return fitLayer(refThumb(t),s)}
/* Boxes are drawn in the annotate view over the whole image, so they are
   fractions of the full image. A thumbnail frame crops the image (cover), so the
   image and its boxes go in one layer with the image's own proportions, and
   that layer is sized and placed the way "cover" would place the image. With a
   selection, the layer is instead scaled so that region fills the frame. */
function fitLayer(inner,sel){if(!sel)return`<div class="fitlayer">${inner}</div>`;
  const w=Math.max(sel.w,.04),h=Math.max(sel.h,.04),W=100/w,H=100/h;
  // Until an image loads (or for a mock, which fills the frame anyway) zoom as if the content were the frame's shape.
  return`<div class="fitlayer zoom" data-sel="${[sel.x,sel.y,w,h].join(",")}" style="width:${W}%;height:${H}%;left:${-sel.x*W}%;top:${-sel.y*H}%">${inner}</div>`}
function placeFitLayer(layer,img){const nw=img.naturalWidth,nh=img.naturalHeight,box=layer.parentElement;
  if(!nw||!nh||!box)return;const cw=box.clientWidth,ch=box.clientHeight;if(!cw||!ch)return;
  const ar=nw/nh,cr=cw/ch;let W,H,L,T;
  if(layer.dataset.sel){const[x,y,w,h]=layer.dataset.sel.split(",").map(Number);
    // the region's own proportions, in pixels of the image
    if(ar*w/h>cr){H=100/h;W=H*ar/cr}else{W=100/w;H=W*cr/ar}
    L=-x*W+(100-w*W)/2;T=-y*H+(100-h*H)/2}
  else{const topAligned=img.classList.contains("shot");
    if(ar>cr){H=100;W=100*ar/cr;L=(100-W)/2;T=0}else{W=100;H=100*cr/ar;L=0;T=topAligned?0:(100-H)/2}}
  Object.assign(layer.style,{width:W+"%",height:H+"%",left:L+"%",top:T+"%"});layer.classList.add("fitted")}
/* Images already in memory may be complete before the load hook sees them. */
function fitLayers(root){$$(".fitlayer",root).forEach(l=>{const img=$("img",l);if(img&&img.complete&&img.naturalWidth)placeFitLayer(l,img)})}
document.addEventListener("load",e=>{const img=e.target;if(img.tagName!=="IMG")return;const l=img.closest(".fitlayer");if(l)placeFitLayer(l,img)},true);
function annoRect(a,i){return`<span class="arect" style="left:${a.selection.x*100}%;top:${a.selection.y*100}%;width:${a.selection.w*100}%;height:${a.selection.h*100}%"><b>${i+1}</b></span>`}
function annoRects(r){return(r.annotations||[]).map(annoRect).join("")}
function syncBorrow(t){const notes=(t.annotations||[]).map(a=>a.note);t.borrow=t.whole?"the entire reference"+(notes.length?"; especially: "+notes.join("; "):""):notes.length?notes.join("; "):"(not yet chosen)"}
function savedFromExplore(id){return S.tiles.find(t=>t.from===id)}
function renderInspiration(){const root=$("#inspBody"),rail=$("#rail-inspiration");if(!root||!rail)return;const saved=S.tiles;
  const annotated=saved.flatMap(t=>(t.annotations||[]).map((a,i)=>({t,a,i})));
  const annoGroups=saved.map(t=>({t,list:(t.annotations||[]).map((a,i)=>({a,i}))})).filter(g=>g.list.length);
  const savedCard=t=>`<div class="refcard" data-ref="${t.id}"><div class="refthumb">${fitLayer(refThumb(t)+(refMissing(t)?"":annoRects(t)))}</div><div class="refinfo"><div class="row" style="flex-wrap:nowrap"><span class="title-s" style="flex:1;min-width:0">${esc(t.title)}</span><span class="badge ok">Saved</span><button class="icon-btn rmref" data-rmref="${t.id}" aria-label="Remove ${esc(t.title)}" title="Remove"><span class="ms">delete</span></button></div>
    ${t.whole?`<span class="badge ok" style="align-self:flex-start"><span class="ms" style="font-size:14px;margin-right:var(--sp-1)">done_all</span>Borrowing entire reference</span>`:""}
    ${(t.annotations||[]).map((a,i)=>`<div class="annonote"><b>${i+1}</b><span style="flex:1">${esc(a.note)}</span><button class="x" data-rmanno="${t.id}:${i}" aria-label="Remove annotation ${i+1}"><span class="ms" style="font-size:16px">close</span></button></div>`).join("")}
    ${!t.whole&&!(t.annotations||[]).length?`<div class="body-s osv">Nothing chosen yet. Select a part or borrow everything.</div>`:""}
    <div class="refactions"><button class="btn tonal sm" data-part="saved:${t.id}"><span class="ms">crop</span>Select part & annotate</button><button class="btn ${t.whole?"outlined":"tonal"} sm" data-whole="saved:${t.id}"><span class="ms">${t.whole?"remove_done":"done_all"}</span>${t.whole?"Borrowing all ✓":"Borrow everything"}</button></div></div></div>`;
  /* One card per reference, however many parts were taken from it: repeating the
     same full preview for every annotation made the rail unreadable. Each part
     shows a crop of just the region that was selected, not the whole reference. */
  const annoPart=(t,a,i)=>`<div class="insp-part"><div class="insp-part-crop">${zoomThumb(t,a)}</div><div class="insp-part-meta"><div class="annonote"><b>${i+1}</b><span style="flex:1">${esc(a.note)}</span></div><button class="btn text sm" data-rmanno="${t.id}:${i}" aria-label="Remove annotated part ${i+1} from ${esc(t.title)}"><span class="ms">close</span>Remove</button></div></div>`;
  const annoGroup=g=>`<article class="insp-anno"><div class="insp-anno-head"><span class="title-s" style="flex:1;min-width:0">${esc(g.t.title)}</span><span class="badge p">${g.list.length}</span></div><div class="insp-part-list">${g.list.map(({a,i})=>annoPart(g.t,a,i)).join("")}</div></article>`;
  const exCard=e=>{const s=savedFromExplore(e.id);return`<div class="refcard"><div class="refthumb">${e.url?shotThumb(e.url,noPreview(e.site||e.name)):(e.mock?`${mock(e.mock)}<span class="mocktag">Proposed direction \u00b7 not a real site</span>`:`<img src="${IMG[e.imgk]}" alt="${esc(e.name)}" draggable="false">`)}</div><div class="refinfo"><div class="row" style="flex-wrap:nowrap"><span class="title-s" style="flex:1;min-width:0">${esc(e.name)}</span>${s?`<span class="badge ok">Saved</span>`:""}</div>${(()=>{const sd=splitDerived(e.desc);return`<div class="body-s osv">${esc(sd.text)}</div>${sd.from.length?`<div class="body-s osv"><span class="ms" style="font-size:14px;vertical-align:-2px">science</span> From your research: ${sd.from.map(t=>`“${esc(t)}”`).join(", ")}</div>`:""}`})()}${e.url?`<a class="insp-site" href="${esc(e.url)}" target="_blank" rel="noopener noreferrer"><span class="ms" style="font-size:15px">open_in_new</span><span style="flex:1;min-width:0">${esc(e.site||e.urlHost||e.url)}</span><span class="badge ok">live</span></a>${e.siteBorrow&&!sameAdvice(splitDerived(e.desc).text,e.siteBorrow)?`<div class="body-s osv">From this site: ${esc(e.siteBorrow)}</div>`:""}`:e.deadUrl?`<div class="body-s osv"><span class="ms" style="font-size:14px;vertical-align:-2px">link_off</span> ${esc(e.site||"Suggested site")} could not be verified, so it is not linked.</div>`:""}<div class="refactions"><button class="btn tonal sm" data-part="explore:${e.id}"><span class="ms">crop</span>Select part & annotate</button><button class="btn tonal sm" data-whole="explore:${e.id}" ${s&&s.whole?"disabled":""}><span class="ms">done_all</span>${s&&s.whole?"Borrowing everything":"Borrow everything"}</button></div></div></div>`};
  root.innerHTML=`<div class="insp-hd"><div><h1 class="headline-s" style="margin:0 0 var(--sp-1)">Inspiration, all in one place.</h1><p class="body-m osv" style="margin:0;max-width:64ch">Collect your own references or explore examples. Choose a specific part and describe what to borrow, or borrow the entire reference.</p></div></div>
    <section class="card outlined insp-sec"><div class="pane-hd"><div><span class="title-l">Inspirations <span class="badge p">${saved.length}</span></span><div class="body-s osv">Your uploaded and saved references appear here.</div></div><span class="spacer"></span><button class="btn filled" id="addRefBtn2"><span class="ms">add</span>Add reference</button></div>
      ${saved.length?`<div class="refgrid">${saved.map(savedCard).join("")}</div>`:`<div class="drop" style="padding:var(--sp-7)"><span class="title-s">Your inspiration collection is empty.</span><br><span class="body-s">Upload a reference or borrow something from Explore below.</span></div>`}</section>
    <section class="card outlined insp-sec"><div class="pane-hd"><div><span class="title-l">Explore</span><div class="body-s osv">Browse references and choose what you'd like to borrow.</div></div></div><div class="refgrid">${[...exploreList()].sort((a,b)=>(b.url?1:0)-(a.url?1:0)).map(exCard).join("")}</div></section>
    <div class="row" style="justify-content:space-between;margin:var(--sp-1) 0 var(--sp-5)"><span class="body-s osv">Only selected references and annotations inform your design choices.</span><button class="btn filled" id="toSystem"><span class="ms">arrow_forward</span>Continue to Design system</button></div>`;
  rail.innerHTML=`<div class="pane-hd"><div><span class="title-m">Selected parts</span> <span class="badge p">${annotated.length}</span><div class="body-s osv">Parts you chose to borrow.</div></div></div>
    ${annoGroups.length?`<div class="insp-anno-list">${annoGroups.map(annoGroup).join("")}</div>`:`<div class="insp-anno-empty body-s osv">No annotated parts yet. Select a part from a reference to add it here.</div>`}`;
  $("#addRefBtn2").onclick=addReferenceModal;
  $$("[data-rmref]",root).forEach(b=>b.onclick=()=>{const t=S.tiles.find(x=>x.id===b.dataset.rmref);if(t&&t.imgKey)imgDel(t.imgKey).catch(()=>{});removeTile(b.dataset.rmref)});
  [root,rail].forEach(container=>$$("[data-rmanno]",container).forEach(b=>b.onclick=()=>{const[id,i]=b.dataset.rmanno.split(":");const t=S.tiles.find(x=>x.id===id);t.annotations.splice(+i,1);syncBorrow(t);snapshot("removed annotation");save();renderInspiration()}));
  $$("[data-whole]",root).forEach(b=>b.onclick=()=>{const[o,id]=b.dataset.whole.split(":");borrowAll(o,id)});
  $$("[data-part]",root).forEach(b=>b.onclick=()=>{const[o,id]=b.dataset.part.split(":");selectPartModal(o,id)});
  $("#toSystem").onclick=()=>{if(!S.tokens)S.tokens=seedTokens();S.sysBuilt=true;snapshot("design system drafted");save();go("system");toast(`Design system drafted from research + ${S.tiles.length} inspiration${S.tiles.length===1?"":"s"}`)};
  fitLayers(root);fitLayers(rail);
}
/* Snapshot the reference onto the tile. Saved inspiration must survive a later
   regeneration of Explore, so it never looks its source up again at render time. */
function exploreToTile(e,extra){const t={id:uid("r"),type:"site",kind:"yours",from:e.id,title:e.name,why:"from Explore",desc:e.desc||"",url:e.url||"",annotations:[],whole:false,...(e.imgk?{imgk:e.imgk}:{}),...(e.mock?{mock:JSON.parse(JSON.stringify(e.mock))}:{}),...(e.img?{img:e.img}:{}),...(e.ai?{why:e.desc}:{}),...extra};syncBorrow(t);S.tiles.unshift(t);return t}
function borrowAll(origin,id){if(origin==="explore"){const e=exploreList().find(x=>x.id===id);let t=savedFromExplore(id);if(t)t.whole=true;else t=exploreToTile(e,{whole:true});syncBorrow(t)}else{const t=S.tiles.find(x=>x.id===id);t.whole=!t.whole;syncBorrow(t)}
  snapshot(origin==="explore"?"borrowed an entire reference":"changed borrow-everything");save();renderInspiration();toast(origin==="explore"?"Entire reference saved to Inspirations":"Updated")}
function modalShell(html){const d=document.createElement("div");d.className="dialog";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.innerHTML=`<div class="box" style="width:min(760px,100%)">${html}</div>`;document.body.appendChild(d);d.onclick=e=>{if(e.target===d)d.remove()};d.onkeydown=e=>{if(e.key==="Escape")d.remove()};return d}
function addReferenceModal(){const d=modalShell(`<span class="headline-s">Add reference</span><div class="body-m osv">Upload an image or screenshot. It will appear at the top of the Inspiration page.</div>
  <div class="drop" id="arDrop"><span class="ms" style="font-size:28px">add_photo_alternate</span><br>Drop an image or <button class="btn text sm" id="arPick" type="button">choose a file</button><input type="file" id="arFile" accept="image/*" hidden><div id="arPrev" style="margin-top:var(--sp-2)"></div></div>
  <div class="field"><label for="arName">Reference name</label><input id="arName" placeholder="e.g. Restaurant website I like"></div>
  <div class="row" style="justify-content:flex-end"><button class="btn text" id="arCancel">Cancel</button><button class="btn filled" id="arSave">Add to Inspirations</button></div>`);
  let data=null,fname="";const take=f=>{if(!f||!f.type.startsWith("image/")){toast("Choose an image file");return}if(f.size>3*1024*1024){toast("Choose an image under 3 MB");return}const rd=new FileReader();rd.onload=()=>{data=rd.result;fname=f.name.replace(/\.[^.]+$/,"");$("#arPrev",d).innerHTML=`<img src="${data}" alt="" style="max-height:160px;border-radius:8px;display:inline-block;width:auto">`;if(!$("#arName",d).value)$("#arName",d).value=fname};rd.readAsDataURL(f)};
  $("#arPick",d).onclick=()=>$("#arFile",d).click();$("#arFile",d).onchange=e=>take(e.target.files[0]);dragDrop($("#arDrop",d),fs=>take(fs[0]));
  $("#arCancel",d).onclick=()=>d.remove();
  $("#arSave",d).onclick=async()=>{if(!data){toast("Choose an image to upload");return}
    const pid=currentPid();const id=uid("r");const key="tile:"+id;
    const stored=await rememberImage(key,data);
    if(!stillOnProject(pid)){imgDel(key).catch(()=>{});toast("Project changed \u2014 reference not added");return}
    const t={id,type:"site",kind:"yours",title:$("#arName",d).value.trim()||fname,why:"uploaded",img:stored,imgKey:key,annotations:[],whole:false};syncBorrow(t);S.tiles.unshift(t);snapshot("added reference");save();d.remove();renderInspiration();toast("Reference added to Inspirations")}}
function selectPartModal(origin,id){const e=origin==="explore"?exploreList().find(x=>x.id===id):null;const t=origin==="saved"?S.tiles.find(x=>x.id===id):null;const src=t||{...e,title:e.name};let sel=null,start=null;
  const d=modalShell(`<span class="headline-s">Select a part to borrow</span><div class="body-m osv">Drag across the reference to mark a specific area, then describe what you'd like to borrow from it.</div>
  <div class="selscroll" id="selScroll"><div class="selarea" id="selArea">${src.url?shotThumb(src.url,(t&&t.mock)||e&&e.mock?mock((t&&t.mock)||e.mock,true):`<img src="${IMG[(t&&t.imgk)||(e&&e.imgk)]||IMG.overhead}" alt="" draggable="false">`,true):(t?refThumb(t,true):e.mock?mock(e.mock,true):`<img src="${IMG[e.imgk]}" alt="" draggable="false">`)}${t?annoRects(t).replace(/class="arect"/g,'class="arect old"'):""}<div class="selrect" id="selRect"></div></div></div>
  <div class="field"><label for="partNote">What do you want to borrow from this part?</label><textarea id="partNote" rows="3" placeholder="e.g. The loose editorial spacing and warm muted colors, not the navigation."></textarea></div>
  <div class="row" style="justify-content:flex-end"><button class="btn text" id="spCancel">Cancel</button><button class="btn filled" id="spSave">Save annotated part</button></div>`);
  const area=$("#selArea",d),rect=$("#selRect",d);const pos=ev=>{const b=area.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(ev.clientX-b.left)/b.width)),y:Math.max(0,Math.min(1,(ev.clientY-b.top)/b.height))}};
  area.addEventListener("pointerdown",ev=>{ev.preventDefault();start=pos(ev);area.setPointerCapture(ev.pointerId)});
  // A drag that begins on the image must not scroll the container under it.
  area.addEventListener("touchmove",ev=>{if(start)ev.preventDefault()},{passive:false});
  area.addEventListener("pointermove",ev=>{if(!start)return;const p=pos(ev);sel={x:Math.min(p.x,start.x),y:Math.min(p.y,start.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)};Object.assign(rect.style,{display:"block",left:sel.x*100+"%",top:sel.y*100+"%",width:sel.w*100+"%",height:sel.h*100+"%"})});
  area.addEventListener("pointerup",()=>{start=null});
  $("#spCancel",d).onclick=()=>d.remove();
  $("#spSave",d).onclick=()=>{const note=$("#partNote",d).value.trim();if(!sel||sel.w<.02||sel.h<.02){toast("Drag to select a part of the reference first");return}if(!note){toast("Add a note describing what to borrow");$("#partNote",d).focus();return}
    let tile=t;if(!tile){tile=savedFromExplore(id)||exploreToTile(e,{})}tile.annotations=tile.annotations||[];tile.annotations.push({selection:sel,note});syncBorrow(tile);snapshot("annotated a reference");save();d.remove();renderInspiration();toast("Part and annotation saved to Inspirations")}}
/* route the old page renderers to Inspiration */
function renderReference(){renderInspiration()}
function renderTrending(){renderInspiration()}
function renderTrendRail(){}
