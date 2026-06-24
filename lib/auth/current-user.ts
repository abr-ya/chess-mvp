import { currentUser } from "@clerk/nextjs/server";

export type CurrentUserIdentity = {
  provider: "clerk";
  providerUserId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

export async function getCurrentUserIdentity(): Promise<CurrentUserIdentity | null> {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const primaryEmail =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null;

  return {
    provider: "clerk",
    providerUserId: user.id,
    email: primaryEmail,
    displayName: user.fullName ?? user.username ?? primaryEmail,
    avatarUrl: user.imageUrl,
  };
}
