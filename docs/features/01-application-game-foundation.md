# Feature 01. Application and Game Foundation

This completed feature plan records the foundation that the first playable game loop builds on. It covers the application scaffold, shared UI layer, quality gates, authentication shell, database foundation, local user initialization, and game domain contracts.

## Feature Goal

Deliver a reliable application and domain foundation:

- users can sign in;
- the app has internal user and rating records;
- the database can store games, participants, moves, positions, and time events;
- game behavior uses stable domain types instead of raw Prisma records;
- the repository has executable lint, typecheck, and test quality gates;
- the implementation is ready for Feature 02 to add the first persisted manual game loop.

## Stop Point

Feature 01 stops after the game domain types and Prisma mappers are implemented and tested. `GameService`, server operations, the interactive chessboard, and the persisted browser game flow belong to Feature 02.

These items intentionally remain outside Feature 01:

- chess rule validation with `chess.js`;
- implemented game creation and move submission;
- browser chessboard package integration;
- persisted browser game flow;
- engine play, online play, clocks, rating updates, and PGN history.

Continue with [Feature 02. Basic Persisted Game Loop](./02-basic-persisted-game-loop.md).

## Assumptions

- App stack follows `docs/architecture-plan.md`: Next.js 16.2.9 App Router, TypeScript, Tailwind CSS, shadcn/ui, Prisma 7.8.0, PostgreSQL, Clerk, and `chess.js`.
- The UI language is English unless a later decision changes it.
- The domain model uses internal `User.id` values, not provider user IDs.
- Server-side chess validation is authoritative; the client may only provide UI hints.
- The first game flow will be a local/manual board flow without computer replies in Feature 02.
- Core framework and ORM versions should be pinned exactly. Stable non-breaking Next.js and Prisma updates are allowed as intentional maintenance tasks, but canary/pre-release or breaking upgrades should not be absorbed into unrelated MVP work.

## Stage 01. Project Scaffold

- [x] Create the Next.js app with TypeScript and App Router.
- [x] Add Tailwind CSS and confirm global styles are loaded.
- [x] Add baseline scripts for `dev`, `build`, `lint`, `typecheck`, and `test`.
- [x] Add a basic root route that opens the product surface instead of a marketing landing page.
- [x] Add app folders for `(auth)`, `play`, `games`, and shared layout pieces.
- [x] Add domain folders for game logic, persistence adapters, chessboard UI, and auth helpers.
- [x] Verify the scaffold runs locally.

## Stage 01-a. shadcn/ui Setup

- [x] Initialize shadcn/ui with the repository's chosen style settings.
- [x] Confirm generated shadcn configuration matches Tailwind CSS 4 and the current app structure.
- [x] Add the first practical UI primitives for the Feature 01 surface: `Button`, `Select`, `Table`, `Badge`, `Tooltip`, and `Separator`.
- [x] Replace temporary hand-styled action links with shared button styling where it helps consistency.
- [x] Confirm `npm run lint`, `npm run typecheck`, and `npm run test` still pass after shadcn setup.

## Stage 02. Tooling and Quality Gates

- [x] Configure ESLint and TypeScript strictness suitable for the MVP.
- [x] Add Vitest for domain service tests.
- [x] Confirm a test setup file is not needed yet for current Node-only domain tests.
- [x] Document Playwright as the next browser-flow verification step instead of adding it before an interactive game flow exists.
- [x] Add initial CI-friendly commands to `package.json`.
- [x] Confirm `npm run lint`, `npm run typecheck`, and `npm run test` can run on the scaffold.

Playwright should be added in Feature 02 when the first real browser game flow exists, likely after `/play` can create a game and `/games/[id]` can render a persisted game snapshot.

## Stage 03. Authentication Shell

- [x] Add Clerk dependencies and provider wiring.
- [x] Add sign-in route.
- [x] Add sign-out access from the authenticated app shell.
- [x] Protect the game routes that need a signed-in user.
- [x] Add an auth helper that returns the current external identity.
- [x] Define the local user synchronization path after first login.
- [x] Keep provider-specific IDs out of game and rating domain records.

Local user synchronization path: `getCurrentUserIdentity()` returns a trimmed Clerk identity for server code. The local user helper upserts the `User`, `UserAuthIdentity`, and default `Rating` before protected game operations. Game and rating records must reference internal `User.id` values, while Clerk user IDs stay inside `UserAuthIdentity`.

Clerk webhook dependency: Feature 01 must work without Clerk webhooks. The local user upsert should happen on demand from the authenticated session before protected game actions, so local development and Vercel preview/production deployments do not require a public webhook endpoint, custom domain, SSL setup, or ngrok-style tunnel for the core MVP loop. Webhooks may be added after deployment for profile refresh and deletion reconciliation, but they are not required for sign-in, game creation, result persistence, or game history.

## Stage 04. Prisma and Database Foundation

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

## Stage 05. User and Rating Models

- [x] Implement local user creation or upsert from Clerk identity.
- [x] Ensure local user upsert does not depend on Clerk webhooks.
- [x] Store email, display name, avatar URL, and last seen timestamp.
- [x] Create default rating records for new users.
- [x] Use a starting rating of 1200.
- [x] Keep rating update logic out of Feature 01 except for model shape and testable helper boundaries.
- [x] Add tests for user/rating initialization helpers if they contain non-trivial logic.

## Stage 06. Game Domain Types

- [x] Define TypeScript domain types for game snapshots, participants, moves, status, result, and legal actions.
- [x] Define a normalized move command shape with `from`, `to`, optional `promotion`, and idempotency key.
- [x] Define a game creation input for a basic manual chess game.
- [x] Define mapper functions between Prisma records and domain snapshots.
- [x] Keep controller/page code from depending directly on raw Prisma shapes where game behavior is involved.

## Feature Completion Criteria

- [x] The Next.js application scaffold and shared UI layer are available.
- [x] Authentication resolves an external identity without leaking provider IDs into game records.
- [x] Local users and default ratings can be initialized on demand.
- [x] The Prisma schema and initial migration cover the core game records.
- [x] Game domain types and Prisma mappers are implemented and tested.
- [x] Lint, typecheck, and tests pass.
- [x] The backlog and docs point to Feature 02.

## Next Task

Start Feature 02 with Stage 01: add `chess.js` and implement the first `GameService` create-game and legal-move operations.
