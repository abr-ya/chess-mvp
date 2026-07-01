"use client";

import { type ChangeEvent, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  formatPgnImportBytes,
  getPgnImportSize,
  MAX_PGN_IMPORT_BYTES,
} from "@/lib/pgn/import-input";
import {
  previewPgnImport,
  type PgnImportPreviewResult,
} from "@/lib/pgn/import-preview";

const PREVIEW_TAGS = [
  "Event",
  "Site",
  "Date",
  "Round",
  "White",
  "Black",
  "Result",
] as const;

export function PgnImportInput() {
  const fileInputId = useId();
  const pasteInputId = useId();
  const [source, setSource] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PgnImportPreviewResult | null>(null);
  const size = getPgnImportSize(source);
  const maxSizeLabel = formatPgnImportBytes(MAX_PGN_IMPORT_BYTES);

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileError(null);
    setPreview(null);

    if (!file) {
      return;
    }

    if (file.size > MAX_PGN_IMPORT_BYTES) {
      setFileName(null);
      setFileError(`That file is larger than the ${maxSizeLabel} limit.`);
      event.target.value = "";
      return;
    }

    try {
      const nextSource = await file.text();
      const nextSize = getPgnImportSize(nextSource);

      if (!nextSize.isWithinLimit) {
        setFileName(null);
        setFileError(`That file is larger than the ${maxSizeLabel} limit.`);
        event.target.value = "";
        return;
      }

      setSource(nextSource);
      setFileName(file.name);
    } catch {
      setFileName(null);
      setFileError("The selected file could not be read.");
      event.target.value = "";
    }
  }

  function clearInput() {
    setSource("");
    setFileName(null);
    setFileError(null);
    setPreview(null);
  }

  function showPreview() {
    setPreview(previewPgnImport(source));
  }

  const errorMessage = fileError
    ? fileError
    : size.isWithinLimit
      ? null
      : `The pasted PGN is larger than the ${maxSizeLabel} limit.`;

  const validationError = preview && !preview.ok ? preview.message : null;
  const displayedError = errorMessage ?? validationError;

  return (
    <div className="grid gap-6">
      <section className="border border-[#d9d0c0] bg-white/45 p-5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(240px,0.72fr)_minmax(0,1.28fr)]">
        <div>
          <h2 className="text-lg font-semibold">Choose a PGN file</h2>
          <p className="mt-2 text-sm leading-6 text-[#5d5548]">
            Select a plain-text <code>.pgn</code> file up to {maxSizeLabel}. Its
            contents will appear in the editor before anything is imported.
          </p>
          <label
            htmlFor={fileInputId}
            className="mt-5 block text-sm font-semibold text-[#40382d]"
          >
            PGN file
          </label>
          <input
            id={fileInputId}
            type="file"
            accept=".pgn,application/x-chess-pgn,text/plain"
            onChange={selectFile}
            className="mt-2 block w-full text-sm file:mr-3 file:rounded-md file:border file:border-[#b9a98e] file:bg-[#f5f1e8] file:px-3 file:py-2 file:font-semibold file:text-[#25211c] hover:file:bg-[#ede4d4]"
          />
          {fileName ? (
            <p className="mt-3 text-sm text-[#5d5548]">
              Loaded <span className="font-semibold text-[#25211c]">{fileName}</span>
            </p>
          ) : null}
        </div>

        <div>
          <div className="flex items-end justify-between gap-4">
            <label htmlFor={pasteInputId} className="text-lg font-semibold">
              Or paste PGN
            </label>
            <span className="text-xs font-medium tabular-nums text-[#766246]">
              {formatPgnImportBytes(size.bytes)} / {maxSizeLabel}
            </span>
          </div>
          <textarea
            id={pasteInputId}
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setFileName(null);
              setFileError(null);
              setPreview(null);
            }}
            rows={16}
            spellCheck={false}
            aria-invalid={displayedError ? true : undefined}
            aria-describedby="pgn-import-message"
            placeholder={'[Event "Casual Game"]\n[Site "Chess MVP"]\n…\n\n1. e4 e5'}
            className="mt-2 min-h-72 w-full resize-y border border-[#b9a98e] bg-[#fffdf8] p-3 font-mono text-sm leading-6 outline-none transition focus:border-[#766246] focus:ring-2 focus:ring-[#c8b99f]/50 aria-invalid:border-red-700"
          />
          <div className="mt-3 flex min-h-8 items-center justify-between gap-4">
            <p
              id="pgn-import-message"
              className={`text-sm ${displayedError ? "font-medium text-red-700" : "text-[#5d5548]"}`}
              aria-live="polite"
            >
              {displayedError ??
                (preview?.ok
                  ? "PGN is valid and ready for review."
                  : "The PGN will be validated before import.")}
            </p>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={clearInput}
                disabled={!source && !fileError}
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={showPreview}
                disabled={!source.trim() || !size.isWithinLimit}
              >
                Preview PGN
              </Button>
            </div>
          </div>
        </div>
      </div>
      </section>

      {preview?.ok ? (
        <section className="border border-[#b9a98e] bg-[#fffdf8] p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#766246]">
                Valid PGN
              </p>
              <h2 className="mt-1 text-2xl font-semibold">Import preview</h2>
            </div>
            <p className="text-sm font-medium text-[#5d5548]">
              {preview.parsed.moves.length} plies · {Math.ceil(preview.parsed.moves.length / 2)} moves
            </p>
          </div>

          <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            {PREVIEW_TAGS.map((tag) => (
              <div key={tag}>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#766246]">
                  {tag}
                </dt>
                <dd className="mt-1 break-words text-sm font-medium text-[#25211c]">
                  {preview.parsed.tags[tag]}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}
