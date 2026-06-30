import { Chess, DEFAULT_POSITION, type Move } from "chess.js";

export const PGN_REQUIRED_TAGS = [
  "Event",
  "Site",
  "Date",
  "Round",
  "White",
  "Black",
  "Result",
] as const;

export type PgnRequiredTag = (typeof PGN_REQUIRED_TAGS)[number];
export type PgnResult = "1-0" | "0-1" | "1/2-1/2" | "*";
export type PgnTags = Record<PgnRequiredTag, string> & Record<string, string>;

export type PgnMove = {
  ply: number;
  moveNumber: number;
  side: "white" | "black";
  from: string;
  to: string;
  promotion: "q" | "r" | "b" | "n" | null;
  uci: string;
  san: string;
  fenAfter: string;
};

export type PgnMoveInput = Pick<PgnMove, "from" | "to"> &
  Partial<Pick<PgnMove, "promotion" | "san" | "uci" | "fenAfter">>;

export type PgnGameInput = {
  tags: PgnTags;
  initialFen?: string;
  moves: PgnMoveInput[];
};

export type ParsedPgn = {
  tags: PgnTags;
  initialFen: string;
  moves: PgnMove[];
  finalFen: string;
  normalizedPgn: string;
};

export type PgnErrorCode =
  | "INVALID_PGN"
  | "MISSING_TAG"
  | "INVALID_TAG"
  | "INVALID_MOVE"
  | "MOVE_MISMATCH";

export class PgnError extends Error {
  constructor(
    public readonly code: PgnErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PgnError";
  }
}

export function generatePgn(input: PgnGameInput): string {
  validateTags(input.tags);

  let chess: Chess;
  try {
    chess = new Chess(input.initialFen ?? DEFAULT_POSITION);
  } catch (error) {
    throw new PgnError("INVALID_PGN", getErrorMessage(error));
  }

  setTags(chess, input.tags, input.initialFen ?? DEFAULT_POSITION);

  input.moves.forEach((expected, index) => {
    let move: Move;
    try {
      move = chess.move({
        from: expected.from,
        to: expected.to,
        promotion: expected.promotion ?? undefined,
      });
    } catch {
      throw new PgnError(
        "INVALID_MOVE",
        `Move ${index + 1} (${expected.from}${expected.to}) is not legal.`,
      );
    }

    assertMoveMatches(move, expected, index);
  });

  return chess.pgn({ newline: "\n", maxWidth: 80 });
}

export function parsePgn(source: string): ParsedPgn {
  if (!source.trim()) {
    throw new PgnError("INVALID_PGN", "PGN cannot be empty.");
  }

  assertRequiredTagsPresent(source);

  const chess = new Chess();
  try {
    chess.loadPgn(source, { strict: true });
  } catch (error) {
    throw new PgnError("INVALID_PGN", getErrorMessage(error));
  }

  const tags = chess.getHeaders();
  validateTags(tags);

  const history = chess.history({ verbose: true });
  const initialFen = history[0]?.before ?? getHeaderInitialFen(tags);
  const moves = history.map(toPgnMove);

  return {
    tags,
    initialFen,
    moves,
    finalFen: chess.fen(),
    normalizedPgn: chess.pgn({ newline: "\n", maxWidth: 80 }),
  };
}

function assertRequiredTagsPresent(source: string) {
  const presentTags = new Set(
    Array.from(source.matchAll(/^\s*\[\s*([A-Za-z0-9_]+)\s+"/gm), (match) =>
      match[1],
    ),
  );

  for (const tag of PGN_REQUIRED_TAGS) {
    if (!presentTags.has(tag)) {
      throw new PgnError("MISSING_TAG", `Required PGN tag ${tag} is missing.`);
    }
  }
}

function validateTags(tags: Record<string, string>): asserts tags is PgnTags {
  for (const tag of PGN_REQUIRED_TAGS) {
    if (!tags[tag]?.trim()) {
      throw new PgnError("MISSING_TAG", `Required PGN tag ${tag} is missing.`);
    }
  }

  if (!isPgnResult(tags.Result)) {
    throw new PgnError("INVALID_TAG", `Invalid PGN result: ${tags.Result}.`);
  }

  for (const [key, value] of Object.entries(tags)) {
    if (!/^[A-Za-z0-9_]+$/.test(key) || /[\r\n]/.test(value)) {
      throw new PgnError("INVALID_TAG", `Invalid PGN tag ${key}.`);
    }
  }
}

function setTags(chess: Chess, tags: PgnTags, initialFen: string) {
  for (const tag of PGN_REQUIRED_TAGS) {
    chess.setHeader(tag, escapeTagValue(tags[tag]));
  }

  for (const [key, value] of Object.entries(tags)) {
    if (!PGN_REQUIRED_TAGS.includes(key as PgnRequiredTag)) {
      chess.setHeader(key, escapeTagValue(value));
    }
  }

  if (initialFen !== DEFAULT_POSITION) {
    chess.setHeader("SetUp", "1");
    chess.setHeader("FEN", initialFen);
  }
}

function assertMoveMatches(
  actual: Move,
  expected: PgnMoveInput,
  index: number,
) {
  const actualUci = toUci(actual);
  const mismatches = [
    expected.uci && expected.uci !== actualUci ? "UCI" : null,
    expected.san && expected.san !== actual.san ? "SAN" : null,
    expected.fenAfter && expected.fenAfter !== actual.after ? "FEN" : null,
  ].filter(Boolean);

  if (mismatches.length > 0) {
    throw new PgnError(
      "MOVE_MISMATCH",
      `Move ${index + 1} has mismatched ${mismatches.join(", ")} data.`,
    );
  }
}

function toPgnMove(move: Move, index: number): PgnMove {
  const fenMoveNumber = Number(move.before.split(/\s+/)[5]);

  return {
    ply: index + 1,
    moveNumber: Number.isInteger(fenMoveNumber) ? fenMoveNumber : 1,
    side: move.color === "w" ? "white" : "black",
    from: move.from,
    to: move.to,
    promotion: toPromotion(move.promotion),
    uci: toUci(move),
    san: move.san,
    fenAfter: move.after,
  };
}

function toUci(move: Move) {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function toPromotion(piece: Move["promotion"]): PgnMove["promotion"] {
  return piece === "q" || piece === "r" || piece === "b" || piece === "n"
    ? piece
    : null;
}

function getHeaderInitialFen(tags: Record<string, string>) {
  return tags.SetUp === "1" && tags.FEN ? tags.FEN : DEFAULT_POSITION;
}

function isPgnResult(value: string): value is PgnResult {
  return ["1-0", "0-1", "1/2-1/2", "*"].includes(value);
}

function escapeTagValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Invalid PGN.";
}
