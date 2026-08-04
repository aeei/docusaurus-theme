import { expect, test } from "playwright/test";

const markdownRoute = "guides/markdown-gfm";
const mermaidRoute = "showcase/mermaid";

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(colorScheme, () => {
    test.use({ colorScheme });

    for (const viewport of [
      { name: "desktop", width: 1440, height: 900 },
      { name: "mobile", width: 375, height: 812 },
    ]) {
      test(`${viewport.name} image opens and closes an accessible viewer`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await page.goto(markdownRoute);
        const media = page.locator('[data-media-kind="image"]').first();
        const action = media.getByRole("button", { name: "View larger" });
        await expect(action).toBeVisible();

        const inlineBox = await media.locator("img").boundingBox();
        await action.focus();
        await page.keyboard.press("Enter");
        const dialog = page.getByRole("dialog", { name: "Hero art" });
        await expect(dialog).toBeVisible();
        const expandedBox = await dialog.locator("img").boundingBox();
        if (viewport.name === "desktop") {
          expect(expandedBox!.width).toBeGreaterThan(inlineBox!.width);
        } else {
          await expect
            .poll(async () => (await dialog.boundingBox())!.width)
            .toBeGreaterThanOrEqual(viewport.width - 32);
        }

        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(action).toBeFocused();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth)
        ).toBeLessThanOrEqual(viewport.width);
      });
    }
  });
}

test("desktop media reveals its action on hover or focus and opens on click", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(markdownRoute);
  const media = page.locator('[data-media-kind="image"]').first();
  const action = media.getByRole("button", { name: "View larger" });

  await expect(action).toHaveCSS("opacity", "0");
  await media.hover();
  await expect(action).toHaveCSS("opacity", "1");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await page.locator("h1").hover();
  await expect(action).toHaveCSS("opacity", "0");
  await action.focus();
  await expect(action).toHaveCSS("opacity", "1");

  await media.locator("img").click();
  const dialog = page.getByRole("dialog", { name: "Hero art" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(action).toBeFocused();
  await expect(action).toHaveCSS("opacity", "1");

  const linkedImage = page.getByRole("img", { name: "Linked hero art" });
  const linkedImageAnchor = page.getByRole("link").filter({ has: linkedImage });
  await expect(linkedImageAnchor).toHaveAttribute("href", /mdx-playground/);
  await expect(linkedImageAnchor.getByRole("button")).toHaveCount(0);
});

test.describe("touch media", () => {
  test.use({ hasTouch: true });

  test("hides the visual action and opens from a media tap", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(markdownRoute);
    const media = page.locator('[data-media-kind="image"]').first();
    const action = media.getByRole("button", { name: "View larger" });

    await expect(action).toHaveCSS("opacity", "0");
    await media.locator("img").tap();
    await expect(page.getByRole("dialog", { name: "Hero art" })).toBeVisible();
  });
});

test("media dialog is capped by the shared shell width token", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(markdownRoute);
  await page
    .locator('[data-media-kind="image"]')
    .first()
    .locator("img")
    .click();

  const dialog = page.getByRole("dialog", { name: "Hero art" });
  const shellMaxWidth = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;visibility:hidden;width:var(--theme-shell-max-width)";
    document.body.append(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width;
  });
  await expect
    .poll(async () => Math.round((await dialog.boundingBox())!.width))
    .toBe(Math.round(shellMaxWidth));
});

test("Mermaid viewer keeps mobile overflow inside the dialog", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(mermaidRoute);
  const media = page.locator('[data-media-kind="diagram"]').first();
  await media
    .locator(".docusaurus-mermaid-container > svg")
    .click({ position: { x: 10, y: 10 } });

  const viewport = page
    .getByRole("dialog", { name: "Diagram preview" })
    .locator(".theme-media-viewer__viewport");
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollWidth))
    .toBeGreaterThan(await viewport.evaluate((element) => element.clientWidth));
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(375);
});

test("Mermaid viewer renders unique readable SVG copies", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(mermaidRoute);
  const media = page.locator('[data-media-kind="diagram"]').first();
  const action = media.getByRole("button", { name: "View larger" });
  const inlineSvg = media.locator(".docusaurus-mermaid-container > svg");
  await expect(inlineSvg).toBeVisible();
  const inlineBox = await inlineSvg.boundingBox();
  await inlineSvg.click({ position: { x: 10, y: 10 } });

  const dialog = page.getByRole("dialog", { name: "Diagram preview" });
  await expect(dialog).toBeVisible();
  const expandedSvg = dialog.locator(".docusaurus-mermaid-container > svg");
  await expect(expandedSvg).toBeVisible();
  await expect
    .poll(async () => (await expandedSvg.boundingBox())!.width)
    .toBeGreaterThan(inlineBox!.width);
  const duplicateIds = await page.evaluate(() => {
    const ids = [...document.querySelectorAll<HTMLElement>("[id]")].map(
      (node) => node.id
    );
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  expect(duplicateIds).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(action).toBeFocused();
});
