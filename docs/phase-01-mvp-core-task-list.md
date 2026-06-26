# Phase 01 MVP Core Task List

This task list expands Phase 1 from the main backlog into executable slices. It should be completed before moving to chess engine play, early position analysis, time controls, online invite games, or PGN history polish.

## Phase Goal

Deliver the first reliable authenticated chess game loop foundation:

- users can sign in;
- the app has internal user and rating records;
- games, participants, moves, and positions are persisted;
- the server validates legal chess moves with `chess.js`;
- the browser can show a playable chessboard and SAN move list;
- games can finish by core chess rules;
- the implementation is ready for Phase 2 computer replies and early position analysis without changing the core game model.

## Stop Point

Stop Phase 1 when a signed-in user can create or open a basic game screen, make legal moves through the server-backed game service, see the board and SAN move list update, and persist the resulting position and moves in the database.

Do not start these items in Phase 1:

- Stockfish or other engine integration, except for planning the `EngineService` and early analysis boundaries;
- live human invite games;
- Socket.IO synchronization;
- real clock enforcement;
- rating updates after completed games;
- full PGN export and game history UI.

After Phase 1, prioritize the smallest useful engine slice before broader online play: a minimal `EngineService`, computer reply moves, and a first analysis screen that accepts or sets up a FEN position and returns a bounded evaluation.

## Assumptions

- App stack follows `docs/architecture-plan.md`: Next.js 16.2.9 App Router, TypeScript, Tailwind CSS, shadcn/ui, Prisma 7.8.0, PostgreSQL, Clerk, and `chess.js`.
- The UI language is English unless a later decision changes it.
- The domain model uses internal `User.id` values, not provider user IDs.
- Server-side chess validation is authoritative; the client may only provide UI hints.
- The first game flow can be a local/manual board flow without computer replies.
- Core framework and ORM versions should be pinned exactly. Stable non-breaking Next.js and Prisma updates are allowed as intentional maintenance tasks, but canary/pre-release or breaking upgrades should not be absorbed into unrelated MVP work.

## 01. Project Scaffold

- [x] Create the Next.js app with TypeScript and App Router.
- [x] Add Tailwind CSS and confirm global styles are loaded.
- [x] Add baseline scripts for `dev`, `build`, `lint`, `typecheck`, and `test`.
- [x] Add a basic root route that opens the product surface instead of a marketing landing page.
- [x] Add app folders for `(auth)`, `play`, `games`, and shared layout pieces.
- [x] Add domain folders for game logic, persistence adapters, chessboard UI, and auth helpers.
- [x] Verify the scaffold runs locally.

## 01-a. shadcn/ui Setup

- [x] Initialize shadcn/ui with the repository's chosen style settings.
- [x] Confirm generated shadcn configuration matches Tailwind CSS 4 and the current app structure.
- [x] Add the first practical UI primitives for the Phase 1 surface: `Button`, `Select`, `Table`, `Badge`, `Tooltip`, and `Separator`.
- [x] Replace temporary hand-styled action links with shared button styling where it helps consistency.
- [x] Confirm `npm run lint`, `npm run typecheck`, and `npm run test` still pass after shadcn setup.

## 02. Tooling and Quality Gates

- [x] Configure ESLint and TypeScript strictness suitable for the MVP.
- [x] Add Vitest for domain service tests.
- [x] Confirm a test setup file is not needed yet for current Node-only domain tests.
- [x] Document Playwright as the next browser-flow verification step instead of adding it before an interactive game flow exists.
- [x] Add initial CI-friendly commands to `package.json`.
- [x] Confirm `npm run lint`, `npm run typecheck`, and `npm run test` can run on the scaffold.

Playwright should be added when the first real browser game flow exists, likely after `/play` can create a game and `/games/[id]` can render a persisted game snapshot.

## 03. Authentication Shell

- [x] Add Clerk dependencies and provider wiring.
- [x] Add sign-in route.
- [x] Add sign-out access from the authenticated app shell.
- [x] Protect the game routes that need a signed-in user.
- [x] Add an auth helper that returns the current external identity.
- [x] Define the local user synchronization path after first login.
- [x] Keep provider-specific IDs out of game and rating domain records.

Local user synchronization path: `getCurrentUserIdentity()` returns a trimmed Clerk identity for server code. Phase 05 should upsert the local `User`, `UserAuthIdentity`, and default `Rating` from that helper before game creation. Game and rating records must reference internal `User.id` values, while Clerk user IDs stay inside `UserAuthIdentity`.

Clerk webhook dependency: Phase 1 must work without Clerk webhooks. The local user upsert should happen on demand from the authenticated session before protected game actions, so local development and Vercel preview/production deployments do not require a public webhook endpoint, custom domain, SSL setup, or ngrok-style tunnel for the core MVP loop. Webhooks may be added after deployment for profile refresh and deletion reconciliation, but they are not required for sign-in, game creation, result persistence, or game history.

## 04. Prisma and Database Foundation

- [x] Initialize Prisma 7.8.0.
- [x] Add PostgreSQL connection configuration through environment variables.
- [x] Create the initial Prisma schema.
- [x] Add `User`.
- [x] Add `UserAuthIdentity`.
- [x] Add `Rating`.
- [x] Add `Game`.
- [x] Add `GameParticipant`.
- [x] Add `Move`.
- [x] Add `TimeEvent`.
- [x] Add enums for game mode, game status, participant side, result, and termination reason.
- [x] Add indexes for user game lookup and game move ordering.
- [x] Generate Prisma Client.
- [x] Create the first migration.
- [x] Add a shared Prisma client helper.

## 05. User and Rating Models

- [x] Implement local user creation or upsert from Clerk identity.
- [x] Ensure local user upsert does not depend on Clerk webhooks.
- [x] Store email, display name, avatar URL, and last seen timestamp.
- [x] Create default rating records for new users.
- [x] Use a starting rating of 1200.
- [x] Keep rating update logic out of Phase 1 except for model shape and testable helper boundaries.
- [x] Add tests for user/rating initialization helpers if they contain non-trivial logic.

## 06. Game Domain Types

- [x] Define TypeScript domain types for game snapshots, participants, moves, status, result, and legal actions.
- [x] Define a normalized move command shape with `from`, `to`, optional `promotion`, and idempotency key.
- [x] Define a game creation input for a basic manual chess game.
- [x] Define mapper functions between Prisma records and domain snapshots.
- [x] Keep controller/page code from depending directly on raw Prisma shapes where game behavior is involved.

## 07. GameService Core

- [ ] Add `chess.js`.
- [ ] Implement basic game creation with initial FEN.
- [ ] Create two participants for the game, even when Phase 1 has no online opponent.
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

## 08. API or Server Action Surface

- [ ] Choose the Phase 1 server boundary: route handlers, server actions, or a small internal API facade.
- [ ] Implement create basic game operation.
- [ ] Implement get game snapshot operation.
- [ ] Implement submit move operation.
- [ ] Require an authenticated user for game creation and access.
- [ ] Check that the current user is a participant before returning a game snapshot.
- [ ] Normalize errors into UI-friendly messages.
- [ ] Avoid exposing provider auth IDs in API responses.

## 09. Browser Chessboard

- [ ] Choose the exact React chessboard package during scaffold work.
- [ ] Wrap the selected package in a local `ChessboardView` component.
- [ ] Render the current FEN.
- [ ] Support moving pieces by drag/drop or click/tap.
- [ ] Send move commands through the server-backed operation.
- [ ] Disable move input while a move is being submitted.
- [ ] Show illegal move feedback without corrupting local board state.
- [ ] Keep board dimensions stable on desktop and mobile.

## 10. Game Screen

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

## 11. Persistence Verification

- [ ] Confirm game creation writes `Game` and `GameParticipant` rows.
- [ ] Confirm each accepted move writes a `Move` row.
- [ ] Confirm `Game.currentFen` updates after every accepted move.
- [ ] Confirm completed games become immutable for move submission.
- [ ] Confirm a page refresh reloads the latest persisted position and move list.
- [ ] Confirm unauthorized users cannot open another user's game.

## 12. Documentation Updates

- [ ] Update `docs/README.md` if the active next task changes.
- [ ] Update `docs/backlog.md` when Phase 1 checklist items are completed.
- [ ] Record any stack changes in `docs/architecture-plan.md`.
- [ ] Add setup instructions once the scaffold exists.
- [ ] Add environment variable notes for Clerk and PostgreSQL.

## Phase 1 Completion Criteria

- [ ] A signed-in user can create a basic game.
- [ ] The game screen renders a stable chessboard from persisted FEN.
- [ ] Legal moves are accepted by the server-side game service.
- [ ] Illegal moves are rejected by the server-side game service.
- [ ] SAN move list is persisted and displayed.
- [ ] Checkmate and stalemate end the game.
- [ ] Completed games reject further moves.
- [ ] Core behavior has Vitest coverage.
- [ ] Lint, typecheck, and tests pass.
- [ ] The backlog and docs point to the next phase task.

## Next Task

Start Phase 07 by adding `chess.js` and implementing the first `GameService` create-game and legal-move operations.
