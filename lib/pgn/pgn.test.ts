import { DEFAULT_POSITION } from "chess.js";
import { describe, expect, it } from "vitest";

import {
  generatePgn,
  parsePgn,
  PgnError,
  type PgnErrorCode,
  type PgnTags,
} from "./pgn";

const TAGS: PgnTags = {
  Event: "Casual Game",
  Site: "Chess MVP",
  Date: "2026.06.30",
  Round: "-",
  White: "Alice",
  Black: "Bob",
  Result: "1-0",
};

describe("PGN generation", () => {
  it("generates a standards-compatible game from structured moves", () => {
    const pgn = generatePgn({
      tags: TAGS,
      moves: [
        { from: "e2", to: "e4", san: "e4", uci: "e2e4" },
        { from: "e7", to: "e5", san: "e5", uci: "e7e5" },
        { from: "f1", to: "c4", san: "Bc4", uci: "f1c4" },
        { from: "b8", to: "c6", san: "Nc6", uci: "b8c6" },
        { from: "d1", to: "h5", san: "Qh5", uci: "d1h5" },
        { from: "g8", to: "f6", san: "Nf6", uci: "g8f6" },
        { from: "h5", to: "f7", san: "Qxf7#", uci: "h5f7" },
      ],
    });

    expect(pgn).toContain('[Result "1-0"]');
    expect(pgn).toContain("1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0");
  });

  it("rejects structured move data that disagrees with the legal replay", () => {
    expect(() =>
      generatePgn({
        tags: { ...TAGS, Result: "*" },
        moves: [{ from: "e2", to: "e4", san: "e3" }],
      }),
    ).toThrowError(
      expect.objectContaining<Partial<PgnError>>({ code: "MOVE_MISMATCH" }),
    );
  });
});

describe("PGN parsing", () => {
  it("round-trips tags and reconstructs SAN, UCI, and FEN values", () => {
    const generated = generatePgn({
      tags: { ...TAGS, Result: "*", ECO: "C20" },
      moves: [
        { from: "e2", to: "e4" },
        { from: "e7", to: "e5" },
        { from: "g1", to: "f3" },
      ],
    });
    const parsed = parsePgn(generated);

    expect(parsed.tags).toMatchObject({ ...TAGS, Result: "*", ECO: "C20" });
    expect(parsed.initialFen).toBe(DEFAULT_POSITION);
    expect(parsed.moves).toMatchObject([
      { ply: 1, moveNumber: 1, side: "white", san: "e4", uci: "e2e4" },
      { ply: 2, moveNumber: 1, side: "black", san: "e5", uci: "e7e5" },
      { ply: 3, moveNumber: 2, side: "white", san: "Nf3", uci: "g1f3" },
    ]);
    expect(parsed.moves.at(-1)?.fenAfter).toBe(parsed.finalFen);
    expect(parsePgn(parsed.normalizedPgn).moves).toEqual(parsed.moves);
  });

  it("supports a FEN starting position and promotion", () => {
    const initialFen = "7k/P7/8/8/8/8/8/7K w - - 0 12";
    const parsed = parsePgn(
      generatePgn({
        tags: { ...TAGS, Result: "*" },
        initialFen,
        moves: [{ from: "a7", to: "a8", promotion: "q" }],
      }),
    );

    expect(parsed.tags).toMatchObject({ SetUp: "1", FEN: initialFen });
    expect(parsed.initialFen).toBe(initialFen);
    expect(parsed.moves[0]).toMatchObject({
      promotion: "q",
      moveNumber: 12,
      uci: "a7a8q",
      san: "a8=Q+",
    });
  });

  it.each([
    ["empty input", "", "INVALID_PGN"],
    ["malformed notation", validHeaders() + "\n\n1. e4 e5 2. NotAMove", "INVALID_PGN"],
    ["missing required tag", validHeaders().replace('[Site "Chess MVP"]\n', ""), "MISSING_TAG"],
    ["invalid result", validHeaders().replace('Result "1-0"', 'Result "yes"'), "INVALID_TAG"],
  ])("rejects %s", (_label, source, code) => {
    expect(() => parsePgn(source)).toThrowError(
      expect.objectContaining<Partial<PgnError>>({ code: code as PgnErrorCode }),
    );
  });
});

function validHeaders() {
  return Object.entries(TAGS)
    .map(([key, value]) => `[${key} "${value}"]`)
    .join("\n");
}
