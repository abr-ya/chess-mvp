# Chess Platform Docs

Initial product documentation for the chess platform MVP.

## Document Roles

- [MVP Specification](./mvp-spec.md)
  Product scope reference for the broader MVP vision and acceptance criteria.
- [Authentication System Options](./decisions/auth-options.md)
  Authentication decision record and provider comparison.
- [Architecture Plan](./architecture-plan.md)
  Architecture decision reference for stack, boundaries, service ownership, and version policy.
- [Planning Structure](./planning-structure.md)
  Rules for how roadmap, feature plans, stages, tasks, decisions, and architecture documents are maintained.
- [Development Backlog](./backlog.md)
  Top-level feature roadmap.
- [Feature 01. Application and Game Foundation](./features/01-application-game-foundation.md)
  Completed foundation for the application shell, persistence, authentication, and game domain.
- [Feature 02. Basic Persisted Game Loop](./features/02-basic-persisted-game-loop.md)
  Active executable plan for the first playable server-backed game flow.

## Working Assumptions

- The first client is a browser application.
- The backend is designed API-first so mobile apps and desktop clients can be added later.
- The MVP must provide the full game loop: sign up, start a game, use time controls, finish the game, save PGN, and review game history.
- Authentication should use a managed or established provider rather than a fully custom implementation from scratch.
- Game analysis, tournaments, and puzzles are outside the MVP, but the data model and backlog should leave room for them.

## Next Task

Start Stage 01 of Feature 02 by adding `chess.js` and implementing the first `GameService` create-game and legal-move operations.
