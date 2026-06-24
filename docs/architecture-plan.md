# Chess Platform Architecture Plan

## Decision Summary

The first implementation should be a TypeScript web application with a server-authoritative chess game model.

Recommended MVP stack:

- Frontend and HTTP API: Next.js 16.2.9 App Router with TypeScript.
- Styling and UI primitives: Tailwind CSS with shadcn/ui as the local component layer.
- Authentication: Clerk for the fastest MVP path, with a local `User` record linked to the external identity.
- Database: PostgreSQL.
- ORM and migrations: Prisma ORM 7.8.0.
- Real-time transport: Socket.IO on a dedicated Node.js real-time server process.
- Chess rules: `chess.js` on the server for move validation, SAN, FEN, and game-over detection.
- Chessboard UI: a React chessboard component wrapped behind a local `ChessboardView` component.
- Engine integration and analysis: Stockfish behind an internal `EngineService` adapter, initially as a server-side process or WASM worker.
- Testing: Vitest for domain services, Playwright for browser game flows.

## Version Policy

The MVP should use pinned stable versions for core framework and database tooling:

- Next.js: `16.2.9`;
- Prisma CLI and `@prisma/client`: `7.8.0`;
- Database: PostgreSQL, with the concrete hosted/local version documented when the deployment target is chosen.

The project may update to newer stable Next.js or Prisma releases as they become available, but updates should be intentional and verified. Patch and minor updates are acceptable when they do not introduce breaking changes for the features the MVP uses. Major upgrades, canary releases, release candidates, or changes with documented breaking behavior should be treated as separate upgrade tasks with migration notes and validation.

Do not leave core framework dependencies on floating `latest` ranges in `package.json`; pin exact versions so local development, CI, and Vercel builds stay reproducible.

## Why This Stack

Next.js gives the browser MVP a single TypeScript product surface for pages, authenticated routes, route handlers, and server-rendered screens. The App Router is the default direction for new Next.js applications and keeps the first client straightforward while leaving room for API-first growth.

shadcn/ui is a good fit because it copies accessible component code into the repository instead of hiding the UI behind a closed package API. The MVP should use it for application controls, forms, dialogs, tables, badges, tabs, sliders, switches, tooltips, and side panels. The chessboard itself remains a dedicated chess UI component wrapped by `ChessboardView`.

The current shadcn/ui setup uses the `base-nova` style preset with Tailwind CSS 4, Lucide icons, and Base UI primitives. Future components should stay consistent with `components.json` unless there is a concrete accessibility or maintenance reason to migrate the local UI layer.

PostgreSQL and Prisma are a conservative fit for structured game records, moves, ratings, users, and future analysis jobs. The database remains the system of record; PGN is stored as a generated artifact, not as the only game state.

Socket.IO is preferred over raw WebSocket for the first MVP because it gives a stable event model, reconnect behavior, and room-style game subscriptions with less custom infrastructure. It should still be isolated behind a transport layer so it can be replaced later if needed.

`chess.js` is the server-side chess rules dependency. The client can use it for optimistic hints, but every accepted move must be validated by the server.

Stockfish must not leak into controllers or UI components. It should live behind an adapter that accepts a position, level settings, and a time budget, then returns a candidate move or position evaluation.

## Chess Library Boundaries

The chess-specific dependencies should stay isolated behind local application interfaces:

- `chess.js` is the rules and notation library. It owns legal move validation, turn rules, SAN, FEN loading/export, and game-over checks.
- The React chessboard package is a view dependency only. It must be wrapped by `ChessboardView`, which receives FEN, orientation, legal UI hints, and move callbacks. Pages and services should not depend directly on the package API.
- Stockfish is the engine dependency. It must be wrapped by `EngineService`, which can support both engine moves and position analysis.

The exact React chessboard package should be selected during the browser chessboard task after checking current maintenance status and React 19 / Next.js 16 compatibility. The exact Stockfish package, binary, or WASM strategy should be selected during engine implementation.

## Service Architecture

```text
Browser
  |
  | HTTPS: pages, auth callbacks, game creation, history, review
  v
Next.js Web App
  |
  | Prisma Client
  v
PostgreSQL

Browser
  |
  | Socket.IO: join game, submit move, receive game state
  v
Realtime Server
  |
  | GameService
  v
PostgreSQL
  |
  | EngineService for computer games
  v
Stockfish Adapter
```

## Runtime Boundaries

### Web App

Responsible for:

- public and authenticated pages;
- sign-in and sign-out flows;
- game creation forms;
- game history and review screens;
- HTTP API routes for non-realtime operations;
- session validation for HTTP requests.

### Realtime Server

Responsible for:

- authenticating socket connections;
- subscribing users to a game room;
- accepting move commands;
- broadcasting authoritative game snapshots;
- handling reconnect state recovery;
- forwarding computer-move requests to the game service.

The realtime server should be a separate Node.js process in the MVP. This avoids coupling long-lived socket state to serverless route handlers.

### Game Service

Responsible for:

- creating games and participants;
- validating player permissions;
- applying legal moves through `chess.js`;
- updating clocks from server timestamps;
- detecting completion;
- persisting moves and FEN;
- generating PGN;
- calculating rating changes after completion.

### Engine Service

Responsible for:

- translating level names into engine constraints;
- enforcing search depth and move-time limits;
- returning legal UCI moves;
- evaluating a single position from FEN;
- returning a best line or principal variation when available;
- failing gracefully without corrupting game state.

### Analysis Service

Early analysis should reuse `EngineService` instead of creating a second engine integration. The first approximation should support:

- entering or importing a FEN position;
- validating the position with `chess.js`;
- asking Stockfish for a bounded evaluation;
- showing side-to-move, centipawn or mate score, and the top suggested line.

Full game analysis can build on the same service later by analyzing each stored move and saving an analysis job separately from the game.

## First Increment

The first working increment should prove the complete single-player loop before online human play:

1. Scaffold the Next.js application and TypeScript tooling.
2. Add Prisma and the initial PostgreSQL schema for users, games, participants, moves, and ratings.
3. Implement the `GameService` with `chess.js` and unit tests.
4. Build a local game screen with a chessboard, clocks, move list, and game status.
5. Add a minimal engine adapter that can return a legal move for a selected level.
6. Add a minimal position analysis screen that accepts a FEN, validates it, and returns a bounded Stockfish evaluation.
7. Persist completed computer games and show them in a basic history page.

Human invite games and Socket.IO synchronization should be the second implementation increment, after the server-side game model is already reliable.

## Initial Data Model

The initial Prisma schema should include:

- `User`
- `UserAuthIdentity`
- `Rating`
- `Game`
- `GameParticipant`
- `Move`
- `TimeEvent`

Important modeling rules:

- domain records reference internal `User.id`, not provider IDs;
- `Game.currentFen` stores the authoritative active position;
- `Move` stores UCI, SAN, FEN after the move, and clock data;
- completed games are immutable except for derived analysis fields added later;
- PGN is generated from structured data and stored on completion.

## API Contracts

### HTTP

```text
POST /api/games/computer
  Creates a computer game.

POST /api/games/invite
  Creates a waiting human game and returns an invite link.

GET /api/games/:id
  Returns the latest game snapshot for an authorized participant.

GET /api/games
  Returns the current user's paginated game history.

GET /api/games/:id/pgn
  Returns PGN for a completed game.
```

### Socket.IO Events

```text
client -> server: game:join
  { gameId }

server -> client: game:snapshot
  { game, participants, moves, clocks, legalActions }

client -> server: move:submit
  { gameId, moveId, from, to, promotion? }

server -> client: move:accepted
  { moveId, snapshot }

server -> client: move:rejected
  { moveId, reason, snapshot }

server -> room: game:updated
  { snapshot }

server -> room: game:ended
  { snapshot, result, terminationReason }
```

`moveId` is a client-generated idempotency key. Resubmitting the same move command must not create duplicate moves.

## Screen Structure

Initial routes:

```text
/
/sign-in
/play
/games/:id
/games
/games/:id/review
```

The game screen should be the primary product surface, not a landing page. It needs:

- chessboard;
- white and black clocks;
- move list;
- game status;
- side-to-move indicator;
- resign action when applicable;
- new game action after completion;
- PGN access after completion.

shadcn/ui usage should stay practical and restrained:

- use `Button`, `Select`, `Dialog`, `Tabs`, `Table`, `Badge`, `Tooltip`, `Slider`, `Switch`, `Separator`, and `Sheet` for the first UI pass;
- keep the board, clocks, move list, and game state layout custom to the chess product;
- avoid wrapping the whole game screen in decorative cards;
- keep repeated history rows and settings panels dense enough for regular use.

## Open Decisions

- Confirm Clerk vs Auth.js before implementing authentication.
- Confirm whether the UI should be English-only or bilingual from the start.
- Choose the exact React chessboard package during scaffolding after checking current maintenance status.
- Choose the exact Stockfish package or binary strategy during engine implementation.
- Decide whether the local development database should be Docker PostgreSQL or an existing local PostgreSQL instance.

## Next Task

Start Phase 04 by initializing Prisma and the database foundation.
