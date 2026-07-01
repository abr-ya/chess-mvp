import type { EnsureLocalUserResult } from "@/lib/auth/local-user";
import type { GameSnapshot } from "@/lib/game/types";

import { PgnImportService, PgnImportServiceError } from "./import-service";

export type PgnImportApiErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_REQUEST"
  | "INVALID_PGN"
  | "PGN_TOO_LARGE"
  | "INTERNAL_ERROR";

export type PgnImportApiResult =
  | { ok: true; game: GameSnapshot }
  | {
      ok: false;
      status: number;
      error: {
        code: PgnImportApiErrorCode;
        message: string;
      };
    };

export type PgnImportApiDependencies = {
  ensureCurrentLocalUser(): Promise<EnsureLocalUserResult | null>;
  importService: Pick<PgnImportService, "importGame">;
};

export class PgnImportApi {
  constructor(private readonly dependencies: PgnImportApiDependencies) {}

  async importGame(body: unknown): Promise<PgnImportApiResult> {
    const localUser = await this.dependencies.ensureCurrentLocalUser();

    if (!localUser) {
      return apiError(401, "UNAUTHENTICATED", "Sign in to continue.");
    }

    if (!isRecord(body) || typeof body.pgn !== "string") {
      return apiError(400, "INVALID_REQUEST", "A PGN string is required.");
    }

    try {
      return {
        ok: true,
        game: await this.dependencies.importService.importGame(
          localUser.user.id,
          body.pgn,
        ),
      };
    } catch (error) {
      if (error instanceof PgnImportServiceError) {
        return apiError(422, error.code, error.message);
      }

      return apiError(
        500,
        "INTERNAL_ERROR",
        "The PGN could not be imported.",
      );
    }
  }
}

export async function createRuntimePgnImportApi() {
  const [{ resolveCurrentLocalUser }, { PrismaPgnImportRepository }] =
    await Promise.all([
      import("@/lib/auth/local-user"),
      import("./prisma-import-repository"),
    ]);

  return new PgnImportApi({
    ensureCurrentLocalUser: () => resolveCurrentLocalUser(),
    importService: new PgnImportService(new PrismaPgnImportRepository()),
  });
}

function apiError(
  status: number,
  code: PgnImportApiErrorCode,
  message: string,
): PgnImportApiResult {
  return { ok: false, status, error: { code, message } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
