export const MAX_PGN_IMPORT_BYTES = 256 * 1024;

export type PgnImportSize = {
  bytes: number;
  isWithinLimit: boolean;
};

export function getPgnImportSize(source: string): PgnImportSize {
  const bytes = new TextEncoder().encode(source).byteLength;

  return {
    bytes,
    isWithinLimit: bytes <= MAX_PGN_IMPORT_BYTES,
  };
}

export function formatPgnImportBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KiB`;
}
