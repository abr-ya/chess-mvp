import type { GameSnapshot, TerminationReason } from "@/lib/game/types";

import { generatePgn, type PgnResult, type PgnTags } from "./pgn";

export function generateGamePgn(game: GameSnapshot) {
  if (game.pgn) {
    return game.pgn;
  }

  const white = game.participants.find((participant) => participant.side === "white");
  const black = game.participants.find((participant) => participant.side === "black");
  const tags: PgnTags = {
    Event: "Chess MVP Game",
    Site: "Chess MVP",
    Date: formatPgnDate(game.createdAt),
    Round: "-",
    White: white?.displayName?.trim() || "White",
    Black: black?.displayName?.trim() || "Black",
    Result: toPgnResult(game),
    ...(white?.ratingBefore ? { WhiteElo: String(white.ratingBefore) } : {}),
    ...(black?.ratingBefore ? { BlackElo: String(black.ratingBefore) } : {}),
    ...(game.terminationReason
      ? { Termination: formatTermination(game.terminationReason) }
      : {}),
  };

  return generatePgn({
    tags,
    moves: game.moves.map((move) => ({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
      uci: move.uci,
      san: move.san,
      fenAfter: move.fenAfter,
    })),
  });
}

export function getGamePgnFilename(gameId: string) {
  const safeId = gameId.replace(/[^A-Za-z0-9_-]/g, "-").replace(/-+/g, "-");
  return `chess-mvp-game-${safeId || "game"}.pgn`;
}

function toPgnResult(game: GameSnapshot): PgnResult {
  switch (game.result) {
    case "white_win":
      return "1-0";
    case "black_win":
      return "0-1";
    case "draw":
      return "1/2-1/2";
    case "aborted":
    case null:
      return "*";
  }
}

function formatPgnDate(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", ".");
}

function formatTermination(reason: Exclude<TerminationReason, null>) {
  return reason.replaceAll("_", " ");
}
