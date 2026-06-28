# Feature 06. Play Against Computer

This feature reuses the completed `EngineService` to add persisted games against a computer opponent.

## Feature Goal

- let a signed-in user choose color and difficulty;
- persist legal, time-bounded computer replies through `GameService`;
- keep games recoverable after engine failure;
- update the human rating once after completion.

## Stop Point

Stop when a complete rated computer game works as white or black. Position evaluation remains Feature 05; full-game analysis remains Feature 11.

## Stage 01. Computer Game Model

- [ ] Extend creation types for computer mode, color, and difficulty.
- [ ] Create human and computer participants.
- [ ] Store engine level or estimated Elo.
- [ ] Keep manual games backward compatible.

## Stage 02. Reply Orchestration

- [ ] Request a reply after each accepted human move.
- [ ] Validate and persist engine moves through `GameService`.
- [ ] Support the computer moving first.
- [ ] Prevent duplicate replies during retries or concurrency.
- [ ] Preserve recovery after timeout or failure.

## Stage 03. UI and Rating

- [ ] Add color and difficulty controls.
- [ ] Show computer calculation and recoverable error states.
- [ ] Calculate and persist rating changes idempotently.

## Stage 04. Verification

- [ ] Cover the persisted human/computer flow in browser tests.
- [ ] Verify timeout, retry, completion, and rating behavior.
- [ ] Run lint, typecheck, unit tests, and production build.
- [ ] Point the roadmap to Feature 07.

## Feature Completion Criteria

- [ ] A user can complete a persisted game against the computer.
- [ ] Difficulty maps to documented engine behavior.
- [ ] Engine replies are legal and idempotent.
- [ ] Failure does not lose the game.
- [ ] Rating updates happen once.
- [ ] Automated checks pass.

## Next Task

After Feature 05, start Stage 01 by extending the computer-game model.
