# Planning Structure

This repository uses three planning layers:

- `docs/backlog.md` is the top-level roadmap.
- `docs/features/` contains executable plans for active or near-term roadmap features.
- Each feature plan is split into stages that describe the implementation order inside that feature.
- `docs/decisions/` contains research notes, option comparisons, and decision records.

Architecture decisions live separately in `docs/architecture-plan.md`.
Product scope and long-form requirements live in `docs/mvp-spec.md`.

## Terms

Use `Feature` for a large product workstream from the roadmap.

Examples:

- `Feature 01. Application and Game Foundation`
- `Feature 02. Basic Persisted Game Loop`
- `Feature 03. Play Against Computer and Early Analysis`

Use `Stage` for the ordered implementation slices inside one feature plan.

Examples:

- `Stage 01. GameService Core`
- `Stage 02. API or Server Action Surface`
- `Stage 03. Browser Chessboard`

Use `Task` for checklist items inside a stage.

## File Naming

Feature files should live under `docs/features/` and use this pattern:

```text
NN-feature-name.md
```

Examples:

- `01-application-game-foundation.md`
- `02-basic-persisted-game-loop.md`
- `03-computer-play-analysis.md`

Create a feature file when a roadmap item needs a detailed checklist or a resumable implementation handoff. Do not create empty feature files only to mirror the whole roadmap.

Decision files should live under `docs/decisions/` and use this pattern:

```text
decision-topic.md
```

Examples:

- `auth-options.md`
- `chessboard-package.md`
- `engine-runtime.md`

## Update Rules

- When a roadmap item becomes active, link its feature file from `docs/backlog.md`.
- When a stage is completed, update the feature file's checklist and `Next Task`.
- When a feature-level outcome changes, update both `docs/backlog.md` and the related feature file.
- Keep implementation details in feature files; keep `docs/backlog.md` as the high-level roadmap.
- Update `docs/mvp-spec.md` only when product scope, acceptance criteria, user roles, or MVP-level requirements change.
- Create or update a file in `docs/decisions/` when the project compares options, makes a non-obvious product or technical decision, or records tradeoffs that future work should preserve.
- Link decision files from the related feature plan, `docs/backlog.md`, `docs/mvp-spec.md`, or `docs/architecture-plan.md` when the decision affects those documents.
- Update `docs/decisions/auth-options.md` only when authentication requirements, provider decisions, webhook assumptions, or local identity rules change.

## Decision File Updates

Use `docs/decisions/` for scoped decision and research notes.

Each decision file should make these points clear:

- context: what question was being decided;
- options considered;
- selected direction, if one has been chosen;
- tradeoffs and deferred follow-ups;
- links to affected roadmap, feature, product, or architecture documents.

Decision files are not task trackers. If a decision creates implementation work, add that work to the relevant feature plan under `docs/features/` and keep only the decision context in `docs/decisions/`.

## Architecture Plan Updates

Update `docs/architecture-plan.md` when a change affects architecture decisions, not for every completed task.

Return to the architecture plan when changing or confirming:

- core stack choices or pinned framework/tooling versions;
- auth, database, ORM, realtime, chess rules, chessboard, or engine dependencies;
- service boundaries such as `GameService`, `EngineService`, realtime transport, or analysis;
- data ownership rules, API contract shape, or server/client responsibility boundaries;
- deployment/runtime assumptions that affect how the app is built or hosted.

Do not duplicate feature checklists in the architecture plan. If only execution order changes, update the relevant file under `docs/features/` and, when needed, `docs/backlog.md`.
