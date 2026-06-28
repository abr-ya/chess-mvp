import {
  GameMode,
  GameResult,
  GameStatus,
  ParticipantSide,
  TerminationReason,
} from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/persistence/prisma";

import {
  type AppendStoredMoveInput,
  type CreateStoredGameInput,
  type GameRepository,
} from "./game-service";
import { mapGameSnapshotRecord } from "./mappers";
import type { GameSnapshot } from "./types";

const gameSnapshotInclude = {
  participants: true,
  moves: true,
} as const;

export class PrismaGameRepository implements GameRepository {
  async createGame(input: CreateStoredGameInput): Promise<GameSnapshot> {
    const record = await prisma.game.create({
      data: {
        mode: GameMode.MANUAL,
        status: GameStatus.ACTIVE,
        currentFen: input.initialFen,
        participants: {
          create: [
            {
              side: ParticipantSide.WHITE,
              displayName: input.whiteDisplayName,
              user: {
                connect: { id: input.whiteUserId },
              },
            },
            {
              side: ParticipantSide.BLACK,
              displayName: input.blackDisplayName,
              ...(input.blackUserId
                ? { user: { connect: { id: input.blackUserId } } }
                : {}),
            },
          ],
        },
      },
      include: gameSnapshotInclude,
    });

    return mapGameSnapshotRecord(record);
  }

  async getGame(gameId: string): Promise<GameSnapshot | null> {
    const record = await prisma.game.findUnique({
      where: { id: gameId },
      include: gameSnapshotInclude,
    });

    return record ? mapGameSnapshotRecord(record) : null;
  }

  async getGameByMoveKey(
    gameId: string,
    idempotencyKey: string,
  ): Promise<GameSnapshot | null> {
    const move = await prisma.move.findUnique({
      where: {
        gameId_idempotencyKey: {
          gameId,
          idempotencyKey,
        },
      },
      select: { gameId: true },
    });

    return move ? this.getGame(move.gameId) : null;
  }

  async appendMove(input: AppendStoredMoveInput): Promise<GameSnapshot> {
    return prisma.$transaction(async (tx) => {
      const gameUpdate = await tx.game.updateMany({
        where: {
          id: input.gameId,
          currentFen: input.expectedFen,
          status: GameStatus.ACTIVE,
        },
        data: {
          currentFen: input.fenAfter,
          status: toGameStatus(input.status),
          result: toGameResult(input.result),
          terminationReason: toTerminationReason(input.terminationReason),
          completedAt: input.completedAt,
        },
      });

      if (gameUpdate.count !== 1) {
        throw new Error(
          "The game changed before the move could be persisted. Reload and try again.",
        );
      }

      await tx.move.create({
        data: {
          gameId: input.gameId,
          participantId: input.participantId,
          idempotencyKey: input.idempotencyKey,
          moveNumber: input.moveNumber,
          side: toParticipantSide(input.side),
          from: input.from,
          to: input.to,
          promotion: input.promotion,
          uci: input.uci,
          san: input.san,
          fenAfter: input.fenAfter,
        },
      });

      if (input.status === "completed") {
        await tx.gameParticipant.updateMany({
          where: { gameId: input.gameId },
          data: { result: toGameResult(input.result) },
        });
      }

      const record = await tx.game.findUniqueOrThrow({
        where: { id: input.gameId },
        include: gameSnapshotInclude,
      });

      return mapGameSnapshotRecord(record);
    });
  }
}

function toParticipantSide(side: AppendStoredMoveInput["side"]) {
  return side === "white" ? ParticipantSide.WHITE : ParticipantSide.BLACK;
}

function toGameStatus(status: AppendStoredMoveInput["status"]) {
  return status === "completed" ? GameStatus.COMPLETED : GameStatus.ACTIVE;
}

function toGameResult(result: AppendStoredMoveInput["result"]) {
  switch (result) {
    case null:
      return null;
    case "white_win":
      return GameResult.WHITE_WIN;
    case "black_win":
      return GameResult.BLACK_WIN;
    case "draw":
      return GameResult.DRAW;
    case "aborted":
      return GameResult.ABORTED;
  }
}

function toTerminationReason(
  reason: AppendStoredMoveInput["terminationReason"],
) {
  switch (reason) {
    case null:
      return null;
    case "checkmate":
      return TerminationReason.CHECKMATE;
    case "stalemate":
      return TerminationReason.STALEMATE;
    case "insufficient_material":
      return TerminationReason.INSUFFICIENT_MATERIAL;
    case "resignation":
      return TerminationReason.RESIGNATION;
    case "timeout":
      return TerminationReason.TIMEOUT;
    case "aborted":
      return TerminationReason.ABORTED;
  }
}
