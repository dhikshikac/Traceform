# Turning on the AI for free (Google Gemini)

Traceform runs without an AI. Every page loads, and the app bar says **AI offline**. To use the AI features (generating insights from research, "Add something you learned", Regenerate), each of us connects our own free Google Gemini key. It takes about 5 minutes. You don't need a credit card or to download a model.

## 1. Get a free key

1. Go to **https://aistudio.google.com/apikey** and sign in with any Google account. A personal Gmail works; a Cornell account may be blocked by Cornell's Google settings.
2. Click **Create API key**. If it asks for a Google Cloud project, pick the default one it suggests.
3. Copy the key.

**Keep the key to yourself.** Don't paste it into code, Slack, GitHub or the group chat. Each person gets their own key; the free limits are per key, so sharing one makes everyone hit them sooner. If a key leaks, delete it on the same page and create a new one.

## 2. Put the key in `.env`

The app reads the key from a file called `.env` in the project root. Git ignores this file, so it never gets committed.

1. Open a terminal in the project folder.
2. Copy the example file:
   - Windows (PowerShell): `copy .env.example .env`
   - Mac or Linux: `cp .env.example .env`
3. Open `.env` and replace `paste-your-gemini-key-here` with your key. The top of the file should look like this:

   ```env
   AI_PROVIDER=openai
   OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
   OPENAI_API_KEY=your-key-here
   AI_MODEL=gemini-flash-lite-latest
   ```

   `AI_PROVIDER=openai` is correct even though this is Google. Gemini offers an OpenAI-compatible API, and the app talks to it through that.

On Windows, make sure the file is named `.env` and not `.env.txt`. In File Explorer, turn on **View → Show → File name extensions** to check.

## 3. Start the app

```bash
npm install
npm start
```

Then open **http://localhost:5173**. The terminal should print:

```
Traceform running at http://localhost:5173
AI: openai-compatible · gemini-flash-lite-latest
```

The app bar in the browser should show a green dot and **AI live**. If you edit `.env` while the server is running, stop it with Ctrl+C and run `npm start` again; it only reads `.env` at startup.

## 4. Try it

1. On the projects page, click **New project**.
2. Describe the project (for example, "A website for Paw Park, a dog daycare in Ithaca, with booking and pricing") and set the type to **Something else**.
3. Under **Add research**, choose `samples/research/study_pawpark_daycare.md`.
4. Click **Create project**. Themes and insight cards appear in a few seconds. Each quote is checked against the file and marked **Quote found**, **Paraphrased** or **not in sources**.

There is a second sample set in the same folder (a bakery: `interview_owner_dana.txt`, `customer_interviews_notes.md`, `preorder_survey.csv`). All sample research is made up.

## If something goes wrong

| What you see | What to do |
|---|---|
| App bar says **AI offline** | `.env` is missing, in the wrong folder, or named `.env.txt`, or the server wasn't restarted after you made it. The terminal line `AI: offline` confirms it. |
| "This model is no longer available to new users" | Keep `AI_MODEL=gemini-flash-lite-latest`. Older names like `gemini-2.5-flash` are closed to new accounts. |
| "high demand", 503 or "Service Unavailable" | Google's free tier is busy for a moment. The research page retries on its own; otherwise wait a minute and try again. `gemini-flash-latest` is stronger but is busy more often. |
| "Too many requests" or 429 | You hit the free per-minute limit. Wait a minute. |
| The terminal says `AI: anthropic` | You also have `ANTHROPIC_API_KEY` set somewhere. Remove it or set `AI_PROVIDER=openai`. |

## Notes

- The key stays on your computer. The browser talks to our local server (`server/server.mjs`), and the server adds the key when it calls Google. The key is never sent to the browser.
- Google may use free-tier requests to improve its products. Only upload made-up or anonymized research, never real participants' names or personal details.
- Other providers (Anthropic, OpenAI, Groq…) also work. See `.env.example` and the README's "Connecting an AI" section.
