import { readJsonBody } from "@/lib/game/game-http";
import { createRuntimePgnImportApi } from "@/lib/pgn/import-api";

export async function POST(request: Request) {
  try {
    const [body, api] = await Promise.all([
      readJsonBody(request),
      createRuntimePgnImportApi(),
    ]);
    const result = await api.importGame(body);

    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    return Response.json({ game: result.game }, { status: 201 });
  } catch (error) {
    console.error("Unhandled PGN import route error:", error);

    return Response.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "The PGN could not be imported.",
        },
      },
      { status: 500 },
    );
  }
}
