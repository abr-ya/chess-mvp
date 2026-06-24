import { describe, expect, it } from "vitest";

import { GameService } from "./game-service";

describe("GameService scaffold", () => {
  it("keeps createGame explicitly unimplemented until persistence lands", async () => {
    const service = new GameService();

    await expect(service.createGame()).rejects.toThrow(
      "GameService.createGame is not implemented yet.",
    );
  });

  it("keeps submitMove explicitly unimplemented until chess validation lands", async () => {
    const service = new GameService();

    await expect(
      service.submitMove({
        gameId: "game-1",
        moveId: "move-1",
        from: "e2",
        to: "e4",
      }),
    ).rejects.toThrow(
      "GameService.submitMove is not implemented yet for game-1.",
    );
  });
});
