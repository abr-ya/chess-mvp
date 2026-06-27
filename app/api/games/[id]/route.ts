import { createRuntimeGameApi } from "@/lib/game/game-api";
import { gameRouteResponse } from "@/lib/game/game-http";

type GameRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: GameRouteContext) {
  return gameRouteResponse(async () => {
    const [{ id }, gameApi] = await Promise.all([
      context.params,
      createRuntimeGameApi(),
    ]);

    return gameApi.getGame(id);
  });
}
