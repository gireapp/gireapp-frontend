# GIREAPP — Frontend

The web client for **GIREAPP** (Get It Right Edu App), a pan-African e-learning
platform serving three learner tracks — Secondary, Tertiary and Professional — on
one platform.

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind · shadcn/ui.
It talks to the [`gireapp-backend`](https://github.com/gireapp/gireapp-backend)
Express API and shares types, Zod schemas and constants with it through
`@gireapp/shared`.

## What it does

**Learners**

- Sign up with email verification, guardian consent for under-18s, password reset
- Onboarding by track and department, which routes each learner to their own dashboard
- Courses: enrol, read lessons (Markdown, plain text, PDF, video), track progress
- Timed quizzes graded on the server, with a full answer review afterwards
- Points, badges and a dashboard of progress and recent activity
- Profile & Settings: name, email, password, photo, learning preferences
- Help Center and Contact Support

**Staff** (admins and tutors, at `/admin`)

- Dashboard of headline numbers, growth, track distribution and recent activity
- Student listing with search and filters
- Analytics filterable by date range, track, course and grouping
- Course builder: modules and lessons, drafts and publishing, file uploads
- Quiz builder: questions, answers, points, drafts and publishing

## Getting started

Requires **Node.js 22.12 or later**. Run the backend first — the frontend has no
data of its own.

```bash
cp .env.example .env.local    # then fill it in — see below
npm install
npm run dev                   # http://localhost:3000
```

### Environment variables

| Variable                | Required            | What it is                                                                                                                                                                                            |
| ----------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`   | Yes                 | Base URL of the backend, e.g. `http://localhost:8000`. Also the only origin the API client will call, and an entry in the security policy.                                                            |
| `AUTH_SECRET`           | Yes                 | **Must be byte-for-byte identical to the backend's.** Otherwise every session the backend issues is rejected. Generate with `openssl rand -base64 32`.                                                |
| `CLIENT_IP_SECRET`      | Yes, in production  | **Must be identical to the backend's.** Sent with each learner's IP so the backend rate-limits per learner; without it every learner shares one budget, and a handful of sign-ins locks everyone out. |
| `NEXT_PUBLIC_MEDIA_URL` | For uploads         | Origin of the object-storage bucket. Profile photos and lesson files go straight from the browser to storage; if this is unset the browser's security policy blocks them, **silently**.               |
| `NEXT_PUBLIC_APP_URL`   | Production          | The site's own public URL, used for link previews. Defaults to `http://localhost:3000`.                                                                                                               |
| `MOCK_AUTH`             | Never in production | Development only: `true` signs people in on registration without the backend.                                                                                                                         |

## Commands

```bash
npm run dev            # dev server
npm run build          # production build
npm start              # serve the production build
npm run lint           # ESLint (lint:fix to auto-fix)
npm run type-check     # tsc --noEmit
npm run format         # Prettier on src/** (format:check to verify)
npm test               # Vitest unit tests
npm run test:watch     # Vitest in watch mode
npm run test:e2e       # Playwright — there are no end-to-end tests yet
```

Run a single test file: `npx vitest run src/lib/__tests__/sanitize.test.ts`
(or add `-t "<test name>"`).

**Commits run a pre-commit hook** (Husky + lint-staged): ESLint and Prettier on
staged `.ts`/`.tsx` files. ESLint takes around 45 seconds to start on a modest
laptop, so a commit can look stuck — let it finish before staging anything else.

## Project layout

```
src/
  app/
    (auth)/        sign-up, login, verification, onboarding, password reset
    (dashboard)/   the learner app — /dashboard/…
    (admin)/       the staff app — /admin/…
  features/        logic and components per area: auth, dashboard, courses,
                   quizzes, settings, admin
  components/      shadcn/ui primitives and shared components
  lib/             API client, session, roles, sanitising, logging
  middleware.ts    signs-in, role and track routing for every request
shared/            the frontend's copy of @gireapp/shared — see below
```

## Things worth knowing

- **`@gireapp/shared` exists as two hand-maintained copies** — `./shared` here and
  `shared/` in the backend repo. A change to one must be made to the other, or the
  two sides silently disagree.
- **Route access is enforced in `src/middleware.ts`**: signed-out users go to
  login, learners can't open `/admin`, staff are sent to `/admin` rather than a
  learner dashboard, and a learner can only open their own track's dashboard. The
  backend enforces the same rules on its side.
- **Every link in either navigation must point at a page that exists** — a test
  fails otherwise. Add the page with the link.

`CLAUDE.md` is the detailed guide to how the codebase works: sessions, the API
client, the server-action pattern, routing, the admin area and design tokens.

## Deployment

Deployed on **Vercel**. Set the variables above in the Vercel project, using the
live backend URL and the same `AUTH_SECRET` as the backend.

## Decision log

Architecture Decision Records live in `docs/decisions/`, which is kept local and
not versioned.
