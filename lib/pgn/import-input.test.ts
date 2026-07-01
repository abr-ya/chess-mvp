import { describe, expect, it } from "vitest";

import {
  formatPgnImportBytes,
  getPgnImportSize,
  MAX_PGN_IMPORT_BYTES,
} from "./import-input";

describe("PGN import input", () => {
  it("accepts content at the byte limit", () => {
    expect(getPgnImportSize("a".repeat(MAX_PGN_IMPORT_BYTES))).toEqual({
      bytes: MAX_PGN_IMPORT_BYTES,
      isWithinLimit: true,
    });
  });

  it("rejects content above the byte limit", () => {
    expect(
      getPgnImportSize("a".repeat(MAX_PGN_IMPORT_BYTES + 1)).isWithinLimit,
    ).toBe(false);
  });

  it("measures UTF-8 bytes instead of JavaScript characters", () => {
    expect(getPgnImportSize("♞").bytes).toBe(3);
  });

  it("formats byte counts for the input hint", () => {
    expect(formatPgnImportBytes(512)).toBe("512 B");
    expect(formatPgnImportBytes(1536)).toBe("1.5 KiB");
    expect(formatPgnImportBytes(MAX_PGN_IMPORT_BYTES)).toBe("256 KiB");
  });
});
