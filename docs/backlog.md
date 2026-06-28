# Chess Platform Development Backlog

## Roadmap Principle

The MVP should deliver a reliable game loop. Every later feature should build on top of stored games, ratings, and a stable server-side game model.

Planning terminology: [Planning Structure](./planning-structure.md)

## Feature 00. Project Setup

- [x] Choose the frontend, backend, database, and real-time transport stack.
- [x] Create the service architecture diagram.
- [x] Choose the chess rules library.
- [x] Choose the engine integration approach.
- [x] Define API contracts for game creation, moves, game state, history, and PGN.
- [x] Create the basic screen design.

## Feature 01. Application and Game Foundation

Detailed feature plan: [Feature 01. Application and Game Foundation](./features/01-application-game-foundation.md)

Feature 01 is complete. It establishes the application shell and game-domain foundation without implementing the playable game loop.

- [x] Basic registration and sign-in.
- [x] Prisma and PostgreSQL foundation.
- [x] User and rating models.
- [x] Game model in the database.
- [x] Game domain types and Prisma mappers.

## Feature 02. Basic Persisted Game Loop

Detailed feature plan: [Feature 02. Basic Persisted Game Loop](./features/02-basic-persisted-game-loop.md)

Feature 02 is complete. It delivers the first playable, persisted, server-backed manual game flow.

- [x] Browser chessboard.
- [x] Server-side legal move validation.
- [x] Move list in SAN.
- [x] Game completion by checkmate, stalemate, and impossible continuation.
- [x] Position and move persistence.

## Feature 02-a. Game Loop Performance Hardening

Detailed feature plan: [Feature 02-a. Game Loop Performance Hardening](./features/02-a-game-loop-performance.md)

Feature 02-a is complete. It reduced routine user synchronization, compacted move persistence, and preserved immediate optimistic board feedback.

- [x] Measure current auth, game-read, and move-persistence latency.
- [x] Add a lightweight existing-user request path.
- [x] Remove redundant user writes and duplicate game reads.
- [x] Compact atomic move persistence and snapshot return.
- [x] Confirm immediate optimistic board feedback and rollback.
- [x] Record the remaining realtime latency requirements for blitz and bullet.

## Feature 03. Custom Position Setup and FEN

Detailed feature plan: [Feature 03. Custom Position Setup and FEN](./features/03-custom-position-setup.md)

- [ ] Visual position editor and piece palette.
- [ ] Clear and reset board actions.
- [ ] Side-to-move and castling controls.
- [ ] FEN import, validation, copy, and export.
- [ ] Reusable validated-position handoff for later analysis.

## Feature 04. PGN File Import and Export

Detailed feature plan: [Feature 04. PGN File Import and Export](./features/04-pgn-file-import-export.md)

- [ ] Generate PGN from structured game records.
- [ ] Copy and download a `.pgn` file.
- [ ] Upload or paste and validate PGN.
- [ ] Persist imported moves and positions atomically.
- [ ] Basic move-by-move imported-game review.

## Feature 05. Engine Integration and Position Evaluation

Detailed feature plan: [Feature 05. Engine Integration and Position Evaluation](./features/05-engine-position-evaluation.md)

- [ ] Select and pin the Stockfish runtime.
- [ ] Add a reusable `EngineService` boundary.
- [ ] Evaluate a validated FEN with a bounded calculation.
- [ ] Show centipawn or mate score and best move.
- [ ] Handle timeout, cancellation, and engine failure.

## Feature 06. Play Against Computer

Detailed feature plan: [Feature 06. Play Against Computer](./features/06-play-against-computer.md)

- [ ] Difficulty-level adapter and color selection.
- [ ] Legal persisted computer replies.
- [ ] Calculation time limit and failure recovery.
- [ ] Computer rating result and idempotent rating update.

## Feature 07. Time Controls

- [ ] Server-side game clocks.
- [ ] Preset controls: 1+0, 3+0, 3+2, 5+0, 10+0, 15+10.
- [ ] Custom time control.
- [ ] Increment after move.
- [ ] Different starting times for each side.
- [ ] Human time handicap against the computer.
- [ ] Time handicap for one side in a human game.
- [ ] Game completion by timeout.
- [ ] Reconnect with current clock recovery.

## Feature 08. Online Human Play

- [ ] Create a game by invite link.
- [ ] Second player joins the game.
- [ ] WebSocket state synchronization.
- [ ] Side permission checks.
- [ ] Connection status indicator.
- [ ] Resignation.
- [ ] Draw offer.
- [ ] Game completion and rating update for both players.

## Feature 09. Game History and Review

- [ ] "My Games" page.
- [ ] Filters by mode and result.
- [ ] Game review page.
- [ ] Move navigation.
- [ ] Open PGN imported in Feature 04 from history.

## Feature 10. Matchmaking Improvements

- [ ] Quick play with waiting queue.
- [ ] Pairing by nearby rating.
- [ ] Rating search range that expands over time.
- [ ] Cancel search.
- [ ] Protection against joining multiple matches at once.
- [ ] Unrated casual games.

## Feature 11. Full Game Analysis

- [ ] Build on Feature 05 `EngineService` instead of adding a second engine integration.
- [ ] Run engine analysis after game completion.
- [ ] Position evaluation after each move.
- [ ] Best move and missed opportunity.
- [ ] Move classification: good, inaccuracy, mistake, blunder.
- [ ] Evaluation graph.
- [ ] Store analysis job separately from the game.
- [ ] Limit analysis through quotas or a job queue.

## Feature 12. Puzzles and Training

- [ ] Import positions from FEN/PGN.
- [ ] Puzzle database.
- [ ] Puzzle themes: fork, pin, mate, endgame, and so on.
- [ ] Solve puzzle on the board.
- [ ] Validate the correct line.
- [ ] Puzzle rating.
- [ ] User statistics by theme.

## Feature 13. Tournaments

- [ ] Tournament creation.
- [ ] Tournament types: arena, Swiss, round-robin.
- [ ] Participant registration.
- [ ] Round scheduling.
- [ ] Automatic game creation.
- [ ] Standings table.
- [ ] Tie-break rules.
- [ ] Tournament page.

## Feature 14. Social and Community Features

- [ ] User profile.
- [ ] Public game history.
- [ ] Friends.
- [ ] Challenge a friend to a game.
- [ ] In-game chat.
- [ ] Game comments.
- [ ] Reports and moderation.

## Feature 15. Anti-Cheat and Fair Play

- [ ] Detect suspicious engine correlation.
- [ ] Analyze move timing.
- [ ] Flag suspicious games.
- [ ] Manual review.
- [ ] Restrictions for new accounts.
- [ ] Ban policy.

## Feature 16. Mobile Applications

- [ ] Stabilize the public client API.
- [ ] Push notifications for opponent moves.
- [ ] Mobile-friendly reconnect.
- [ ] Shared design system.
- [ ] iOS application.
- [ ] Android application.
- [ ] Deep links for games and invitations.

## Feature 17. Desktop Client

- [ ] Define the goal of the desktop client: offline analysis, play, training, or all of them.
- [ ] Choose the technology: Python/PySide, Electron, Tauri, or native.
- [ ] Implement API-based sign-in.
- [ ] Sync game history.
- [ ] Support a local engine for analysis.
- [ ] Add PGN import and export.

## Feature 18. Monetization

- [ ] Premium game analysis.
- [ ] Advanced statistics.
- [ ] Personal training.
- [ ] Free analysis limits.
- [ ] Subscriptions.
- [ ] Payment integration.

## Technical Debt to Avoid

- [ ] Do not implement chess rules manually unless there is a strong reason.
- [ ] Do not mix UI game state with the server-side game model.
- [ ] Do not make the engine part of the HTTP/WebSocket controller directly.
- [ ] Do not store only PGN without structured moves.
- [ ] Do not trust the client timer as the source of truth.
- [ ] Do not bind the API to a single browser client.

## Next Task

Start Stage 01 of Feature 03 by defining the editable-position model and FEN validation rules.
