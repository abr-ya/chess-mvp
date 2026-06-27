import { createRuntimeGameApi } from "@/lib/game/game-api";
import { gameApiResponse, readJsonBody } from "@/lib/game/game-http";

type GameMoveRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: GameMoveRouteContext) {
  const [{ id }, body, gameApi] = await Promise.all([
    context.params,
    readJsonBody(request),
    createRuntimeGameApi(),
  ]);

  return gameApiResponse(await gameApi.submitMove(id, body));
}
