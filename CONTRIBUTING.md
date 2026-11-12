# Contributing

## Workflow

1. `git pull` on `main`, then `git checkout -b <short-feature-name>`.
2. Make your change. Run `npm start` and check it in the browser at desktop width and at 400px.
3. Run `npm test`.
4. Push and open a pull request. Fill in the template, get one review, then squash and merge.

## Conventions

- **UI:** use the Material 3 tokens in `app.css` (`var(--primary)`, `var(--surface-container)` and so on). Don't hard-code colors. Icons are [Material Symbols](https://fonts.google.com/icons): `<span class="ms">icon_name</span>`.
- **State:** change `S`, then call `save()`, then call the page's render function (`renderResearch()`, `renderInspiration()`, `renderSystem()`, `renderReview()` or `renderAll()`). For anything a user might want to undo, call `snapshot("what changed")` first so it appears in version history.
- **Escaping:** wrap any user text you put into HTML in `esc()`.
- **AI:** call only through `sample` (see the README). Always handle `sample === null` (offline) with a useful fallback or message.
- **Accessibility:** use real `<button>` elements, give icon-only buttons an `aria-label`, and keep text contrast at 4.5:1 or higher. The app audits generated sites for WCAG, so it should pass its own audit too.
- **New files:** add them to `src/js/` with a number prefix that puts them after the code they depend on.

## Suggested next steps (good first issues)

- [ ] Move `src/js` to ES modules with explicit imports and exports (remove the function overrides in `60-projects.js`).
- [ ] Replace `localStorage` with a real backend (Supabase or Firebase) for accounts and shared projects.
- [ ] Stream AI replies (Server-Sent Events from `/api/ai`) instead of waiting for the full reply.
- [ ] Add a real FigJam import with the Figma REST API.
- [ ] Export native Figma variables through a Figma plugin.
- [ ] Unit tests for `audit()` (WCAG checks) and `contrast()`.
