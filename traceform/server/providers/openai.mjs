// Any OpenAI-compatible Chat Completions API:
// OpenAI, Azure OpenAI, OpenRouter, Groq, Together, a local Ollama or LM Studio server, etc.
// Set OPENAI_BASE_URL to the provider's /v1 URL (e.g. http://localhost:11434/v1 for Ollama).
import { SYSTEM } from "./system.mjs";

export function create(env) {
  const key = env.OPENAI_API_KEY || "";
  const base = (env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = env.AI_MODEL || "gpt-4o";
  const quick = env.AI_MODEL_QUICK || model;
  const configured = !!key || !!env.OPENAI_BASE_URL;

  // neutral (Anthropic-style) messages -> OpenAI chat messages
  function toOpenAI(messages) {
    const out = [{ role: "system", content: SYSTEM }];
    for (const m of messages) {
      if (typeof m.content === "string") { out.push({ role: m.role, content: m.content }); continue; }
      const results = m.content.filter(b => b.type === "tool_result");
      results.forEach(b => out.push({ role: "tool", tool_call_id: b.tool_use_id, content: String(b.content) }));
      const calls = m.content.filter(b => b.type === "tool_use");
      const parts = m.content.filter(b => b.type === "text" || b.type === "image").map(b => b.type === "text" ? { type: "text", text: b.text } : { type: "image_url", image_url: { url: `data:${b.media_type};base64,${b.data}` } });
      if (m.role === "assistant") {
        out.push({ role: "assistant", content: parts.map(p => p.text || "").join("\n") || null, ...(calls.length ? { tool_calls: calls.map(c => ({ id: c.id, type: "function", function: { name: c.name, arguments: JSON.stringify(c.input || {}) } })) } : {}) });
      } else if (parts.length) out.push({ role: "user", content: parts });
    }
    return out;
  }

  return {
    configured,
    info: () => ({ configured, provider: "openai-compatible", model, images: true }),
    async complete({ tier = "default", messages = [], tools = [], json = false }) {
      const body = {
        model: tier === "quick" ? quick : model,
        messages: toOpenAI(messages),
        max_tokens: Number(env.AI_MAX_TOKENS || 8192),
        ...(tools.length ? { tools: tools.map(t => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.input_schema } })) } : {}),
        ...(json && !tools.length ? { response_format: { type: "json_object" } } : {}),
      };
      const r = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", ...(key ? { authorization: `Bearer ${key}` } : {}) },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw Object.assign(new Error(j.error?.message || r.statusText), { status: r.status === 429 ? 429 : 502, code: r.status === 429 ? "rate_limited" : "provider_error", publicMessage: j.error?.message });
      const msg = j.choices?.[0]?.message || {};
      return {
        text: msg.content || "",
        tool_calls: (msg.tool_calls || []).map(c => ({ id: c.id, name: c.function.name, input: safeParse(c.function.arguments) })),
        stop: j.choices?.[0]?.finish_reason,
      };
    },
  };
}

function safeParse(s) { try { return JSON.parse(s || "{}"); } catch { return {}; } }
