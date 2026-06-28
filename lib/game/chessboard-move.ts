import { Chess } from "chess.js";

import type { PromotionPiece } from "./types";

export type OptimisticMove = {
  fen: string;
  promotion: PromotionPiece | null;
};

export function createOptimisticMove(
  fen: string,
  from: string,
  to: string,
): OptimisticMove | null {
  try {
    const chess = new Chess(fen);
    const sourcePiece = /^[a-h][1-8]$/.test(from)
      ? chess.get(from as Parameters<Chess["get"]>[0])
      : undefined;
    const promotion =
      sourcePiece?.type === "p" && (to.endsWith("1") || to.endsWith("8"))
        ? "q"
        : undefined;
    const move = chess.move({ from, to, promotion });

    return {
      fen: chess.fen(),
      promotion: toPromotionPiece(move.promotion),
    };
  } catch {
    return null;
  }
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
      return null;
  }
}
