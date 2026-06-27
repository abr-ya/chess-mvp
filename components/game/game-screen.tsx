"use client";

import { useEffect, useMemo, useState } from "react";

import { ChessboardView } from "@/components/chessboard/chessboard-view";
import { NewGameButton } from "@/components/game/new-game-button";
import { Badge } from "@/components/ui/badge";
import type { ClientGameSnapshot, ClientGameMove } from "@/lib/game/client-types";

type GameScreenProps = {
  gameId: string;
};

type GameResponse = {
  game?: ClientGameSnapshot;
  error?: { message?: unknown };
};

export function GameScreen({ gameId }: GameScreenProps) {
  const [game, setGame] = useState<ClientGameSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void loadGame(gameId, controller.signal)
      .then((snapshot) => {
        setGame(snapshot);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof Error ? error.message : "The game could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [gameId]);

  const moveRows = useMemo(() => groupMoves(game?.moves ?? []), [game?.moves]);

  if (isLoading) {
    return (
      <div className="grid min-h-[420px] place-items-center text-sm font-medium text-[#766246]">
        Loading game…
      </div>
    );
  }

  if (!game) {
    return (
      <div className="border border-red-200 bg-red-50 p-6 text-red-800">
        <h1 className="text-xl font-semibold">Game unavailable</h1>
        <p className="mt-2 text-sm">{errorMessage ?? "The game could not be loaded."}</p>
      </div>
    );
  }

  const white = game.participants.find((participant) => participant.side === "white");
  const black = game.participants.find((participant) => participant.side === "black");
  const isFinished = game.status === "completed" || game.status === "aborted";

  return (
    <section className="grid w-full gap-6 lg:grid-cols-[minmax(320px,680px)_minmax(280px,360px)]">
      <div className="min-w-0">
        <div className="mb-3 flex items-center justify-between gap-3 text-sm">
          <PlayerLabel side="Black" name={black?.displayName} />
          <span className="text-[#766246]">{black?.ratingBefore ?? "Unrated"}</span>
        </div>
        <ChessboardView
          key={game.id}
          gameId={game.id}
          fen={game.currentFen}
          disabled={isFinished}
          onGameChange={setGame}
        />
        <div className="mt-1 flex items-center justify-between gap-3 text-sm">
          <PlayerLabel side="White" name={white?.displayName} />
          <span className="text-[#766246]">{white?.ratingBefore ?? "Unrated"}</span>
        </div>
      </div>

      <aside className="min-w-0 border-t border-[#d9d0c0] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Manual game</h1>
          <Badge variant={isFinished ? "outline" : "secondary"}>
            {formatStatus(game.status)}
          </Badge>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-[#d9d0c0] py-4 text-sm">
          <div>
            <dt className="font-semibold text-[#766246]">Side to move</dt>
            <dd className="mt-1 capitalize text-[#25211c]">
              {isFinished ? "—" : game.sideToMove}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#766246]">Moves</dt>
            <dd className="mt-1 text-[#25211c]">{game.moves.length}</dd>
          </div>
        </dl>

        {isFinished ? <GameResult game={game} /> : null}

        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#766246]">
            Moves
          </h2>
          {moveRows.length ? (
            <div className="mt-3 max-h-[360px] overflow-y-auto border-y border-[#d9d0c0] py-2 font-mono text-sm">
              {moveRows.map((row) => (
                <div
                  key={row.number}
                  className="grid grid-cols-[2rem_1fr_1fr] gap-2 px-2 py-1.5 even:bg-white/45"
                >
                  <span className="text-[#8a7a62]">{row.number}.</span>
                  <span>{row.white ?? ""}</span>
                  <span>{row.black ?? ""}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#766246]">No moves yet.</p>
          )}
        </div>

        {isFinished ? (
          <NewGameButton label="Start another game" className="mt-6" />
        ) : null}
      </aside>
    </section>
  );
}

function PlayerLabel({ side, name }: { side: string; name?: string | null }) {
  return (
    <p className="min-w-0 truncate font-semibold text-[#25211c]">
      {name ?? `${side} local player`}
    </p>
  );
}

function GameResult({ game }: { game: ClientGameSnapshot }) {
  const result =
    game.result === "white_win"
      ? "White wins"
      : game.result === "black_win"
        ? "Black wins"
        : game.result === "draw"
          ? "Draw"
          : "Game ended";

  return (
    <div className="mt-5 border border-[#cdbd9f] bg-[#eee5d5] p-4">
      <p className="font-semibold text-[#25211c]">{result}</p>
      <p className="mt-1 text-sm capitalize text-[#766246]">
        {game.terminationReason?.replaceAll("_", " ") ?? "Completed"}
      </p>
    </div>
  );
}

function groupMoves(moves: ClientGameMove[]) {
  const rows: Array<{ number: number; white?: string; black?: string }> = [];

  for (const move of moves) {
    const number = Math.floor((move.moveNumber + 1) / 2);
    let row = rows.at(-1);

    if (!row || row.number !== number) {
      row = { number };
      rows.push(row);
    }

    row[move.side] = move.san;
  }

  return rows;
}

function formatStatus(status: ClientGameSnapshot["status"]) {
  switch (status) {
    case "waiting":
      return "Waiting";
    case "active":
      return "In progress";
    case "completed":
      return "Completed";
    case "aborted":
      return "Aborted";
  }
}

async function loadGame(gameId: string, signal: AbortSignal) {
  const response = await fetch(`/api/games/${encodeURIComponent(gameId)}`, {
    signal,
    cache: "no-store",
  });
  const payload = (await response.json()) as GameResponse;

  if (!response.ok) {
    throw new Error(
      typeof payload.error?.message === "string"
        ? payload.error.message
        : "The game could not be loaded.",
    );
  }

  if (!payload.game || typeof payload.game.currentFen !== "string") {
    throw new Error("The server returned an invalid game.");
  }

  return payload.game;
}
