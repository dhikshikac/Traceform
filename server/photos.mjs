// Stock photo search. Openverse (Creative Commons) by default — no API key needed.
//
// Set PHOTO_PROVIDER=unsplash + UNSPLASH_ACCESS_KEY to swap sources; the shape
// returned here is the contract the browser depends on, so both providers
// normalise to it:
//
//   {id, src, thumb, w, h, alt, creator, license, licenseUrl, source, provider}
//
// Nothing is generated. Every image is a real photograph with an attributable
// creator and licence, which is what makes an image decision traceable.

const UA = "traceform/0.1 (coursework project)";
const MIN_SCORE = 0.45;   // conservative on purpose: an honest placeholder beats a wrong photo
const TIMEOUT = 12_000;

const LICENSE_URL = {
  "by": "https://creativecommons.org/licenses/by/", "by-sa": "https://creativecommons.org/licenses/by-sa/",
  "by-nd": "https://creativecommons.org/licenses/by-nd/", "by-nc": "https://creativecommons.org/licenses/by-nc/",
  "by-nc-sa": "https://creativecommons.org/licenses/by-nc-sa/", "by-nc-nd": "https://creativecommons.org/licenses/by-nc-nd/",
  "cc0": "https://creativecommons.org/publicdomain/zero/1.0/", "pdm": "https://creativecommons.org/publicdomain/mark/1.0/",
};

async function getJSON(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" }, signal: ctl.signal });
    if (!r.ok) {
      const e = new Error(`upstream ${r.status}`);
      e.status = r.status === 429 ? 429 : 502;
      e.code = r.status === 429 ? "rate_limited" : "provider_error";
      e.publicMessage = r.status === 429
        ? "The photo service is rate-limiting us; try again shortly."
        : "The photo service returned an error.";
      throw e;
    }
    return await r.json();
  } finally { clearTimeout(t); }
}

// Openverse ranks loosely, so ask for more than we need and filter down to
// images actually usable as site photography: landscape-ish and large enough.
async function openverse(q, want) {
  const u = new URL("https://api.openverse.org/v1/images/");
  u.searchParams.set("q", q);
  u.searchParams.set("license_type", "commercial,modification");
  u.searchParams.set("size", "large");
  u.searchParams.set("mature", "false");
  u.searchParams.set("page_size", String(Math.min(20, want * 5)));
  const d = await getJSON(u);
  return (d.results || []).map(r => ({
    tags: (r.tags || []).map(t => (t && t.name) || "").join(" "),
    id: "ov:" + r.id,
    src: r.url,
    thumb: r.thumbnail || r.url,
    w: r.width || 0,
    h: r.height || 0,
    alt: r.title || q,
    creator: r.creator || "Unknown",
    license: `CC ${String(r.license || "").toUpperCase()}${r.license_version ? " " + r.license_version : ""}`.trim(),
    licenseUrl: LICENSE_URL[r.license] || r.license_url || "https://creativecommons.org/",
    source: r.foreign_landing_url || r.url,
    provider: "openverse",
  }));
}

async function unsplash(q, want) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) { const e = new Error("no key"); e.status = 503; e.code = "not_configured"; e.publicMessage = "Unsplash needs UNSPLASH_ACCESS_KEY in .env."; throw e; }
  const u = new URL("https://api.unsplash.com/search/photos");
  u.searchParams.set("query", q);
  u.searchParams.set("orientation", "landscape");
  u.searchParams.set("per_page", String(Math.min(20, want * 3)));
  u.searchParams.set("client_id", key);
  const d = await getJSON(u);
  return (d.results || []).map(r => ({
    id: "us:" + r.id,
    src: r.urls?.regular, thumb: r.urls?.small,
    w: r.width || 0, h: r.height || 0,
    alt: r.alt_description || r.description || q,
    creator: r.user?.name || "Unknown",
    license: "Unsplash", licenseUrl: "https://unsplash.com/license",
    source: r.links?.html, provider: "unsplash",
  }));
}

// Site photography is nearly always wide. Drop portrait crops and anything too
// small to survive a full-bleed hero.
function usable(p) {
  if (!p.src || !/^https:/.test(p.src)) return false;
  if (p.w && p.w < 1000) return false;
  if (p.w && p.h && p.h / p.w > 1.1) return false;
  return true;
}

// Openverse ANDs every term, so a descriptive phrase like "hands pounding green
// papaya mortar" matches nothing at all. Try the phrase, then progressively
// looser subsets of its content words, and keep the first that hits.
const STOP = new Set("a an the of in on at with and or for to from into over under by its his her their one some".split(" "));
function candidates(q) {
  const w = q.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  const keep = w.filter(x => !STOP.has(x) && !/ing$/.test(x) && x.length > 1);
  const tries = [q, keep.join(" "), keep.slice(-3).join(" "), keep.slice(-2).join(" "), keep.slice(0, 2).join(" "), keep.slice(-1).join(" ")];
  return [...new Set(tries.filter(Boolean))];
}

// A wrong photograph is worse than an honest placeholder: "community grocery store"
// once resolved to a picture of an abandoned supermarket. Score every candidate on
// how much of the requested subject it actually depicts, and refuse weak matches.
function words(t) {
  return (t || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
}
// Stems loosely, so "tomatoes" matches "tomato" and "crates" matches "crate".
function stem(w) { return w.replace(/(ies|es|s)$/, m => (m === "ies" ? "y" : "")); }
// Junk that is technically a photo but never usable as site imagery.
const JUNK = /\b(abandoned|derelict|demolition|closed|vacant|for sale|logo|map of|diagram|chart|screenshot|poster|signage|coat of arms|plaque)\b/i;

// Words that describe almost any photograph. Openverse's tags are machine-generated
// and full of these, so matching only on them scores high while depicting nothing:
// "fresh green kale on a wooden table" once matched a photo of strawberries on
// the strength of "fresh", "green" and "piled" alone.
const GENERIC = new Set(("fresh green red blue white black brown yellow orange dark light bright "
  + "close closeup view photo image picture background top bottom side front back "
  + "wooden wood metal glass plastic paper table surface floor wall indoor outdoor "
  + "people person group man woman hand hands holding piled pile stack row set "
  + "large small big little old new modern natural organic colorful assorted various "
  + "food drink object thing item product display shop store market").split(" "));

function relevance(p, qWords) {
  const hay = new Set(words(p.alt + " " + (p.tags || "")).map(stem));
  if (!qWords.length) return 0;
  const matched = qWords.filter(w => hay.has(w));
  // The subject itself must appear, not just the adjectives around it.
  const subject = qWords.filter(w => !GENERIC.has(w));
  if (subject.length && !subject.some(w => hay.has(w))) return 0;
  const hits = matched.length;
  let sc = hits / qWords.length;
  if (JUNK.test(p.alt || "")) sc -= 0.5;
  // A bare street address or catalogue number as a title means an untitled scan.
  if (/^\s*\d{3,}[\s-]/.test(p.alt || "")) sc -= 0.25;
  if (p.w >= 1600) sc += 0.05;
  return sc;
}

export async function searchPhotos(q, want = 3) {
  const query = String(q || "").trim().slice(0, 120);
  if (!query) { const e = new Error("empty query"); e.status = 400; e.code = "bad_query"; e.publicMessage = "Describe the photo you want."; throw e; }
  const name = (process.env.PHOTO_PROVIDER || "openverse").toLowerCase();
  const qWords = [...new Set(words(query).map(stem))];
  // Unsplash ranks fuzzily and needs no relaxation; Openverse does.
  const tries = name === "unsplash" ? [query] : candidates(query);
  const seen = new Set(), pool = [];
  // Gather across several relaxations BEFORE ranking. Stopping at the first query
  // that returned anything picks from too small a pool: "brown eggs in a carton"
  // settled on a photo of drink cartons when an actual photo of brown eggs was one
  // relaxation away.
  for (const t of tries.slice(0, 4)) {
    const all = name === "unsplash" ? await unsplash(t, want * 2) : await openverse(t, 6);
    for (const p of all) {
      if (!p.src || seen.has(p.src) || !usable(p)) continue;
      seen.add(p.src);
      pool.push({ ...p, matched: t, score: relevance(p, qWords) });
    }
    if (pool.length >= 18) break;
  }
  pool.sort((a, b) => b.score - a.score);
  const keep = pool.filter(p => p.score >= MIN_SCORE).slice(0, want);
  // Nothing depicts the subject: say so, and let the page show its art direction
  // instead of an unrelated picture.
  return { query, provider: name, matched: keep[0] ? keep[0].matched : null,
           rejected: pool.length - keep.length, results: keep.map(({ score, tags, ...p }) => p) };
}

export function photoInfo() {
  const name = (process.env.PHOTO_PROVIDER || "openverse").toLowerCase();
  return { provider: name, configured: name === "unsplash" ? !!process.env.UNSPLASH_ACCESS_KEY : true };
}
