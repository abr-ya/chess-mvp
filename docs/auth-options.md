# Authentication System Options

## Decision Context

The chess platform needs user accounts because games, ratings, PGN history, and future features such as tournaments and analysis are tied to a stable user identity.

The desired authentication options are:

- Google sign-in in the MVP or very early after it;
- possible Facebook sign-in later;
- email-based sign-in as a fallback or primary option;
- an account model that can support browser, mobile, and desktop clients.

## Key Recommendation

Do not build the full authentication system from scratch for the MVP.

Authentication quickly becomes a separate security-sensitive product area: password storage, email verification, password reset, session refresh, OAuth callbacks, CSRF protection, account linking, multi-device sessions, abuse prevention, and future mobile login flows.

The recommended MVP direction is:

- use a managed or well-established authentication system;
- store a local application `User` record in our database;
- link the local user to the external auth identity;
- require Google sign-in support;
- keep Facebook sign-in optional until after the MVP.

## Recommended MVP Requirement

The MVP should support:

- external authentication provider integration;
- Google sign-in;
- email-based sign-in, either password-based or magic-link/code-based;
- local user profile creation after first successful login;
- stable internal `userId` used by games, ratings, and history;
- sign-out;
- session validation for API and WebSocket requests.

The MVP may postpone:

- Facebook sign-in;
- Apple sign-in;
- enterprise SSO;
- multi-factor authentication;
- account deletion self-service;
- full admin user management UI.

## Local User Model

The application should not use provider-specific user IDs directly as domain IDs.

Recommended fields:

- `id`: internal application user ID;
- `email`;
- `displayName`;
- `avatarUrl`;
- `authProvider`;
- `authProviderUserId`;
- `createdAt`;
- `updatedAt`;
- `lastSeenAt`.

If multiple login providers are supported for one user later, split auth identities into a separate table:

- `User`;
- `UserAuthIdentity`.

`UserAuthIdentity` fields:

- `id`;
- `userId`;
- `provider`: `google`, `facebook`, `email`, `apple`, etc.;
- `providerUserId`;
- `emailAtProvider`;
- `createdAt`;
- `updatedAt`.

## Option A. Clerk

Clerk is a strong choice if the first implementation uses Next.js or React and the priority is fast delivery.

Pros:

- polished prebuilt sign-in and user profile components;
- good Next.js and React developer experience;
- social login support, including Google and Facebook;
- session handling and webhooks;
- useful path toward mobile clients.

Cons:

- vendor lock-in;
- pricing and free-tier limits must be checked before production;
- application UI and user-management flows may become shaped by Clerk's model.

Best fit:

- fastest practical MVP;
- Next.js-first implementation;
- small team that wants to avoid owning auth complexity early.

## Option B. Kinde

Kinde is a good option if the platform may later need a broader identity/product layer, such as billing, permissions, organizations, or feature flags.

Pros:

- managed authentication with social sign-in support;
- good fit for API-first products;
- useful adjacent product features for later phases;
- less custom security work than building from scratch.

Cons:

- still a managed-provider dependency;
- UI and SDK experience should be validated against the chosen frontend stack;
- pricing and plan limits must be checked before production.

Best fit:

- product expected to grow into subscriptions, feature gates, or organization-like structures;
- team wants managed auth but with a broader product platform direction.

## Option C. Auth.js

Auth.js is a strong choice if the project wants more control and less vendor lock-in.

Pros:

- open-source;
- supports common OAuth providers such as Google and Facebook;
- can store sessions and accounts in the application database;
- flexible for custom backend architecture.

Cons:

- more implementation work;
- more responsibility for secure session design and provider edge cases;
- fewer complete user-management features out of the box than managed providers.

Best fit:

- team wants ownership and portability;
- custom backend architecture is more important than speed;
- there is capacity to maintain auth flows carefully.

## Option D. Supabase Auth

Supabase Auth is attractive if the project chooses Supabase as the main backend platform.

Pros:

- authentication, Postgres, and realtime capabilities in one ecosystem;
- social login support;
- simple path for browser and mobile clients;
- useful for fast prototypes.

Cons:

- strongest when the project also adopts Supabase broadly;
- less compelling if the backend is custom Node/Next.js with a separate database layer;
- platform lock-in should be considered.

Best fit:

- Supabase-first stack;
- fast prototype where database, auth, and realtime are intentionally bundled.

## Option E. Custom Authentication From Scratch

Building custom auth from scratch is not recommended for the MVP.

Potential advantages:

- maximum control;
- no provider dependency;
- exact match to the product model.

Major drawbacks:

- high security risk;
- slower MVP;
- many non-chess features to implement and maintain;
- more complex mobile and desktop authentication later;
- OAuth account linking is easy to get wrong.

Best fit:

- only if there is a strict requirement to avoid external auth providers and the team has security/auth expertise.

## Suggested Decision

For the first MVP, choose one of these paths:

- **Preferred fast path:** Clerk with Google sign-in and email sign-in.
- **Preferred control path:** Auth.js with Google sign-in and email sign-in.
- **Platform path:** Kinde if billing, permissions, and product gates are likely to matter soon.

Facebook sign-in should be treated as post-MVP unless there is a clear audience reason to include it immediately. Google is usually enough for the first social-login path and has lower product complexity.

## Architecture Notes

- The chess domain must use the internal `User.id`, not the external provider ID.
- Games, ratings, participants, and history should reference the internal user ID.
- WebSocket authentication must validate the same session/token as HTTP requests.
- Auth provider webhooks should create or update the local user profile.
- If the provider is changed later, game history should remain attached to the same internal users.

## Open Questions

- Which frontend/backend stack will be used for the MVP?
- Is email/password required, or is email code/magic-link acceptable?
- Should the MVP allow only registered users, or also guest games?
- Should Facebook sign-in be included before launch or kept as a later enhancement?
- Do we need bilingual authentication screens from day one?
