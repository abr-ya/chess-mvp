# Feature 02. Basic Persisted Game Loop

This completed feature turns the application and domain foundation from Feature 01 into the first reliable authenticated chess game loop.

## Feature Goal

Deliver the first playable server-backed manual game flow:

- a signed-in user can create and reopen a basic game;
- the server validates legal chess moves with `chess.js`;
- games, participants, moves, and positions are persisted;
- the browser shows a playable chessboard and SAN move list;
- games finish by core chess rules;
- the implementation is ready for Feature 03 computer replies and early position analysis without changing the core game model.

## Stop Point

Stop Feature 02 when a signed-in user can create or open a basic game screen, make legal moves through the server-backed game service, see the board and SAN move list update, and persist the resulting position and moves in the database.

Do not start these items in Feature 02:

- Stockfish or other engine integration, except for preserving the planned `EngineService` boundary;
- live human invite games;
- Socket.IO synchronization;
- real clock enforcement;
- rating updates after completed games;
- full PGN export and game history UI.

After Feature 02, prioritize the smallest useful engine slice before broader online play: a minimal `EngineService`, computer reply moves, and a first analysis screen that accepts or sets up a FEN position and returns a bounded evaluation.

## Assumptions

- Feature 01 is complete and provides authentication, persistence, local user initialization, game domain types, and Prisma mappers.
- App stack follows `docs/architecture-plan.md`: Next.js 16.2.9 App Router, TypeScript, Tailwind CSS, shadcn/ui, Prisma 7.8.0, PostgreSQL, Clerk, and `chess.js`.
- The UI language is English unless a later decision changes it.
- Server-side chess validation is authoritative; the client may only provide UI hints.
- The first game flow is local/manual without computer replies.
- Game and rating records use internal `User.id` values, not provider user IDs.

## Stage 01. GameService Core

- [x] Add `chess.js`.
- [x] Implement basic game creation with initial FEN.
- [x] Create two participants for the game, even when Feature 02 has no online opponent.
- [x] Implement legal move application through `chess.js`.
- [x] Persist UCI-like move coordinates, SAN, move number, side, and FEN after move.
- [x] Update `Game.currentFen` after each accepted move.
- [x] Reject illegal moves.
- [x] Reject moves for the wrong side.
- [x] Reject moves after a finished game.
- [x] Detect checkmate.
- [x] Detect stalemate.
- [x] Detect draw by insufficient material or impossible continuation where supported by `chess.js`.
- [x] Store final game status, result, and termination reason.
- [x] Return a complete game snapshot after create and move operations.
- [x] Add Vitest coverage for legal moves, illegal moves, SAN output, turn checks, and completion.

## Stage 02. API or Server Action Surface

- [x] Choose the Feature 02 server boundary: route handlers, server actions, or a small internal API facade.
- [x] Implement create basic game operation.
- [x] Implement get game snapshot operation.
- [x] Implement submit move operation.
- [x] Require an authenticated user for game creation and access.
- [x] Check that the current user is a participant before returning a game snapshot.
- [x] Normalize errors into UI-friendly messages.
- [x] Avoid exposing provider auth IDs in API responses.

## Stage 03. Browser Chessboard

- [x] Choose the exact React chessboard package.
- [x] Wrap the selected package in the local `ChessboardView` component.
- [x] Render the current FEN.
- [x] Support moving pieces by drag/drop or click/tap.
- [x] Send move commands through the server-backed operation.
- [x] Disable move input while a move is being submitted.
- [x] Show illegal move feedback without corrupting local board state.
- [x] Keep board dimensions stable on desktop and mobile.

## Stage 04. Game Screen

- [x] Build `/play` as the primary product entry.
- [x] Add a "new game" action.
- [x] Add `/games/[id]` for the active game screen.
- [x] Show the board.
- [x] Show white and black player labels.
- [x] Show side to move.
- [x] Show game status.
- [x] Show a compact SAN move list.
- [x] Show checkmate, stalemate, or draw state when the game ends.
- [x] Add a new game action after completion.
- [x] Keep the layout usable on desktop and mobile.

## Stage 05. Browser-Flow and Persistence Verification

- [x] Add Playwright for the first real browser game flow.
- [x] Confirm game creation writes `Game` and `GameParticipant` rows.
- [x] Confirm each accepted move writes a `Move` row.
- [x] Confirm `Game.currentFen` updates after every accepted move.
- [x] Confirm completed games become immutable for move submission.
- [x] Confirm a page refresh reloads the latest persisted position and move list.
- [x] Confirm non-participant game access is rejected through `GameApi` tests.

Expanded Playwright coverage with a second Clerk user is deferred until the E2E suite grows beyond the first critical persisted game flow.

## Stage 06. Documentation Updates

- [x] Update `docs/README.md` if the active next task changes.
- [x] Update `docs/backlog.md` when Feature 02 checklist items are completed.
- [x] Record any stack changes in `docs/architecture-plan.md`.
- [x] Add or refine setup instructions for the playable game flow.
- [x] Confirm environment variable notes cover Clerk and PostgreSQL.

## Feature Completion Criteria

- [x] A signed-in user can create a basic game.
- [x] The game screen renders a stable chessboard from persisted FEN.
- [x] Legal moves are accepted by the server-side game service.
- [x] Illegal moves are rejected by the server-side game service.
- [x] SAN move list is persisted and displayed.
- [x] Checkmate and stalemate end the game.
- [x] Completed games reject further moves.
- [x] Core behavior has Vitest coverage.
- [x] Lint, typecheck, tests, and the browser-flow check pass.
- [x] The backlog and docs point to the next stage or feature task.

## Next Task

Continue with [Feature 03. Play Against Computer and Early Analysis](./03-computer-play-analysis.md), starting with the engine runtime decision.
