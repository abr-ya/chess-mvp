# Feature 04. PGN File Import and Export

This feature lets users move complete chess games into and out of the application as standard PGN files. FEN position setup remains owned by Feature 03.

## Feature Goal

- generate standards-compatible PGN from persisted games;
- download a game as a `.pgn` file;
- upload or paste PGN and validate it before persistence;
- reconstruct structured moves and positions instead of storing PGN as the only source of truth;
- open an imported game in a basic move-by-move review screen.

## Stop Point

Stop when one valid PGN can be exported, imported, persisted safely, and replayed. Do not add bulk archives, cloud-provider imports, engine analysis, or advanced history filters.

## Stage 01. PGN Domain

- [x] Define required and optional PGN tags.
- [x] Generate PGN from structured game and move records.
- [x] Parse PGN with the chess rules library and reject invalid notation.
- [x] Reconstruct SAN, UCI, and FEN-after-move values.
- [x] Add round-trip and malformed-file tests.

## Stage 02. Export

- [x] Add an authenticated PGN response for accessible games.
- [x] Add copy-PGN and download-`.pgn` actions.
- [x] Use a safe, predictable filename.

## Stage 03. Import

- [x] Add file selection and paste-PGN inputs with size limits.
- [x] Preview headers and validation errors before import.
- [ ] Persist an imported game and its structured moves atomically.
- [ ] Prevent duplicate submission through an idempotency key.

## Stage 04. Basic Review and Verification

- [ ] Add move navigation for the imported game.
- [ ] Cover export/import round-trip in browser tests.
- [ ] Run lint, typecheck, unit tests, and production build.
- [ ] Point the roadmap to Feature 05.

## Feature Completion Criteria

- [ ] Persisted games download as valid PGN files.
- [ ] Valid PGN files import into structured game records.
- [ ] Invalid or oversized files are rejected safely.
- [ ] Imported games can be replayed move by move.
- [ ] Automated checks pass.

## Next Task

Continue Stage 03 by persisting an imported game and its structured moves atomically.
