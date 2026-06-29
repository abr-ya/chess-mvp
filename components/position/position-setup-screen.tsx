"use client";

import { useState } from "react";

import { PositionSetupBoard } from "@/components/position/position-setup-board";
import { Button } from "@/components/ui/button";
import {
  createInitialPosition,
  parseFen,
  toFen,
  validateEditablePosition,
  type CastlingRights,
  type EditablePosition,
  type PositionColor,
} from "@/lib/position/editable-position";

type CopyState = "idle" | "copied" | "failed";

const castlingOptions: Array<{
  key: keyof CastlingRights;
  label: string;
}> = [
  { key: "whiteKingSide", label: "White O-O" },
  { key: "whiteQueenSide", label: "White O-O-O" },
  { key: "blackKingSide", label: "Black O-O" },
  { key: "blackQueenSide", label: "Black O-O-O" },
];

export function PositionSetupScreen() {
  const [position, setPosition] = useState(createInitialPosition);
  const [fenDraft, setFenDraft] = useState(() => toFen(createInitialPosition()));
  const [fenErrors, setFenErrors] = useState<string[]>([]);
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const positionFen = toFen(position);
  const positionValidation = validateEditablePosition(position);

  function updatePosition(nextPosition: EditablePosition) {
    setPosition(nextPosition);
    setFenDraft(toFen(nextPosition));
    setFenErrors([]);
    setCopyState("idle");
  }

  function setSideToMove(sideToMove: PositionColor) {
    updatePosition({ ...position, sideToMove });
  }

  function toggleCastlingRight(right: keyof CastlingRights) {
    updatePosition({
      ...position,
      castlingRights: {
        ...position.castlingRights,
        [right]: !position.castlingRights[right],
      },
    });
  }

  function loadFen() {
    const result = parseFen(fenDraft);

    if (!result.ok) {
      setFenErrors(result.errors.map((error) => error.message));
      return;
    }

    updatePosition(result.position);
  }

  async function copyFen() {
    try {
      await navigator.clipboard.writeText(positionFen);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  const validationErrors = positionValidation.ok
    ? []
    : positionValidation.errors.map((error) => error.message);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(320px,600px)_minmax(280px,1fr)]">
      <PositionSetupBoard
        position={position}
        onPositionChange={updatePosition}
      />

      <aside className="grid content-start gap-6 border border-[#d9d0c0] bg-white/55 p-5 sm:p-6">
        <section className="grid gap-3" aria-labelledby="side-to-move-label">
          <h2 id="side-to-move-label" className="text-sm font-semibold">
            Side to move
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {(["white", "black"] as const).map((color) => (
              <Button
                key={color}
                type="button"
                variant={position.sideToMove === color ? "secondary" : "outline"}
                aria-pressed={position.sideToMove === color}
                onClick={() => setSideToMove(color)}
              >
                {color === "white" ? "White" : "Black"}
              </Button>
            ))}
          </div>
        </section>

        <section className="grid gap-3" aria-labelledby="castling-label">
          <h2 id="castling-label" className="text-sm font-semibold">
            Castling rights
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {castlingOptions.map(({ key, label }) => (
              <Button
                key={key}
                type="button"
                variant={position.castlingRights[key] ? "secondary" : "outline"}
                aria-pressed={position.castlingRights[key]}
                onClick={() => toggleCastlingRight(key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </section>

        <section className="grid gap-3" aria-labelledby="fen-label">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="fen-label" className="text-sm font-semibold">
                FEN
              </h2>
              <p className="mt-1 text-xs text-[#766246]">
                Edit the value, then load it onto the board.
              </p>
            </div>
            <span className="text-xs text-[#766246]" aria-live="polite">
              {copyState === "copied"
                ? "Copied"
                : copyState === "failed"
                  ? "Copy failed"
                  : ""}
            </span>
          </div>

          <textarea
            value={fenDraft}
            rows={3}
            spellCheck={false}
            aria-label="FEN position"
            aria-invalid={fenErrors.length > 0}
            aria-describedby="fen-feedback"
            className="w-full resize-y rounded-lg border border-[#cfc4b2] bg-white px-3 py-2 font-mono text-sm leading-6 outline-none transition focus:border-[#987d54] focus:ring-2 focus:ring-[#987d54]/20 aria-invalid:border-red-700"
            onChange={(event) => {
              setFenDraft(event.target.value);
              setFenErrors([]);
              setCopyState("idle");
            }}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={loadFen}>
              Load FEN
            </Button>
            <Button type="button" variant="outline" onClick={copyFen}>
              Copy current FEN
            </Button>
          </div>

          <div id="fen-feedback" className="text-sm" aria-live="polite">
            {fenErrors.length > 0 ? (
              <ul className="grid gap-1 text-red-800">
                {fenErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : validationErrors.length > 0 ? (
              <ul className="grid gap-1 text-amber-800">
                {validationErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : (
              <p className="text-emerald-800">Position is valid.</p>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
