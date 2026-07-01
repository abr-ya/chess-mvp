import {
  GameMode,
  GameResult,
  GameStatus,
  ParticipantSide,
  TerminationReason,
} from "@/lib/generated/prisma/enums";
import { mapGameSnapshotRecord } from "@/lib/game/mappers";
import { prisma } from "@/lib/persistence/prisma";

import type {
  PersistImportedGameInput,
  PgnImportRepository,
} from "./import-service";

const importedGameInclude = {
  participants: true,
  moves: true,
} as const;

export class PrismaPgnImportRepository implements PgnImportRepository {
  async persistImportedGame(input: PersistImportedGameInput) {
    try {
      const record = await prisma.game.create({
        data: {
          ownerUserId: input.ownerUserId,
          importIdempotencyKey: input.idempotencyKey,
          mode: GameMode.MANUAL,
          status: toGameStatus(input.status),
          currentFen: input.parsed.finalFen,
          result: toGameResult(input.result),
          terminationReason: toTerminationReason(input.terminationReason),
          pgn: input.parsed.normalizedPgn,
          completedAt: input.completedAt,
          participants: {
            create: [
              participant(
                ParticipantSide.WHITE,
                input.parsed.tags.White,
                input.result,
              ),
              participant(
                ParticipantSide.BLACK,
                input.parsed.tags.Black,
                input.result,
              ),
            ],
          },
          moves: {
            create: input.parsed.moves.map((move) => ({
              moveNumber: move.ply,
              side:
                move.side === "white"
                  ? ParticipantSide.WHITE
                  : ParticipantSide.BLACK,
              from: move.from,
              to: move.to,
              promotion: move.promotion,
              uci: move.uci,
              san: move.san,
              fenAfter: move.fenAfter,
            })),
          },
        },
        include: importedGameInclude,
      });

      return mapGameSnapshotRecord(record);
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }

      const existing = await prisma.game.findUnique({
        where: {
          ownerUserId_importIdempotencyKey: {
            ownerUserId: input.ownerUserId,
            importIdempotencyKey: input.idempotencyKey,
          },
        },
        include: importedGameInclude,
      });

      if (!existing) {
        throw error;
      }

      return mapGameSnapshotRecord(existing);
    }
  }
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function participant(
  side: ParticipantSide,
  displayName: string,
  result: PersistImportedGameInput["result"],
) {
  return {
    side,
    displayName,
    result: toGameResult(result),
  };
}

function toGameStatus(status: PersistImportedGameInput["status"]) {
  return status === "completed" ? GameStatus.COMPLETED : GameStatus.ACTIVE;
}

function toGameResult(result: PersistImportedGameInput["result"]) {
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
  reason: PersistImportedGameInput["terminationReason"],
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
