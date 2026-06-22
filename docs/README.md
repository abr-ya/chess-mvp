# Chess Platform Docs

Initial product documentation for the chess platform MVP.

- [MVP Specification](./mvp-spec.md)
- [Future Backlog](./backlog.md)

## Working Assumptions

- The first client is a browser application.
- The backend is designed API-first so mobile apps and desktop clients can be added later.
- The MVP must provide the full game loop: sign up, start a game, use time controls, finish the game, save PGN, and review game history.
- Game analysis, tournaments, and puzzles are outside the MVP, but the data model and backlog should leave room for them.

## Next Task

Choose the technology stack and create the architecture plan for the first implementation increment: chessboard UI, server-side game model, WebSocket synchronization, and play against an engine.
