export type GameMode = "manual" | "computer" | "online";

export type GameSide = "white" | "black";

export type GameStatus = "waiting" | "active" | "completed" | "aborted";

export type GameResult = "white_win" | "black_win" | "draw" | "aborted" | null;

export type TerminationReason =
  | "checkmate"
  | "stalemate"
  | "insufficient_material"
  | "resignation"
  | "timeout"
  | "aborted"
  | null;

export type PromotionPiece = "q" | "r" | "b" | "n";

export type GameParticipant = {
  id: string;
  userId: string | null;
  side: GameSide;
  isComputer: boolean;
  displayName: string | null;
  ratingBefore: number | null;
  ratingAfter: number | null;
  result: GameResult;
};

export type MoveCommand = {
  gameId: string;
  idempotencyKey: string;
  from: string;
  to: string;
  promotion?: PromotionPiece;
};

export type CreateGameInput = {
  ownerUserId: string;
  mode: Extract<GameMode, "manual">;
  whiteUserId: string;
  blackUserId?: string | null;
  whiteDisplayName?: string | null;
  blackDisplayName?: string | null;
};

export type GameMove = {
  id: string;
  participantId: string | null;
  moveNumber: number;
  side: GameSide;
  from: string;
  to: string;
  promotion: PromotionPiece | null;
  uci: string;
  san: string;
  fenAfter: string;
  clockMsAfter: number | null;
  createdAt: Date;
};

export type LegalMove = {
  from: string;
  to: string;
  promotion?: PromotionPiece;
};

export type LegalActionSet = {
  sideToMove: GameSide;
  moves: LegalMove[];
};

export type GameSnapshot = {
  id: string;
  mode: GameMode;
  status: GameStatus;
  result: GameResult;
  terminationReason: TerminationReason;
  currentFen: string;
  sideToMove: GameSide;
  participants: GameParticipant[];
  moves: GameMove[];
  pgn: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
};
