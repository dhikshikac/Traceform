/* AI client.
 *
 * Every AI feature in the app calls one global, `sample`, with this shape:
 *
 *   await sample(promptOrMessages, {modelTier, tools, onText, images})  -> {text}
 *   await sample.json(prompt, {modelTier})                              -> parsed JSON
 *   await sample.limits()                                              -> {tools, images}
 *
 * TraceformAI.connect() picks a backend for it:
 *   1. Inside a Claude artifact: the viewer's own Claude account (window.claude).
 *   2. Otherwise: this repo's server at /api/ai, which forwards to the provider in .env.
 *   3. Neither: null, and the app runs in offline mode (no AI, everything else works).
 *
 * Tools run here in the browser, because they change app state (add a card, set a token).
 * The server only relays messages; it never sees or stores the project.
 */
const TraceformAI = (() => {
  const MAX_TOOL_ROUNDS = 6;

  function aiError(code, text) { const e = new Error(text || code); e.code = code; if (text) e.text = text; return e; }

  async function blobToBase64(blob) {
    const buf = new Uint8Array(await blob.arrayBuffer());
    let s = ""; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return { media_type: blob.type || "image/jpeg", data: btoa(s) };
  }

  async function post(body) {
    let r;
    try { r = await fetch("api/ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
    catch { throw aiError("network", "Couldn't reach the Traceform server."); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw aiError(j.code || (r.status === 429 ? "rate_limited" : "provider_error"), j.error);
    return j; // {text, tool_calls:[{id,name,input}], stop}
  }

  function serverSample(info) {
    async function run(input, opts = {}) {
      const messages = typeof input === "string" ? [{ role: "user", content: input }] : input.map(m => ({ role: m.role, content: m.content }));
      if (opts.images?.length) {
        const imgs = await Promise.all(opts.images.map(blobToBase64));
        const last = messages[messages.length - 1];
        last.content = [...imgs.map(i => ({ type: "image", ...i })), { type: "text", text: String(last.content) }];
      }
      const tools = (opts.tools || []).map(t => ({ name: t.name, description: t.description, input_schema: t.inputSchema }));
      let text = "";
      for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
        const res = await post({ tier: opts.modelTier || "default", messages, tools, json: !!opts._json });
        if (res.text) { text += (text ? "\n" : "") + res.text; opts.onText?.({ text }); }
        if (!res.tool_calls?.length || !opts.tools) break;
        messages.push({ role: "assistant", content: [...(res.text ? [{ type: "text", text: res.text }] : []), ...res.tool_calls.map(c => ({ type: "tool_use", id: c.id, name: c.name, input: c.input }))] });
        const results = [];
        for (const c of res.tool_calls) {
          const tool = opts.tools.find(t => t.name === c.name);
          let out;
          try { out = tool ? await tool.execute(c.input || {}) : { error: "unknown tool" }; } catch (e) { out = { error: String(e.message || e) }; }
          results.push({ type: "tool_result", tool_use_id: c.id, content: JSON.stringify(out ?? { ok: true }) });
        }
        messages.push({ role: "user", content: results });
      }
      return { text };
    }
    run.json = async (prompt, opts = {}) => {
      const { text } = await run(prompt + "\n\nReply with JSON only, no prose and no code fences.", { ...opts, _json: true });
      const out = parseLooseJSON(text);
      if (out === undefined) throw aiError("bad_json", "The AI reply wasn't valid JSON.");
      return out;
    };
    run.limits = async () => ({ tools: true, images: !!info.images, provider: info.provider, model: info.model });
    return run;
  }

  async function connect() {
    try { if (window.claude?.use) { const s = await window.claude.use("sample"); if (s) return s; } } catch { /* not inside Claude */ }
    try {
      const r = await fetch("api/ai/health", { cache: "no-store" });
      if (r.ok) { const info = await r.json(); if (info.configured) return serverSample(info); }
    } catch { /* static hosting, no server */ }
    return null;
  }

  return { connect };
})();


/* Models slip on the JSON wrapper more often than on the content: a list of
   tokens followed by a stray "reasoning": {...} with the opening {"tokens":
   missing, a trailing comma, a code fence. Throwing all of it away meant a whole
   design system failed over one missing brace, so the usual slips are repaired. */
function parseLooseJSON(text) {
  const t = String(text || "").replace(/```(?:json)?/gi, "").trim();
  const m = t.match(/[\[{][\s\S]*[\]}]/); const core = m ? m[0] : t;
  const noTrail = s => s.replace(/,\s*([\]}])/g, "$1");
  const cands = [core, noTrail(core)];
  if (core.startsWith("[") && /\]\s*,\s*"\w+"\s*:/.test(core)) {
    /* Wrap it, dropping stray closing brackets from the end until it parses. */
    let body = noTrail(core).trimEnd();
    for (let k = 0; k < 4; k++) { cands.push(`{"tokens":${body}}`); if (!/[\]}]$/.test(body)) break; body = body.slice(0, -1).trimEnd(); }
  }
  for (const c of cands) { try { return JSON.parse(c); } catch {} }
  /* Last resort: the first complete value at the start. */
  let depth = 0, inStr = false, esc = false;
  for (let i = 0; i < core.length; i++) {
    const ch = core[i];
    if (inStr) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') inStr = true; else if (ch === "{" || ch === "[") depth++;
    else if (ch === "}" || ch === "]") { depth--; if (depth === 0) { try { return JSON.parse(noTrail(core.slice(0, i + 1))); } catch { break; } } }
  }
  return undefined;
}
