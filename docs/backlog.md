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

Feature 02 owns the first playable server-backed manual game flow.

- [x] Browser chessboard.
- [x] Server-side legal move validation.
- [x] Move list in SAN.
- [x] Game completion by checkmate, stalemate, and impossible continuation.
- [x] Position and move persistence.

## Feature 03. Play Against Computer and Early Analysis

- [ ] Chess engine integration.
- [ ] Difficulty-level adapter.
- [ ] Color selection.
- [ ] Computer reply move.
- [ ] Calculation time limit.
- [ ] Rating calculation against the computer's estimated Elo.
- [ ] Engine error handling without losing the game.
- [ ] Minimal analysis screen.
- [ ] FEN input or position setup for analysis.
- [ ] Position validation before analysis.
- [ ] Bounded Stockfish evaluation for a single position.
- [ ] Show score and at least one suggested best line.

## Feature 04. Time Controls

- [ ] Server-side game clocks.
- [ ] Preset controls: 1+0, 3+0, 3+2, 5+0, 10+0, 15+10.
- [ ] Custom time control.
- [ ] Increment after move.
- [ ] Different starting times for each side.
- [ ] Human time handicap against the computer.
- [ ] Time handicap for one side in a human game.
- [ ] Game completion by timeout.
- [ ] Reconnect with current clock recovery.

## Feature 05. Online Human Play

- [ ] Create a game by invite link.
- [ ] Second player joins the game.
- [ ] WebSocket state synchronization.
- [ ] Side permission checks.
- [ ] Connection status indicator.
- [ ] Resignation.
- [ ] Draw offer.
- [ ] Game completion and rating update for both players.

## Feature 06. PGN and History

- [ ] PGN generation with required tags.
- [ ] Store PGN on the game record.
- [ ] "My Games" page.
- [ ] Filters by mode and result.
- [ ] Game review page.
- [ ] Move navigation.
- [ ] Copy PGN.
- [ ] Download PGN.

## Feature 07. Matchmaking Improvements

- [ ] Quick play with waiting queue.
- [ ] Pairing by nearby rating.
- [ ] Rating search range that expands over time.
- [ ] Cancel search.
- [ ] Protection against joining multiple matches at once.
- [ ] Unrated casual games.

## Feature 08. Game Analysis

- [ ] Build on the early analysis slice instead of adding a second engine integration.
- [ ] Run engine analysis after game completion.
- [ ] Position evaluation after each move.
- [ ] Best move and missed opportunity.
- [ ] Move classification: good, inaccuracy, mistake, blunder.
- [ ] Evaluation graph.
- [ ] Store analysis job separately from the game.
- [ ] Limit analysis through quotas or a job queue.

## Feature 09. Puzzles and Training

- [ ] Import positions from FEN/PGN.
- [ ] Puzzle database.
- [ ] Puzzle themes: fork, pin, mate, endgame, and so on.
- [ ] Solve puzzle on the board.
- [ ] Validate the correct line.
- [ ] Puzzle rating.
- [ ] User statistics by theme.

## Feature 10. Tournaments

- [ ] Tournament creation.
- [ ] Tournament types: arena, Swiss, round-robin.
- [ ] Participant registration.
- [ ] Round scheduling.
- [ ] Automatic game creation.
- [ ] Standings table.
- [ ] Tie-break rules.
- [ ] Tournament page.

## Feature 11. Social and Community Features

- [ ] User profile.
- [ ] Public game history.
- [ ] Friends.
- [ ] Challenge a friend to a game.
- [ ] In-game chat.
- [ ] Game comments.
- [ ] Reports and moderation.

## Feature 12. Anti-Cheat and Fair Play

- [ ] Detect suspicious engine correlation.
- [ ] Analyze move timing.
- [ ] Flag suspicious games.
- [ ] Manual review.
- [ ] Restrictions for new accounts.
- [ ] Ban policy.

## Feature 13. Mobile Applications

- [ ] Stabilize the public client API.
- [ ] Push notifications for opponent moves.
- [ ] Mobile-friendly reconnect.
- [ ] Shared design system.
- [ ] iOS application.
- [ ] Android application.
- [ ] Deep links for games and invitations.

## Feature 14. Desktop Client

- [ ] Define the goal of the desktop client: offline analysis, play, training, or all of them.
- [ ] Choose the technology: Python/PySide, Electron, Tauri, or native.
- [ ] Implement API-based sign-in.
- [ ] Sync game history.
- [ ] Support a local engine for analysis.
- [ ] Add PGN import and export.

## Feature 15. Monetization

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

Complete Stage 06 documentation, mark Feature 02 complete, and prepare the executable plan for Feature 03.
