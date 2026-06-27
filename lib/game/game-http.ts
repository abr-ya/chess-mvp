import type { GameApiResult } from "./game-api";

export function gameApiResponse(result: GameApiResult): Response {
  if (result.ok) {
    return Response.json({ game: result.game });
  }

  return Response.json({ error: result.error }, { status: result.status });
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
