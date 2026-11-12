/* Real photographs instead of generated graphics.
   Images are searched from a stock library (Openverse by default) and then FROZEN
   onto the project state, so a hero stays the same photo across reloads, version
   history and export. Re-resolving on every render would reshuffle the site and
   make an image's decision record meaningless.

   S.photos: { "<subject phrase>": {src, thumb, alt, creator, license, licenseUrl, source, provider, q} }
*/
var PHOTOS_ON = true;            // flipped off if the endpoint isn't there
var photoPending = Object.create(null);

function photoStore() { if (!S.photos) S.photos = {}; return S.photos; }
function photoKey(q) { return String(q || "").toLowerCase().trim().replace(/\s+/g, " "); }

/* A frozen pick, or null. Never triggers a lookup. */
function photoGet(q) { const k = photoKey(q); return k ? (photoStore()[k] || null) : null; }

/* Look a subject up once and freeze the first usable result.
   Returns the photo, or null when offline / nothing matched. */
async function photoResolve(q) {
  const k = photoKey(q);
  if (!k || !PHOTOS_ON) return null;
  const have = photoStore()[k];
  if (have) return have.miss ? null : have;
  if (photoPending[k]) return photoPending[k];

  photoPending[k] = (async () => {
    try {
      const r = await fetch(`/api/images?q=${encodeURIComponent(k)}&n=3`);
      if (r.status === 404) { PHOTOS_ON = false; return null; }
      if (!r.ok) return null;
      const d = await r.json();
      const p = (d.results || [])[0];
      // Remember a miss too, so a hopeless subject isn't retried on every render.
      photoStore()[k] = p ? { ...p, q: k } : { miss: true, q: k };
      save();
      return p || null;
    } catch { return null; }
    finally { delete photoPending[k]; }
  })();
  return photoPending[k];
}

/* Resolve many subjects, then redraw once. */
async function photoResolveAll(list, after) {
  const qs = [...new Set((list || []).map(photoKey).filter(Boolean))].filter(q => !photoStore()[q]);
  if (!qs.length || !PHOTOS_ON) return 0;
  let n = 0;
  // Serial on purpose: Openverse is unauthenticated and rate-limits bursts.
  for (const q of qs) { if (await photoResolve(q)) n++; }
  if (n && typeof after === "function") after();
  return n;
}

/* Every subject phrase the current site copy refers to. */
function sitePhotoSubjects() {
  const W = S.site; if (!W) return [];
  const out = [W.hero && W.hero.img, W.side && W.side.img, W.story && W.story.img,
               W.about && W.about.img, W.location && W.location.img];
  (W.items && W.items.list || []).forEach(d => out.push(d.img));
  (W.collections && W.collections.list || []).forEach(b => out.push(b.img));
  (W.about && W.about.photos || []).forEach(p => out.push(Array.isArray(p) ? p[0] : null));
  return out.filter(Boolean);
}

/* Credit line for the Review page and export. One entry per distinct photo. */
function photoCredits() {
  const seen = new Set(), out = [];
  sitePhotoSubjects().forEach(q => {
    const p = photoGet(q);
    if (!p || p.miss || seen.has(p.src)) return;
    seen.add(p.src); out.push(p);
  });
  return out;
}

async function photosHealth() {
  try { const r = await fetch("/api/images/health"); if (!r.ok) { PHOTOS_ON = false; return null; } return await r.json(); }
  catch { PHOTOS_ON = false; return null; }
}
