import { createRuntimeGameApi } from "@/lib/game/game-api";
import { gameRouteResponse, readJsonBody } from "@/lib/game/game-http";
import { createRequestPerformanceTrace } from "@/lib/observability/request-performance";

type GameMoveRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: GameMoveRouteContext) {
  const trace = createRequestPerformanceTrace("POST game move");

  return gameRouteResponse(async () => {
    const [{ id }, body, gameApi] = await Promise.all([
      context.params,
      readJsonBody(request),
      createRuntimeGameApi(trace),
    ]);

    return gameApi.submitMove(id, body);
  }, trace);
}
