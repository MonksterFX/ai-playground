# Agent Playground

A controlled testing environment for observing how AI agents, browser automation tools, and crawlers interact with web pages. It provides a set of small, accessible test pages, a WebMCP challenge system, comprehensive request tracking, and a demo e-commerce shop — all instrumented so you can watch exactly what agents do.

## Features

### Test pages

Pre-built interaction tests at `/tests/*`:

| Page | What it tests |
| :--- | :--- |
| Basic Navigation | Can an agent follow clear links to a target? |
| Simple Form | Can an agent fill and submit an accessible form? |
| Button Interaction | Can an agent click a button and detect state changes? |
| Content Extraction | Can an agent find and extract structured data? |
| Disabled State | How does an agent handle a 410 Gone page? |

### WebMCP challenge system

Test pages at `/tests/webmcp*` expose tools via `document.modelContext` for agents that support the [WebMCP API](https://webmcp.dev). The server issues **stateless, HMAC-signed challenge tokens** — no session state required. Agents request a challenge, compute the answer, and submit it to receive a `FLAG{...}` proof of completion.

API endpoints under `/api/webmcp/`:

- `POST /challenge` — issue a signed challenge token
- `POST /solve` — submit an answer; returns a flag on success
- `POST /intent` — agents declare their task intent for logging
- `POST /track` — external proxy reports tool interactions

### Request tracking & observability

All requests are tracked via Astro middleware. The event log captures timestamp, event type, path, status, response time, agent hint (Claude, ChatGPT, Playwright, etc.), filtered headers, and optional IP. Credentials are never stored.

### Admin panel

Password-protected at `/admin/` (HTTP Basic Auth):

- **Dashboard** — event counts, error rate, slowest responses (last 24 h)
- **Pages** — enable/disable test pages at runtime; disabled pages return 410
- **Events** — last 200 events with expandable header/metadata detail

### Demo shop

A fully accessible fake shop at `/shop/` with product listing, product detail, cart, checkout, and order confirmation — designed to test end-to-end agent shopping workflows.

## Stack

- **Astro 7** + Node standalone adapter (SSR)
- **Tailwind CSS v4**
- **SQLite** via **Drizzle ORM** (no external database)
- **Node.js ≥ 22.12.0** / TypeScript

## Getting started

```sh
npm install
cp .env.example .env   # set ADMIN_USER, ADMIN_PASS, WEBMCP_SECRET
npm run dev
```

Open [localhost:4321](http://localhost:4321).

## Environment variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `ADMIN_USER` | ✓ | HTTP Basic Auth username for `/admin/` |
| `ADMIN_PASS` | ✓ | HTTP Basic Auth password for `/admin/` |
| `WEBMCP_SECRET` | ✓ | HMAC key for signing challenge tokens |
| `TRACK_IP` | | Set to `true` to store requester IP in the event log |

## Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build for production to `./dist/` |
| `npm run preview` | Preview the production build locally |
| `npx astro check` | Type-check all `.astro` files |

## Project structure

```text
src/
├── lib/
│   ├── db/          # Drizzle schema, repo helpers, seed data
│   ├── pages/       # Test-page registry (title, path, enabled flag)
│   ├── tracking/    # Agent detection, header filtering, event recording
│   └── webmcp/      # Challenge types, token signing, flag derivation
├── pages/
│   ├── admin/       # Dashboard, pages management, event viewer
│   ├── api/webmcp/  # Challenge, solve, intent, track endpoints
│   ├── shop/        # Product list, detail, cart, checkout, confirmation
│   └── tests/       # Individual agent interaction test pages
└── middleware.ts     # Request tracking for every route
```
