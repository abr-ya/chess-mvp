import type { EnsureLocalUserResult } from "@/lib/auth/local-user";

import {
  GameService,
  GameServiceError,
  type GameServiceErrorCode,
} from "./game-service";
import type { GameSnapshot, MoveCommand, PromotionPiece } from "./types";

export type GameApiErrorCode =
  | GameServiceErrorCode
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "INVALID_REQUEST"
  | "INTERNAL_ERROR";

export type GameApiResult =
  | { ok: true; game: GameSnapshot }
  | {
      ok: false;
      status: number;
      error: { code: GameApiErrorCode; message: string };
    };

export type GameApiDependencies = {
  ensureCurrentLocalUser(): Promise<EnsureLocalUserResult | null>;
  gameService: Pick<
    GameService,
    "createGame" | "getGameSnapshot" | "submitMove"
  >;
};

export class GameApi {
  constructor(private readonly dependencies: GameApiDependencies) {}

  async createBasicGame(): Promise<GameApiResult> {
    const auth = await this.requireUser();

    if (!auth.ok) {
      return auth.result;
    }

    return this.runGameOperation(() =>
      this.dependencies.gameService.createGame({
        ownerUserId: auth.localUser.user.id,
        mode: "manual",
        whiteUserId: auth.localUser.user.id,
        whiteDisplayName: auth.localUser.user.displayName,
      }),
    );
  }

  async getGame(gameId: string): Promise<GameApiResult> {
    const access = await this.requireGameAccess(gameId);

    if (!access.ok) {
      return access.result;
    }

    return { ok: true, game: access.game };
  }

  async submitMove(gameId: string, body: unknown): Promise<GameApiResult> {
    const access = await this.requireGameAccess(gameId);

    if (!access.ok) {
      return access.result;
    }

    const command = parseMoveCommand(gameId, body);

    if (!command) {
      return apiError(
        400,
        "INVALID_REQUEST",
        "A move requires an idempotencyKey, from, to, and optional promotion.",
      );
    }

    return this.runGameOperation(() =>
      this.dependencies.gameService.submitMove(command),
    );
  }

  private async requireGameAccess(gameId: string) {
    const auth = await this.requireUser();

    if (!auth.ok) {
      return auth;
    }

    const gameResult = await this.runGameOperation(() =>
      this.dependencies.gameService.getGameSnapshot(gameId),
    );

    if (!gameResult.ok) {
      return { ok: false as const, result: gameResult };
    }

    const isParticipant = gameResult.game.participants.some(
      (participant) => participant.userId === auth.localUser.user.id,
    );

    if (!isParticipant) {
      return {
        ok: false as const,
        result: apiError(
          403,
          "FORBIDDEN",
          "You are not a participant in this game.",
        ),
      };
    }

    return {
      ok: true as const,
      localUser: auth.localUser,
      game: gameResult.game,
    };
  }

  private async requireUser() {
    const localUser = await this.dependencies.ensureCurrentLocalUser();

    if (!localUser) {
      return {
        ok: false as const,
        result: apiError(
          401,
          "UNAUTHENTICATED",
          "Sign in to continue.",
        ),
      };
    }

    return { ok: true as const, localUser };
  }

  private async runGameOperation(
    operation: () => Promise<GameSnapshot>,
  ): Promise<GameApiResult> {
    try {
      return { ok: true, game: await operation() };
    } catch (error) {
      if (error instanceof GameServiceError) {
        return gameServiceError(error);
      }

      return apiError(
        500,
        "INTERNAL_ERROR",
        "The game operation could not be completed.",
      );
    }
  }
}

export async function createRuntimeGameApi(): Promise<GameApi> {
  const [{ ensureCurrentLocalUser }, { PrismaGameRepository }] =
    await Promise.all([
      import("@/lib/auth/local-user"),
      import("./prisma-game-repository"),
    ]);

  return new GameApi({
    ensureCurrentLocalUser,
    gameService: new GameService(new PrismaGameRepository()),
  });
}

function parseMoveCommand(gameId: string, body: unknown): MoveCommand | null {
  if (!isRecord(body)) {
    return null;
  }

  const { idempotencyKey, from, to, promotion } = body;

  if (
    !isNonEmptyString(idempotencyKey) ||
    !isSquare(from) ||
    !isSquare(to) ||
    (promotion !== undefined && !isPromotion(promotion))
  ) {
    return null;
  }

  return {
    gameId,
    idempotencyKey,
    from,
    to,
    ...(promotion ? { promotion } : {}),
  };
}

function gameServiceError(error: GameServiceError): GameApiResult {
  switch (error.code) {
    case "GAME_NOT_FOUND":
      return apiError(404, error.code, error.message);
    case "GAME_FINISHED":
      return apiError(409, error.code, error.message);
    case "INVALID_MOVE":
    case "WRONG_SIDE":
    case "INVALID_GAME_INPUT":
      return apiError(422, error.code, error.message);
  }
}

function apiError(
  status: number,
  code: GameApiErrorCode,
  message: string,
): GameApiResult {
  return { ok: false, status, error: { code, message } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isSquare(value: unknown): value is string {
  return typeof value === "string" && /^[a-h][1-8]$/.test(value);
}

function isPromotion(value: unknown): value is PromotionPiece {
  return value === "q" || value === "r" || value === "b" || value === "n";
}
