import { describe, expect, it, vi } from "vitest";

import type { EnsureLocalUserResult } from "@/lib/auth/local-user";
import { GameMode } from "@/lib/generated/prisma/enums";
import type { GameSnapshot } from "@/lib/game/types";

import { PgnImportApi } from "./import-api";
import { PgnImportServiceError } from "./import-service";

describe("PgnImportApi", () => {
  it("requires authentication", async () => {
    const { api, importService } = createApi(null);

    expect(await api.importGame({ pgn: "game" })).toMatchObject({
      ok: false,
      status: 401,
      error: { code: "UNAUTHENTICATED" },
    });
    expect(importService.importGame).not.toHaveBeenCalled();
  });

  it("requires a string PGN body", async () => {
    const { api, importService } = createApi();

    expect(await api.importGame({ pgn: 42 })).toMatchObject({
      ok: false,
      status: 400,
      error: { code: "INVALID_REQUEST" },
    });
    expect(importService.importGame).not.toHaveBeenCalled();
  });

  it("requires an idempotency key", async () => {
    const { api, importService } = createApi();

    expect(await api.importGame({ pgn: "valid pgn" })).toMatchObject({
      ok: false,
      status: 400,
      error: { code: "INVALID_REQUEST" },
    });
    expect(importService.importGame).not.toHaveBeenCalled();
  });

  it("imports for the current local user", async () => {
    const { api, importService } = createApi();

    expect(
      await api.importGame({ pgn: "valid pgn", idempotencyKey: "import-1" }),
    ).toEqual({
      ok: true,
      game: importedGame,
    });
    expect(importService.importGame).toHaveBeenCalledWith(
      "user-1",
      "import-1",
      "valid pgn",
    );
  });

  it("returns parser errors without leaking persistence details", async () => {
    const { api, importService } = createApi();
    importService.importGame.mockRejectedValueOnce(
      new PgnImportServiceError("INVALID_PGN", "Required tag Event is missing."),
    );

    expect(
      await api.importGame({ pgn: "bad", idempotencyKey: "import-1" }),
    ).toEqual({
      ok: false,
      status: 422,
      error: {
        code: "INVALID_PGN",
        message: "Required tag Event is missing.",
      },
    });
  });
});

function createApi(localUser: EnsureLocalUserResult | null = currentLocalUser) {
  const importService = {
    importGame: vi.fn().mockResolvedValue(importedGame),
  };
  const api = new PgnImportApi({
    ensureCurrentLocalUser: vi.fn().mockResolvedValue(localUser),
    importService,
  });

  return { api, importService };
}

const currentLocalUser: EnsureLocalUserResult = {
  user: {
    id: "user-1",
    email: "player@example.com",
    displayName: "Player One",
    avatarUrl: null,
    lastSeenAt: new Date("2026-07-01T00:00:00.000Z"),
  },
  rating: {
    id: "rating-1",
    userId: "user-1",
    mode: GameMode.MANUAL,
    value: 1200,
  },
};

const importedGame = { id: "game-imported" } as GameSnapshot;
