import { describe, expect, it, vi } from "vitest";

import type { GameSnapshot } from "@/lib/game/types";

import {
  PgnImportService,
  type PersistImportedGameInput,
  type PgnImportRepository,
} from "./import-service";

const VALID_PGN = `[Event "Imported Game"]
[Site "Chess MVP"]
[Date "2026.07.01"]
[Round "-"]
[White "Alice"]
[Black "Bob"]
[Result "1-0"]

1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0`;

describe("PgnImportService", () => {
  it("parses and atomically hands a complete imported game to the repository", async () => {
    const repository = new MemoryPgnImportRepository();
    const service = new PgnImportService(repository);

    await service.importGame("user-1", "import-1", VALID_PGN);

    expect(repository.persistImportedGame).toHaveBeenCalledOnce();
    expect(repository.persistImportedGame).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: "user-1",
        idempotencyKey: "import-1",
        status: "completed",
        result: "white_win",
        terminationReason: "checkmate",
        completedAt: expect.any(Date),
        parsed: expect.objectContaining({
          tags: expect.objectContaining({ White: "Alice", Black: "Bob" }),
          moves: expect.arrayContaining([
            expect.objectContaining({ ply: 1, san: "e4", uci: "e2e4" }),
            expect.objectContaining({ ply: 7, san: "Qxf7#", uci: "h5f7" }),
          ]),
        }),
      }),
    );
  });

  it("keeps an unfinished imported game active", async () => {
    const repository = new MemoryPgnImportRepository();
    const service = new PgnImportService(repository);

    await service.importGame(
      "user-1",
      "import-1",
      VALID_PGN.replaceAll("1-0", "*"),
    );

    expect(repository.persistImportedGame).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "active",
        result: null,
        completedAt: null,
      }),
    );
  });

  it("rejects invalid PGN without invoking persistence", async () => {
    const repository = new MemoryPgnImportRepository();
    const service = new PgnImportService(repository);

    await expect(
      service.importGame("user-1", "import-1", "not pgn"),
    ).rejects.toMatchObject({ code: "INVALID_PGN" });
    expect(repository.persistImportedGame).not.toHaveBeenCalled();
  });
});

class MemoryPgnImportRepository implements PgnImportRepository {
  persistImportedGame = vi
    .fn<(input: PersistImportedGameInput) => Promise<GameSnapshot>>()
    .mockResolvedValue(importedGame);
}

const importedGame = {
  id: "game-imported",
} as GameSnapshot;
