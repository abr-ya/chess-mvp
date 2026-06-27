# Feature 02. Basic Persisted Game Loop

This feature turns the application and domain foundation from Feature 01 into the first reliable authenticated chess game loop. It should be completed before moving to computer replies, early position analysis, time controls, online invite games, or PGN history polish.

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

- [ ] Add `chess.js`.
- [ ] Implement basic game creation with initial FEN.
- [ ] Create two participants for the game, even when Feature 02 has no online opponent.
- [ ] Implement legal move application through `chess.js`.
- [ ] Persist UCI-like move coordinates, SAN, move number, side, and FEN after move.
- [ ] Update `Game.currentFen` after each accepted move.
- [ ] Reject illegal moves.
- [ ] Reject moves for the wrong side.
- [ ] Reject moves after a finished game.
- [ ] Detect checkmate.
- [ ] Detect stalemate.
- [ ] Detect draw by insufficient material or impossible continuation where supported by `chess.js`.
- [ ] Store final game status, result, and termination reason.
- [ ] Return a complete game snapshot after create and move operations.
- [ ] Add Vitest coverage for legal moves, illegal moves, SAN output, turn checks, and completion.

## Stage 02. API or Server Action Surface

- [ ] Choose the Feature 02 server boundary: route handlers, server actions, or a small internal API facade.
- [ ] Implement create basic game operation.
- [ ] Implement get game snapshot operation.
- [ ] Implement submit move operation.
- [ ] Require an authenticated user for game creation and access.
- [ ] Check that the current user is a participant before returning a game snapshot.
- [ ] Normalize errors into UI-friendly messages.
- [ ] Avoid exposing provider auth IDs in API responses.

## Stage 03. Browser Chessboard

- [ ] Choose the exact React chessboard package.
- [ ] Wrap the selected package in the local `ChessboardView` component.
- [ ] Render the current FEN.
- [ ] Support moving pieces by drag/drop or click/tap.
- [ ] Send move commands through the server-backed operation.
- [ ] Disable move input while a move is being submitted.
- [ ] Show illegal move feedback without corrupting local board state.
- [ ] Keep board dimensions stable on desktop and mobile.

## Stage 04. Game Screen

- [ ] Build `/play` as the primary product entry.
- [ ] Add a "new game" action.
- [ ] Add `/games/[id]` for the active game screen.
- [ ] Show the board.
- [ ] Show white and black player labels.
- [ ] Show side to move.
- [ ] Show game status.
- [ ] Show a compact SAN move list.
- [ ] Show checkmate, stalemate, or draw state when the game ends.
- [ ] Add a new game action after completion.
- [ ] Keep the layout usable on desktop and mobile.

## Stage 05. Browser-Flow and Persistence Verification

- [ ] Add Playwright for the first real browser game flow.
- [ ] Confirm game creation writes `Game` and `GameParticipant` rows.
- [ ] Confirm each accepted move writes a `Move` row.
- [ ] Confirm `Game.currentFen` updates after every accepted move.
- [ ] Confirm completed games become immutable for move submission.
- [ ] Confirm a page refresh reloads the latest persisted position and move list.
- [ ] Confirm unauthorized users cannot open another user's game.

## Stage 06. Documentation Updates

- [ ] Update `docs/README.md` if the active next task changes.
- [ ] Update `docs/backlog.md` when Feature 02 checklist items are completed.
- [ ] Record any stack changes in `docs/architecture-plan.md`.
- [ ] Add or refine setup instructions for the playable game flow.
- [ ] Confirm environment variable notes cover Clerk and PostgreSQL.

## Feature Completion Criteria

- [ ] A signed-in user can create a basic game.
- [ ] The game screen renders a stable chessboard from persisted FEN.
- [ ] Legal moves are accepted by the server-side game service.
- [ ] Illegal moves are rejected by the server-side game service.
- [ ] SAN move list is persisted and displayed.
- [ ] Checkmate and stalemate end the game.
- [ ] Completed games reject further moves.
- [ ] Core behavior has Vitest coverage.
- [ ] Lint, typecheck, tests, and the browser-flow check pass.
- [ ] The backlog and docs point to the next stage or feature task.

## Next Task

Start Stage 01 by adding `chess.js` and implementing the first `GameService` create-game and legal-move operations.
