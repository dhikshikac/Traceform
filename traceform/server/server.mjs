// Traceform dev server + AI proxy. Node 18+, no dependencies.
//
//   GET  /              index.html
//   GET  /app.js        src/js/*.js concatenated in filename order (rebuilt on every request)
//   GET  /src/... /img/...  static files
//   GET  /api/ai/health which provider is configured (never returns the key)
//   POST /api/ai        {tier, messages, tools, json} -> {text, tool_calls, stop}
//
// The API key stays on the server. The browser never sees it.

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAppJs } from "../scripts/build.mjs";
import { getProvider } from "./providers/index.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Minimal .env loader (KEY=value lines). Real environment variables win.
const envFile = path.join(ROOT, ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith("#") && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const PORT = Number(process.env.PORT || 5173);
const provider = getProvider(process.env);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".ico": "image/x-icon", ".webp": "image/webp" };

// Simple per-IP rate limit so a shared deployment can't run up the bill.
const RATE = Number(process.env.AI_RATE_LIMIT_PER_MIN || 20);
const hits = new Map();
function limited(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter(t => now - t < 60_000);
  list.push(now); hits.set(ip, list);
  return list.length > RATE;
}

function send(res, status, body, type = "application/json") {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

async function readBody(req, max = 15 * 1024 * 1024) {
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > max) throw Object.assign(new Error("Request too large"), { status: 413 }); chunks.push(c); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function serveStatic(res, urlPath) {
  const rel = decodeURIComponent(urlPath === "/" ? "/index.html" : urlPath);
  // public/ is served at the root (public/img/x.jpg -> /img/x.jpg); everything else from the repo root.
  const candidates = [path.join(ROOT, "public", rel), path.join(ROOT, rel)];
  for (const file of candidates) {
    if (!file.startsWith(ROOT) || file.includes(`${path.sep}server${path.sep}`) || file.endsWith(".env")) continue;
    try { if ((await stat(file)).isFile()) return send(res, 200, await readFile(file), TYPES[path.extname(file)] || "application/octet-stream"); } catch {}
  }
  send(res, 404, "Not found", "text/plain");
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  try {
    if (url.pathname === "/app.js") return send(res, 200, await buildAppJs(), TYPES[".js"]);
    if (url.pathname === "/api/ai/health") return send(res, 200, provider.info());
    if (url.pathname === "/api/ai" && req.method === "POST") {
      if (!provider.configured) return send(res, 503, { code: "not_configured", error: "No AI provider configured. Copy .env.example to .env and add a key." });
      if (limited(req.socket.remoteAddress)) return send(res, 429, { code: "rate_limited", error: "Too many requests; try again in a minute." });
      const body = await readBody(req);
      const out = await provider.complete(body);
      return send(res, 200, out);
    }
    return serveStatic(res, url.pathname);
  } catch (e) {
    console.error(e);
    send(res, e.status || 502, { code: e.code || "provider_error", error: e.publicMessage || "The AI provider returned an error." });
  }
}).listen(PORT, () => {
  const i = provider.info();
  console.log(`Traceform running at http://localhost:${PORT}`);
  console.log(i.configured ? `AI: ${i.provider} · ${i.model}` : "AI: offline (no provider configured; see README › Connecting an AI)");
});
