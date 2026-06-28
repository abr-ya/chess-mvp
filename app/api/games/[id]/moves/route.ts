import { createRuntimeGameApi } from "@/lib/game/game-api";
import { gameRouteResponse, readJsonBody } from "@/lib/game/game-http";

type GameMoveRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: GameMoveRouteContext) {
  return gameRouteResponse(async () => {
    const [{ id }, body, gameApi] = await Promise.all([
      context.params,
      readJsonBody(request),
      createRuntimeGameApi(),
    ]);

    return gameApi.submitMove(id, body);
  });
}
