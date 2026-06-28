# Chess Platform Docs

Initial product documentation for the chess platform MVP.

## Document Roles

- [MVP Specification](./mvp-spec.md)
  Product scope reference for the broader MVP vision and acceptance criteria.
- [Authentication System Options](./decisions/auth-options.md)
  Authentication decision record and provider comparison.
- [Chessboard Package Decision](./decisions/chessboard-package.md)
  React chessboard package comparison and selected integration boundary.
- [Architecture Plan](./architecture-plan.md)
  Architecture decision reference for stack, boundaries, service ownership, and version policy.
- [Planning Structure](./planning-structure.md)
  Rules for how roadmap, feature plans, stages, tasks, decisions, and architecture documents are maintained.
- [Development Backlog](./backlog.md)
  Top-level feature roadmap.
- [Feature 01. Application and Game Foundation](./features/01-application-game-foundation.md)
  Completed foundation for the application shell, persistence, authentication, and game domain.
- [Feature 02. Basic Persisted Game Loop](./features/02-basic-persisted-game-loop.md)
  Completed first playable persisted game loop.
- [Feature 02-a. Game Loop Performance Hardening](./features/02-a-game-loop-performance.md)
  Completed hardening for the authenticated game request path.
- [Feature 03. Custom Position Setup and FEN](./features/03-custom-position-setup.md)
  Active executable plan for visual position construction and FEN workflows.
- [Feature 04. PGN File Import and Export](./features/04-pgn-file-import-export.md)
  Planned file-transfer boundary for complete games.
- [Feature 05. Engine Integration and Position Evaluation](./features/05-engine-position-evaluation.md)
  Planned reusable engine boundary, score, and best move.
- [Feature 06. Play Against Computer](./features/06-play-against-computer.md)
  Planned computer opponent built on the shared engine service.

## Working Assumptions

- The first client is a browser application.
- The backend is designed API-first so mobile apps and desktop clients can be added later.
- The MVP must provide the full game loop: sign up, start a game, use time controls, finish the game, save PGN, and review game history.
- Authentication should use a managed or established provider rather than a fully custom implementation from scratch.
- Game analysis, tournaments, and puzzles are outside the MVP, but the data model and backlog should leave room for them.

## Next Task

Start Stage 03 of Feature 03 by adding position controls, synchronized FEN input, and the `/analysis/setup` route.
