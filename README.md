# Chess MVP

Browser-first chess platform MVP built with Next.js, TypeScript, Tailwind CSS,
and a server-authoritative game model.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see
the result.

## Quality Commands

```bash
npm run lint
npm run typecheck
npm run test
```

`npm run test` currently runs the TypeScript gate until Vitest is installed in
the Phase 01 tooling step.

## Project Docs

- [Docs index](./docs/README.md)
- [Phase 01 MVP Core Task List](./docs/phase-01-mvp-core-task-list.md)
- [Architecture Plan](./docs/architecture-plan.md)

## Current Implementation Slice

Phase 01 starts with the scaffold, domain package layout, authentication shell,
Prisma schema, server-side game validation, and a browser chessboard surface.

The current scaffold includes the initial product routes:

- `/`
- `/sign-in`
- `/play`
- `/games/[id]`
