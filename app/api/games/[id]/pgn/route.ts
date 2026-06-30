import { createRuntimeGameApi } from "@/lib/game/game-api";
import { createRequestPerformanceTrace } from "@/lib/observability/request-performance";
import { generateGamePgn, getGamePgnFilename } from "@/lib/pgn/game-pgn";

type GamePgnRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: GamePgnRouteContext) {
  const trace = createRequestPerformanceTrace("GET game PGN");

  try {
    const [{ id }, gameApi] = await Promise.all([
      context.params,
      createRuntimeGameApi(trace),
    ]);
    const result = await gameApi.getGame(id);

    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    return new Response(generateGamePgn(result.game), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${getGamePgnFilename(id)}"`,
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Unhandled game PGN route error:", error);

    return Response.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "The PGN could not be generated.",
        },
      },
      { status: 500 },
    );
  } finally {
    trace.finish();
  }
}
