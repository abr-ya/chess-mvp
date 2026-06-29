import { expect, test } from "@playwright/test";

const customFen = "4k3/8/8/3pP3/8/8/8/4K3 w - d6 7 42";

test("builds a position visually and round-trips it through FEN", async ({
  page,
}) => {
  await page.goto("/analysis/setup");

  const fenInput = page.getByRole("textbox", { name: "FEN position" });
  await expect(
    page.getByRole("heading", { name: "Set up a position" }),
  ).toBeVisible();
  await expect(page.getByText("Position is valid.")).toBeVisible();

  await fenInput.fill(customFen);
  await page.getByRole("button", { name: "Load FEN" }).click();

  await expect(fenInput).toHaveValue(customFen);
  await expect(page.getByText("Position is valid.")).toBeVisible();

  await page.getByRole("button", { name: "White queen" }).click();
  await page.locator('[id="position-setup-square-d4"]').click();
  await expect(fenInput).toHaveValue(
    "4k3/8/8/3pP3/3Q4/8/8/4K3 w - d6 7 42",
  );

  await page.getByRole("button", { name: "Black", exact: true }).click();
  await expect(fenInput).toHaveValue(
    "4k3/8/8/3pP3/3Q4/8/8/4K3 b - d6 7 42",
  );

  await fenInput.fill("not a fen");
  await page.getByRole("button", { name: "Load FEN" }).click();
  await expect(fenInput).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#fen-feedback")).not.toBeEmpty();
});
