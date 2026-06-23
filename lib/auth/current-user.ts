export type CurrentUserIdentity = {
  provider: "clerk";
  providerUserId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

export async function getCurrentUserIdentity(): Promise<CurrentUserIdentity | null> {
  return null;
}
