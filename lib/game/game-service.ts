import type { GameSnapshot, MoveCommand } from "./types";

export class GameService {
  async createGame(): Promise<GameSnapshot> {
    throw new Error("GameService.createGame is not implemented yet.");
  }

  async getGameSnapshot(gameId: string): Promise<GameSnapshot> {
    throw new Error(
      `GameService.getGameSnapshot is not implemented yet for ${gameId}.`,
    );
  }

  async submitMove(command: MoveCommand): Promise<GameSnapshot> {
    throw new Error(
      `GameService.submitMove is not implemented yet for ${command.gameId}.`,
    );
  }
}
