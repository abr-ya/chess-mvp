import { DEFAULT_POSITION } from "chess.js";
import { describe, expect, it } from "vitest";

import { createOptimisticMove } from "./chessboard-move";

describe("createOptimisticMove", () => {
  it("returns the next FEN for a legal move", () => {
    const move = createOptimisticMove(DEFAULT_POSITION, "e2", "e4");

    expect(move?.fen).toContain(" b KQkq ");
    expect(move?.promotion).toBeNull();
  });

  it("rejects an illegal move without producing local state", () => {
    expect(createOptimisticMove(DEFAULT_POSITION, "e2", "e5")).toBeNull();
  });

  it("defaults pawn promotion to a queen", () => {
    const move = createOptimisticMove(
      "4k3/P7/8/8/8/8/4K3/8 w - - 0 1",
      "a7",
      "a8",
    );

    expect(move?.promotion).toBe("q");
  });
});
