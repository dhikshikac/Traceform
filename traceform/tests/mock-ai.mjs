// A fake OpenAI-compatible AI server for developing without an API key.
//   Terminal 1: npm run mock-ai
//   Terminal 2: AI_PROVIDER=openai OPENAI_BASE_URL=http://localhost:5174/v1 npm start
// It calls the first offered tool once (with simple arguments) and then replies with text,
// so you can test the whole tool loop end to end.
import http from "node:http";
const PORT = Number(process.env.MOCK_PORT || 5174);
http.createServer(async (req, res) => {
  let body = ""; for await (const c of req) body += c;
  const j = JSON.parse(body || "{}");
  const msgs = j.messages || [];
  const lastUser = [...msgs].reverse().find(m => m.role === "user");
  const userText = typeof lastUser?.content === "string" ? lastUser.content : (lastUser?.content || []).map(p => p.text || "").join(" ");
  const usedTool = msgs.some(m => m.role === "tool");
  let message;
  if (j.response_format?.type === "json_object" || /JSON only/.test(userText)) {
    message = { role: "assistant", content: JSON.stringify(mockJSON(userText)) };
  } else if (j.tools?.length && !usedTool) {
    const t = j.tools[0].function, props = t.parameters?.properties || {};
    const args = Object.fromEntries(Object.entries(props).map(([k, s]) => [k, s.enum ? s.enum[0] : s.type === "boolean" ? false : s.type === "number" ? 1 : `mock ${k}`]));
    message = { role: "assistant", content: null, tool_calls: [{ id: "call_" + Date.now(), type: "function", function: { name: t.name, arguments: JSON.stringify(args) } }] };
  } else {
    message = { role: "assistant", content: `(mock AI) Done. I read ${msgs.length} messages${usedTool ? " and used a tool" : ""}.` };
  }
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ choices: [{ message, finish_reason: message.tool_calls ? "tool_calls" : "stop" }] }));
}).listen(PORT, () => console.log(`Mock AI on http://localhost:${PORT}/v1`));

// Canned JSON for each generation stage, picked by a phrase in the prompt (see src/js/70-generate.js).
function mockJSON(p) {
  if (/affinity mapping/.test(p)) return { themes: [
    { name: "Mock theme A", cards: [{ text: "Members choose by where food comes from.", quotes: ["“I want to know which farm it came from.” — member"], source: "project_brief.md", conf: "high" }] },
    { name: "Mock theme B", cards: [{ text: "Older members order on phones with large text.", quotes: ["“The print is too small.” — member"], source: "project_brief.md", conf: "medium" }] }],
    assumptions: [{ label: "Hero relies on generic lifestyle stock photos", why: "research shows members care about specific farms" }] };
  if (/visual directions/.test(p)) return { directions: [1, 2, 3].map(i => ({ name: `Mock direction ${i}`, desc: "A mock direction.", borrow: "the layout", why: "mock card", palette: { bg: "#F7F5F0", fg: "#1A1A1A", accent: ["#2F5D50", "#8A3B12", "#334E7A"][i - 1], card: "#FFFFFF" }, font: "Fraunces", body: "Roboto", headline: "Mock headline", sub: "Mock subhead", cta: "Shop the week", nav: ["Shop", "Farms", "About"], items: [["Item", "4"], ["Item", "6"], ["Item", "3"]], img: "" })) };
  if (/design tokens/.test(p)) return { tokens: [{ k: "color.accent", v: "#2F5D50", why: "mock: farm green", not: "supermarket red", typical: "bright red", typicalPct: 62 }, { k: "color.ground", v: "#F7F5F0", why: "mock", not: "pure white", typical: "pure white", typicalPct: 70 }, { k: "comp.cta", v: "“Shop the week”", why: "mock", not: "“Shop now”", typical: "“Shop now”", typicalPct: 80 }], reasoning: { color: "Mock reasoning for color." } };
  if (/Write all content/.test(p)) return { brand: "Mock Co-op", cta: "Shop the week", hero: { headline: "Mock site headline", sub: "Mock supporting line from the research.", caption: "", img: "", alt: "Farmer holding a crate of carrots at the loading dock" }, items: { title: "This week", sub: "From farms within 60 miles", button: "Add", show: 3, gap: "", list: [{ n: "Carrots", d: "Mock description", p: "3", tags: ["local"], img: "", alt: "Carrots", group: "Produce", heat: 0 }, { n: "Eggs", d: "Mock", p: "6", tags: [], img: "", alt: "Eggs", group: "Dairy", heat: 0 }, { n: "Bread", d: "Mock", p: "5", tags: [], img: "", alt: "Bread", group: "Bakery", heat: 0 }] } };
  if (/decision record/.test(p)) return { review: { hero: { name: "Hero", receipt: "Farm photo, not stock ← mock card", gaps: ["[PHOTO] real farm photo"], typical: [["lifestyle stock photo", 70], ["farm photo", 15]], mine: "farm photo" } } };
  return { assumptions: [], cards: [] };
}
