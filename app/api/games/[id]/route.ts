import { createRuntimeGameApi } from "@/lib/game/game-api";
import { gameApiResponse } from "@/lib/game/game-http";

type GameRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: GameRouteContext) {
  const [{ id }, gameApi] = await Promise.all([
    context.params,
    createRuntimeGameApi(),
  ]);

  return gameApiResponse(await gameApi.getGame(id));
}
