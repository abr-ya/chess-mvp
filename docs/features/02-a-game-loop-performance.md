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

- [ ] Add development-only timing around current-user resolution, game loading, rule validation, and persistence.
- [ ] Record the baseline number of database operations for GET game and POST move.
- [ ] Separate Next.js compilation time from application-code time.
- [ ] Capture warm request timings against the configured PostgreSQL database.
- [ ] Keep logs free of secrets, provider tokens, and full database URLs.

## Stage 02. Lightweight Request Identity

- [ ] Resolve the active Clerk provider user ID from the session without fetching the full Clerk profile on every game request.
- [ ] Look up the existing internal user and identity with a read-only fast path.
- [ ] Run full local user, profile, and default-rating synchronization only when the identity is missing or an explicit refresh is needed.
- [ ] Avoid updating `lastSeenAt`, profile fields, identity, and rating on every move.
- [ ] Preserve webhook-free first-login behavior.
- [ ] Add tests for existing-user fast path and first-login fallback.

## Stage 03. Compact Game Read and Move Persistence

- [ ] Remove duplicate snapshot reads from normal move submission.
- [ ] Check idempotency without adding a separate routine round trip.
- [ ] Persist the move and game state atomically with optimistic concurrency protection.
- [ ] Return the updated snapshot without an avoidable second reload.
- [ ] Preserve checkmate, stalemate, insufficient-material, and immutable-completed-game behavior.
- [ ] Add tests for retries and concurrent state conflicts.

## Stage 04. Immediate Client Feedback

- [ ] Confirm drag/drop and click-to-move update the board before the HTTP response.
- [ ] Keep the authoritative server response as the final state.
- [ ] Roll back to the previous FEN on rejection or network failure.
- [ ] Avoid blocking unrelated status rendering while a move is pending.
- [ ] Show a subtle pending or slow-connection state without delaying the piece animation.
- [ ] Preserve mobile board dimensions and input behavior.

## Stage 05. Verification and Realtime Readiness

- [ ] Re-run warm GET and POST timing measurements and compare them with the baseline.
- [ ] Confirm the reduced database-operation count.
- [ ] Run lint, typecheck, unit tests, production build, and the persisted Playwright flow.
- [ ] Document the remaining latency budget that Socket.IO and server clock work must address for blitz and bullet.
- [ ] Update architecture and roadmap handoff to Feature 03.

## Feature Completion Criteria

- [ ] The user's own legal move appears immediately on the board.
- [ ] Existing users use the lightweight request-identity path.
- [ ] Move submission avoids duplicate snapshot reads and repeated user writes.
- [ ] Move persistence remains atomic and idempotent.
- [ ] Warm request measurements meet the target or document an external bottleneck with evidence.
- [ ] Existing unit and Playwright game-flow tests pass.
- [ ] Documentation points to Feature 03.

## Next Task

Start Stage 01 by measuring the current request phases and database-operation count for one warm GET game request and one warm POST move request.
