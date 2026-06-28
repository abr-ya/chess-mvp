import type { GameMove, GameSnapshot } from "./types";

export type ClientGameMove = Omit<GameMove, "createdAt"> & {
  createdAt: string;
};

export type ClientGameSnapshot = Omit<
  GameSnapshot,
  "moves" | "createdAt" | "updatedAt" | "completedAt"
> & {
  moves: ClientGameMove[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};
