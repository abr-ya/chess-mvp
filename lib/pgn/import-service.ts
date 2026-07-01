import { Chess } from "chess.js";

import type { GameResult, GameSnapshot, TerminationReason } from "@/lib/game/types";

import { previewPgnImport } from "./import-preview";
import type { ParsedPgn } from "./pgn";

export type PersistImportedGameInput = {
  ownerUserId: string;
  idempotencyKey: string;
  parsed: ParsedPgn;
  status: "active" | "completed";
  result: GameResult;
  terminationReason: TerminationReason;
  completedAt: Date | null;
};

export interface PgnImportRepository {
  persistImportedGame(input: PersistImportedGameInput): Promise<GameSnapshot>;
}

export type PgnImportServiceErrorCode = "INVALID_PGN" | "PGN_TOO_LARGE";

export class PgnImportServiceError extends Error {
  constructor(
    public readonly code: PgnImportServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PgnImportServiceError";
  }
}

export class PgnImportService {
  constructor(private readonly repository: PgnImportRepository) {}

  async importGame(
    ownerUserId: string,
    idempotencyKey: string,
    source: string,
  ): Promise<GameSnapshot> {
    const preview = previewPgnImport(source);

    if (!preview.ok) {
      throw new PgnImportServiceError(
        preview.code === "TOO_LARGE" ? "PGN_TOO_LARGE" : "INVALID_PGN",
        preview.message,
      );
    }

    const result = toGameResult(preview.parsed.tags.Result);
    const status = result ? "completed" : "active";

    return this.repository.persistImportedGame({
      ownerUserId,
      idempotencyKey,
      parsed: preview.parsed,
      status,
      result,
      terminationReason: inferTerminationReason(preview.parsed.finalFen),
      completedAt: status === "completed" ? new Date() : null,
    });
  }
}

function toGameResult(result: string): GameResult {
  switch (result) {
    case "1-0":
      return "white_win";
    case "0-1":
      return "black_win";
    case "1/2-1/2":
      return "draw";
    case "*":
      return null;
    default:
      throw new PgnImportServiceError(
        "INVALID_PGN",
        `Invalid PGN result: ${result}.`,
      );
  }
}

function inferTerminationReason(finalFen: string): TerminationReason {
  const chess = new Chess(finalFen);

  if (chess.isCheckmate()) {
    return "checkmate";
  }

  if (chess.isStalemate()) {
    return "stalemate";
  }

  if (chess.isInsufficientMaterial()) {
    return "insufficient_material";
  }

  return null;
}
