import {
  AuthProvider,
  GameMode,
  GameResult,
  GameStatus,
  ParticipantSide,
  TerminationReason,
} from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/persistence/prisma";
import type { PerformanceTrace } from "@/lib/observability/request-performance";

import {
  type AppendStoredMoveInput,
  type CreateStoredGameInput,
  GamePersistenceConflictError,
  type GameRepository,
} from "./game-service";
import { mapGameSnapshotRecord } from "./mappers";
import type { GameSnapshot } from "./types";

const gameSnapshotInclude = {
  participants: true,
  moves: true,
} as const;

export class PrismaGameRepository implements GameRepository {
  constructor(private readonly trace?: PerformanceTrace) {}

  async createGame(input: CreateStoredGameInput): Promise<GameSnapshot> {
    const record = await this.database("game.create", () => prisma.game.create({
      data: {
        ownerUserId: input.ownerUserId,
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
    }));

    return mapGameSnapshotRecord(record);
  }

  async getGame(gameId: string): Promise<GameSnapshot | null> {
    const record = await this.database("game.findUnique", () => prisma.game.findUnique({
      where: { id: gameId },
      include: gameSnapshotInclude,
    }));

    return record ? mapGameSnapshotRecord(record) : null;
  }

  async getGameForMove(
    gameId: string,
    idempotencyKey: string,
    providerUserId?: string,
  ) {
    const record = await this.database("game.findUnique.forMove", () =>
      prisma.game.findUnique({
        where: { id: gameId },
        include: {
          moves: true,
          participants: {
            include: {
              user: {
                select: {
                  authIdentities: {
                    where: {
                      provider: AuthProvider.CLERK,
                      providerUserId: providerUserId ?? "",
                    },
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      }),
    );

    return record
      ? {
          game: mapGameSnapshotRecord(record),
          isDuplicate: record.moves.some(
            (move) => move.idempotencyKey === idempotencyKey,
          ),
          isAuthorized:
            !providerUserId ||
            record.participants.some(
              (participant) =>
                participant.user?.authIdentities.length === 1,
            ),
        }
      : null;
  }

  async appendMove(input: AppendStoredMoveInput) {
    return this.database("transaction", () => prisma.$transaction(async (tx) => {
      const gameUpdate = await this.database("game.updateMany", () => tx.game.updateMany({
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
          updatedAt: input.persistedAt,
        },
      }));

      if (gameUpdate.count !== 1) {
        throw new GamePersistenceConflictError();
      }

      const move = await this.database("move.create", () => tx.move.create({
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
      }));

      if (input.status === "completed") {
        await this.database("gameParticipant.updateMany", () => tx.gameParticipant.updateMany({
          where: { gameId: input.gameId },
          data: { result: toGameResult(input.result) },
        }));
      }

      return { id: move.id, createdAt: move.createdAt };
    }));
  }

  private database<T>(operation: string, query: () => Promise<T>) {
    return this.trace ? this.trace.database(operation, query) : query();
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
