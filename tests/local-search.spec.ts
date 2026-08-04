import { expect, test } from "playwright/test";

const route = "guides/markdown-gfm";

async function semanticColor(page: import("playwright/test").Page) {
  return page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.cssText =
      "position:fixed;visibility:hidden;color:var(--muted-foreground)";
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
}

test("local search shows a semantic placeholder and Kbd shortcut", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);

  const search = page.getByRole("button", { name: "Search documentation" });
  await expect(search).toBeVisible();
  const placeholder = search.getByText("Search documentation...");
  await expect(placeholder).toBeVisible();
  await expect(search.locator('[data-slot="kbd-group"]')).toBeVisible();
  await expect(
    search.locator('[data-slot="kbd-group"] > [data-slot="kbd"]')
  ).toHaveText(["⌘", "K"]);
  expect(
    await placeholder.evaluate((element) => getComputedStyle(element).color)
  ).toBe(await semanticColor(page));

  await search.click();
  const dialog = page.getByRole("dialog", { name: "Search documentation..." });
  const input = dialog.getByPlaceholder("Search documentation...");
  await expect(input).toBeFocused();
  expect(
    await input.evaluate(
      (element) => getComputedStyle(element, "::placeholder").color
    )
  ).toBe(await semanticColor(page));

  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+K");
  await expect(dialog).toBeVisible();
});
