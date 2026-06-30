import { describe, expect, it } from "vitest";

import type { GameSnapshot } from "@/lib/game/types";

import { generateGamePgn, getGamePgnFilename } from "./game-pgn";
import { parsePgn } from "./pgn";

describe("game PGN export", () => {
  it("maps a stored game into tags and verified move text", () => {
    const pgn = generateGamePgn(game);
    const parsed = parsePgn(pgn);

    expect(parsed.tags).toMatchObject({
      Event: "Chess MVP Game",
      Site: "Chess MVP",
      Date: "2026.06.30",
      White: "Alice",
      Black: "Bob",
      WhiteElo: "1400",
      BlackElo: "1350",
      Result: "1-0",
      Termination: "checkmate",
    });
    expect(parsed.moves.map((move) => move.san)).toEqual(["e4", "e5"]);
  });

  it("creates a safe predictable filename", () => {
    expect(getGamePgnFilename("game/one dangerous")).toBe(
      "chess-mvp-game-game-one-dangerous.pgn",
    );
  });
});

const game: GameSnapshot = {
  id: "game-1",
  mode: "manual",
  status: "completed",
  result: "white_win",
  terminationReason: "checkmate",
  currentFen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
  sideToMove: "white",
  participants: [
    {
      id: "white",
      userId: "user-1",
      side: "white",
      isComputer: false,
      displayName: "Alice",
      ratingBefore: 1400,
      ratingAfter: 1410,
      result: "white_win",
    },
    {
      id: "black",
      userId: null,
      side: "black",
      isComputer: false,
      displayName: "Bob",
      ratingBefore: 1350,
      ratingAfter: 1340,
      result: "black_win",
    },
  ],
  moves: [
    {
      id: "move-1",
      participantId: "white",
      moveNumber: 1,
      side: "white",
      from: "e2",
      to: "e4",
      promotion: null,
      uci: "e2e4",
      san: "e4",
      fenAfter: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
      clockMsAfter: null,
      createdAt: new Date("2026-06-30T12:01:00.000Z"),
    },
    {
      id: "move-2",
      participantId: "black",
      moveNumber: 2,
      side: "black",
      from: "e7",
      to: "e5",
      promotion: null,
      uci: "e7e5",
      san: "e5",
      fenAfter: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      clockMsAfter: null,
      createdAt: new Date("2026-06-30T12:02:00.000Z"),
    },
  ],
  pgn: null,
  createdAt: new Date("2026-06-30T12:00:00.000Z"),
  updatedAt: new Date("2026-06-30T12:02:00.000Z"),
  completedAt: new Date("2026-06-30T12:02:00.000Z"),
};
