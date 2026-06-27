# Chess MVP

Browser-first chess platform MVP built with Next.js, TypeScript, Tailwind CSS,
and a server-authoritative game model.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in
`.env.local` before using protected routes such as `/play` and `/games/[id]`.

Open [http://localhost:3000](http://localhost:3000) with your browser to see
the result.

## Quality Commands

```bash
npm run lint
npm run typecheck
npm run test
```

`npm run test` runs the Vitest domain test suite.

## Project Docs

- [Docs index](./docs/README.md)
- [Development Backlog](./docs/backlog.md)
- [Application and Game Foundation](./docs/features/01-application-game-foundation.md)
- [Basic Persisted Game Loop](./docs/features/02-basic-persisted-game-loop.md)
- [Planning Structure](./docs/planning-structure.md)
- [Architecture Plan](./docs/architecture-plan.md)

## Current Implementation Slice

Feature 01 provides the scaffold, domain package layout, authentication shell,
Prisma schema, local user initialization, and game domain contracts. Feature 02
is the active implementation slice; server-side game validation, authenticated
HTTP operations, the interactive chessboard, and the persisted game screen are
complete. Browser-flow verification is next.

The current scaffold includes the initial product routes:

- `/`
- `/sign-in`
- `/play`
- `/games/[id]`
