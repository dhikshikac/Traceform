// Screenshots of the real websites Explore recommends.
//
// Rendering pages locally would mean a headless browser download of several
// hundred MB, which every teammate would also need. Microlink renders them
// instead: no key, no account, no install. Its free tier is roughly 50 requests
// a day, so every screenshot is cached on disk and fetched at most once.
//
// The URL comes from a language model, so the host is checked the same way link
// verification checks it: public addresses only, never localhost or a metadata
// endpoint.

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { isPublicHost } from "./checkurl.mjs";

const TIMEOUT = 25_000;
const MAX_BYTES = 8 * 1024 * 1024;
const TTL = 14 * 24 * 60 * 60 * 1000;   // a site's design does not change daily
const UA = "traceform/0.1 (coursework project)";

const mem = new Map();

function keyFor(url, w) { return createHash("sha1").update(w + "|" + url).digest("hex"); }

async function fresh(file) {
  try { const s = await stat(file); return Date.now() - s.mtimeMs < TTL ? s : null; }
  catch { return null; }
}

async function fromMicrolink(url, w) {
  const api = new URL("https://api.microlink.io/");
  api.searchParams.set("url", url);
  api.searchParams.set("screenshot", "true");
  api.searchParams.set("meta", "false");
  api.searchParams.set("viewport.width", String(w));
  api.searchParams.set("viewport.height", String(Math.round(w * 0.625)));

  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT);
  let shot;
  try {
    const r = await fetch(api, { headers: { "user-agent": UA, accept: "application/json" }, signal: ctl.signal });
    if (!r.ok) throw new Error("microlink " + r.status);
    const d = await r.json();
    shot = d && d.data && d.data.screenshot && d.data.screenshot.url;
    if (!shot) throw new Error("no screenshot in response");
  } finally { clearTimeout(t); }

  const ctl2 = new AbortController();
  const t2 = setTimeout(() => ctl2.abort(), TIMEOUT);
  try {
    const img = await fetch(shot, { headers: { "user-agent": UA }, signal: ctl2.signal });
    if (!img.ok) throw new Error("image " + img.status);
    const buf = Buffer.from(await img.arrayBuffer());
    if (!buf.length || buf.length > MAX_BYTES) throw new Error("bad size");
    return { buf, type: img.headers.get("content-type") || "image/png" };
  } finally { clearTimeout(t2); }
}

/* thum.io renders asynchronously: the first request for a page it has not seen
   returns a placeholder GIF while it works, and the real PNG follows. */
async function fromThumio(url, w) {
  const h = Math.round(w * 0.625);
  const api = `https://image.thum.io/get/width/${w}/crop/${h}/${url}`;
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), TIMEOUT);
    try {
      const r = await fetch(api, { headers: { "user-agent": UA }, signal: ctl.signal });
      if (!r.ok) throw new Error("thum.io " + r.status);
      const type = r.headers.get("content-type") || "";
      const buf = Buffer.from(await r.arrayBuffer());
      if (!buf.length || buf.length > MAX_BYTES) throw new Error("bad size");
      // A GIF here is the "still rendering" placeholder, not the page.
      if (!/gif/i.test(type)) return { buf, type: type || "image/png" };
    } finally { clearTimeout(t); }
    await new Promise(r => setTimeout(r, 6000));
  }
  throw new Error("thum.io still rendering");
}

/* Two free services, tried in order. Microlink gives the nicer capture but allows
   only ~50 a day per address, which a few regenerations can exhaust; thum.io then
   keeps Explore populated instead of dropping every card back to a mock. */
/* Bot protection (Cloudflare and friends) shows the renderer an interstitial
   instead of the site, and a picture of "Performing security verification" is
   worse than no picture at all. Those pages are nearly blank, and a compressed
   screenshot of them is far smaller than one of a real page: measured at 1000px
   wide, real homepages came in at 127-577 KB and a challenge page at 43 KB. */
function looksBlank(buf, w) {
  const px = Math.max(1, w * Math.round(w * 0.625));
  return buf.length / px < 0.10;
}

const SHOT_PROVIDERS = [fromThumio, fromMicrolink];

export async function getShot(rawUrl, width, cacheDir) {
  const w = Math.max(600, Math.min(1600, Number(width) || 1200));
  let u;
  try { u = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : "https://" + rawUrl); }
  catch { const e = new Error("bad url"); e.status = 400; throw e; }
  if (u.protocol !== "https:" && u.protocol !== "http:") { const e = new Error("scheme"); e.status = 400; throw e; }
  if (!(await isPublicHost(u.hostname))) { const e = new Error("not public"); e.status = 400; throw e; }

  const key = keyFor(u.href, w);
  const hit = mem.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit;

  const file = path.join(cacheDir, key + ".img");
  if (await fresh(file)) {
    try {
      const buf = await readFile(file);
      const rec = { buf, type: buf[0] === 0xff ? "image/jpeg" : buf[0] === 0x52 ? "image/webp" : "image/png", at: Date.now() };
      mem.set(key, rec);
      return rec;
    } catch {}
  }

  let got = null, lastErr = null, weak = null;
  for (const provider of SHOT_PROVIDERS) {
    try {
      const shot = await provider(u.href, w);
      // Keep a thin capture only as a last resort; another provider may get through.
      if (looksBlank(shot.buf, w)) { if (!weak || shot.buf.length > weak.buf.length) weak = shot; continue; }
      got = shot; break;
    } catch (e) { lastErr = e; }
  }
  if (!got) {
    const e = new Error(weak ? "blocked by bot protection" : (lastErr ? lastErr.message : "no provider"));
    e.status = 502; e.code = weak ? "blocked" : "no_shot";
    throw e;
  }
  const rec = { ...got, at: Date.now() };
  mem.set(key, rec);
  try { await mkdir(cacheDir, { recursive: true }); await writeFile(file, got.buf); } catch {}
  return rec;
}
