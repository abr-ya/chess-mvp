import {
  GameMode as PrismaGameMode,
  GameResult as PrismaGameResult,
  GameStatus as PrismaGameStatus,
  ParticipantSide as PrismaParticipantSide,
  TerminationReason as PrismaTerminationReason,
  type GameMode as PrismaGameModeValue,
  type GameResult as PrismaGameResultValue,
  type GameStatus as PrismaGameStatusValue,
  type ParticipantSide as PrismaParticipantSideValue,
  type TerminationReason as PrismaTerminationReasonValue,
} from "@/lib/generated/prisma/enums";

import type {
  GameMode,
  GameMove,
  GameParticipant,
  GameResult,
  GameSide,
  GameSnapshot,
  GameStatus,
  PromotionPiece,
  TerminationReason,
} from "./types";

export type GameParticipantRecord = {
  id: string;
  userId: string | null;
  side: PrismaParticipantSideValue;
  isComputer: boolean;
  displayName: string | null;
  ratingBefore: number | null;
  ratingAfter: number | null;
  result: PrismaGameResultValue | null;
};

export type GameMoveRecord = {
  id: string;
  participantId: string | null;
  moveNumber: number;
  side: PrismaParticipantSideValue;
  from: string;
  to: string;
  promotion: string | null;
  uci: string;
  san: string;
  fenAfter: string;
  clockMsAfter: number | null;
  createdAt: Date;
};

export type GameSnapshotRecord = {
  id: string;
  mode: PrismaGameModeValue;
  status: PrismaGameStatusValue;
  currentFen: string;
  result: PrismaGameResultValue | null;
  terminationReason: PrismaTerminationReasonValue | null;
  pgn: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  participants: GameParticipantRecord[];
  moves: GameMoveRecord[];
};

export function mapGameSnapshotRecord(
  record: GameSnapshotRecord,
): GameSnapshot {
  return {
    id: record.id,
    mode: mapGameMode(record.mode),
    status: mapGameStatus(record.status),
    result: mapGameResult(record.result),
    terminationReason: mapTerminationReason(record.terminationReason),
    currentFen: record.currentFen,
    sideToMove: getSideToMove(record.currentFen),
    participants: record.participants
      .map(mapGameParticipantRecord)
      .sort((left, right) => compareSides(left.side, right.side)),
    moves: record.moves
      .map(mapGameMoveRecord)
      .sort((left, right) => left.moveNumber - right.moveNumber),
    pgn: record.pgn,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    completedAt: record.completedAt,
  };
}

export function getSideToMove(fen: string): GameSide {
  const activeColor = fen.trim().split(/\s+/)[1];

  if (activeColor === "b") {
    return "black";
  }

  return "white";
}

function mapGameParticipantRecord(
  record: GameParticipantRecord,
): GameParticipant {
  return {
    id: record.id,
    userId: record.userId,
    side: mapParticipantSide(record.side),
    isComputer: record.isComputer,
    displayName: record.displayName,
    ratingBefore: record.ratingBefore,
    ratingAfter: record.ratingAfter,
    result: mapGameResult(record.result),
  };
}

function mapGameMoveRecord(record: GameMoveRecord): GameMove {
  return {
    id: record.id,
    participantId: record.participantId,
    moveNumber: record.moveNumber,
    side: mapParticipantSide(record.side),
    from: record.from,
    to: record.to,
    promotion: mapPromotion(record.promotion),
    uci: record.uci,
    san: record.san,
    fenAfter: record.fenAfter,
    clockMsAfter: record.clockMsAfter,
    createdAt: record.createdAt,
  };
}

function mapGameMode(mode: PrismaGameModeValue): GameMode {
  switch (mode) {
    case PrismaGameMode.MANUAL:
      return "manual";
    case PrismaGameMode.COMPUTER:
      return "computer";
    case PrismaGameMode.ONLINE:
      return "online";
  }
}

function mapGameStatus(status: PrismaGameStatusValue): GameStatus {
  switch (status) {
    case PrismaGameStatus.WAITING:
      return "waiting";
    case PrismaGameStatus.ACTIVE:
      return "active";
    case PrismaGameStatus.COMPLETED:
      return "completed";
    case PrismaGameStatus.ABORTED:
      return "aborted";
  }
}

function mapParticipantSide(side: PrismaParticipantSideValue): GameSide {
  switch (side) {
    case PrismaParticipantSide.WHITE:
      return "white";
    case PrismaParticipantSide.BLACK:
      return "black";
  }
}

function mapGameResult(result: PrismaGameResultValue | null): GameResult {
  switch (result) {
    case null:
      return null;
    case PrismaGameResult.WHITE_WIN:
      return "white_win";
    case PrismaGameResult.BLACK_WIN:
      return "black_win";
    case PrismaGameResult.DRAW:
      return "draw";
    case PrismaGameResult.ABORTED:
      return "aborted";
  }
}

function mapTerminationReason(
  reason: PrismaTerminationReasonValue | null,
): TerminationReason {
  switch (reason) {
    case null:
      return null;
    case PrismaTerminationReason.CHECKMATE:
      return "checkmate";
    case PrismaTerminationReason.STALEMATE:
      return "stalemate";
    case PrismaTerminationReason.INSUFFICIENT_MATERIAL:
      return "insufficient_material";
    case PrismaTerminationReason.RESIGNATION:
      return "resignation";
    case PrismaTerminationReason.TIMEOUT:
      return "timeout";
    case PrismaTerminationReason.ABORTED:
      return "aborted";
  }
}

function mapPromotion(promotion: string | null): PromotionPiece | null {
  switch (promotion) {
    case null:
      return null;
    case "q":
    case "r":
    case "b":
    case "n":
      return promotion;
    default:
      throw new Error(`Unsupported promotion piece: ${promotion}.`);
  }
}

function compareSides(left: GameSide, right: GameSide) {
  const order: Record<GameSide, number> = {
    white: 0,
    black: 1,
  };

  return order[left] - order[right];
}
