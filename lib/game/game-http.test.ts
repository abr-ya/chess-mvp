import { afterEach, describe, expect, it, vi } from "vitest";

import { readJsonResponse } from "./game-client-http";
import { gameRouteResponse } from "./game-http";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("gameRouteResponse", () => {
  it("normalizes an unhandled route failure as JSON", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await gameRouteResponse(async () => {
      throw new Error("Database unavailable.");
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INTERNAL_ERROR",
        message: "The game operation could not be completed.",
      },
    });
  });
});

describe("readJsonResponse", () => {
  it("returns null for an empty response", async () => {
    await expect(readJsonResponse(new Response(null))).resolves.toBeNull();
  });

  it("returns null for a non-JSON response", async () => {
    await expect(
      readJsonResponse(new Response("Internal Server Error")),
    ).resolves.toBeNull();
  });
});
