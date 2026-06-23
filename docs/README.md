# Chess Platform Docs

Initial product documentation for the chess platform MVP.

- [MVP Specification](./mvp-spec.md)
- [Authentication System Options](./auth-options.md)
- [Architecture Plan](./architecture-plan.md)
- [Future Backlog](./backlog.md)

## Working Assumptions

- The first client is a browser application.
- The backend is designed API-first so mobile apps and desktop clients can be added later.
- The MVP must provide the full game loop: sign up, start a game, use time controls, finish the game, save PGN, and review game history.
- Authentication should use a managed or established provider rather than a fully custom implementation from scratch.
- Game analysis, tournaments, and puzzles are outside the MVP, but the data model and backlog should leave room for them.

## Next Task

Scaffold the application with Next.js, TypeScript, Tailwind CSS, shadcn/ui, Prisma, and the initial domain package layout.
