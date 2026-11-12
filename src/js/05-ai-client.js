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
      const m = text.match(/[\[{][\s\S]*[\]}]/);
      try { return JSON.parse(m ? m[0] : text); } catch { throw aiError("bad_json", "The AI reply wasn't valid JSON."); }
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
