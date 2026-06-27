# Chessboard Package Decision

## Context

Feature 02 needs an interactive browser chessboard that renders FEN positions, supports drag/drop and click/tap moves, works on mobile, and stays isolated behind the local `ChessboardView` component. The application uses React 19.2.4 and Next.js 16.2.9, so explicit React 19 compatibility is required.

## Options Considered

- `react-chessboard` 5.10.0: maintained, responsive, accessible, TypeScript-native, MIT licensed, and declares React 19 peer dependencies.
- `@react-chess/chessground` 1.3.4: its declared peer dependencies stop at React 18 and the package has not been published recently.
- `@bezalel6/react-chessground` 2.1.1: modernized and mobile-friendly, but has very low adoption and uses the GPL-3.0 license.
- A custom board: maximum control, but duplicates solved drag/drop, touch, accessibility, piece rendering, and responsive-layout work.

## Decision

Use exactly `react-chessboard` 5.10.0 for Feature 02.

`ChessboardView` is the only application component that imports the package. It receives FEN and game identifiers through local props, translates drag/drop and click interactions into the application's move-command shape, and sends moves through the authenticated HTTP API. Server-side `GameService` validation remains authoritative.

## Tradeoffs and Follow-ups

- The package belongs in the client bundle, so the client boundary stays limited to the chessboard and later interactive game-screen shell.
- The first promotion interaction defaults to a queen. A promotion chooser may be added later without changing the server command shape.
- Package-specific option names and callbacks must not leak into pages, API routes, or game-domain services.
- Reassess the package only if React compatibility, maintenance, accessibility, or mobile behavior becomes inadequate.

## Related Documents

- [Architecture Plan](../architecture-plan.md)
- [Feature 02. Basic Persisted Game Loop](../features/02-basic-persisted-game-loop.md)
