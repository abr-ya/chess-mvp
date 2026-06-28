# Feature 03. Custom Position Setup and FEN

This feature adds a reusable board editor before engine work. It lets a user construct a chess position visually or load one from FEN, validate it, and hand the resulting position to later play and analysis features.

## Feature Goal

- provide a dedicated position setup screen;
- place, move, and remove pieces without normal move restrictions;
- configure side to move, castling rights, and en passant state;
- import, validate, copy, and export FEN;
- expose one validated position value that Feature 05 analysis can consume.

## Stop Point

Stop when a user can build a valid position on the board, round-trip it through FEN, and receive clear validation feedback. Do not add Stockfish evaluation, PGN import, or computer play here.

## Stage 01. Position Domain

- [x] Define editable-position state independent of the chessboard package.
- [x] Convert editable state to and from FEN.
- [x] Validate king count, pawn placement, side to move, castling rights, and FEN structure.
- [x] Add unit tests for valid, invalid, empty, and edge-case positions.

## Stage 02. Board Editor

- [ ] Add a reusable `PositionSetupBoard` behind the local chessboard boundary.
- [ ] Support placing, moving, replacing, and removing pieces.
- [ ] Add piece palette, clear-board, and reset-to-start actions.
- [ ] Keep desktop, mobile, mouse, and touch interactions usable.

## Stage 03. Position Controls and FEN

- [ ] Add side-to-move and castling controls.
- [ ] Add FEN input, validation feedback, copy, and load actions.
- [ ] Keep board state and FEN synchronized.
- [ ] Add a dedicated `/analysis/setup` entry route.

## Stage 04. Verification and Handoff

- [ ] Add browser coverage for visual setup and FEN round-trip.
- [ ] Run lint, typecheck, unit tests, and production build.
- [ ] Document the validated-position handoff for Feature 05.
- [ ] Point the roadmap to Feature 04.

## Feature Completion Criteria

- [ ] A user can construct a position visually.
- [ ] FEN import and export round-trip without losing state.
- [ ] Invalid positions show actionable errors.
- [ ] The editor does not depend on Stockfish.
- [ ] Automated checks pass.

## Next Task

Start Stage 02 by adding the reusable `PositionSetupBoard`, piece palette, and clear/reset interactions.
