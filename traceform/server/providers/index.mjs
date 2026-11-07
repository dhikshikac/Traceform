// Picks the AI provider from environment variables.
//
// Every provider exposes the same interface:
//   configured: boolean
//   info()      -> {configured, provider, model, images}
//   complete({tier, messages, tools, json}) -> {text, tool_calls:[{id,name,input}], stop}
//
// `messages` use one neutral format (it matches Anthropic's), and each provider translates:
//   {role:"user"|"assistant", content: string | Block[]}
//   Block = {type:"text",text} | {type:"image",media_type,data}
//         | {type:"tool_use",id,name,input} | {type:"tool_result",tool_use_id,content}
//
// To add a provider: write providers/<name>.mjs exporting create(env), add it below.

import { create as anthropic } from "./anthropic.mjs";
import { create as openai } from "./openai.mjs";

const PROVIDERS = { anthropic, openai };

export function getProvider(env) {
  const name = (env.AI_PROVIDER || (env.ANTHROPIC_API_KEY ? "anthropic" : env.OPENAI_API_KEY || env.OPENAI_BASE_URL ? "openai" : "none")).toLowerCase();
  if (!PROVIDERS[name]) return { configured: false, info: () => ({ configured: false, provider: "none" }), complete: async () => { throw new Error("No provider"); } };
  return PROVIDERS[name](env);
}
