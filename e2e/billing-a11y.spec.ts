import { test, expect, EMPTY_STATE, openWhenHydrated } from "./fixtures";
import { analyzeA11y } from "./a11y";

/** axe audit + focus order for the Tagihan Bulanan sheet (Pengaturan → Data). */
test.use({ seed: EMPTY_STATE });

test.describe("Tagihan Bulanan — accessibility", () => {
  test("the sheet, its form and its summary raise no axe violations", async ({ page }) => {
    await page.goto("/settings", { waitUntil: "domcontentloaded" });
    const row = page.getByRole("button", { name: /tagihan bulanan/i }).first();
    const sheet = page.getByTestId("billing-sheet");

    await openWhenHydrated(
      () => row.click(),
      async () => {
        await expect(sheet).toBeVisible({ timeout: 1_000 });
      },
    );

    await expect(page.getByTestId("billing-summary")).toBeVisible();
    await expect(page.getByTestId("billing-empty")).toBeVisible();

    const violations = await analyzeA11y(page, '[data-testid="billing-sheet"]');
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
    await expect(page.getByTestId("billing-icon-group")).toBeVisible();

  });

  test("form fields follow document order under Tab", async ({ page }) => {
    await page.goto("/settings", { waitUntil: "domcontentloaded" });
    const sheet = page.getByTestId("billing-sheet");
    await openWhenHydrated(
      () =>
        page
          .getByRole("button", { name: /tagihan bulanan/i })
          .first()
          .click(),
      async () => {
        await expect(sheet).toBeVisible({ timeout: 1_000 });
      },
    );

    await page.getByTestId("billing-name").focus();
    const order = [
      "billing-amount",
      "billing-due-date",
      "billing-recurring",
      "billing-tax",
      "billing-discount-mode",
      "billing-discount-value",
      "billing-phone",
      "billing-note",
      "billing-submit",
    ];
    for (const id of order) {
      await page.keyboard.press("Tab");
      const active = await page.evaluate(
        () => (document.activeElement as HTMLElement | null)?.dataset["testid"] ?? "",
      );
      expect(active, `expected focus on ${id}`).toBe(id);
    }
  });
});
