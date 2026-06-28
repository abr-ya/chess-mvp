import { DEFAULT_POSITION, validateFen } from "chess.js";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

export type PositionFile = (typeof files)[number];
export type PositionRank = (typeof ranks)[number];
export type PositionSquare = `${PositionFile}${PositionRank}`;
export type PositionColor = "white" | "black";
export type PositionPieceType =
  | "pawn"
  | "knight"
  | "bishop"
  | "rook"
  | "queen"
  | "king";

export type PositionPiece = {
  color: PositionColor;
  type: PositionPieceType;
};

export type CastlingRights = {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
};

export type EditablePosition = {
  pieces: Partial<Record<PositionSquare, PositionPiece>>;
  sideToMove: PositionColor;
  castlingRights: CastlingRights;
  enPassantTarget: PositionSquare | null;
  halfmoveClock: number;
  fullmoveNumber: number;
};

export type PositionValidationErrorCode =
  | "INVALID_FEN"
  | "INVALID_COUNTER"
  | "KING_COUNT"
  | "PAWN_COUNT"
  | "PAWN_ON_EDGE"
  | "INVALID_CASTLING_RIGHT"
  | "INVALID_EN_PASSANT";

export type PositionValidationError = {
  code: PositionValidationErrorCode;
  message: string;
};

export type PositionValidationResult =
  | { ok: true }
  | { ok: false; errors: PositionValidationError[] };

export type FenParseResult =
  | { ok: true; position: EditablePosition }
  | { ok: false; errors: PositionValidationError[] };

export function createEmptyPosition(): EditablePosition {
  return {
    pieces: {},
    sideToMove: "white",
    castlingRights: noCastlingRights(),
    enPassantTarget: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
  };
}

export function createInitialPosition(): EditablePosition {
  const result = parseFen(DEFAULT_POSITION);

  if (!result.ok) {
    throw new Error("The built-in initial chess position is invalid.");
  }

  return result.position;
}

export function parseFen(fen: string): FenParseResult {
  const normalizedFen = fen.trim();
  const libraryValidation = validateFen(normalizedFen);

  if (!libraryValidation.ok) {
    return invalid("INVALID_FEN", libraryValidation.error ?? "Invalid FEN.");
  }

  const [placement, activeColor, castling, enPassant, halfmove, fullmove] =
    normalizedFen.split(/\s+/);

  if (!/^\d+$/.test(halfmove) || !/^\d+$/.test(fullmove)) {
    return invalid("INVALID_COUNTER", "FEN move counters must be integers.");
  }

  const position: EditablePosition = {
    pieces: parsePlacement(placement),
    sideToMove: activeColor === "w" ? "white" : "black",
    castlingRights: {
      whiteKingSide: castling.includes("K"),
      whiteQueenSide: castling.includes("Q"),
      blackKingSide: castling.includes("k"),
      blackQueenSide: castling.includes("q"),
    },
    enPassantTarget:
      enPassant === "-" ? null : (enPassant as PositionSquare),
    halfmoveClock: Number(halfmove),
    fullmoveNumber: Number(fullmove),
  };
  const validation = validateEditablePosition(position);

  return validation.ok ? { ok: true, position } : validation;
}

export function toFen(position: EditablePosition): string {
  const placement = [...ranks]
    .reverse()
    .map((rank) => serializeRank(position, rank))
    .join("/");
  const activeColor = position.sideToMove === "white" ? "w" : "b";
  const castling = serializeCastlingRights(position.castlingRights);

  return [
    placement,
    activeColor,
    castling,
    position.enPassantTarget ?? "-",
    position.halfmoveClock,
    position.fullmoveNumber,
  ].join(" ");
}

export function validateEditablePosition(
  position: EditablePosition,
): PositionValidationResult {
  const errors: PositionValidationError[] = [];
  const pieces = Object.entries(position.pieces) as Array<
    [PositionSquare, PositionPiece]
  >;

  for (const color of ["white", "black"] as const) {
    const kings = pieces.filter(
      ([, piece]) => piece.color === color && piece.type === "king",
    ).length;
    const pawns = pieces.filter(
      ([, piece]) => piece.color === color && piece.type === "pawn",
    ).length;

    if (kings !== 1) {
      errors.push({
        code: "KING_COUNT",
        message: `The position must contain exactly one ${color} king.`,
      });
    }

    if (pawns > 8) {
      errors.push({
        code: "PAWN_COUNT",
        message: `The position cannot contain more than eight ${color} pawns.`,
      });
    }
  }

  for (const [square, piece] of pieces) {
    if (
      piece.type === "pawn" &&
      (square.endsWith("1") || square.endsWith("8"))
    ) {
      errors.push({
        code: "PAWN_ON_EDGE",
        message: `A pawn cannot be placed on ${square}.`,
      });
    }
  }

  validateCastlingRights(position, errors);
  validateEnPassant(position, errors);

  if (
    !Number.isInteger(position.halfmoveClock) ||
    position.halfmoveClock < 0 ||
    !Number.isInteger(position.fullmoveNumber) ||
    position.fullmoveNumber < 1
  ) {
    errors.push({
      code: "INVALID_COUNTER",
      message:
        "The halfmove clock must be non-negative and the fullmove number must be positive.",
    });
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}

function parsePlacement(placement: string) {
  const pieces: EditablePosition["pieces"] = {};

  placement.split("/").forEach((row, rowIndex) => {
    let fileIndex = 0;

    for (const token of row) {
      if (/\d/.test(token)) {
        fileIndex += Number(token);
        continue;
      }

      const square = `${files[fileIndex]}${8 - rowIndex}` as PositionSquare;
      pieces[square] = fenTokenToPiece(token);
      fileIndex += 1;
    }
  });

  return pieces;
}

function serializeRank(position: EditablePosition, rank: PositionRank) {
  let emptySquares = 0;
  let result = "";

  for (const file of files) {
    const piece = position.pieces[`${file}${rank}`];

    if (!piece) {
      emptySquares += 1;
      continue;
    }

    if (emptySquares) {
      result += emptySquares;
      emptySquares = 0;
    }

    result += pieceToFenToken(piece);
  }

  return result + (emptySquares || "");
}

function fenTokenToPiece(token: string): PositionPiece {
  const pieceTypes: Record<string, PositionPieceType> = {
    p: "pawn",
    n: "knight",
    b: "bishop",
    r: "rook",
    q: "queen",
    k: "king",
  };

  return {
    color: token === token.toUpperCase() ? "white" : "black",
    type: pieceTypes[token.toLowerCase()],
  };
}

function pieceToFenToken(piece: PositionPiece) {
  const tokens: Record<PositionPieceType, string> = {
    pawn: "p",
    knight: "n",
    bishop: "b",
    rook: "r",
    queen: "q",
    king: "k",
  };
  const token = tokens[piece.type];

  return piece.color === "white" ? token.toUpperCase() : token;
}

function validateCastlingRights(
  position: EditablePosition,
  errors: PositionValidationError[],
) {
  const requirements: Array<
    [keyof CastlingRights, PositionSquare, PositionSquare, string]
  > = [
    ["whiteKingSide", "e1", "h1", "white kingside"],
    ["whiteQueenSide", "e1", "a1", "white queenside"],
    ["blackKingSide", "e8", "h8", "black kingside"],
    ["blackQueenSide", "e8", "a8", "black queenside"],
  ];

  for (const [right, kingSquare, rookSquare, label] of requirements) {
    if (!position.castlingRights[right]) {
      continue;
    }

    const color = right.startsWith("white") ? "white" : "black";
    const king = position.pieces[kingSquare];
    const rook = position.pieces[rookSquare];

    if (
      king?.color !== color ||
      king.type !== "king" ||
      rook?.color !== color ||
      rook.type !== "rook"
    ) {
      errors.push({
        code: "INVALID_CASTLING_RIGHT",
        message: `${label} castling requires the king on ${kingSquare} and rook on ${rookSquare}.`,
      });
    }
  }
}

function validateEnPassant(
  position: EditablePosition,
  errors: PositionValidationError[],
) {
  const target = position.enPassantTarget;

  if (!target) {
    return;
  }

  const expectedRank = position.sideToMove === "white" ? "6" : "3";

  if (!target.endsWith(expectedRank) || position.pieces[target]) {
    errors.push({
      code: "INVALID_EN_PASSANT",
      message: `The en passant target must be an empty square on rank ${expectedRank}.`,
    });
  }
}

function serializeCastlingRights(rights: CastlingRights) {
  const value = [
    rights.whiteKingSide ? "K" : "",
    rights.whiteQueenSide ? "Q" : "",
    rights.blackKingSide ? "k" : "",
    rights.blackQueenSide ? "q" : "",
  ].join("");

  return value || "-";
}

function noCastlingRights(): CastlingRights {
  return {
    whiteKingSide: false,
    whiteQueenSide: false,
    blackKingSide: false,
    blackQueenSide: false,
  };
}

function invalid(
  code: PositionValidationErrorCode,
  message: string,
): FenParseResult {
  return { ok: false, errors: [{ code, message }] };
}
