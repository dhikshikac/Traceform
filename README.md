# Traceform
# Traceform

**A research-first AI design tool.** Traceform makes every design decision traceable to user research, so AI-generated designs come out specific to the people they're for instead of generic.

The demo project is **Mali's Table**, a family-run northern Thai restaurant. Three more sample projects are included: a food co-op, a ceramics studio and a clinic.

> INFO 3160 group project. The UI follows Google's [Material 3](https://m3.material.io/) design system.

---

## How it works

You upload research. The AI reads it and builds each stage on top of the one before. You can edit everything it makes.

```
research artifacts ─▶ themes, insight cards, assumptions ─▶ inspiration directions ─▶ design system ─▶ site + review
     (you)                      (AI, editable)                  (AI, editable)         (AI, editable)   (AI, editable)
```

| Step | Page | What the AI generates | What you can edit |
|---|---|---|---|
| 0 | **Projects** | — | The app opens on a landing page of all your projects. **New project** asks what you're building, what kind of project it is (or lets Traceform decide from your description), the name, who it's for, context, and what it should never feel like, plus optional research files. Change these later with **Edit details** on a project card or **Project details** on the Research page. |
| 1 | **Research** | Groups findings into themes and insight cards, each with verbatim quotes and a confidence level. Lists the assumptions an AI would make that the research doesn't support. | Rename or delete themes; open any card to edit its text, quotes and source; keep or reject assumptions. Rejected assumptions become the avoid-list for every later stage. |
| 2 | **Inspiration** | Four visual directions, each tied to an insight. | Save directions, select a part and annotate what to borrow, upload your own references, remove any. |
| 3 | **Design system** | Color, type, spacing, imagery and component tokens, each with why (the evidence), what it is not, and how common it is in AI output. Plus reasoning for each section. | Every token's value, why and not. Swap in a prebuilt base system. |
| 4 | **Review** | All site copy and image direction across four pages, and a decision record for every element (decision ← evidence, gaps, typicality). | Click any part to edit its content and decision record, or prompt the AI to change just that part. Includes a WCAG audit with fixes, version history and export. |

Moving forward runs the next stage automatically the first time ("Continue to Inspiration" generates directions, and so on). **Build everything from research** on the Research page runs all stages in one go. Each page has a **Regenerate** button.

**The project details steer every stage.** Each AI request starts with the project type (which shapes the pages, items and primary action), what you're building, who it's for, your context and what it must never feel like, followed by the avoid-list. The research then decides the specific choices, and when the research and your context disagree, the AI is told to follow the research and say so.

Without an AI connected, each stage fills in a clearly marked template instead, so the app still works end to end.

---|---|---|
| 0 | **Projects** | Pick a project, or fill in a short form: what you're building, who it's for, context, and what it should never feel like. |
| 1 | **Research** | Upload interview notes, transcripts, surveys or a FigJam affinity map. Group findings into insight cards with their quotes. Reject the **assumptions** an AI would make by default; rejected ones become the avoid-list. |
| 2 | **Inspiration** | Save references (your uploads or examples), annotate the parts you want to borrow, and remove ones you don't. |
| 3 | **Design system** | Color, type, spacing, imagery and components, each with the research-based reason for the choice. Start from a prebuilt system or let the AI draft one. |
| 4 | **Review** | See the generated site. Click any part to see the decision behind it, how typical it is of AI designs, research gaps, and to prompt edits to that part only. Includes a WCAG audit with fixes, version history, and export. |

---

## Quick start

You need [Node.js 18 or newer](https://nodejs.org/). There are no runtime dependencies.

```bash
git clone https://github.com/<your-org>/traceform.git
cd traceform
npm start
```

Open http://localhost:5173. Without an AI key the app runs in **offline mode**: everything works except the features that call an AI (they say so in the UI).

To turn the AI on, see [Connecting an AI](#connecting-an-ai).

### Commands

| Command | What it does |
|---|---|
| `npm start` | Runs the app and AI proxy at http://localhost:5173 |
| `npm run dev` | Same, and restarts the server when files in `server/` change. Front-end changes only need a browser refresh. |
| `npm run mock-ai` | Starts a fake AI on port 5174, so you can test AI features without a key (see below) |
| `npm run build` | Builds a static copy into `dist/` (no AI) |
| `npm run check` | Syntax-checks everything |
| `npm test` | Check + headless browser tests: a smoke test and the full AI pipeline against the mock AI (run `npm install` and `npx playwright install chromium` once first) |

---

## Project structure

```
traceform/
├── index.html                  App markup (all pages; JS shows and hides them)
├── src/
│   ├── styles/app.css          Material 3 tokens (light and dark) and all component styles
│   └── js/                     Concatenated in filename order into app.js
│       ├── 00-images.js        Demo image paths
│       ├── 05-ai-client.js     The single AI entry point (`sample`), see below
│       ├── 10-state-research.js  Seed data, persistence, Research page
│       ├── 20-design-system-specs.js  Spec sheets: color, type, space, imagery, components
│       ├── 30-site-renderer.js  Renders the generated website + the "typical AI" baseline
│       ├── 40-app.js           Design system + Review pages, WCAG audit, versions, prompting, export, routing
│       ├── 50-inspiration.js   Inspiration page
│       ├── 60-projects.js      Multiple projects, landing page, new-project form
│       └── 70-generate.js      The AI pipeline: prompts, parsing, templates, banners, content editors
├── public/img/                 Placeholder food photography (generated; replace freely)
├── server/
│   ├── server.mjs              Dev server + /api/ai proxy (keeps the API key off the browser)
│   └── providers/              One file per AI provider, plus the shared system prompt
├── scripts/                    build + check
├── tests/                      Smoke test, pipeline test, mock AI
└── .github/workflows/          CI on every PR; optional GitHub Pages deploy
```

### Things to know before editing

- **Files share globals.** `S` is the current project's state, `$`/`$$` select elements, `save()` persists, and `renderAll()` redraws. Later files deliberately **override** some earlier functions (`60-projects.js` replaces `load()` and `save()`), which is why they're concatenated rather than loaded as modules. Keep the number prefixes when adding files.
- **State lives in the browser** (`localStorage`, key `traceform-projects`). To reset, run `localStorage.clear()` in the browser console and reload. There is no database or account system yet.
- **Changing the seed data?** It's in `SEED()` (`10-state-research.js`) for Mali's Table, and in `makeSeedStore()` (`60-projects.js`) for the other projects. Existing browsers keep their saved copy until it's cleared.
- **Top-level `const` and `let`** in an early file can't be used by code that runs at load time in an earlier file (temporal dead zone). If something must be ready during `load()`, use a function or `var`.

---

## Connecting an AI

All AI features go through one function, `sample`, created in `src/js/05-ai-client.js`. When the app starts, `TraceformAI.connect()` picks a backend:

1. **Inside Claude** (published as a Claude artifact): uses the viewer's own Claude account. No key is needed.
2. **This repo's server**: the browser calls `POST /api/ai`, and `server/server.mjs` forwards the call to the provider you configured. **The API key stays on the server.** Never put a key in front-end code.
3. **Neither**: offline mode.

```
Browser (app.js)                    server/server.mjs                 AI provider
  sample(messages, {tools}) ──POST /api/ai──▶ providers/<name>.mjs ──▶ Claude / OpenAI / Ollama…
          ▲                                                                   │
          └── runs any tool calls in the browser, sends the results back ◀────┘
```

Tools (for example `add_insight_card`, `add_assumption`, `set_token`) **run in the browser** because they change the project. The server only relays messages and doesn't store anything.

### Option A: Claude (Anthropic)

1. Get a key at https://console.anthropic.com.
2. `cp .env.example .env`
3. In `.env`, set `ANTHROPIC_API_KEY=sk-ant-...`
4. Run `npm start`. The terminal shows `AI: anthropic · claude-sonnet-5-5`, and the app bar shows **AI live**.

Quick tasks (drafting assumptions, alt text) use `AI_MODEL_QUICK`, which defaults to `claude-haiku-5-5`. Everything else uses `AI_MODEL`.

### Option B: OpenAI or any OpenAI-compatible API

This works for OpenAI, Azure OpenAI, OpenRouter, Groq, Together, and local models through Ollama or LM Studio.

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1   # or e.g. http://localhost:11434/v1 for Ollama
AI_MODEL=gpt-4o                             # or llama3.1, etc.
```

Local models need to support tool calling for the "prompt this part" and research features to change anything.

### Option C: No key, for development

```bash
npm run mock-ai                                                         # terminal 1
AI_PROVIDER=openai OPENAI_BASE_URL=http://localhost:5174/v1 npm start   # terminal 2
```

The mock returns canned output for every pipeline stage and tool call, so you can test the whole flow for free. `tests/pipeline.mjs` uses it to check the pipeline end to end.

### Adding another provider (Gemini, a school-hosted model, etc.)

1. Create `server/providers/<name>.mjs` that exports `create(env)` and returns `{configured, info(), complete({tier, messages, tools, json})}`. Copy `openai.mjs` as a starting point. The message format is documented in `providers/index.mjs`.
2. Register it in the `PROVIDERS` map in `providers/index.mjs`.
3. Set `AI_PROVIDER=<name>` in `.env`.

### Changing what the AI does

| What to change | Where |
|---|---|
| Overall behavior on every request | `server/providers/system.mjs` |
| How project type and context are given to the AI | `projectHeader()` in `70-generate.js` (also used by the research chat and "prompt this part") |
| Design rules and avoid-list context | `RULES` and `ctxSummary()` in `10-state-research.js` |
| What each stage generates (themes, directions, tokens, site, review) | `aiResearch`, `aiInspiration`, `aiSystem`, `aiSite`, `aiReview` in `70-generate.js`. Each has a matching `apply…` function that validates the reply before it touches the project. |
| Research prompting and its tools | The research ask handler in `10-state-research.js` |
| "Prompt this part" on the Review page | `promptBox` / `wirePrompt` in `40-app.js` |
| New-project AI drafting | `create()` in `openWizard`, `60-projects.js` |

### Before sharing a deployed link

The proxy has a per-IP rate limit (`AI_RATE_LIMIT_PER_MIN`, default 20), but anyone with the URL can still spend your credits. For anything public, add a login or a shared passcode in front of `/api/ai`, and set a spending limit in your provider's console.

---

## Deploying

- **Static, no AI (free):** turn on GitHub Pages under Settings → Pages → Source: GitHub Actions. `.github/workflows/pages.yml` publishes `dist/` on every push to `main`.
- **With AI:** deploy the Node server to any host that runs Node 18+ (Render, Railway, Fly.io, a campus VM) with start command `npm start`. Set the `.env` values as environment variables in the host's dashboard.

---

## Working on it as a team

1. One person creates the GitHub repo and pushes this folder. Everyone else clones it.
2. **Never commit `.env`.** It's in `.gitignore`. Share keys privately, or have each person use their own or the mock AI.
3. Work on a branch per feature: `git checkout -b research-filters`.
4. Open a pull request. CI runs `npm test` automatically, and the PR template asks for a screenshot and a phone-width check.
5. Split work by file to avoid merge conflicts. Each page mostly lives in one file (see the structure above).

See [CONTRIBUTING.md](CONTRIBUTING.md) for conventions and suggested next steps.

---

## Known limitations

- Everything is saved in one browser. There are no accounts, sync or real-time collaboration.
- "Typicality" percentages are the AI's estimates (or seeded numbers for Mali's Table), not measured from a real set of AI-generated sites.
- The FigJam import loads prebuilt templates rather than a real board.
- Generated sites use one layout (home, catalog, action, about pages) for every kind of project; the AI fills in the content and the design system styles it.
- Site generation asks for a long reply. Keep `AI_MAX_TOKENS` at 8192 or higher, and use a capable model.
- Figma export produces a tokens and spec file, not a native `.fig` file.
- Images are procedurally generated stand-ins for Mali's Table. Other projects show labeled placeholders with the AI's art direction until you upload real images.

## License

Pick one before making the repo public, for example MIT. Add a `LICENSE` file at the root.
