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
- [x] Legal moves are accepted by the server-side game service.
- [x] Illegal moves are rejected by the server-side game service.
- [ ] SAN move list is persisted and displayed.
- [x] Checkmate and stalemate end the game.
- [x] Completed games reject further moves.
- [x] Core behavior has Vitest coverage.
- [ ] Lint, typecheck, tests, and the browser-flow check pass.
- [ ] The backlog and docs point to the next stage or feature task.

## Next Task

Start Stage 03 by selecting a maintained React 19-compatible chessboard package and integrating it behind `ChessboardView`.
