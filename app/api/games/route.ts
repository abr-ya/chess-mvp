import { createRuntimeGameApi } from "@/lib/game/game-api";
import { gameRouteResponse } from "@/lib/game/game-http";

export async function POST() {
  return gameRouteResponse(async () => {
    const gameApi = await createRuntimeGameApi();

    return gameApi.createBasicGame();
  });
}
