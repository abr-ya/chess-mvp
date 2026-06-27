import { expect, test, type Page } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const createdGameIds: string[] = [];

test.afterAll(async () => {
  await pool.end();
});

test.afterEach(async () => {
  if (createdGameIds.length) {
    const ids = createdGameIds.splice(0);
    await pool.query('DELETE FROM "Game" WHERE id = ANY($1::text[])', [ids]);
  }
});

test("persists a complete authenticated game flow", async ({ page }) => {
  const primaryEmail = requiredEnvironmentVariable(
    "E2E_CLERK_USER_EMAIL",
  );

  await page.goto("/");
  await clerk.signIn({ page, emailAddress: primaryEmail });
  await page.goto("/play");
  await page.getByRole("button", { name: "New game" }).click();
  await page.waitForURL(/\/games\/[^/]+$/);

  const gameId = new URL(page.url()).pathname.split("/").at(-1);
  expect(gameId).toBeTruthy();
  createdGameIds.push(gameId!);

  await expect(page.getByRole("heading", { name: "Manual game" })).toBeVisible();
  await expect(page.getByText("No moves yet.")).toBeVisible();

  const createdGame = await pool.query(
    'SELECT id FROM "Game" WHERE id = $1',
    [gameId],
  );
  const participants = await pool.query(
    'SELECT id FROM "GameParticipant" WHERE "gameId" = $1',
    [gameId],
  );
  expect(createdGame.rowCount).toBe(1);
  expect(participants.rowCount).toBe(2);

  await clickMove(page, gameId!, "f2", "f3");
  await expect(page.getByText("f3", { exact: true })).toBeVisible();

  const firstStoredMove = await pool.query<{
    san: string;
    fenAfter: string;
  }>(
    'SELECT san, "fenAfter" FROM "Move" WHERE "gameId" = $1 ORDER BY "moveNumber" ASC LIMIT 1',
    [gameId],
  );
  const gameAfterFirstMove = await pool.query<{ currentFen: string }>(
    'SELECT "currentFen" FROM "Game" WHERE id = $1',
    [gameId],
  );
  expect(firstStoredMove.rows[0]?.san).toBe("f3");
  expect(firstStoredMove.rows[0]?.fenAfter).toBe(
    gameAfterFirstMove.rows[0]?.currentFen,
  );

  await page.reload();
  await expect(page.getByText("f3", { exact: true })).toBeVisible();

  await clickMove(page, gameId!, "e7", "e5");
  await clickMove(page, gameId!, "g2", "g4");
  await clickMove(page, gameId!, "d8", "h4");

  await expect(page.getByText("Completed", { exact: true })).toBeVisible();
  await expect(page.getByText("Black wins", { exact: true })).toBeVisible();
  await expect(page.getByText("checkmate", { exact: true })).toBeVisible();

  const completedGame = await pool.query<{
    status: string;
    terminationReason: string | null;
  }>(
    'SELECT status, "terminationReason" FROM "Game" WHERE id = $1',
    [gameId],
  );
  const completedMoves = await pool.query(
    'SELECT id FROM "Move" WHERE "gameId" = $1',
    [gameId],
  );
  expect(completedGame.rows[0]?.status).toBe("COMPLETED");
  expect(completedGame.rows[0]?.terminationReason).toBe("CHECKMATE");
  expect(completedMoves.rowCount).toBe(4);

  const rejectedMove = await page.request.post(`/api/games/${gameId}/moves`, {
    data: {
      idempotencyKey: "move-after-completion",
      from: "e2",
      to: "e4",
    },
  });
  expect(rejectedMove.status()).toBe(409);

});

async function clickMove(
  page: Page,
  gameId: string,
  from: string,
  to: string,
) {
  await page.locator(`[id="game-${gameId}-square-${from}"]`).click();
  await page.locator(`[id="game-${gameId}-square-${to}"]`).click();
  await expect(page.getByText("Submitting move…")).toBeHidden();
}

function requiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required to run authenticated E2E tests.`);
  }

  return value;
}
