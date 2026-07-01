import { describe, expect, it } from "vitest";

import { MAX_PGN_IMPORT_BYTES } from "./import-input";
import { previewPgnImport } from "./import-preview";

const VALID_PGN = `[Event "Casual Game"]
[Site "Chess MVP"]
[Date "2026.07.01"]
[Round "-"]
[White "Alice"]
[Black "Bob"]
[Result "*"]

1. e4 e5 2. Nf3 *`;

describe("PGN import preview", () => {
  it("returns parsed headers and moves for a valid PGN", () => {
    const result = previewPgnImport(VALID_PGN);

    expect(result).toMatchObject({
      ok: true,
      parsed: {
        tags: { White: "Alice", Black: "Bob", Result: "*" },
        moves: [{ san: "e4" }, { san: "e5" }, { san: "Nf3" }],
      },
    });
  });

  it("returns a useful parser error for invalid PGN", () => {
    expect(previewPgnImport(VALID_PGN.replace("2. Nf3", "2. NotAMove"))).toEqual(
      expect.objectContaining({ ok: false, code: "INVALID_PGN" }),
    );
  });

  it("rejects oversized content before parsing", () => {
    expect(previewPgnImport("a".repeat(MAX_PGN_IMPORT_BYTES + 1))).toEqual({
      ok: false,
      code: "TOO_LARGE",
      message: "The PGN is larger than the import limit.",
    });
  });
});
