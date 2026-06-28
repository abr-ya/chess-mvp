export type PerformanceTrace = {
  measure<T>(phase: string, operation: () => Promise<T>): Promise<T>;
  measureSync<T>(phase: string, operation: () => T): T;
  database<T>(operation: string, query: () => Promise<T>): Promise<T>;
  finish(): void;
};

type TraceEvent = {
  name: string;
  durationMs: number;
};

export function createRequestPerformanceTrace(
  requestName: string,
  options: {
    enabled?: boolean;
    now?: () => number;
    log?: (message: string) => void;
  } = {},
): PerformanceTrace {
  const enabled = options.enabled ?? process.env.NODE_ENV === "development";

  if (!enabled) {
    return noopTrace;
  }

  const now = options.now ?? (() => performance.now());
  const log = options.log ?? console.info;
  const startedAt = now();
  const phases: TraceEvent[] = [];
  const databaseOperations: TraceEvent[] = [];
  let finished = false;

  async function timed<T>(
    events: TraceEvent[],
    name: string,
    operation: () => Promise<T>,
  ) {
    const phaseStartedAt = now();

    try {
      return await operation();
    } finally {
      events.push({ name, durationMs: round(now() - phaseStartedAt) });
    }
  }

  return {
    measure: (phase, operation) => timed(phases, phase, operation),
    measureSync(phase, operation) {
      const phaseStartedAt = now();

      try {
        return operation();
      } finally {
        phases.push({ name: phase, durationMs: round(now() - phaseStartedAt) });
      }
    },
    database: (operation, query) =>
      timed(databaseOperations, operation, query),
    finish() {
      if (finished) {
        return;
      }

      finished = true;
      log(
        `[game-performance] ${JSON.stringify({
          request: requestName,
          applicationMs: round(now() - startedAt),
          databaseOperationCount: databaseOperations.length,
          databaseOperations,
          phases,
        })}`,
      );
    },
  };
}

const noopTrace: PerformanceTrace = {
  measure: (_phase, operation) => operation(),
  measureSync: (_phase, operation) => operation(),
  database: (_operation, query) => query(),
  finish: () => undefined,
};

function round(value: number) {
  return Math.round(value * 10) / 10;
}
