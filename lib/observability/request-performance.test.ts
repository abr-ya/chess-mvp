import { describe, expect, it, vi } from "vitest";

import { createRequestPerformanceTrace } from "./request-performance";

describe("createRequestPerformanceTrace", () => {
  it("logs safe phase timings and the database-operation count", async () => {
    const log = vi.fn();
    const times = [0, 1, 4, 5, 9, 12];
    const trace = createRequestPerformanceTrace("POST game move", {
      enabled: true,
      now: () => times.shift() ?? 12,
      log,
    });

    await trace.measure("current-user-resolution", async () => undefined);
    await trace.database("game.findUnique", async () => undefined);
    trace.finish();

    expect(log).toHaveBeenCalledOnce();
    expect(log.mock.calls[0][0]).toContain(
      '"databaseOperationCount":1',
    );
    expect(log.mock.calls[0][0]).toContain(
      '"name":"current-user-resolution"',
    );
    expect(log.mock.calls[0][0]).not.toContain("DATABASE_URL");
  });

  it("does not time or log when disabled", async () => {
    const log = vi.fn();
    const operation = vi.fn().mockResolvedValue("result");
    const trace = createRequestPerformanceTrace("GET game", {
      enabled: false,
      log,
    });

    await expect(trace.measure("game-loading", operation)).resolves.toBe(
      "result",
    );
    trace.finish();

    expect(log).not.toHaveBeenCalled();
  });
});
