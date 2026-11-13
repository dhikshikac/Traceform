# Traceform

**A research-first AI design tool.** Traceform makes every design decision traceable to user research, so AI-generated designs come out specific to the people they're for instead of generic.

It ships with four sample projects: **Mali's Table** (a family-run northern Thai restaurant, fully built out), a food co-op, a ceramics studio and a clinic patient portal.

> INFO 3160 group project. The app's own UI follows Google's [Material 3](https://m3.material.io/) design system.

---

## How it works

You add research. The AI reads it and builds each stage on top of the ones before it. You can change what it makes at every stage.

```
research artifacts ─▶ themes, insight cards, assumptions ─▶ inspiration ─▶ design system ─▶ home page + review
     (you)                      (AI, editable)             (AI + you)     (AI, editable)   (AI, promptable)
```

| Step | Page | What the AI generates | What you do |
|---|---|---|---|
| 0 | **Projects** | — | The app opens on a list of your projects. **New project** asks what you're building, what kind of project it is (or lets Traceform decide from the description), its name, who it's for, and context. A card's menu has Open, Edit details, Rename, Duplicate and Delete. Deleted projects sit in **Recently deleted** for 30 days. |
| 1 | **Research** | Groups findings into themes and insight cards, each with quotes copied from your files and a confidence level. Lists the assumptions an AI tool would make that the research doesn't support. | Upload `.txt`, `.md`, `.csv`, `.json` or `.pdf` files, or paste text. Edit, add and pin themes; open a card to edit its text, quotes and source; keep or reject assumptions. **Add something you learned** turns a typed note into cards. Every quote is checked against the uploaded text, and ones that can't be found are flagged. |
| 2 | **Inspiration** | Three visual directions, each tied to an insight. For each, it names one real website; the server confirms the site exists and shows a screenshot of it. | Save a direction, drag over the part you want and say what to borrow, or borrow the whole thing. Upload your own reference images. Only what you save and mark informs later stages. |
| 3 | **Design system** | Colour, type, spacing, radius, imagery and component tokens. Each has a why (the evidence), a "what it is not", and the AI's estimate of how common the choice is in AI output. Plus a paragraph of reasoning per section, and the content of the spec sheets: sample copy in the project's own words, the photographs the research calls for, and the kinds of image to avoid. | Edit any token's value, why and not. Swap in a prebuilt base (Material 3, Human Interface, Carbon, Polaris) or paste your own tokens as JSON. **Reset to draft** returns to what was generated. Upload your own photographs, each with a note on how to use it that you write or have the AI draft from the research and the photo itself. |
| 4 | **Review** | A designed home page: its own structure, sections and copy, built from the research, the saved inspiration and the design system, with a decision record for every section. | Click a section to see why it is the way it is, ask about it, or prompt a change to just that section. Run the accessibility audit, go back through version history, and export. |

Opening a page for the first time generates it, along with any earlier stage that hasn't been generated yet. Every page has a **Regenerate** button.

**The project details steer every stage.** Each AI request starts with the project type, what you're building, who it's for and your context, followed by the avoid-list (your rejected assumptions and hard rules). The research then decides the specific choices. When research and context disagree, the AI is told to follow the research and say so.

Without an AI connected, each stage fills in a clearly marked template instead, so every page still loads.

### How the Review page keeps the design tied to the earlier pages

- **Research.** Each section must cite the insight cards it rests on. Those citations are checked against the project, so an invented one is dropped, and a section with nothing behind it is tagged **AI alone**.
- **Inspiration.** Only references you saved and marked are sent to the AI. Uploaded reference images are sent as images when the provider can read them.
- **Design system.** Colour, fonts, type sizes, spacing and radius reach the page as CSS variables, so editing a token on the System page restyles the page without regenerating it. A colour or font the AI writes from outside the system is replaced with the nearest token.
- **Built from.** The Decisions tab shows how many insight cards, borrowed references and tokens the page actually uses, and warns when any of the three has changed since the page was designed.

The Review side panel has three tabs:

| Tab | What it shows |
|---|---|
| **Decisions** | With nothing selected: the overview above, one line per section, and pattern flags. With a section selected: only that section — its decision, what it is based on, how common the choice is, research gaps, and **Prompt this part**. |
| **Audit** | [axe-core](https://github.com/dequelabs/axe-core) run on the page as rendered, against the WCAG 2.2 A and AA rules it automates plus its best-practice rules. Each problem is written in plain language: what is wrong, who it affects, where it is, and how to fix it, with the WCAG number and axe's own wording under **Technical details**. **Fix it for me** appears only when a contrast failure is between two of your tokens. Whether the page fits a 320px-wide screen has no axe rule, so Traceform measures that one itself. |
| **History** | Every token edit, section edit and regenerated page is a version you can preview and restore. |

Photographs on the page are searched from a stock library, never generated, and each one is credited under the preview.

---

## Quick start

You need [Node.js 18 or newer](https://nodejs.org/).

```bash
git clone https://github.com/dhikshikac/Traceform.git
```

```bash
cd Traceform
```

```bash
npm install
```

```bash
npm start
```

Open http://localhost:5173. Without an AI key the app runs in **offline mode**: the app bar says **AI offline** and anything that needs the AI says so.

`npm install` is required: the server uses `pdfjs-dist` to read PDF uploads, and the audit loads `axe-core` from `node_modules`.

To turn the AI on, see [Connecting an AI](#connecting-an-ai).

### Commands

| Command | What it does |
|---|---|
| `npm start` | Runs the app and its API at http://localhost:5173 |
| `npm run dev` | Same, and restarts the server when files in `server/` change. Front-end changes only need a browser refresh, because `app.js` is rebuilt on every request. |
| `npm run mock-ai` | Starts a fake AI on port 5174, so you can test AI features without a key |
| `npm run build` | Builds a static copy into `dist/` (no AI, photo search, PDF reading or screenshots) |
| `npm run check` | Syntax-checks the built `app.js` and every server file |
| `npm test` | `check`, then two headless-browser tests: a smoke test and the full pipeline against the mock AI. Run `npx playwright install chromium` once first. |

---

## Project structure

```
├── index.html                  App markup (all pages; JS shows and hides them)
├── src/
│   ├── styles/app.css          Material 3 tokens (light and dark) and all component styles
│   └── js/                     Concatenated in filename order into app.js
│       ├── 00-images.js          Paths of the demo images
│       ├── 05-ai-client.js       The single AI entry point (`sample`), see below
│       ├── 06-photos.js          Stock-photo lookup, frozen onto the project, and credits
│       ├── 07-imagestore.js      Uploaded images, kept in IndexedDB
│       ├── 10-state-research.js  Seed data, tokens, persistence helpers, Research page
│       ├── 20-design-system-specs.js  Hand-built spec sheets for the Mali's Table example
│       ├── 21-system-generated.js  Spec sheets for every other project, drawn from generated content; photo upload cards
│       ├── 30-site-renderer.js   The older fixed four-page layout and the "typical AI" baseline
│       ├── 40-app.js             Design system and Review pages, the Review side panel, export, routing
│       ├── 50-inspiration.js     Inspiration page
│       ├── 60-projects.js        Multiple projects, landing page, new-project form, recently deleted
│       ├── 70-generate.js        The AI pipeline: prompts, validation, templates, generate banners
│       ├── 75-design-page.js     The designed home page: brief, token enforcement, frame, section prompts, versions
│       └── 77-audit.js           The accessibility audit (axe-core)
├── public/img/                 Demo photographs for Mali's Table and the sample thumbnails
├── samples/research/           Fictional research files to try a new project with
├── server/
│   ├── server.mjs              Dev server and API
│   ├── providers/              One file per AI provider, plus the shared system prompt
│   ├── photos.mjs              Stock photo search (Openverse, or Unsplash)
│   ├── extract.mjs             Text extraction from PDF uploads
│   ├── checkurl.mjs            Confirms a suggested inspiration site really exists
│   └── shots.mjs               Screenshots of those sites (Microlink), cached in .cache/
├── scripts/                    build.mjs, check.mjs
├── tests/                      smoke.mjs, pipeline.mjs, mock-ai.mjs
├── GEMINI_SETUP.md             Step-by-step free AI setup
├── CONTRIBUTING.md             Conventions and next steps
└── AGENTS.md, GEMINI.md        Instructions for AI coding agents (see the note on Astryx below)
```

### Server endpoints

| Endpoint | Purpose |
|---|---|
| `GET /` , `/src/…`, `/img/…` | Static files |
| `GET /app.js` | `src/js/*.js` concatenated, rebuilt per request |
| `GET /vendor/axe.min.js` | axe-core, from `node_modules` |
| `GET /api/ai/health`, `POST /api/ai` | Which provider is configured; the AI proxy |
| `GET /api/images?q=`, `/api/images/health` | Stock photo search |
| `POST /api/extract` | PDF bytes in, text out |
| `POST /api/check-urls` | Which suggested sites resolve |
| `GET /api/shot?url=` | Cached screenshot of a real site |

### Things to know before editing

- **Files share globals.** `S` is the current project's state, `$`/`$$` select elements, `save()` persists, and `renderAll()` redraws. Later files deliberately **override** some earlier functions (`60-projects.js` replaces `load()` and `save()`; `70-generate.js` wraps the page renderers), which is why they're concatenated rather than loaded as modules. Keep the number prefixes when adding files.
- **Load order matters.** `40-app.js` draws the first screen before the files after it have run. Code in `70`, `75` and `77` that is reached while drawing must be a function declaration or a `var` with no initial value; a top-level `const`, or a `var x = …`, is not ready yet (or resets what the first draw set).
- **Spacing is a fixed scale.** The app's own UI uses eight spacing steps defined as `--sp-0` to `--sp-7` at the top of `app.css`, on a 4px grid. Use those variables for every gap, padding and margin.
- **State lives in the browser.** Projects are in `localStorage` under `traceform-projects`; uploaded images are in IndexedDB. There is no database or account system. To start over, use **Reset prototype data** in the export menu, or clear the site's data in the browser.
- **Changing the seed data?** Mali's Table is `SEED()` in `10-state-research.js`; the other three samples are in `makeSeedStore()` in `60-projects.js`. Existing browsers keep their saved copy until it's cleared.
- **Mali's Table is the hand-built example.** Its design-system sheets, typicality figures and four-page site were written by hand. Every other project shows only what was generated for it; where nothing has been generated yet, the page says so instead of showing a stand-in.
- **Two kinds of generated site.** New generations produce the designed home page (`S.design`, rendered in a sandboxed frame). Mali's Table, and projects generated before that existed, still render with the fixed four-page layout in `30-site-renderer.js`, which keeps its own element-by-element side panel.
- **The generated page is untrusted markup.** It is sanitised, held to the design tokens, and shown in a frame that cannot run scripts. The audit runs in a separate frame that can run scripts but has no access to the app.

---

## Connecting an AI

All AI features go through one function, `sample`, created in `src/js/05-ai-client.js`. When the app starts, `TraceformAI.connect()` picks a backend:

1. **Inside Claude** (published as a Claude artifact): uses the viewer's own Claude account. No key is needed.
2. **This repo's server**: the browser calls `POST /api/ai`, and `server/server.mjs` forwards the call to the provider you configured. **The API key stays on the server.** Never put a key in front-end code.
3. **Neither**: offline mode.

```
Browser (app.js)                    server/server.mjs                 AI provider
  sample(messages, {tools}) ──POST /api/ai──▶ providers/<name>.mjs ──▶ Gemini / Claude / OpenAI / Ollama…
          ▲                                                                   │
          └── runs any tool calls in the browser, sends the results back ◀────┘
```

Almost every AI feature asks for JSON and validates the reply before it touches the project. The one place that uses tool calls is "Prompt this part" on the older fixed layout (`set_token`, `set_element`); those tools run in the browser because they change the project. The server only relays messages and stores nothing.

### Free option: Google Gemini (what the team uses)

Get a free key at https://aistudio.google.com/apikey, copy `.env.example` to `.env`, paste the key in, and restart `npm start`. The example file is already set up for Gemini through its OpenAI-compatible API with the model `gemini-flash-lite-latest`. Step-by-step instructions and troubleshooting are in [GEMINI_SETUP.md](GEMINI_SETUP.md).

### Option A: Claude (Anthropic)

1. Get a key at https://console.anthropic.com.
2. Copy `.env.example` to `.env`.
3. In `.env`, set `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY=sk-ant-...`, and remove the Gemini lines.
4. Run `npm start`. The terminal shows `AI: anthropic · claude-sonnet-5-5`, and the app bar shows **AI live**.

`AI_MODEL` defaults to `claude-sonnet-5-5`. Quick tasks (image usage notes) use `AI_MODEL_QUICK`, which defaults to `claude-haiku-5-5`.

### Option B: OpenAI or any OpenAI-compatible API

This works for OpenAI, OpenRouter, Groq, and local models through Ollama or LM Studio.

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1   # or e.g. http://localhost:11434/v1 for Ollama
AI_MODEL=gpt-4o                             # or llama3.1, etc.
```

`AI_MODEL` defaults to `gpt-4o`, and `AI_MODEL_QUICK` defaults to the same model.

### Option C: No key, for development

Terminal 1:

```bash
npm run mock-ai
```

Terminal 2:

```bash
AI_PROVIDER=openai OPENAI_BASE_URL=http://localhost:5174/v1 npm start
```

The mock returns canned output for every pipeline stage, the designed page, and section prompts, so you can test the whole flow for free. `tests/pipeline.mjs` uses it to check the pipeline end to end.

### All environment variables

| Variable | Default | Purpose |
|---|---|---|
| `AI_PROVIDER` | chosen from which key is set | `anthropic` or `openai` |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL` | — , `https://api.anthropic.com` | Anthropic |
| `OPENAI_API_KEY`, `OPENAI_BASE_URL` | — , `https://api.openai.com/v1` | OpenAI-compatible APIs, including Gemini |
| `AI_MODEL`, `AI_MODEL_QUICK` | see above | Main model, and the model for quick tasks |
| `AI_MAX_TOKENS` | `8192` | Reply length limit. The designed page is a long reply; don't lower it. |
| `AI_RATE_LIMIT_PER_MIN` | `20` | Per-IP limit on `/api/ai` and photo searches |
| `PHOTO_PROVIDER`, `UNSPLASH_ACCESS_KEY` | `openverse`, — | Use Unsplash instead of Openverse for photos |
| `PORT` | `5173` | Server port |

### Adding another provider

1. Create `server/providers/<name>.mjs` that exports `create(env)` and returns `{configured, info(), complete({tier, messages, tools, json})}`. Copy `openai.mjs` as a starting point. The message format is documented in `providers/index.mjs`.
2. Register it in the `PROVIDERS` map in `providers/index.mjs`.
3. Set `AI_PROVIDER=<name>` in `.env`.

### Changing what the AI does

| What to change | Where |
|---|---|
| Overall behaviour on every request | `server/providers/system.mjs` |
| How project type and context are given to the AI | `projectHeader()` in `70-generate.js` |
| What research, inspiration and tokens are sent | `insightDump()`, `inspirationDump()` in `70-generate.js`; `systemDump()` in `75-design-page.js` |
| Themes, directions, real-site suggestions, tokens | `aiResearch`, `aiInspiration`, `aiRealSites`, `aiSystem` in `70-generate.js`. Each has a matching `apply…` function that validates the reply. |
| What the design system's spec sheets show | `aiSystemKit()` and `cleanKit()` in `70-generate.js`; the sheets themselves in `21-system-generated.js` |
| The note the AI drafts for an uploaded photo | `wireUserImgs()` in `40-app.js` |
| The designed home page | `designBrief()`, `designRules()` and `applyHomePage()` in `75-design-page.js` |
| Which colours and fonts are allowed on the page | `designTokens()` and `enforceTokens()` in `75-design-page.js` |
| Prompting one section | `sectionRules()`, `askSection()` and `applySectionEdit()` in `75-design-page.js` |
| "Add something you learned" on the Research page | The research form handler in `10-state-research.js` |
| The older fixed-layout content and its "Prompt this part" | `aiSite`, `aiReview` in `70-generate.js`; `promptBox` / `wirePrompt` in `40-app.js` |
| Which accessibility rules run | The `runOnly` list in `axInFrame()` in `77-audit.js` |
| The plain-language wording of an accessibility problem | `axPlain()` in `77-audit.js` |

### Before sharing a deployed link

The server has a per-IP rate limit, but anyone with the URL can still spend your credits. For anything public, add a login or a shared passcode in front of `/api/ai`, and set a spending limit in your provider's console.

---

## Deploying

- **With AI:** deploy the Node server to any host that runs Node 18+ (Render, Railway, Fly.io, a campus VM) with start command `npm start`, and set the `.env` values as environment variables in the host's dashboard.
- **Static, no AI:** `npm run build` writes `dist/`, which can be served by any static host. It includes its own copy of axe-core, so the audit works; the AI, photo search, PDF reading and site screenshots need the server.

There is no CI or deploy workflow in the repository yet. Run `npm test` before opening a pull request.

---

## Working on it as a team

1. Clone the repo and run `npm install`.
2. **Never commit `.env`.** It's in `.gitignore`. Each person uses their own key, or the mock AI.
3. Work on a branch and open a pull request into `main`.
4. Split work by file to avoid merge conflicts. Each page mostly lives in one file (see the structure above).

See [CONTRIBUTING.md](CONTRIBUTING.md) for conventions and suggested next steps.

**A note on Astryx.** `AGENTS.md` describes Meta's Astryx design system, and its packages are in `package.json`, but nothing in the app uses them yet. The UI is plain JavaScript string templates styled with the Material 3 tokens in `app.css`. Adopting Astryx would mean porting the UI to React; until that happens, follow the conventions in `CONTRIBUTING.md`.

---

## Known limitations

- Everything is saved in one browser. There are no accounts, sync or real-time collaboration.
- Only the home page is designed. Its navigation names the other pages, but they are not built and the links do nothing.
- The audit and the reflow check need the browser tab to be visible: a background tab is not drawn, so they wait rather than report on a page they could not measure.
- A designed section can only be changed by prompting it. The direct content editor and the remove and reset buttons exist only for the older fixed layout.
- "How common this choice is" percentages are the AI's estimates (or seeded numbers for Mali's Table). They are not measured from a real set of AI-generated sites. An edited token has no estimate, and none is shown.
- The example photographs on the design system's imagery sheet are stock photos of the subjects the research calls for, not final images.
- The audit is automated. It covers only the part of WCAG a tool can test; keyboard use, screen-reader announcements and whether the wording makes sense still need a person.
- Type and spacing scales must be numbers for the page to use them; a prose value from the AI is converted to a scale.
- Version history keeps the last 30 versions across reloads and the last eight page designs. Restoring a version older than that brings back its tokens but not its page.
- Photo search uses Openverse without a key, which is sometimes slow or unavailable; a photo slot then keeps its art-direction placeholder. Site screenshots use Microlink's free tier, roughly 50 a day, cached on disk.
- "Push to Figma" produces a JSON payload to copy, not a native Figma file.
- Scanned PDFs have no text layer, so nothing can be read from them.
- Mali's Table uses bundled demo images.

## License

No licence has been chosen yet. Pick one (for example MIT) and add a `LICENSE` file before making the repository public. axe-core, a dependency, is under MPL-2.0.
