"use client";

import { useMemo, useState } from "react";
import { Chessboard, type ChessboardOptions } from "react-chessboard";

import { Button } from "@/components/ui/button";
import {
  createEmptyPosition,
  createInitialPosition,
  isPositionSquare,
  movePositionPiece,
  setPositionPiece,
  type EditablePosition,
  type PositionPiece,
  type PositionSquare,
} from "@/lib/position/editable-position";

type PositionSetupBoardProps = {
  position: EditablePosition;
  onPositionChange: (position: EditablePosition) => void;
  orientation?: "white" | "black";
};

type EditorTool = PositionPiece | "erase" | null;

const palette: Array<PositionPiece & { symbol: string; label: string }> = [
  { color: "white", type: "king", symbol: "♔", label: "White king" },
  { color: "white", type: "queen", symbol: "♕", label: "White queen" },
  { color: "white", type: "rook", symbol: "♖", label: "White rook" },
  { color: "white", type: "bishop", symbol: "♗", label: "White bishop" },
  { color: "white", type: "knight", symbol: "♘", label: "White knight" },
  { color: "white", type: "pawn", symbol: "♙", label: "White pawn" },
  { color: "black", type: "king", symbol: "♚", label: "Black king" },
  { color: "black", type: "queen", symbol: "♛", label: "Black queen" },
  { color: "black", type: "rook", symbol: "♜", label: "Black rook" },
  { color: "black", type: "bishop", symbol: "♝", label: "Black bishop" },
  { color: "black", type: "knight", symbol: "♞", label: "Black knight" },
  { color: "black", type: "pawn", symbol: "♟", label: "Black pawn" },
];

export function PositionSetupBoard({
  position,
  onPositionChange,
  orientation = "white",
}: PositionSetupBoardProps) {
  const [tool, setTool] = useState<EditorTool>(null);
  const [sourceSquare, setSourceSquare] = useState<PositionSquare | null>(null);
  const boardPosition = useMemo(() => toBoardPosition(position), [position]);

  const options: ChessboardOptions = {
      id: "position-setup",
      position: boardPosition,
      boardOrientation: orientation,
      allowDragging: true,
      allowDragOffBoard: true,
      animationDurationInMs: 120,
      darkSquareStyle: { backgroundColor: "#987d54" },
      lightSquareStyle: { backgroundColor: "#ede4d4" },
      squareStyles: sourceSquare
        ? {
            [sourceSquare]: {
              boxShadow: "inset 0 0 0 4px rgba(180, 132, 47, 0.78)",
            },
          }
        : {},
      onPieceDrop: ({ sourceSquare: source, targetSquare: target }) => {
        if (!isPositionSquare(source)) {
          return false;
        }

        const targetSquare =
          target && isPositionSquare(target) ? target : null;
        onPositionChange(movePositionPiece(position, source, targetSquare));
        setSourceSquare(null);
        return true;
      },
      onSquareClick: ({ square }) => {
        if (!isPositionSquare(square)) {
          return;
        }

        if (tool === "erase") {
          onPositionChange(setPositionPiece(position, square, null));
          setSourceSquare(null);
          return;
        }

        if (tool) {
          onPositionChange(setPositionPiece(position, square, tool));
          setSourceSquare(null);
          return;
        }

        if (!sourceSquare) {
          if (position.pieces[square]) {
            setSourceSquare(square);
          }
          return;
        }

        if (sourceSquare === square) {
          setSourceSquare(null);
          return;
        }

        onPositionChange(movePositionPiece(position, sourceSquare, square));
        setSourceSquare(null);
      },
  };

  return (
    <section className="grid w-full gap-4" aria-label="Position setup board">
      <div className="aspect-square w-full overflow-hidden border border-[#987d54] bg-[#ede4d4] shadow-sm">
        <Chessboard options={options} />
      </div>

      <div className="grid gap-3">
        <div
          className="grid grid-cols-7 gap-1.5 sm:grid-cols-13"
          role="toolbar"
          aria-label="Piece palette"
        >
          {palette.map(({ symbol, label, color, type }) => {
            const isSelected =
              typeof tool === "object" &&
              tool?.color === color &&
              tool.type === type;

            return (
              <Button
                key={`${color}-${type}`}
                type="button"
                variant={isSelected ? "secondary" : "outline"}
                size="icon-lg"
                className="text-2xl"
                aria-label={label}
                aria-pressed={isSelected}
                onClick={() => {
                  setTool(isSelected ? null : { color, type });
                  setSourceSquare(null);
                }}
              >
                <span aria-hidden="true">{symbol}</span>
              </Button>
            );
          })}
          <Button
            type="button"
            variant={tool === "erase" ? "secondary" : "outline"}
            size="icon-lg"
            aria-label="Erase piece"
            aria-pressed={tool === "erase"}
            onClick={() => {
              setTool(tool === "erase" ? null : "erase");
              setSourceSquare(null);
            }}
          >
            ×
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onPositionChange(createEmptyPosition());
              setSourceSquare(null);
            }}
          >
            Clear board
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onPositionChange(createInitialPosition());
              setSourceSquare(null);
            }}
          >
            Reset position
          </Button>
        </div>

        <p className="text-sm text-[#766246]" aria-live="polite">
          {describeSelection(tool, sourceSquare)}
        </p>
      </div>
    </section>
  );
}

function toBoardPosition(position: EditablePosition) {
  return Object.fromEntries(
    Object.entries(position.pieces).map(([square, piece]) => [
      square,
      { pieceType: `${piece.color === "white" ? "w" : "b"}${pieceTypeCode(piece)}` },
    ]),
  );
}

function pieceTypeCode(piece: PositionPiece) {
  const codes = {
    pawn: "P",
    knight: "N",
    bishop: "B",
    rook: "R",
    queen: "Q",
    king: "K",
  } as const;

  return codes[piece.type];
}

function describeSelection(tool: EditorTool, sourceSquare: PositionSquare | null) {
  if (tool === "erase") {
    return "Erase tool selected. Tap a square to remove its piece.";
  }

  if (tool) {
    return `${tool.color} ${tool.type} selected. Tap a square to place it.`;
  }

  if (sourceSquare) {
    return `Piece on ${sourceSquare} selected. Tap another square to move it.`;
  }

  return "Drag pieces, or select a palette piece and tap a square.";
}
