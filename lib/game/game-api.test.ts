import { describe, expect, it, vi } from "vitest";

import type { EnsureLocalUserResult } from "@/lib/auth/local-user";
import { GameMode } from "@/lib/generated/prisma/enums";

import { GameApi } from "./game-api";
import { GameServiceError } from "./game-service";
import type { GameSnapshot } from "./types";

describe("GameApi", () => {
  it("requires authentication before creating a game", async () => {
    const { api, gameService } = createApi({ localUser: null });

    const result = await api.createBasicGame();

    expect(result).toEqual({
      ok: false,
      status: 401,
      error: { code: "UNAUTHENTICATED", message: "Sign in to continue." },
    });
    expect(gameService.createGame).not.toHaveBeenCalled();
  });

  it("creates a manual game for the current internal user", async () => {
    const { api, gameService } = createApi();

    const result = await api.createBasicGame();

    expect(result).toEqual({ ok: true, game: ownedGame });
    expect(gameService.createGame).toHaveBeenCalledWith({
      ownerUserId: "user-1",
      mode: "manual",
      whiteUserId: "user-1",
      whiteDisplayName: "Player One",
    });
  });

  it("does not return a game to a non-participant", async () => {
    const { api } = createApi({
      game: {
        ...ownedGame,
        ownerUserId: "another-user",
        participants: [
          { ...ownedGame.participants[0], userId: "another-user" },
          ownedGame.participants[1],
        ],
      },
    });

    const result = await api.getGame("game-1");

    expect(result).toEqual({
      ok: false,
      status: 403,
      error: {
        code: "FORBIDDEN",
        message: "You do not have access to this game.",
      },
    });
  });

  it("returns an imported game to its owner without linking them to a player", async () => {
    const { api } = createApi({
      game: {
        ...ownedGame,
        participants: ownedGame.participants.map((participant) => ({
          ...participant,
          userId: null,
        })),
      },
    });

    expect(await api.getGame("game-1")).toEqual({
      ok: true,
      game: expect.objectContaining({ ownerUserId: "user-1" }),
    });
  });

  it("validates and submits a move for a participant", async () => {
    const { api, gameService } = createApi();

    const result = await api.submitMove("game-1", {
      idempotencyKey: "client-move-1",
      from: "e2",
      to: "e4",
    });

    expect(result).toEqual({ ok: true, game: ownedGame });
    expect(gameService.submitMove).toHaveBeenCalledWith(
      {
        gameId: "game-1",
        idempotencyKey: "client-move-1",
        from: "e2",
        to: "e4",
      },
      "clerk-user-1",
    );
  });

  it("returns a UI-friendly validation error for malformed moves", async () => {
    const { api, gameService } = createApi();

    const result = await api.submitMove("game-1", {
      from: "not-a-square",
      to: "e4",
    });

    expect(result).toMatchObject({
      ok: false,
      status: 400,
      error: { code: "INVALID_REQUEST" },
    });
    expect(gameService.submitMove).not.toHaveBeenCalled();
  });

  it("maps expected game errors without leaking implementation details", async () => {
    const { api, gameService } = createApi();
    gameService.getGameSnapshot.mockRejectedValueOnce(
      new GameServiceError("GAME_NOT_FOUND", "Game not found."),
    );

    const result = await api.getGame("missing-game");

    expect(result).toEqual({
      ok: false,
      status: 404,
      error: { code: "GAME_NOT_FOUND", message: "Game not found." },
    });
  });
});

function createApi(
  options: {
    localUser?: EnsureLocalUserResult | null;
    game?: GameSnapshot;
  } = {},
) {
  const game = options.game ?? ownedGame;
  const gameService = {
    createGame: vi.fn().mockResolvedValue(game),
    getGameSnapshot: vi.fn().mockResolvedValue(game),
    submitMove: vi.fn().mockResolvedValue(game),
  };
  const localUser =
    options.localUser === undefined ? currentLocalUser : options.localUser;
  const api = new GameApi({
    ensureCurrentLocalUser: vi.fn().mockResolvedValue(localUser),
    getCurrentProviderUserId: vi.fn().mockResolvedValue("clerk-user-1"),
    gameService,
  });

  return { api, gameService };
}

const currentLocalUser: EnsureLocalUserResult = {
  user: {
    id: "user-1",
    email: "player@example.com",
    displayName: "Player One",
    avatarUrl: null,
    lastSeenAt: new Date("2026-06-27T00:00:00.000Z"),
  },
  rating: {
    id: "rating-1",
    userId: "user-1",
    mode: GameMode.MANUAL,
    value: 1200,
  },
};

const ownedGame: GameSnapshot = {
  id: "game-1",
  ownerUserId: "user-1",
  mode: "manual",
  status: "active",
  result: null,
  terminationReason: null,
  currentFen: "initial-fen",
  sideToMove: "white",
  participants: [
    {
      id: "participant-white",
      userId: "user-1",
      side: "white",
      isComputer: false,
      displayName: "Player One",
      ratingBefore: null,
      ratingAfter: null,
      result: null,
    },
    {
      id: "participant-black",
      userId: null,
      side: "black",
      isComputer: false,
      displayName: null,
      ratingBefore: null,
      ratingAfter: null,
      result: null,
    },
  ],
  moves: [],
  pgn: null,
  createdAt: new Date("2026-06-27T00:00:00.000Z"),
  updatedAt: new Date("2026-06-27T00:00:00.000Z"),
  completedAt: null,
};
