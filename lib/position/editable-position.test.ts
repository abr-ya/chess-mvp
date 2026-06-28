import { DEFAULT_POSITION } from "chess.js";
import { describe, expect, it } from "vitest";

import {
  createEmptyPosition,
  createInitialPosition,
  parseFen,
  toFen,
  validateEditablePosition,
} from "./editable-position";

describe("editable position FEN conversion", () => {
  it("round-trips the initial position", () => {
    expect(toFen(createInitialPosition())).toBe(DEFAULT_POSITION);
  });

  it("round-trips a custom position and all FEN state fields", () => {
    const fen = "4k3/8/8/3pP3/8/8/8/4K3 w - d6 7 42";
    const result = parseFen(fen);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.position.sideToMove).toBe("white");
      expect(result.position.enPassantTarget).toBe("d6");
      expect(result.position.halfmoveClock).toBe(7);
      expect(result.position.fullmoveNumber).toBe(42);
      expect(toFen(result.position)).toBe(fen);
    }
  });

  it("serializes an empty editor without pretending it is playable", () => {
    const position = createEmptyPosition();

    expect(toFen(position)).toBe("8/8/8/8/8/8/8/8 w - - 0 1");
    expect(validateEditablePosition(position)).toMatchObject({
      ok: false,
      errors: [
        { code: "KING_COUNT" },
        { code: "KING_COUNT" },
      ],
    });
  });
});

describe("editable position validation", () => {
  it.each([
    ["missing rank", "8/8/8/8/8/8/4K3 w - - 0 1", "INVALID_FEN"],
    ["invalid side", "4k3/8/8/8/8/8/8/4K3 x - - 0 1", "INVALID_FEN"],
    ["pawn on edge", "P3k3/8/8/8/8/8/8/4K3 w - - 0 1", "INVALID_FEN"],
    ["fractional counter", "4k3/8/8/8/8/8/8/4K3 w - - 1.5 2", "INVALID_COUNTER"],
  ])("rejects %s", (_label, fen, code) => {
    expect(parseFen(fen)).toMatchObject({
      ok: false,
      errors: [{ code }],
    });
  });

  it("rejects castling rights without the required rook", () => {
    const position = createInitialPosition();
    delete position.pieces.h1;

    expect(validateEditablePosition(position)).toMatchObject({
      ok: false,
      errors: [
        expect.objectContaining({ code: "INVALID_CASTLING_RIGHT" }),
      ],
    });
  });

  it("rejects more than eight pawns for one side", () => {
    const position = createEmptyPosition();
    position.pieces.e1 = { color: "white", type: "king" };
    position.pieces.e8 = { color: "black", type: "king" };

    for (const square of [
      "a2",
      "b2",
      "c2",
      "d2",
      "e2",
      "f2",
      "g2",
      "h2",
      "a3",
    ] as const) {
      position.pieces[square] = { color: "white", type: "pawn" };
    }

    expect(validateEditablePosition(position)).toMatchObject({
      ok: false,
      errors: [expect.objectContaining({ code: "PAWN_COUNT" })],
    });
  });
});
