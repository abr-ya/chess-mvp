import { Chess, DEFAULT_POSITION, type Color, type Square } from "chess.js";

import type {
  CreateGameInput,
  GameResult,
  GameSide,
  GameSnapshot,
  MoveCommand,
  PromotionPiece,
  TerminationReason,
} from "./types";

export type CreateStoredGameInput = CreateGameInput & {
  initialFen: string;
};

export type AppendStoredMoveInput = {
  gameId: string;
  expectedFen: string;
  idempotencyKey: string;
  participantId: string;
  moveNumber: number;
  side: GameSide;
  from: string;
  to: string;
  promotion: PromotionPiece | null;
  uci: string;
  san: string;
  fenAfter: string;
  status: "active" | "completed";
  result: GameResult;
  terminationReason: TerminationReason;
  completedAt: Date | null;
};

export interface GameRepository {
  createGame(input: CreateStoredGameInput): Promise<GameSnapshot>;
  getGame(gameId: string): Promise<GameSnapshot | null>;
  getGameByMoveKey(
    gameId: string,
    idempotencyKey: string,
  ): Promise<GameSnapshot | null>;
  appendMove(input: AppendStoredMoveInput): Promise<GameSnapshot>;
}

export type GameServiceErrorCode =
  | "GAME_NOT_FOUND"
  | "GAME_FINISHED"
  | "INVALID_MOVE"
  | "WRONG_SIDE"
  | "INVALID_GAME_INPUT";

export class GameServiceError extends Error {
  constructor(
    public readonly code: GameServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "GameServiceError";
  }
}

export class GameService {
  constructor(private readonly repository: GameRepository) {}

  async createGame(input: CreateGameInput): Promise<GameSnapshot> {
    if (
      input.ownerUserId !== input.whiteUserId &&
      input.ownerUserId !== input.blackUserId
    ) {
      throw new GameServiceError(
        "INVALID_GAME_INPUT",
        "The game owner must be one of the participants.",
      );
    }

    return this.repository.createGame({
      ...input,
      initialFen: DEFAULT_POSITION,
    });
  }

  async getGameSnapshot(gameId: string): Promise<GameSnapshot> {
    const snapshot = await this.repository.getGame(gameId);

    if (!snapshot) {
      throw new GameServiceError("GAME_NOT_FOUND", "Game not found.");
    }

    return snapshot;
  }

  async submitMove(command: MoveCommand): Promise<GameSnapshot> {
    const existingResult = await this.repository.getGameByMoveKey(
      command.gameId,
      command.idempotencyKey,
    );

    if (existingResult) {
      return existingResult;
    }

    const snapshot = await this.getGameSnapshot(command.gameId);

    if (snapshot.status === "completed" || snapshot.status === "aborted") {
      throw new GameServiceError(
        "GAME_FINISHED",
        "Moves cannot be submitted after a game has finished.",
      );
    }

    const chess = new Chess(snapshot.currentFen);
    const side = colorToSide(chess.turn());
    const participant = snapshot.participants.find(
      (candidate) => candidate.side === side,
    );

    if (!participant) {
      throw new GameServiceError(
        "INVALID_GAME_INPUT",
        `The game has no ${side} participant.`,
      );
    }

    const sourcePiece = isSquare(command.from)
      ? chess.get(command.from as Square)
      : undefined;

    if (sourcePiece && sourcePiece.color !== chess.turn()) {
      throw new GameServiceError(
        "WRONG_SIDE",
        `It is ${side}'s turn to move.`,
      );
    }

    let move: ReturnType<Chess["move"]>;

    try {
      move = chess.move({
        from: command.from,
        to: command.to,
        promotion: command.promotion,
      });
    } catch {
      throw new GameServiceError("INVALID_MOVE", "The move is not legal.");
    }

    const completion = getCompletion(chess, side);

    return this.repository.appendMove({
      gameId: command.gameId,
      expectedFen: snapshot.currentFen,
      idempotencyKey: command.idempotencyKey,
      participantId: participant.id,
      moveNumber: snapshot.moves.length + 1,
      side,
      from: move.from,
      to: move.to,
      promotion: toPromotionPiece(move.promotion),
      uci: `${move.from}${move.to}${move.promotion ?? ""}`,
      san: move.san,
      fenAfter: chess.fen(),
      ...completion,
    });
  }
}

type MoveCompletion = Pick<
  AppendStoredMoveInput,
  "status" | "result" | "terminationReason" | "completedAt"
>;

function getCompletion(chess: Chess, movingSide: GameSide): MoveCompletion {
  if (chess.isCheckmate()) {
    return {
      status: "completed" as const,
      result: movingSide === "white" ? "white_win" : "black_win",
      terminationReason: "checkmate" as const,
      completedAt: new Date(),
    };
  }

  if (chess.isStalemate()) {
    return drawnGame("stalemate");
  }

  if (chess.isInsufficientMaterial()) {
    return drawnGame("insufficient_material");
  }

  return {
    status: "active" as const,
    result: null,
    terminationReason: null,
    completedAt: null,
  };
}

function drawnGame(
  reason: Extract<
    TerminationReason,
    "stalemate" | "insufficient_material"
  >,
): MoveCompletion {
  return {
    status: "completed" as const,
    result: "draw" as const,
    terminationReason: reason,
    completedAt: new Date(),
  };
}

function colorToSide(color: Color): GameSide {
  return color === "w" ? "white" : "black";
}

function isSquare(value: string) {
  return /^[a-h][1-8]$/.test(value);
}

function toPromotionPiece(value: string | undefined): PromotionPiece | null {
  switch (value) {
    case undefined:
      return null;
    case "q":
    case "r":
    case "b":
    case "n":
      return value;
    default:
      throw new GameServiceError(
        "INVALID_MOVE",
        `Unsupported promotion piece: ${value}.`,
      );
  }
}
