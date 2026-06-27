import { AuthProvider, GameMode } from "@/lib/generated/prisma/enums";

import { getCurrentUserIdentity, type CurrentUserIdentity } from "./current-user";

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

export async function ensureCurrentLocalUser(
  db?: LocalUserDatabase,
): Promise<EnsureLocalUserResult | null> {
  const identity = await getCurrentUserIdentity();

  if (!identity) {
    return null;
  }

  if (db) {
    return ensureLocalUser(identity, db);
  }

  const { prisma } = await import("@/lib/persistence/prisma");

  return ensureLocalUser(identity, prisma);
}

export async function ensureLocalUser(
  identity: CurrentUserIdentity,
  db: LocalUserDatabase,
  options: { now?: Date } = {},
): Promise<EnsureLocalUserResult> {
  const provider = toAuthProvider(identity.provider);
  const lastSeenAt = options.now ?? new Date();

  return db.$transaction(async (tx) => {
    const existingIdentity = await tx.userAuthIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId: identity.providerUserId,
        },
      },
    });

    const userData = {
      email: identity.email,
      displayName: identity.displayName,
      avatarUrl: identity.avatarUrl,
      lastSeenAt,
    };

    const user = existingIdentity
      ? await tx.user.update({
          where: {
            id: existingIdentity.userId,
          },
          data: userData,
        })
      : await tx.user.create({
          data: userData,
        });

    await tx.userAuthIdentity.upsert({
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
    });

    const rating = await tx.rating.upsert({
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
    });

    return {
      user,
      rating,
    };
  });
}

function toAuthProvider(provider: CurrentUserIdentity["provider"]): AuthProvider {
  switch (provider) {
    case "clerk":
      return AuthProvider.CLERK;
  }
}
