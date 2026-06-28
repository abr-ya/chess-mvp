"use client";

import { useCallback, useMemo, useState } from "react";
import { Chessboard, type ChessboardOptions } from "react-chessboard";

import { createOptimisticMove } from "@/lib/game/chessboard-move";
import { readJsonResponse } from "@/lib/game/game-client-http";
import type { ClientGameSnapshot } from "@/lib/game/client-types";

type ChessboardViewProps = {
  gameId: string;
  fen: string;
  orientation?: "white" | "black";
  disabled?: boolean;
  onGameChange?: (game: ClientGameSnapshot) => void;
};

type GameResponse = {
  game?: Partial<ClientGameSnapshot>;
  error?: { message?: unknown };
};

export function ChessboardView({
  gameId,
  fen,
  orientation = "white",
  disabled = false,
  onGameChange,
}: ChessboardViewProps) {
  const [displayFen, setDisplayFen] = useState(fen);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tryMove = useCallback(
    (from: string, to: string) => {
      if (disabled || isSubmitting) {
        return false;
      }

      const optimisticMove = createOptimisticMove(displayFen, from, to);

      if (!optimisticMove) {
        setErrorMessage("That move is not legal.");
        return false;
      }

      const previousFen = displayFen;
      setDisplayFen(optimisticMove.fen);
      setSelectedSquare(null);
      setErrorMessage(null);
      setIsSubmitting(true);

      void submitMove(gameId, {
        idempotencyKey: crypto.randomUUID(),
        from,
        to,
        ...(optimisticMove.promotion
          ? { promotion: optimisticMove.promotion }
          : {}),
      })
        .then((game) => {
          setDisplayFen(game.currentFen);
          onGameChange?.(game);
        })
        .catch((error: unknown) => {
          setDisplayFen(previousFen);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "The move could not be submitted.",
          );
        })
        .finally(() => {
          setIsSubmitting(false);
        });

      return true;
    },
    [disabled, displayFen, gameId, isSubmitting, onGameChange],
  );

  const options = useMemo<ChessboardOptions>(
    () => ({
      id: `game-${gameId}`,
      position: displayFen,
      boardOrientation: orientation,
      allowDragging: !disabled && !isSubmitting,
      allowDragOffBoard: false,
      animationDurationInMs: 180,
      darkSquareStyle: { backgroundColor: "#987d54" },
      lightSquareStyle: { backgroundColor: "#ede4d4" },
      squareStyles: selectedSquare
        ? {
            [selectedSquare]: {
              boxShadow: "inset 0 0 0 4px rgba(180, 132, 47, 0.72)",
            },
          }
        : {},
      onPieceDrop: ({ sourceSquare, targetSquare }) =>
        targetSquare ? tryMove(sourceSquare, targetSquare) : false,
      onSquareClick: ({ piece, square }) => {
        if (disabled || isSubmitting) {
          return;
        }

        if (!selectedSquare) {
          if (piece) {
            setSelectedSquare(square);
            setErrorMessage(null);
          }
          return;
        }

        if (selectedSquare === square) {
          setSelectedSquare(null);
          return;
        }

        if (!tryMove(selectedSquare, square) && piece) {
          setSelectedSquare(square);
        }
      },
    }),
    [
      disabled,
      displayFen,
      gameId,
      isSubmitting,
      orientation,
      selectedSquare,
      tryMove,
    ],
  );

  return (
    <div className="w-full">
      <div
        className="aspect-square w-full overflow-hidden border border-[#987d54] bg-[#ede4d4] shadow-sm"
        aria-busy={isSubmitting}
      >
        <Chessboard options={options} />
      </div>
      <div className="mt-2 min-h-5 text-sm" aria-live="polite">
        {isSubmitting ? (
          <p className="text-[#766246]">Submitting move…</p>
        ) : errorMessage ? (
          <p className="font-medium text-red-700">{errorMessage}</p>
        ) : null}
      </div>
    </div>
  );
}

async function submitMove(
  gameId: string,
  command: {
    idempotencyKey: string;
    from: string;
    to: string;
    promotion?: "q" | "r" | "b" | "n";
  },
) {
  const response = await fetch(
    `/api/games/${encodeURIComponent(gameId)}/moves`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(command),
    },
  );
  const payload = (await readJsonResponse(response)) as GameResponse | null;

  if (!response.ok) {
    throw new Error(
      typeof payload?.error?.message === "string"
        ? payload.error.message
        : "The move could not be submitted.",
    );
  }

  if (typeof payload?.game?.currentFen !== "string") {
    throw new Error("The server returned an invalid game position.");
  }

  return payload.game as ClientGameSnapshot;
}
