import { createRuntimeGameApi } from "@/lib/game/game-api";
import { gameRouteResponse } from "@/lib/game/game-http";
import { createRequestPerformanceTrace } from "@/lib/observability/request-performance";

type GameRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: GameRouteContext) {
  const trace = createRequestPerformanceTrace("GET game");

  return gameRouteResponse(async () => {
    const [{ id }, gameApi] = await Promise.all([
      context.params,
      createRuntimeGameApi(trace),
    ]);

    return gameApi.getGame(id);
  }, trace);
}
