import { AuthProvider, GameMode } from "@/lib/generated/prisma/enums";
import type { PerformanceTrace } from "@/lib/observability/request-performance";

import {
  getCurrentProviderUserId,
  getCurrentUserIdentity,
  type CurrentUserIdentity,
} from "./current-user";

export const STARTING_RATING = 1200;

export type LocalUserRecord = {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  lastSeenAt: Date;
};

export type LocalRatingRecord = {
  id: string;
  userId: string;
  mode: GameMode;
  value: number;
};

type LocalUserAuthIdentityRecord = {
  userId: string;
};

export type EnsureLocalUserResult = {
  user: LocalUserRecord;
  rating: LocalRatingRecord;
};

export type LocalUserTransaction = {
  userAuthIdentity: {
    findUnique(args: {
      where: {
        provider_providerUserId: {
          provider: AuthProvider;
          providerUserId: string;
        };
      };
    }): Promise<LocalUserAuthIdentityRecord | null>;
    upsert(args: {
      where: {
        provider_providerUserId: {
          provider: AuthProvider;
          providerUserId: string;
        };
      };
      update: {
        userId: string;
        email: string | null;
      };
      create: {
        userId: string;
        provider: AuthProvider;
        providerUserId: string;
        email: string | null;
      };
    }): Promise<unknown>;
  };
  user: {
    create(args: {
      data: {
        email: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        lastSeenAt: Date;
      };
    }): Promise<LocalUserRecord>;
    update(args: {
      where: {
        id: string;
      };
      data: {
        email: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        lastSeenAt: Date;
      };
    }): Promise<LocalUserRecord>;
  };
  rating: {
    upsert(args: {
      where: {
        userId_mode: {
          userId: string;
          mode: GameMode;
        };
      };
      update: Record<string, never>;
      create: {
        userId: string;
        mode: GameMode;
        value: number;
      };
    }): Promise<LocalRatingRecord>;
  };
};

export type LocalUserDatabase = {
  $transaction<T>(callback: (tx: LocalUserTransaction) => Promise<T>): Promise<T>;
};

export type LocalUserRequestDatabase = {
  userAuthIdentity: {
    findUnique(args: {
      where: {
        provider_providerUserId: {
          provider: AuthProvider;
          providerUserId: string;
        };
      };
      select: {
        user: {
          select: {
            id: true;
            email: true;
            displayName: true;
            avatarUrl: true;
            lastSeenAt: true;
            ratings: {
              where: { mode: GameMode };
              take: 1;
              select: {
                id: true;
                userId: true;
                mode: true;
                value: true;
              };
            };
          };
        };
      };
    }): Promise<{ user: LocalUserRecord & { ratings: LocalRatingRecord[] } } | null>;
  };
};

export async function resolveCurrentLocalUser(
  db?: LocalUserRequestDatabase & LocalUserDatabase,
  trace?: PerformanceTrace,
): Promise<EnsureLocalUserResult | null> {
  const providerUserId = await getCurrentProviderUserId();

  if (!providerUserId) {
    return null;
  }

  const databaseClient = db ?? (await import("@/lib/persistence/prisma")).prisma;
  const existing = await findLocalUserByProviderId(
    providerUserId,
    databaseClient,
    trace,
  );

  if (existing) {
    return existing;
  }

  return ensureCurrentLocalUser(databaseClient, trace);
}

export async function findLocalUserByProviderId(
  providerUserId: string,
  db: LocalUserRequestDatabase,
  trace?: PerformanceTrace,
): Promise<EnsureLocalUserResult | null> {
  const identity = await database(trace, "userAuthIdentity.findUnique.fast", () =>
    db.userAuthIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.CLERK,
          providerUserId,
        },
      },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
            lastSeenAt: true,
            ratings: {
              where: { mode: GameMode.MANUAL },
              take: 1,
              select: {
                id: true,
                userId: true,
                mode: true,
                value: true,
              },
            },
          },
        },
      },
    }),
  );
  const rating = identity?.user.ratings[0];

  if (!identity || !rating) {
    return null;
  }

  const user: LocalUserRecord = {
    id: identity.user.id,
    email: identity.user.email,
    displayName: identity.user.displayName,
    avatarUrl: identity.user.avatarUrl,
    lastSeenAt: identity.user.lastSeenAt,
  };

  return { user, rating };
}

export async function ensureCurrentLocalUser(
  db?: LocalUserDatabase,
  trace?: PerformanceTrace,
): Promise<EnsureLocalUserResult | null> {
  const identity = await getCurrentUserIdentity();

  if (!identity) {
    return null;
  }

  if (db) {
    return ensureLocalUser(identity, db, { trace });
  }

  const { prisma } = await import("@/lib/persistence/prisma");

  return ensureLocalUser(identity, prisma, { trace });
}

export async function ensureLocalUser(
  identity: CurrentUserIdentity,
  db: LocalUserDatabase,
  options: { now?: Date; trace?: PerformanceTrace } = {},
): Promise<EnsureLocalUserResult> {
  const provider = toAuthProvider(identity.provider);
  const lastSeenAt = options.now ?? new Date();

  return database(options.trace, "user-sync.transaction", () => db.$transaction(async (tx) => {
    const existingIdentity = await database(options.trace, "userAuthIdentity.findUnique", () => tx.userAuthIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId: identity.providerUserId,
        },
      },
    }));

    const userData = {
      email: identity.email,
      displayName: identity.displayName,
      avatarUrl: identity.avatarUrl,
      lastSeenAt,
    };

    const user = existingIdentity
      ? await database(options.trace, "user.update", () => tx.user.update({
          where: {
            id: existingIdentity.userId,
          },
          data: userData,
        }))
      : await database(options.trace, "user.create", () => tx.user.create({
          data: userData,
        }));

    await database(options.trace, "userAuthIdentity.upsert", () => tx.userAuthIdentity.upsert({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId: identity.providerUserId,
        },
      },
      update: {
        userId: user.id,
        email: identity.email,
      },
      create: {
        userId: user.id,
        provider,
        providerUserId: identity.providerUserId,
        email: identity.email,
      },
    }));

    const rating = await database(options.trace, "rating.upsert", () => tx.rating.upsert({
      where: {
        userId_mode: {
          userId: user.id,
          mode: GameMode.MANUAL,
        },
      },
      update: {},
      create: {
        userId: user.id,
        mode: GameMode.MANUAL,
        value: STARTING_RATING,
      },
    }));

    return {
      user,
      rating,
    };
  }));
}

function database<T>(
  trace: PerformanceTrace | undefined,
  operation: string,
  query: () => Promise<T>,
) {
  return trace ? trace.database(operation, query) : query();
}

function toAuthProvider(provider: CurrentUserIdentity["provider"]): AuthProvider {
  switch (provider) {
    case "clerk":
      return AuthProvider.CLERK;
  }
}
