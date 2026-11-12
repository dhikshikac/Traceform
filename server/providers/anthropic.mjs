// Anthropic Messages API (Claude).
// Docs: https://docs.claude.com/en/api/messages
import { SYSTEM } from "./system.mjs";

export function create(env) {
  const key = env.ANTHROPIC_API_KEY;
  const model = env.AI_MODEL || "claude-sonnet-5-5";
  const quick = env.AI_MODEL_QUICK || "claude-haiku-5-5";
  const base = (env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/$/, "");

  return {
    configured: !!key,
    info: () => ({ configured: !!key, provider: "anthropic", model, images: true }),
    async complete({ tier = "default", messages = [], tools = [] }) {
      const content = b => typeof b === "string" ? b : b.map(x => x.type === "image" ? { type: "image", source: { type: "base64", media_type: x.media_type, data: x.data } } : x);
      const body = {
        model: tier === "quick" ? quick : model,
        max_tokens: Number(env.AI_MAX_TOKENS || 8192),
        system: SYSTEM,
        messages: messages.map(m => ({ role: m.role, content: content(m.content) })),
        ...(tools.length ? { tools } : {}),
      };
      const r = await fetch(`${base}/v1/messages`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw Object.assign(new Error(j.error?.message || r.statusText), { status: r.status === 429 ? 429 : 502, code: r.status === 429 ? "rate_limited" : "provider_error", publicMessage: j.error?.message });
      return {
        text: j.content.filter(b => b.type === "text").map(b => b.text).join("\n"),
        tool_calls: j.content.filter(b => b.type === "tool_use").map(b => ({ id: b.id, name: b.name, input: b.input })),
        stop: j.stop_reason,
      };
    },
  };
}
