import { DEFAULT_POSITION } from "chess.js";
import { describe, expect, it } from "vitest";

import {
  GamePersistenceConflictError,
  GameService,
  type AppendStoredMoveInput,
  type CreateStoredGameInput,
  type GameRepository,
} from "./game-service";
import type { GameMove, GameSnapshot } from "./types";

describe("GameService", () => {
  it("creates an active manual game with two participants", async () => {
    const repository = new MemoryGameRepository();
    const service = new GameService(repository);

    const game = await service.createGame({
      ownerUserId: "user-1",
      mode: "manual",
      whiteUserId: "user-1",
      whiteDisplayName: "White",
    });

    expect(game.currentFen).toBe(DEFAULT_POSITION);
    expect(game.status).toBe("active");
    expect(game.participants).toEqual([
      expect.objectContaining({ side: "white", userId: "user-1" }),
      expect.objectContaining({ side: "black", userId: null }),
    ]);
  });

  it("persists a legal move with SAN, UCI, side, and resulting FEN", async () => {
    const { repository, service, gameId } = await createGame();

    const game = await service.submitMove({
      gameId,
      idempotencyKey: "move-1",
      from: "e2",
      to: "e4",
    });

    expect(game.currentFen).not.toBe(DEFAULT_POSITION);
    expect(game.sideToMove).toBe("black");
    expect(game.moves).toEqual([
      expect.objectContaining({
        moveNumber: 1,
        side: "white",
        from: "e2",
        to: "e4",
        uci: "e2e4",
        san: "e4",
        fenAfter: game.currentFen,
      }),
    ]);
    expect(repository.appendedMoves).toHaveLength(1);
  });

  it("returns the stored result when an idempotency key is repeated", async () => {
    const { repository, service, gameId } = await createGame();
    const command = {
      gameId,
      idempotencyKey: "move-1",
      from: "e2",
      to: "e4",
    };

    const firstResult = await service.submitMove(command);
    const repeatedResult = await service.submitMove(command);

    expect(repeatedResult).toEqual(firstResult);
    expect(repository.appendedMoves).toHaveLength(1);
  });

  it("rejects illegal moves without changing the stored game", async () => {
    const { repository, service, gameId } = await createGame();

    await expect(
      service.submitMove({
        gameId,
        idempotencyKey: "move-1",
        from: "e2",
        to: "e5",
      }),
    ).rejects.toMatchObject({ code: "INVALID_MOVE" });

    expect(repository.appendedMoves).toHaveLength(0);
  });

  it("rejects a move made with the side that is not to move", async () => {
    const { service, gameId } = await createGame();

    await expect(
      service.submitMove({
        gameId,
        idempotencyKey: "move-1",
        from: "e7",
        to: "e5",
      }),
    ).rejects.toMatchObject({ code: "WRONG_SIDE" });
  });

  it("rejects a move submitted by a non-participant", async () => {
    const { service, gameId } = await createGame();

    await expect(
      service.submitMove(
        {
          gameId,
          idempotencyKey: "move-1",
          from: "e2",
          to: "e4",
        },
        "another-user",
      ),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("does not expose a duplicate move snapshot to a non-participant", async () => {
    const { service, gameId } = await createGame();
    const command = {
      gameId,
      idempotencyKey: "move-1",
      from: "e2",
      to: "e4",
    };
    await service.submitMove(command, "user-1");

    await expect(
      service.submitMove(command, "another-user"),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns a conflict when another command changes the position first", async () => {
    const { repository, service, gameId } = await createGame();
    repository.conflictOnAppend = true;

    await expect(
      service.submitMove({
        gameId,
        idempotencyKey: "move-1",
        from: "e2",
        to: "e4",
      }),
    ).rejects.toMatchObject({ code: "GAME_CONFLICT" });
  });

  it("stores checkmate and rejects moves after completion", async () => {
    const { service, gameId } = await createGame();

    for (const [index, from, to] of [
      [1, "f2", "f3"],
      [2, "e7", "e5"],
      [3, "g2", "g4"],
      [4, "d8", "h4"],
    ] as const) {
      await service.submitMove({
        gameId,
        idempotencyKey: `move-${index}`,
        from,
        to,
      });
    }

    const completed = await service.getGameSnapshot(gameId);
    expect(completed.status).toBe("completed");
    expect(completed.result).toBe("black_win");
    expect(completed.terminationReason).toBe("checkmate");
    expect(completed.completedAt).toBeInstanceOf(Date);

    await expect(
      service.submitMove({
        gameId,
        idempotencyKey: "move-5",
        from: "e2",
        to: "e4",
      }),
    ).rejects.toMatchObject({ code: "GAME_FINISHED" });
  });

  it("detects a draw by insufficient material", async () => {
    const repository = new MemoryGameRepository(
      "4k3/8/8/8/8/4b3/4K3/8 w - - 0 1",
    );
    const service = new GameService(repository);
    const game = await service.createGame(defaultCreateInput);

    const completed = await service.submitMove({
      gameId: game.id,
      idempotencyKey: "move-1",
      from: "e2",
      to: "e3",
    });

    expect(completed.status).toBe("completed");
    expect(completed.result).toBe("draw");
    expect(completed.terminationReason).toBe("insufficient_material");
  });

  it("detects stalemate", async () => {
    const repository = new MemoryGameRepository(
      "7k/5K2/8/6Q1/8/8/8/8 w - - 0 1",
    );
    const service = new GameService(repository);
    const game = await service.createGame(defaultCreateInput);

    const completed = await service.submitMove({
      gameId: game.id,
      idempotencyKey: "move-1",
      from: "g5",
      to: "g6",
    });

    expect(completed.status).toBe("completed");
    expect(completed.result).toBe("draw");
    expect(completed.terminationReason).toBe("stalemate");
  });
});

const defaultCreateInput = {
  ownerUserId: "user-1",
  mode: "manual" as const,
  whiteUserId: "user-1",
};

async function createGame() {
  const repository = new MemoryGameRepository();
  const service = new GameService(repository);
  const game = await service.createGame(defaultCreateInput);

  return { repository, service, gameId: game.id };
}

class MemoryGameRepository implements GameRepository {
  private game: GameSnapshot | null = null;
  readonly appendedMoves: AppendStoredMoveInput[] = [];
  conflictOnAppend = false;

  constructor(private readonly replacementFen?: string) {}

  async createGame(input: CreateStoredGameInput): Promise<GameSnapshot> {
    const now = new Date("2026-06-27T00:00:00.000Z");
    this.game = {
      id: "game-1",
      mode: "manual",
      status: "active",
      result: null,
      terminationReason: null,
      currentFen: this.replacementFen ?? input.initialFen,
      sideToMove: "white",
      participants: [
        participant("white", input.whiteUserId, input.whiteDisplayName),
        participant("black", input.blackUserId, input.blackDisplayName),
      ],
      moves: [],
      pgn: null,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };

    return structuredClone(this.game);
  }

  async getGame(gameId: string): Promise<GameSnapshot | null> {
    return this.game?.id === gameId ? structuredClone(this.game) : null;
  }

  async getGameForMove(
    gameId: string,
    idempotencyKey: string,
    providerUserId?: string,
  ) {
    const exists = this.appendedMoves.some(
      (move) =>
        move.gameId === gameId && move.idempotencyKey === idempotencyKey,
    );

    const game = await this.getGame(gameId);

    return game
      ? {
          game,
          isDuplicate: exists,
          isAuthorized: providerUserId !== "another-user",
        }
      : null;
  }

  async appendMove(input: AppendStoredMoveInput) {
    if (this.conflictOnAppend) {
      throw new GamePersistenceConflictError();
    }

    if (!this.game || this.game.currentFen !== input.expectedFen) {
      throw new Error("Game state conflict.");
    }

    this.appendedMoves.push(input);
    const move: GameMove = {
      id: `stored-move-${input.moveNumber}`,
      participantId: input.participantId,
      moveNumber: input.moveNumber,
      side: input.side,
      from: input.from,
      to: input.to,
      promotion: input.promotion,
      uci: input.uci,
      san: input.san,
      fenAfter: input.fenAfter,
      clockMsAfter: null,
      createdAt: new Date(),
    };
    this.game = {
      ...this.game,
      currentFen: input.fenAfter,
      sideToMove: input.side === "white" ? "black" : "white",
      status: input.status,
      result: input.result,
      terminationReason: input.terminationReason,
      completedAt: input.completedAt,
      moves: [...this.game.moves, move],
      updatedAt: input.persistedAt,
    };

    return { id: move.id, createdAt: move.createdAt };
  }
}

function participant(
  side: "white" | "black",
  userId: string | null | undefined,
  displayName: string | null | undefined,
) {
  return {
    id: `participant-${side}`,
    userId: userId ?? null,
    side,
    isComputer: false,
    displayName: displayName ?? null,
    ratingBefore: null,
    ratingAfter: null,
    result: null,
  };
}
