import type { GameApiResult } from "./game-api";
import type { PerformanceTrace } from "@/lib/observability/request-performance";

export function gameApiResponse(result: GameApiResult): Response {
  if (result.ok) {
    return Response.json({ game: result.game });
  }

  return Response.json({ error: result.error }, { status: result.status });
}

export async function gameRouteResponse(
  operation: () => Promise<GameApiResult>,
  trace?: PerformanceTrace,
): Promise<Response> {
  try {
    return gameApiResponse(await operation());
  } catch (error) {
    console.error("Unhandled game route error:", error);

    return Response.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "The game operation could not be completed.",
        },
      },
      { status: 500 },
    );
  } finally {
    trace?.finish();
  }
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
