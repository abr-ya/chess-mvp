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
- [MVP Core Feature Plan](./docs/features/01-mvp-core.md)
- [Planning Structure](./docs/planning-structure.md)
- [Architecture Plan](./docs/architecture-plan.md)

## Current Implementation Slice

Feature 01 starts with the scaffold, domain package layout, authentication shell,
Prisma schema, server-side game validation, and a browser chessboard surface.

The current scaffold includes the initial product routes:

- `/`
- `/sign-in`
- `/play`
- `/games/[id]`
