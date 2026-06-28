# Feature 05. Engine Integration and Position Evaluation

This feature introduces one reusable Stockfish boundary and uses it for a focused product result: evaluate a validated position and show the best move.

## Feature Goal

- choose and pin the deployment-compatible Stockfish runtime;
- define an engine API independent of the selected package;
- accept a validated FEN from Feature 03;
- return a bounded centipawn or mate score and best move;
- handle timeouts, cancellation, and engine failures safely.

## Stop Point

Stop when the setup screen can request one bounded evaluation and display its score and best move. Do not add computer opponents, full-game analysis, graphs, or move classifications.

## Stage 01. Engine Runtime Decision

- [ ] Compare maintained package, WASM worker, and server-process options.
- [ ] Pin the dependency and record `docs/decisions/engine-runtime.md`.
- [ ] Define timeout, concurrency, cleanup, and deployment constraints.

## Stage 02. EngineService

- [ ] Define package-independent request and response types.
- [ ] Implement bounded position evaluation and best-move requests.
- [ ] Normalize score, mate, timeout, cancellation, and failure results.
- [ ] Add unit tests around parsing and failure behavior.

## Stage 03. Evaluation API and UI

- [ ] Add an authenticated bounded-evaluation operation.
- [ ] Connect the Feature 03 position setup screen.
- [ ] Display side-relative score, mate result, best move, and calculation state.
- [ ] Prevent stale responses from replacing a newer position.

## Stage 04. Verification and Handoff

- [ ] Verify valid and invalid FEN behavior in the browser.
- [ ] Verify timeout and engine-process cleanup.
- [ ] Run lint, typecheck, unit tests, and production build.
- [ ] Document reuse by Feature 06 computer play.

## Feature Completion Criteria

- [ ] A valid custom position returns a bounded evaluation.
- [ ] The UI shows a normalized score and best move.
- [ ] Failures do not corrupt position state.
- [ ] Stockfish is isolated behind `EngineService`.
- [ ] Automated checks pass.

## Next Task

After Feature 04, start Stage 01 by comparing Stockfish runtime options.
