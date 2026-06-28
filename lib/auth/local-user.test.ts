import { describe, expect, it } from "vitest";

import { AuthProvider, GameMode } from "@/lib/generated/prisma/enums";

import {
  ensureLocalUser,
  findLocalUserByProviderId,
  STARTING_RATING,
  type LocalRatingRecord,
  type LocalUserDatabase,
  type LocalUserRecord,
  type LocalUserTransaction,
} from "./local-user";

type IdentityRecord = {
  id: string;
  userId: string;
  provider: AuthProvider;
  providerUserId: string;
  email: string | null;
};

class InMemoryLocalUserDatabase implements LocalUserDatabase {
  users: LocalUserRecord[] = [];
  identities: IdentityRecord[] = [];
  ratings: LocalRatingRecord[] = [];

  private nextId = 1;

  async $transaction<T>(
    callback: (tx: LocalUserTransaction) => Promise<T>,
  ): Promise<T> {
    return callback(this.tx);
  }

  private tx: LocalUserTransaction = {
    userAuthIdentity: {
      findUnique: async ({ where }) => {
        const identity = this.identities.find(
          (item) =>
            item.provider === where.provider_providerUserId.provider &&
            item.providerUserId ===
              where.provider_providerUserId.providerUserId,
        );

        return identity ? { userId: identity.userId } : null;
      },
      upsert: async ({ where, update, create }) => {
        const identity = this.identities.find(
          (item) =>
            item.provider === where.provider_providerUserId.provider &&
            item.providerUserId ===
              where.provider_providerUserId.providerUserId,
        );

        if (identity) {
          identity.userId = update.userId;
          identity.email = update.email;
          return identity;
        }

        const created = {
          id: this.createId("identity"),
          ...create,
        };

        this.identities.push(created);

        return created;
      },
    },
    user: {
      create: async ({ data }) => {
        const user = {
          id: this.createId("user"),
          ...data,
        };

        this.users.push(user);

        return user;
      },
      update: async ({ where, data }) => {
        const user = this.users.find((item) => item.id === where.id);

        if (!user) {
          throw new Error(`User ${where.id} was not found.`);
        }

        Object.assign(user, data);

        return user;
      },
    },
    rating: {
      upsert: async ({ where, create }) => {
        const rating = this.ratings.find(
          (item) =>
            item.userId === where.userId_mode.userId &&
            item.mode === where.userId_mode.mode,
        );

        if (rating) {
          return rating;
        }

        const created = {
          id: this.createId("rating"),
          ...create,
        };

        this.ratings.push(created);

        return created;
      },
    },
  };

  private createId(prefix: string) {
    const id = `${prefix}-${this.nextId}`;
    this.nextId += 1;

    return id;
  }
}

describe("ensureLocalUser", () => {
  it("creates a local user, Clerk identity, and default manual rating", async () => {
    const db = new InMemoryLocalUserDatabase();
    const now = new Date("2026-06-25T10:00:00.000Z");

    const result = await ensureLocalUser(
      {
        provider: "clerk",
        providerUserId: "clerk-user-1",
        email: "player@example.com",
        displayName: "Player One",
        avatarUrl: "https://example.com/avatar.png",
      },
      db,
      { now },
    );

    expect(result.user).toMatchObject({
      email: "player@example.com",
      displayName: "Player One",
      avatarUrl: "https://example.com/avatar.png",
      lastSeenAt: now,
    });
    expect(db.identities).toEqual([
      expect.objectContaining({
        userId: result.user.id,
        provider: AuthProvider.CLERK,
        providerUserId: "clerk-user-1",
        email: "player@example.com",
      }),
    ]);
    expect(result.rating).toMatchObject({
      userId: result.user.id,
      mode: GameMode.MANUAL,
      value: STARTING_RATING,
    });
  });

  it("updates the existing local user without creating duplicate records", async () => {
    const db = new InMemoryLocalUserDatabase();

    const first = await ensureLocalUser(
      {
        provider: "clerk",
        providerUserId: "clerk-user-1",
        email: "old@example.com",
        displayName: "Old Name",
        avatarUrl: null,
      },
      db,
      { now: new Date("2026-06-25T10:00:00.000Z") },
    );

    const secondSeenAt = new Date("2026-06-25T11:00:00.000Z");
    const second = await ensureLocalUser(
      {
        provider: "clerk",
        providerUserId: "clerk-user-1",
        email: "new@example.com",
        displayName: "New Name",
        avatarUrl: "https://example.com/new.png",
      },
      db,
      { now: secondSeenAt },
    );

    expect(second.user.id).toBe(first.user.id);
    expect(second.rating.id).toBe(first.rating.id);
    expect(db.users).toHaveLength(1);
    expect(db.identities).toHaveLength(1);
    expect(db.ratings).toHaveLength(1);
    expect(second.user).toMatchObject({
      email: "new@example.com",
      displayName: "New Name",
      avatarUrl: "https://example.com/new.png",
      lastSeenAt: secondSeenAt,
    });
    expect(db.identities[0]).toMatchObject({
      userId: first.user.id,
      email: "new@example.com",
    });
  });
});

describe("findLocalUserByProviderId", () => {
  it("returns an existing user and rating without performing synchronization writes", async () => {
    const lastSeenAt = new Date("2026-06-25T10:00:00.000Z");
    const findUnique = async () => ({
      user: {
        id: "user-1",
        email: "player@example.com",
        displayName: "Player One",
        avatarUrl: null,
        lastSeenAt,
        ratings: [
          {
            id: "rating-1",
            userId: "user-1",
            mode: GameMode.MANUAL,
            value: 1200,
          },
        ],
      },
    });

    const result = await findLocalUserByProviderId("clerk-user-1", {
      userAuthIdentity: { findUnique },
    });

    expect(result).toEqual({
      user: {
        id: "user-1",
        email: "player@example.com",
        displayName: "Player One",
        avatarUrl: null,
        lastSeenAt,
      },
      rating: {
        id: "rating-1",
        userId: "user-1",
        mode: GameMode.MANUAL,
        value: 1200,
      },
    });
  });

  it("returns null when the identity or default rating is missing", async () => {
    const result = await findLocalUserByProviderId("new-clerk-user", {
      userAuthIdentity: { findUnique: async () => null },
    });

    expect(result).toBeNull();
  });
});
