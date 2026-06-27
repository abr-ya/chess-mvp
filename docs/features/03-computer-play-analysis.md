# Feature 03. Play Against Computer and Early Analysis

This feature builds on the persisted game loop from Feature 02. It introduces one reusable engine boundary for computer replies and bounded position analysis without coupling Stockfish directly to route handlers or UI components.

## Feature Goal

Deliver the first useful engine-backed chess experience:

- a signed-in user can choose a color and difficulty and play against the computer;
- computer replies are legal, time-bounded, and persisted through the existing `GameService` path;
- engine failures do not corrupt or discard a game;
- completed computer games can update the user's rating against an estimated engine Elo;
- a minimal analysis screen accepts a valid FEN and returns a bounded score and suggested line;
- computer play and analysis share one `EngineService` integration.

## Stop Point

Stop Feature 03 when computer games work through the persisted browser flow and the same engine adapter can evaluate one supplied position. Do not add full post-game analysis, evaluation graphs, move classifications, background analysis jobs, or online play.

## Stage 01. Engine Runtime Decision

- [ ] Compare maintained Stockfish package, WASM worker, and server-process options against the deployment target.
- [ ] Choose and pin the exact engine dependency and version.
- [ ] Record the decision in `docs/decisions/engine-runtime.md`.
- [ ] Define runtime, timeout, concurrency, and cleanup constraints.

## Stage 02. EngineService Core

- [ ] Define engine request and response types independent of the selected package.
- [ ] Implement `EngineService` for best-move and bounded-evaluation requests.
- [ ] Support a hard calculation timeout and cancellation.
- [ ] Normalize engine errors without leaking package-specific details.
- [ ] Add unit tests around level mapping, result parsing, timeout, and failure behavior.

## Stage 03. Computer Game Creation

- [ ] Extend game creation types for computer mode, selected player color, and difficulty.
- [ ] Create one human and one computer participant.
- [ ] Store the engine level or estimated Elo needed to reproduce rating behavior.
- [ ] Add an authenticated computer-game API operation.
- [ ] Keep manual game creation backward compatible.

## Stage 04. Computer Reply Orchestration

- [ ] Request a computer reply after each accepted human move when the game remains active.
- [ ] Route the selected engine move back through authoritative `GameService` validation and persistence.
- [ ] Handle the computer moving first when the user selects black.
- [ ] Prevent duplicate replies during retries or concurrent requests.
- [ ] Keep the game recoverable when the engine times out or fails.

## Stage 05. Computer Game UI and Rating

- [ ] Add color and difficulty controls to `/play`.
- [ ] Show computer identity and difficulty on the game screen.
- [ ] Disable human input while the computer is calculating.
- [ ] Show recoverable engine-error feedback.
- [ ] Calculate and persist the human rating result after a completed computer game.
- [ ] Keep rating changes idempotent.

## Stage 06. Early Position Analysis

- [ ] Add a minimal analysis route and screen.
- [ ] Accept FEN input or a position supplied by the board.
- [ ] Validate FEN with `chess.js` before calling the engine.
- [ ] Return a bounded centipawn or mate score.
- [ ] Return and display at least one suggested best line.
- [ ] Reuse `EngineService` instead of introducing a second Stockfish integration.

## Stage 07. Verification and Documentation

- [ ] Cover the persisted human/computer loop with automated tests.
- [ ] Verify engine timeout and failure recovery.
- [ ] Verify rating updates happen once.
- [ ] Verify bounded FEN analysis in the browser.
- [ ] Update architecture, backlog, setup, and environment documentation.
- [ ] Point the roadmap to Feature 04.

## Feature Completion Criteria

- [ ] A signed-in user can play a persisted game against the computer as white or black.
- [ ] Difficulty changes engine behavior through a documented adapter.
- [ ] Engine replies are legal and persisted.
- [ ] Engine failure does not lose or corrupt the game.
- [ ] Completed computer games update rating once.
- [ ] A valid FEN returns a bounded evaluation and suggested line.
- [ ] Computer play and analysis use the same `EngineService`.
- [ ] Lint, typecheck, unit tests, and relevant browser-flow tests pass.

## Next Task

Start Stage 01 by comparing current Stockfish runtime options and recording the selected deployment-compatible engine strategy in `docs/decisions/engine-runtime.md`.
