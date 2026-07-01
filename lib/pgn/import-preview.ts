import { getPgnImportSize } from "./import-input";
import { parsePgn, PgnError, type ParsedPgn } from "./pgn";

export type PgnImportPreviewResult =
  | { ok: true; parsed: ParsedPgn }
  | { ok: false; code: "TOO_LARGE" | "INVALID_PGN"; message: string };

export function previewPgnImport(source: string): PgnImportPreviewResult {
  if (!getPgnImportSize(source).isWithinLimit) {
    return {
      ok: false,
      code: "TOO_LARGE",
      message: "The PGN is larger than the import limit.",
    };
  }

  try {
    return { ok: true, parsed: parsePgn(source) };
  } catch (error) {
    return {
      ok: false,
      code: "INVALID_PGN",
      message:
        error instanceof PgnError
          ? error.message
          : "The PGN could not be validated.",
    };
  }
}
