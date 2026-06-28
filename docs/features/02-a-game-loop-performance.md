# Feature 02-a. Game Loop Performance Hardening

This follow-up feature hardens the completed Feature 02 game loop before engine work begins. It addresses measured warm-request times of roughly 3–4 seconds for game reads and 4–6 seconds for move submissions against the configured remote PostgreSQL database.

## Feature Goal

Make the existing HTTP game loop responsive and establish boundaries that later realtime play can build on:

- a local move appears on the board immediately through optimistic state;
- routine authenticated game requests avoid repeated Clerk profile work and unnecessary database writes;
- move submission uses a compact, observable persistence path;
- rejected moves roll back cleanly without corrupting the board;
- the HTTP path is fast enough for manual play, computer play, and analysis workflows;
- later blitz and bullet work can add Socket.IO, server clocks, and premoves without replacing `GameService` or the persisted game model.

## Stop Point

Stop Feature 02-a when the warm move path has a measured baseline, avoids redundant user synchronization, uses a reduced number of database round trips, preserves idempotency and atomic persistence, and provides immediate local feedback.

This feature does not implement Socket.IO, opponent synchronization, clocks, premoves, matchmaking, or claim that HTTP persistence alone is sufficient for blitz or bullet. Those remain in the time-control and online-play features.

## Performance Targets

- Optimistic board update begins within one animation frame after a legal local move.
- Routine game access resolves the internal user without a full Clerk profile fetch or multi-write upsert.
- A normal move command performs no more than one authoritative snapshot read and one atomic persistence operation, excluding retry recovery.
- Warm `application-code` time against the configured remote database should normally remain below 1.5 seconds in development; slower results must have measured query-level evidence.
- Unit and browser-flow behavior remains unchanged: legal moves persist once, illegal moves roll back, reload restores state, and completed games remain immutable.

## Stage 01. Measurement and Request Tracing

- [x] Add development-only timing around current-user resolution, game loading, rule validation, and persistence.
- [x] Record the baseline number of database operations for GET game and POST move.
- [x] Separate Next.js compilation time from application-code time.
- [x] Capture warm request timings against the configured PostgreSQL database.
- [x] Keep logs free of secrets, provider tokens, and full database URLs.

## Stage 02. Lightweight Request Identity

- [x] Resolve the active Clerk provider user ID from the session without fetching the full Clerk profile on every game request.
- [x] Look up the existing internal user and identity with a read-only fast path.
- [x] Run full local user, profile, and default-rating synchronization only when the identity is missing or an explicit refresh is needed.
- [x] Avoid updating `lastSeenAt`, profile fields, identity, and rating on every move.
- [x] Preserve webhook-free first-login behavior.
- [x] Add tests for existing-user fast path and first-login fallback.

## Stage 03. Compact Game Read and Move Persistence

- [x] Remove duplicate snapshot reads from normal move submission.
- [x] Check idempotency without adding a separate routine round trip.
- [x] Persist the move and game state atomically with optimistic concurrency protection.
- [x] Return the updated snapshot without an avoidable second reload.
- [x] Preserve checkmate, stalemate, insufficient-material, and immutable-completed-game behavior.
- [x] Add tests for retries and concurrent state conflicts.

## Stage 04. Immediate Client Feedback

- [x] Confirm drag/drop and click-to-move update the board before the HTTP response.
- [x] Keep the authoritative server response as the final state.
- [x] Roll back to the previous FEN on rejection or network failure.
- [x] Avoid blocking unrelated status rendering while a move is pending.
- [x] Show a subtle pending or slow-connection state without delaying the piece animation.
- [x] Preserve mobile board dimensions and input behavior.

## Stage 05. Verification and Realtime Readiness

- [x] Re-run warm GET and POST timing measurements and compare them with the baseline.
- [x] Confirm the reduced database-operation count.
- [x] Run lint, typecheck, unit tests, production build, and the persisted Playwright flow.
- [x] Document the remaining latency budget that Socket.IO and server clock work must address for blitz and bullet.
- [x] Update architecture and roadmap handoff to Feature 03.

## Measured Result

Development-only `[game-performance]` logs report application time separately from the Next.js request summary and include only phase names, durations, and database-operation names.

Against the configured remote PostgreSQL database on June 28, 2026:

- the warm GET baseline was roughly 1.5–2.0 seconds with 6 counted database calls; after hardening, the repeated warm GET was about 0.5 seconds with 2 calls;
- the normal POST move baseline was roughly 2.25–2.36 seconds with 12 counted calls; after hardening, normal moves were about 0.91–1.07 seconds with 5 counted calls, or 6 when completing a game;
- repeated user synchronization previously consumed roughly 1.05–1.31 seconds per request; the existing-user path is now one read-only identity/user/rating lookup and performs no routine profile, `lastSeenAt`, identity, or rating writes;
- chess rule validation remained about 1–4 milliseconds, confirming that remote request and persistence round trips were the bottleneck.

The HTTP path now meets the development target for manual and computer play. It does not remove the later realtime budget: blitz and bullet still require Socket.IO delivery, authoritative server clocks, reconnect recovery, and premove handling so opponent updates and clock events do not wait on a full persisted HTTP round trip.

## Feature Completion Criteria

- [x] The user's own legal move appears immediately on the board.
- [x] Existing users use the lightweight request-identity path.
- [x] Move submission avoids duplicate snapshot reads and repeated user writes.
- [x] Move persistence remains atomic and idempotent.
- [x] Warm request measurements meet the target or document an external bottleneck with evidence.
- [x] Existing unit and Playwright game-flow tests pass.
- [x] Documentation points to Feature 03.

## Next Task

Continue with [Feature 03. Play Against Computer and Early Analysis](./03-computer-play-analysis.md).
