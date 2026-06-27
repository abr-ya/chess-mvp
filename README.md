# Chess MVP

Browser-first chess platform MVP built with Next.js, TypeScript, Tailwind CSS,
and a server-authoritative game model.

## Getting Started

Install dependencies and create the local environment file:

```bash
npm install
cp .env.example .env
```

Configure these required values in `.env`:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from the same Clerk application;
- `DATABASE_URL` for the PostgreSQL database.

Apply the database migrations and start the application:

```bash
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see
the application. Sign in, open `/play`, create a game, and use drag/drop or
click-to-move on the board. Games and SAN moves persist across page reloads.

## Quality Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

`npm run test` runs the Vitest domain test suite.

`npm run test:e2e` runs the authenticated Playwright game flow against the configured PostgreSQL database. Before the first run, install Chromium with `npx playwright install chromium` if no compatible system Chromium is available. Set `E2E_CLERK_USER_EMAIL` to one existing user from the same Clerk development application. The test creates and removes its own game records.

## Project Docs

- [Docs index](./docs/README.md)
- [Development Backlog](./docs/backlog.md)
- [Application and Game Foundation](./docs/features/01-application-game-foundation.md)
- [Basic Persisted Game Loop](./docs/features/02-basic-persisted-game-loop.md)
- [Play Against Computer and Early Analysis](./docs/features/03-computer-play-analysis.md)
- [Planning Structure](./docs/planning-structure.md)
- [Architecture Plan](./docs/architecture-plan.md)

## Current Implementation Slice

Features 01 and 02 are complete. The application now provides authentication,
the persisted game model, server-authoritative move validation, an interactive
browser chessboard, SAN move history, game completion, and an authenticated
Playwright persistence check. Feature 03 is the active implementation slice for
computer play and bounded position analysis.

The current scaffold includes the initial product routes:

- `/`
- `/sign-in`
- `/play`
- `/games/[id]`
