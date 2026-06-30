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

- [x] Add a reusable `PositionSetupBoard` behind the local chessboard boundary.
- [x] Support placing, moving, replacing, and removing pieces.
- [x] Add piece palette, clear-board, and reset-to-start actions.
- [x] Keep desktop, mobile, mouse, and touch interactions usable.

## Stage 03. Position Controls and FEN

- [x] Add side-to-move and castling controls.
- [x] Add FEN input, validation feedback, copy, and load actions.
- [x] Keep board state and FEN synchronized.
- [x] Add a dedicated `/analysis/setup` entry route.

## Stage 04. Verification and Handoff

- [x] Add browser coverage for visual setup and FEN round-trip.
- [x] Run lint, typecheck, unit tests, and production build.
- [x] Document the validated-position handoff for Feature 05.
- [x] Point the roadmap to Feature 04.

## Validated-Position Handoff

- `EditablePosition` is the editor-owned mutable value and remains independent of React and the chessboard package.
- `parseFen(fen)` is the input boundary. Consumers must continue only when it returns `{ ok: true, position }`.
- `validateEditablePosition(position)` validates state changed through editor controls.
- `toFen(position)` is the serialized handoff value for Feature 05 `EngineService`; the engine feature must not depend on editor component state.
- Feature 05 may add stricter engine-specific legality checks at its boundary without moving Stockfish concerns into Feature 03.

## Feature Completion Criteria

- [x] A user can construct a position visually.
- [x] FEN import and export round-trip without losing state.
- [x] Invalid positions show actionable errors.
- [x] The editor does not depend on Stockfish.
- [x] Automated checks pass.

## Next Task

Start Stage 01 of Feature 04 by defining PGN import and export domain contracts.
