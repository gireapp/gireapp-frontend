# GIREAPP — Frontend

[![Frontend CI](https://github.com/gireapp/gireapp-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/gireapp/gireapp-frontend/actions/workflows/ci.yml)

The web client for **GIREAPP** (Get It Right Edu App), an e-learning platform
for African learners across three tracks — Secondary, Tertiary and
Professional.

It is a Next.js application that talks to the GIREAPP backend API for all of
its data, and shares types, validation schemas and constants with it through
the `@gireapp/shared` package.

## Features

**For learners**

- Sign-up with email verification, guardian consent for under-18s, and
  password reset
- Onboarding by track and department, routing each learner to their own
  dashboard
- Courses with Markdown, plain-text, PDF and video lessons, and progress
  tracking
- Timed quizzes graded on the server, with a full answer review afterwards
- Points, badges and a dashboard of progress and recent activity
- Profile and settings: name, email, password, photo and learning preferences
- Help Center and Contact Support

**For staff** (admins and tutors)

- Dashboard of headline figures, growth, track distribution and recent
  activity
- Student listing with search and filters
- Analytics filterable by date range, track, course and grouping
- Course builder and quiz builder, with drafts and publishing

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router) and React 19
- TypeScript (strict)
- Tailwind CSS and [shadcn/ui](https://ui.shadcn.com/)
- Zod for validation
- Vitest and Testing Library for unit tests

## Getting started

### Prerequisites

- **Node.js 22.12 or later** and npm
- A running instance of the GIREAPP backend API — the frontend has no data
  of its own

### Installation

```bash
git clone https://github.com/gireapp/gireapp-frontend.git
cd gireapp-frontend
npm install
cp .env.example .env.local
```

### Configuration

Set these in `.env.local`:

| Variable                | Required      | Description                                                                                                                                                    |
| ----------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`   | Yes           | Base URL of the backend API, e.g. `http://localhost:8000`. The API client refuses to call any other origin.                                                    |
| `AUTH_SECRET`           | Yes           | Verifies session tokens. Must be identical to the backend's `AUTH_SECRET`. Generate one with `openssl rand -base64 32`.                                        |
| `CLIENT_IP_SECRET`      | In production | Shared with the backend so it can rate-limit each visitor separately. Must be identical on both sides, and must never be given a `NEXT_PUBLIC_` prefix.        |
| `NEXT_PUBLIC_MEDIA_URL` | For uploads   | Origin of the object-storage bucket. Uploads go straight from the browser to storage, and the site's Content Security Policy blocks any origin not named here. |
| `NEXT_PUBLIC_APP_URL`   | In production | The site's public URL, used for link previews. Defaults to `http://localhost:3000`.                                                                            |

### Running

```bash
npm run dev
```

The app is served at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command              | Description                                     |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | Start the development server                    |
| `npm run build`      | Create a production build                       |
| `npm start`          | Serve the production build                      |
| `npm run lint`       | Lint with ESLint (`lint:fix` to fix)            |
| `npm run type-check` | Type-check with `tsc`                           |
| `npm run format`     | Format with Prettier (`format:check` to verify) |
| `npm test`           | Run the unit tests                              |
| `npm run test:watch` | Run the unit tests in watch mode                |

To run a single test file:

```bash
npx vitest run src/lib/__tests__/sanitize.test.ts
```

## Project structure

```
src/
  app/
    (auth)/        sign-up, login, verification, onboarding, password reset
    (dashboard)/   the learner app, under /dashboard
    (admin)/       the staff app, under /admin
  features/        components and server actions, grouped by area
  components/      UI primitives and shared components
  lib/             API client, session handling, routing rules, utilities
  middleware.ts    authentication and role-based routing for every request
shared/            @gireapp/shared: types, schemas and constants
```

## Contributing

1. Branch from `staging` and open your pull request against `staging`.
2. Make sure `npm run lint`, `npm run type-check` and `npm test` pass. CI runs
   the same checks on every push and pull request.
3. A pre-commit hook runs ESLint and Prettier on staged files.

Two things to know before changing code:

- **`@gireapp/shared` is kept in both repositories.** The copy in `./shared`
  must stay identical in behaviour to the backend's; a change to one needs the
  same change in the other.
- **Every navigation link must point to a page that exists.** A test checks
  each link in both navigations against the app's routes.

## Security

The frontend never handles database credentials, and session tokens live in an
httpOnly cookie that client-side scripts cannot read. All data goes through
the backend API, which validates every request.

If you find a security issue, please **do not open a public issue**. Report it
privately through
[GitHub's private vulnerability reporting](https://github.com/gireapp/gireapp-frontend/security/advisories/new),
and we will respond there.

## License

Copyright (c) 2026 GIREAPP. All rights reserved.

This is proprietary software. The source is visible, but no licence is
granted to use, copy, modify or distribute it without GIREAPP's written
permission. See [LICENSE](LICENSE).
