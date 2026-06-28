import { createRuntimeGameApi } from "@/lib/game/game-api";
import { gameRouteResponse } from "@/lib/game/game-http";
import { createRequestPerformanceTrace } from "@/lib/observability/request-performance";

export async function POST() {
  const trace = createRequestPerformanceTrace("POST game");

  return gameRouteResponse(async () => {
    const gameApi = await createRuntimeGameApi(trace);

    return gameApi.createBasicGame();
  }, trace);
}
