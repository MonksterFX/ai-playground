# Project Guidelines

Server-side-rendered **Astro** app (Node standalone adapter) styled with **Tailwind CSS v4**.

See [AGENTS.md](../AGENTS.md) for dev-server commands and Astro documentation links.

## Build and Test

- Dev server (background): `astro dev --background` — manage with `astro dev stop|status|logs`.
- Build: `npm run build` · Preview: `npm run preview`.
- Type/template check: `npx astro check`.

## Architecture

- Pages live in `src/pages/` (file-based routing). Prefer `.astro` components; add framework islands only when interactivity requires it.
- SSR via `@astrojs/node` (`mode: 'standalone'`). Content is rendered on the server — design for **progressive enhancement**, so pages work before/without client hydration.
- Choose hydration directives deliberately (`client:idle`, `client:visible`) and only for genuinely interactive components.

## Accessibility (required baseline)

Accessibility is a first-class requirement for all UI work.

- Conform to **WCAG 2.2 Level AA**, **WAI-ARIA APG** patterns, and **EN 301 549 / EAA**.
- **Semantic HTML first**; add ARIA only when no native element exists ("no ARIA is better than bad ARIA").
- Every interactive element must be keyboard operable, have a visible focus indicator, and expose a correct name/role/state.
- One `<h1>` per page, logical heading order, landmark regions (`<header> <nav> <main> <footer>`), and a skip-to-content link.
- Text contrast ≥ 4.5:1 (≥ 3:1 for large text and UI components); check Tailwind color choices.
- Provide meaningful `alt` text; use `alt=""` only for decorative images.
- Manage focus on Astro View Transitions / client navigation (reset focus to `<main>` or the `<h1>`).
- Do not remove focus outlines without an equivalent replacement; avoid `set:html` unless justified.

For accessibility audits and fixes, use the **A11y Expert** custom agent (`.github/agents/a11y-expert.agent.md`). Verify changes with `npx astro check`, ESLint a11y rules, and an axe-core scan (`@axe-core/playwright` or `npx @axe-core/cli <url>`).
