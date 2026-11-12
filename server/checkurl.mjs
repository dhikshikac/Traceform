// Verify that a referenced website actually exists.
//
// The Explore list names real sites as inspiration, and a language model will
// happily invent a plausible URL. Every proposed reference is checked here before
// the UI presents it as real; anything that does not answer is dropped.
//
// This makes the server fetch a URL chosen by the model, so the hostname is
// resolved first and anything that is not a public address is refused — a model
// (or a prompt-injected research file) must not be able to aim it at localhost
// or at a cloud metadata endpoint.

import dns from "node:dns/promises";
import net from "node:net";

const TIMEOUT = 8000;
const UA = "traceform/0.1 (link check; coursework project)";

function isPrivate(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 ||
      (a === 169 && b === 254) ||                 // link-local, incl. cloud metadata
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||       // CGNAT
      a >= 224;                                    // multicast / reserved
  }
  const s = ip.toLowerCase();
  return s === "::1" || s === "::" || s.startsWith("fe80") || s.startsWith("fc") || s.startsWith("fd") ||
    s.startsWith("::ffff:");                       // IPv4-mapped: refuse rather than re-parse
}

export async function isPublicHost(hostname) {
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".internal")) return false;
  if (net.isIP(hostname)) return !isPrivate(hostname);
  try {
    const addrs = await dns.lookup(hostname, { all: true });
    return addrs.length > 0 && addrs.every(a => !isPrivate(a.address));
  } catch { return false; }
}

async function hit(url, method) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    return await fetch(url, { method, redirect: "follow", signal: ctl.signal, headers: { "user-agent": UA, accept: "text/html,*/*" } });
  } finally { clearTimeout(t); }
}

export async function checkUrl(raw) {
  let u;
  try { u = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw); }
  catch { return { url: raw, ok: false, reason: "malformed" }; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return { url: raw, ok: false, reason: "scheme" };
  if (!(await isPublicHost(u.hostname))) return { url: raw, ok: false, reason: "not_public" };

  try {
    // Some sites refuse HEAD; fall back to GET before believing a failure.
    let r = await hit(u.href, "HEAD");
    if (!r.ok || r.status >= 400) r = await hit(u.href, "GET");
    // A redirect may land somewhere private, so re-check where we ended up.
    const final = new URL(r.url || u.href);
    if (!(await isPublicHost(final.hostname))) return { url: u.href, ok: false, reason: "redirect_private" };
    // Plenty of real sites refuse unknown clients (403/429) or disallow the method
    // (405). The host resolved and answered, which is what we are checking: that
    // the site exists. Only a 404/410 or a server error means "not a real page".
    const exists = (r.status >= 200 && r.status < 400) || [401, 403, 405, 406, 429].includes(r.status);
    return { url: final.href, ok: exists, status: r.status, host: final.hostname };
  } catch (e) {
    return { url: u.href, ok: false, reason: e.name === "AbortError" ? "timeout" : "unreachable" };
  }
}

export async function checkUrls(list) {
  const urls = [...new Set((list || []).map(String).filter(Boolean))].slice(0, 12);
  return Promise.all(urls.map(checkUrl));
}
