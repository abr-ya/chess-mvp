export type GameSide = "white" | "black";

export type GameStatus = "waiting" | "active" | "completed" | "aborted";

export type GameResult = "white_win" | "black_win" | "draw" | null;

export type TerminationReason =
  | "checkmate"
  | "stalemate"
  | "insufficient_material"
  | "resignation"
  | "timeout"
  | "aborted"
  | null;

export type MoveCommand = {
  gameId: string;
  moveId: string;
  from: string;
  to: string;
  promotion?: "q" | "r" | "b" | "n";
};

export type GameMove = {
  id: string;
  moveNumber: number;
  side: GameSide;
  san: string;
  from: string;
  to: string;
  fenAfter: string;
};

export type GameSnapshot = {
  id: string;
  status: GameStatus;
  result: GameResult;
  terminationReason: TerminationReason;
  currentFen: string;
  sideToMove: GameSide;
  moves: GameMove[];
};
