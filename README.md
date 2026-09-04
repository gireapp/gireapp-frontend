# GIREAPP — Frontend

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind + shadcn/ui.

The web client for [GIREAPP](https://github.com/gireapp) (Get It Right Edu App), a
pan-African e-learning platform serving three learner tracks — Secondary, Tertiary
and Professional — on one platform. It talks to the `gireapp-backend` Express API
and shares types, Zod schemas and constants with it via `@gireapp/shared`.

## Getting started

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL and AUTH_SECRET
npm install
npm run dev                  # http://localhost:3000
```

`AUTH_SECRET` **must be identical to the backend's**, or the frontend will reject
every token the backend issues. Node >= 22.12 is required (see
ADR-015 — the `engines` field
currently understates this).

## Commands

```bash
npm run dev            # dev server
npm run build          # production build
npm run lint           # ESLint (lint:fix to auto-fix)
npm run type-check     # tsc --noEmit
npm run format         # Prettier on src/**
npm test               # Vitest (unit)
npm run test:watch     # Vitest watch
npm run test:e2e       # Playwright — see ADR-020, currently runs no tests
```

Run a single test: `npx vitest run src/lib/__tests__/sanitize.test.ts`.

## Architecture

`CLAUDE.md` in the repo root is the working guide to the codebase — auth and
session handling, the API client, the server-action convention, routing, and
design tokens. Start there for _how things work_.

Start with the decision log below for _why they work that way_.

## Decision log

Architecture Decision Records live in `docs/decisions/` — kept local, not versioned.
