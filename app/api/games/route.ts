import { createRuntimeGameApi } from "@/lib/game/game-api";
import { gameApiResponse } from "@/lib/game/game-http";

export async function POST() {
  const gameApi = await createRuntimeGameApi();

  return gameApiResponse(await gameApi.createBasicGame());
}
