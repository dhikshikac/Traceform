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
  // Spec-sheet content for the design system: its own request, after the tokens.
  if (/SPEC SHEET CONTENT/.test(p)) return {
    imagery: { show: [{ subject: "carrot crate", what: "A farmer's crate of carrots at the loading dock", why: "members choose by farm" }, { subject: "farm stand", what: "The Saturday farm stand", why: "mock" }], avoid: [{ what: "Supermarket aisle stock photos", why: "members said it feels like a chain" }] },
    samples: { headline: "Mock kit headline", body: "Mock kit body sentence about this week's farms.", nav: ["Shop", "Farms", "Pickup"], items: [{ name: "Mock kit carrots", detail: "From Hollow Creek Farm", meta: "$3" }, { name: "Mock kit eggs", detail: "A dozen, mixed", meta: "$6" }], field: { label: "Member number", example: "RB-1042", error: "Enter your member number" }, chips: ["Local", "Organic", "This week"] } };
  if (/visual directions/.test(p)) return { directions: [1, 2, 3].map(i => ({ name: `Mock direction ${i}`, desc: "A mock direction.", borrow: "the layout", why: "mock card", palette: { bg: "#F7F5F0", fg: "#1A1A1A", accent: ["#2F5D50", "#8A3B12", "#334E7A"][i - 1], card: "#FFFFFF" }, font: "Fraunces", body: "Roboto", headline: "Mock headline", sub: "Mock subhead", cta: "Shop the week", nav: ["Shop", "Farms", "About"], items: [["Item", "4"], ["Item", "6"], ["Item", "3"]], img: "" })) };
  if (/design tokens/.test(p)) return { tokens: [{ k: "color.accent", v: "#2F5D50", why: "mock: farm green", not: "supermarket red", typical: "bright red", typicalPct: 62, minePct: 9 }, { k: "color.ground", v: "#F7F5F0", why: "mock", not: "pure white", typical: "pure white", typicalPct: 70 }, { k: "comp.cta", v: "“Shop the week”", why: "mock", not: "“Shop now”", typical: "“Shop now”", typicalPct: 80 }], reasoning: { color: "Mock reasoning for color." } };
  // Prompting one section of the designed page: a question is answered, anything else rewrites the section.
  if (/THE DESIGNER IS ASKING ABOUT ONE SECTION/.test(p)) {
    const said = (p.match(/THE DESIGNER SAYS: """([\s\S]*?)"""/) || [])[1] || "";
    if (/why/i.test(said)) return { reply: "Because members choose by farm.", change: false };
    return {
      reply: "Shortened the headline.", change: true, remove: false,
      html: '<section class="hero" data-tf="hero"><h1>Edited by prompt</h1><button type="button" class="cta">Shop the week</button><div data-tf="stray">x</div></section>',
      css: '.pg [data-tf="hero"] h1{color:#00FF00}',
      record: { name: "Hero", receipt: "Shorter headline <- designer's call", uses: { cards: [], refs: [], tokens: ["type.display"] }, gaps: [], typical: [["long headline", 60], ["short headline", 30]], mine: "short headline" }
    };
  }
  // The designed home page. It cites the first insight card by its real id, and
  // deliberately writes one colour and one font from outside the design system
  // so the test can see them corrected.
  if (/WHAT TO MAKE/.test(p)) {
    const card = (p.match(/\[Mock theme A\] (\w+):/) || [])[1] || "";
    return {
      css: ".pg .hero{padding:var(--s4);background:#FF00FF;font-family:Comic Sans MS,cursive}.pg .hero h1{font-size:var(--t-display);color:var(--ink)}.pg .cta{background:var(--accent);color:var(--on-accent);border-radius:var(--r-m);padding:var(--s2) var(--s3)}.pg .ph{aspect-ratio:16/9}",
      html: '<section class="hero" data-tf="hero"><h1>Mock site headline</h1><span class="cta">Shop the week</span><img width="10" height="10"><figure class="ph" data-photo="carrot crate">Farmer holding a crate of carrots</figure></section><section data-tf="extra"><p>Mock second section</p></section>',
      nav: [{ label: "Home", current: true }, { label: "Shop", current: false }],
      sections: [
        { id: "hero", name: "Hero", receipt: "Farm named in the headline <- members choose by where food comes from", uses: { cards: [card, "c-invented"], refs: ["A reference nobody saved"], tokens: ["color.accent", "comp.cta"] }, gaps: ["[PHOTO] real farm photo"], typical: [["lifestyle stock photo", 70], ["farm photo", 15]], mine: "farm photo" },
        { id: "extra", name: "Second section", receipt: "", uses: { cards: [], refs: [], tokens: [] }, gaps: [], typical: [], mine: "" },
        { id: "ghost", name: "Not on the page", receipt: "x", uses: {}, gaps: [], typical: [], mine: "" }],
      reasoning: "Mock reasoning for the page."
    };
  }
  if (/Write all content/.test(p)) return { brand: "Mock Co-op", cta: "Shop the week", hero: { headline: "Mock site headline", sub: "Mock supporting line from the research.", caption: "", img: "", alt: "Farmer holding a crate of carrots at the loading dock" }, items: { title: "This week", sub: "From farms within 60 miles", button: "Add", show: 3, gap: "", list: [{ n: "Carrots", d: "Mock description", p: "3", tags: ["local"], img: "", alt: "Carrots", group: "Produce", heat: 0 }, { n: "Eggs", d: "Mock", p: "6", tags: [], img: "", alt: "Eggs", group: "Dairy", heat: 0 }, { n: "Bread", d: "Mock", p: "5", tags: [], img: "", alt: "Bread", group: "Bakery", heat: 0 }] } };
  if (/decision record/.test(p)) return { review: { hero: { name: "Hero", receipt: "Farm photo, not stock ← mock card", gaps: ["[PHOTO] real farm photo"], typical: [["lifestyle stock photo", 70], ["farm photo", 15]], mine: "farm photo" } } };
  return { assumptions: [], cards: [] };
}
