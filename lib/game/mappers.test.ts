import { describe, expect, it } from "vitest";

import {
  GameMode,
  GameResult,
  GameStatus,
  ParticipantSide,
  TerminationReason,
} from "@/lib/generated/prisma/enums";

import { getSideToMove, mapGameSnapshotRecord } from "./mappers";

describe("game mappers", () => {
  it("maps a persisted game shape to a domain snapshot", () => {
    const createdAt = new Date("2026-06-25T10:00:00.000Z");
    const updatedAt = new Date("2026-06-25T10:01:00.000Z");
    const completedAt = new Date("2026-06-25T10:02:00.000Z");

    const snapshot = mapGameSnapshotRecord({
      id: "game-1",
      ownerUserId: "user-1",
      mode: GameMode.MANUAL,
      status: GameStatus.COMPLETED,
      currentFen: "8/8/8/8/8/8/8/8 b - - 0 1",
      result: GameResult.WHITE_WIN,
      terminationReason: TerminationReason.CHECKMATE,
      pgn: null,
      createdAt,
      updatedAt,
      completedAt,
      participants: [
        {
          id: "black-participant",
          userId: null,
          side: ParticipantSide.BLACK,
          isComputer: false,
          displayName: "Guest",
          ratingBefore: null,
          ratingAfter: null,
          result: GameResult.BLACK_WIN,
        },
        {
          id: "white-participant",
          userId: "user-1",
          side: ParticipantSide.WHITE,
          isComputer: false,
          displayName: "Player",
          ratingBefore: 1200,
          ratingAfter: null,
          result: GameResult.WHITE_WIN,
        },
      ],
      moves: [
        {
          id: "move-2",
          participantId: "black-participant",
          moveNumber: 2,
          side: ParticipantSide.BLACK,
          from: "e7",
          to: "e5",
          promotion: null,
          uci: "e7e5",
          san: "e5",
          fenAfter: "fen-after-black",
          clockMsAfter: null,
          createdAt: updatedAt,
        },
        {
          id: "move-1",
          participantId: "white-participant",
          moveNumber: 1,
          side: ParticipantSide.WHITE,
          from: "e2",
          to: "e4",
          promotion: "q",
          uci: "e2e4q",
          san: "e4",
          fenAfter: "fen-after-white",
          clockMsAfter: 300000,
          createdAt,
        },
      ],
    });

    expect(snapshot).toMatchObject({
      id: "game-1",
      mode: "manual",
      status: "completed",
      result: "white_win",
      terminationReason: "checkmate",
      sideToMove: "black",
      participants: [
        { id: "white-participant", side: "white", userId: "user-1" },
        { id: "black-participant", side: "black", userId: null },
      ],
      moves: [
        { id: "move-1", side: "white", promotion: "q" },
        { id: "move-2", side: "black", promotion: null },
      ],
      createdAt,
      updatedAt,
      completedAt,
    });
  });

  it("defaults side-to-move parsing to white for initial FEN strings", () => {
    expect(getSideToMove("8/8/8/8/8/8/8/8 w - - 0 1")).toBe("white");
  });

  it("rejects unsupported promotion values at the mapper boundary", () => {
    expect(() =>
      mapGameSnapshotRecord({
        id: "game-1",
        ownerUserId: null,
        mode: GameMode.MANUAL,
        status: GameStatus.ACTIVE,
        currentFen: "8/8/8/8/8/8/8/8 w - - 0 1",
        result: null,
        terminationReason: null,
        pgn: null,
        createdAt: new Date("2026-06-25T10:00:00.000Z"),
        updatedAt: new Date("2026-06-25T10:00:00.000Z"),
        completedAt: null,
        participants: [],
        moves: [
          {
            id: "move-1",
            participantId: null,
            moveNumber: 1,
            side: ParticipantSide.WHITE,
            from: "a7",
            to: "a8",
            promotion: "king",
            uci: "a7a8k",
            san: "a8=K",
            fenAfter: "fen-after",
            clockMsAfter: null,
            createdAt: new Date("2026-06-25T10:00:00.000Z"),
          },
        ],
      }),
    ).toThrow("Unsupported promotion piece: king.");
  });
});
