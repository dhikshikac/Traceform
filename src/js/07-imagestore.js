/* Uploaded images, kept across reloads.

   Reference and imagery uploads are data URLs: a single photo is easily several
   hundred KB, and localStorage holds about 5 MB for the whole origin. So save()
   used to drop every reference image before writing, which is why an uploaded
   reference came back as a bare title after a reload; design-system uploads were
   written instead, quietly pushing the store towards the quota, where a failed
   write is swallowed and every later change is lost too.

   Images now live in IndexedDB, which is sized for binary data, keyed by the id
   of whatever owns them. localStorage keeps only that key. */

/* Which project is open right now.

   S is a working copy of one project and save() writes it back to that project's
   slot. Anything that awaits - a photo lookup, a URL check, reading a file - can
   therefore finish after the user has switched projects, and would then write its
   result into whichever project happens to be open. Every such path captures the
   id first and checks it before writing. */
function currentPid() { return (typeof S !== "undefined" && S) ? S.pid : null; }
function stillOnProject(pid) { return pid != null && currentPid() === pid; }

var IMGDB = null;
function imgDB() {
  if (IMGDB) return IMGDB;
  IMGDB = new Promise((res, rej) => {
    let r;
    try { r = indexedDB.open("traceform-images", 1); } catch (e) { return rej(e); }
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains("img")) r.result.createObjectStore("img"); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return IMGDB;
}
function imgTx(mode, fn) {
  return imgDB().then(db => new Promise((res, rej) => {
    const tx = db.transaction("img", mode), req = fn(tx.objectStore("img"));
    tx.oncomplete = () => res(req && req.result);
    tx.onerror = tx.onabort = () => rej(tx.error);
  }));
}
function imgPut(k, v) { return imgTx("readwrite", st => st.put(v, k)); }
function imgGet(k) { return imgTx("readonly", st => st.get(k)); }
function imgDel(k) { return imgTx("readwrite", st => st.delete(k)); }

/* A phone photo is far larger than any slot that displays it. Cap the long edge
   so the store stays small and the page stays quick. */
function shrinkImage(src, max, q) {
  max = max || 1600; q = q || 0.85;
  return new Promise(res => {
    const im = new Image();
    im.onload = () => {
      let w = im.naturalWidth || im.width, h = im.naturalHeight || im.height;
      const s = Math.min(1, max / Math.max(w, h));
      if (s >= 1 && src.length < 600000) return res(src);
      w = Math.max(1, Math.round(w * s)); h = Math.max(1, Math.round(h * s));
      try {
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(im, 0, 0, w, h);
        res(c.toDataURL("image/jpeg", q));
      } catch { res(src); }
    };
    im.onerror = () => res(src);
    im.src = src;
  });
}

/* Store an upload and hand back the (possibly smaller) data URL to show now. */
async function rememberImage(key, dataUrl) {
  try { const small = await shrinkImage(dataUrl); await imgPut(key, small); return small; }
  catch { return dataUrl; }
}

/* Fill in images for the project that is open. Returns how many were restored. */
async function hydrateImages() {
  if (typeof S === "undefined" || !S) return 0;
  const pid = currentPid();
  let n = 0;
  for (const t of S.tiles || []) {
    if (!stillOnProject(pid)) return n;
    if (t.imgKey && !t.img) { try { const v = await imgGet(t.imgKey); if (v && stillOnProject(pid)) { t.img = v; n++; } } catch {} }
  }
  for (const u of [...(S.userImgs || []), ...(S.userMotifs || [])] || []) {
    if (!stillOnProject(pid)) return n;
    if (u.imgKey && !u.src) { try { const v = await imgGet(u.imgKey); if (v && stillOnProject(pid)) { u.src = v; n++; } } catch {} }
  }
  return n;
}
function hydrateAndRender() {
  hydrateImages().then(n => { if (n && typeof renderAll === "function") renderAll(); }).catch(() => {});
}

/* Anything uploaded before this existed still has its data URL in memory only;
   move it into the store the first time we see it, so it survives from now on. */
function adoptLooseImages() {
  if (typeof S === "undefined" || !S) return;
  (S.tiles || []).forEach(t => {
    if (t.img && !t.imgKey && /^data:/.test(t.img)) { t.imgKey = "tile:" + t.id; rememberImage(t.imgKey, t.img).then(v => { t.img = v; }); }
  });
  (S.userImgs || []).forEach((u, i) => {
    if (u.src && !u.imgKey && /^data:/.test(u.src)) { u.imgKey = "ui:" + (S.pid || "p") + ":" + i + ":" + Date.now().toString(36); rememberImage(u.imgKey, u.src).then(v => { u.src = v; }); }
  });
}
