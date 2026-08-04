import { expect, test } from "playwright/test";

const markdownRoute = "guides/markdown-gfm";
const mdxRoute = "showcase/mdx-playground";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("theme")) localStorage.setItem("theme", "dark");
  });
});

test("primary routes emit no runtime or accessibility errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  for (const route of ["", markdownRoute, mdxRoute, "showcase/mermaid"]) {
    await page.goto(route);
  }

  expect(errors).toEqual([]);
});

test("desktop GNB uses one official NavigationMenu with unwrapped links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(mdxRoute);

  const left = page.locator(".navbar__items:not(.navbar__items--right)");
  const navigation = left.locator('[data-slot="navigation-menu"]');
  const list = navigation.locator('[data-slot="navigation-menu-list"]');
  const directLink = list.getByRole("link", { name: "Docs", exact: true });
  const trigger = list.getByRole("button", { name: "Showcase", exact: true });

  await expect(navigation).toHaveCount(1);
  await expect(directLink).toHaveCSS("height", "36px");
  await expect(trigger).toHaveCSS("height", "36px");
  await expect(directLink).toHaveCSS("font-weight", "500");
  await expect(trigger).toHaveCSS("font-weight", "500");

  const brand = page.locator(".navbar__brand");
  const gap = await brand.evaluate(
    (element, action) => {
      const brandRect = element.getBoundingClientRect();
      const actionRect = (action as Element).getBoundingClientRect();
      return actionRect.left - brandRect.right;
    },
    await directLink.elementHandle()
  );
  expect(gap).toBe(8);

  await trigger.click();
  const content = page.locator('[data-slot="navigation-menu-content"]');
  const longLink = content.getByRole("link", { name: "Markdown + GFM" });
  await expect(longLink).toBeVisible();
  await expect
    .poll(async () => (await longLink.boundingBox())?.height)
    .toBe(36);
  const textMetrics = await longLink.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return {
      lines: range.getClientRects().length,
      height: element.getBoundingClientRect().height,
      whiteSpace: getComputedStyle(element).whiteSpace,
    };
  });
  expect(textMetrics).toEqual({
    lines: 1,
    height: 36,
    whiteSpace: "normal",
  });
});

test("wide desktop shell centers GNB, LNB, content, TOC, and footer", async ({
  page,
}) => {
  for (const width of [1920, 2736]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(markdownRoute);
    const shellLeft = (width - 1440) / 2;
    const metrics = await page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector(selector);
        const value = element?.getBoundingClientRect();
        return value
          ? { x: value.x, right: value.right, width: value.width }
          : null;
      };
      const textLeft = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const range = document.createRange();
        range.selectNodeContents(element);
        return range.getClientRects()[0]?.x ?? null;
      };
      const navbar = document.querySelector(".navbar");
      const blur = navbar ? getComputedStyle(navbar, "::before") : null;
      return {
        navbarInner: rect(".navbar__inner"),
        brand: rect(".navbar__brand"),
        wrapper: rect(".theme-doc-root-layout > main > .container-wrapper"),
        sidebar: rect(
          ".theme-doc-sidebar-desktop [data-slot='sidebar-container']"
        ),
        firstSidebarItem: rect(
          ".theme-doc-sidebar-desktop [data-slot='sidebar-menu-button']"
        ),
        firstSidebarTextLeft: textLeft(
          ".theme-doc-sidebar-desktop [data-slot='sidebar-menu-button']"
        ),
        docs: rect('[data-slot="docs"]'),
        content: rect(".theme-doc-page__content"),
        toc: rect(".theme-doc-page__toc"),
        footer: rect(".footer > .container"),
        navbar: navbar
          ? {
              position: getComputedStyle(navbar).position,
              background: getComputedStyle(navbar).backgroundColor,
            }
          : null,
        blur: blur
          ? {
              backdropFilter: blur.backdropFilter,
              borderBottomWidth: blur.borderBottomWidth,
              background: blur.backgroundColor,
            }
          : null,
      };
    });

    expect(metrics).toMatchObject({
      navbarInner: {
        x: shellLeft + 24,
        right: shellLeft + 1416,
        width: 1392,
      },
      brand: { x: shellLeft + 24 },
      wrapper: { x: shellLeft, right: shellLeft + 1440, width: 1440 },
      sidebar: { x: shellLeft, width: 288 },
      firstSidebarItem: { x: shellLeft + 16, width: 264 },
      firstSidebarTextLeft: shellLeft + 24,
      docs: { x: shellLeft + 288, right: shellLeft + 1440, width: 1152 },
      content: { x: width / 2 - 320, right: width / 2 + 320, width: 640 },
      toc: {
        x: shellLeft + 1152,
        right: shellLeft + 1440,
        width: 288,
      },
      footer: { x: shellLeft, right: shellLeft + 1440, width: 1440 },
      navbar: { position: "sticky", background: "rgba(0, 0, 0, 0)" },
      blur: {
        backdropFilter: "blur(12px)",
        borderBottomWidth: "1px",
      },
    });
    expect(metrics.blur?.background).not.toBe("rgba(0, 0, 0, 0)");
  }
});

test("desktop LNB stays sticky until the page footer boundary", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("");

  const sidebar = page.locator(".theme-doc-sidebar-desktop");
  const sidebarFooter = sidebar.locator('[data-slot="sidebar-footer"]');
  const pageFooter = page.getByRole("contentinfo");
  await expect(sidebar).toHaveCSS("position", "sticky");
  await expect(sidebar).toHaveCSS("top", "64px");

  await page.evaluate(() => scrollTo(0, 200));
  await expect.poll(async () => (await sidebar.boundingBox())?.y).toBe(64);

  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await expect
    .poll(async () => {
      const [sidebarBox, sidebarFooterBox, pageFooterBox] = await Promise.all([
        sidebar.boundingBox(),
        sidebarFooter.boundingBox(),
        pageFooter.boundingBox(),
      ]);
      if (!sidebarBox || !sidebarFooterBox || !pageFooterBox) return null;
      return {
        sidebarBoundaryDelta:
          sidebarBox.y + sidebarBox.height - pageFooterBox.y,
        sidebarFooterBoundaryDelta:
          sidebarFooterBox.y + sidebarFooterBox.height - pageFooterBox.y,
      };
    })
    .toEqual({
      sidebarBoundaryDelta: 0,
      sidebarFooterBoundaryDelta: 0,
    });
});

test("desktop LNB controls change category and rail state", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(markdownRoute);

  const sidebar = page.getByRole("navigation", { name: "Docs sidebar" });
  const desktopSurface = await page.evaluate(() => {
    const container = document.querySelector(
      ".theme-doc-sidebar-desktop [data-slot='sidebar-container']"
    );
    const inner = document.querySelector(
      ".theme-doc-sidebar-desktop [data-slot='sidebar-inner']"
    );
    const content = document.querySelector(
      ".theme-doc-sidebar-desktop [data-slot='sidebar-content']"
    );
    const probe = document.createElement("div");
    probe.style.backgroundColor = "var(--background)";
    document.body.append(probe);
    const expectedBackground = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return {
      background: inner ? getComputedStyle(inner).backgroundColor : null,
      expectedBackground,
      borderRightWidth: container
        ? getComputedStyle(container).borderRightWidth
        : null,
      scrollFade: content
        ? {
            maskImage: getComputedStyle(content).maskImage,
            animationTimeline:
              getComputedStyle(content).getPropertyValue("animation-timeline"),
          }
        : null,
    };
  });
  expect(desktopSurface).toMatchObject({
    background: desktopSurface.expectedBackground,
    expectedBackground: desktopSurface.expectedBackground,
    borderRightWidth: "0px",
  });
  expect(desktopSurface.scrollFade?.maskImage).not.toBe("none");
  expect(desktopSurface.scrollFade?.animationTimeline).toContain("scroll");
  const fadeStates = await page
    .locator(".theme-doc-sidebar-desktop [data-slot='sidebar-content']")
    .evaluate(async (element) => {
      const content = element as HTMLElement;
      const spacer = document.createElement("div");
      spacer.style.height = "1000px";
      spacer.style.flexShrink = "0";
      content.append(spacer);
      content.style.flex = "none";
      content.style.height = "96px";
      const settle = () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        );
      const read = () => {
        const style = getComputedStyle(content);
        const isActive = (value: string) =>
          value !== "0px" && !value.includes("(0 *");
        return {
          top: isActive(style.getPropertyValue("--scroll-fade-t")),
          bottom: isActive(style.getPropertyValue("--scroll-fade-b")),
        };
      };
      content.scrollTop = 0;
      await settle();
      const start = read();
      content.scrollTop = content.scrollHeight / 2;
      await settle();
      const middle = read();
      content.scrollTop = content.scrollHeight;
      await settle();
      const end = read();
      spacer.remove();
      content.style.removeProperty("flex");
      content.style.removeProperty("height");
      content.scrollTop = 0;
      return { start, middle, end };
    });
  expect(fadeStates).toEqual({
    start: { top: false, bottom: true },
    middle: { top: true, bottom: true },
    end: { top: true, bottom: false },
  });

  const sidebarGroup = page
    .locator('[data-slot="sidebar-group"]')
    .filter({ has: sidebar });
  const firstMenuItem = sidebar
    .locator('[data-slot="sidebar-menu-button"]')
    .first();
  await expect(sidebarGroup).toHaveCSS("padding", "8px");
  await expect
    .poll(async () => {
      const box = await firstMenuItem.boundingBox();
      return box && { x: box.x, width: box.width, height: box.height };
    })
    .toEqual({ x: 16, width: 264, height: 32 });

  const category = sidebar.getByRole("button", { name: "Guides", exact: true });
  const child = sidebar.getByRole("link", { name: "Markdown and GFM" });

  await expect(category).toHaveAttribute("aria-expanded", "true");
  await category.click();
  await expect(category).toHaveAttribute("aria-expanded", "false");
  await expect(child).toBeHidden();
  await category.click();
  await expect(category).toHaveAttribute("aria-expanded", "true");
  await expect(child).toBeVisible();

  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(
    page.getByRole("button", { name: "Expand sidebar" })
  ).toBeVisible();
  await expect(
    sidebar.getByRole("link", { name: "Starter overview" })
  ).toHaveCount(0);
  await expect(
    page
      .locator(".theme-doc-sidebar-desktop")
      .getByRole("button", { name: /Color theme:/ })
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("[data-slot='sidebar-gap']")
        .evaluate((element) => element.getBoundingClientRect().width)
    )
    .toBe(80);
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await expect(
    page.getByRole("button", { name: "Collapse sidebar" })
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("[data-slot='sidebar-gap']")
        .evaluate((element) => element.getBoundingClientRect().width)
    )
    .toBe(288);
});

test("desktop columns share one text start and TOC scroll-fades links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(markdownRoute);

  const result = await page.evaluate(() => {
    const navbar = document.querySelector(".navbar");
    const rail = document.querySelector(".theme-doc-page__toc");
    const header = document.querySelector(".theme-doc-toc-desktop__header");
    const scroll = document.querySelector(".theme-doc-toc-desktop__scroll");
    const lnbItem = document.querySelector(
      ".theme-doc-sidebar-desktop [data-slot='sidebar-menu-button']"
    );
    const breadcrumb = document.querySelector('[data-slot="breadcrumb"]');
    const firstTocLink = document.querySelector(
      ".theme-doc-toc-desktop__list .table-of-contents__link"
    );
    if (
      !navbar ||
      !rail ||
      !header ||
      !scroll ||
      !lnbItem ||
      !breadcrumb ||
      !firstTocLink
    )
      return null;

    const lineTop = (element: Element) => {
      const rect = element.getBoundingClientRect();
      const lineHeight = Number.parseFloat(
        getComputedStyle(element).lineHeight
      );
      return rect.top + Math.max(0, (rect.height - lineHeight) / 2);
    };
    const navbarRect = navbar.getBoundingClientRect();
    const railStyle = getComputedStyle(rail);
    const scrollStyle = getComputedStyle(scroll);
    const scrollElement = scroll as HTMLElement;
    const textTops = {
      lnb: lineTop(lnbItem),
      content: breadcrumb.getBoundingClientRect().top,
      toc: header.getBoundingClientRect().top,
    };
    scrollElement.style.flex = "none";
    scrollElement.style.height = "64px";
    scrollElement.scrollTop = scrollElement.scrollHeight;

    return {
      railPosition: railStyle.position,
      railTop: rail.getBoundingClientRect().top,
      navbarBottom: navbarRect.bottom,
      scrollOverflow: scrollElement.scrollHeight > scrollElement.clientHeight,
      headerPresent: Boolean(header),
      textTops,
      maskImage: scrollStyle.maskImage,
      animationTimeline: scrollStyle.getPropertyValue("animation-timeline"),
    };
  });

  expect(result).not.toBeNull();
  expect(result?.railPosition).toBe("sticky");
  expect(result?.railTop).toBeGreaterThanOrEqual(result?.navbarBottom ?? 0);
  expect(result?.scrollOverflow).toBe(true);
  expect(result?.headerPresent).toBe(true);
  expect(result?.textTops).toEqual({ lnb: 88, content: 88, toc: 88 });
  expect(result?.maskImage).not.toBe("none");
  expect(result?.animationTimeline).toContain("scroll");

  await page.evaluate(() => window.scrollTo(0, 500));
  const pinned = await page.evaluate(() => {
    const lnb = document.querySelector(".theme-doc-sidebar-desktop");
    const toc = document.querySelector(".theme-doc-page__toc");
    return {
      lnb: lnb?.getBoundingClientRect().top,
      lnbPosition: lnb && getComputedStyle(lnb).position,
      toc: toc?.getBoundingClientRect().top,
      tocPosition: toc && getComputedStyle(toc).position,
    };
  });
  expect(pinned).toEqual({
    lnb: 64,
    lnbPosition: "sticky",
    toc: 64,
    tocPosition: "sticky",
  });

  const boundary = await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
    const lnb = document.querySelector(".theme-doc-sidebar-desktop");
    const toc = document.querySelector(".theme-doc-page__toc");
    const footer = document.querySelector(".theme-layout-footer");
    return {
      lnbBottom: lnb?.getBoundingClientRect().bottom,
      tocBottom: toc?.getBoundingClientRect().bottom,
      footerTop: footer?.getBoundingClientRect().top,
    };
  });
  expect(boundary.lnbBottom).toBeLessThanOrEqual(boundary.footerTop ?? 0);
  expect(boundary.tocBottom).toBeLessThanOrEqual(boundary.footerTop ?? 0);
});

test("Tabs, Details, NavigationMenu, and CodeBlock expose real outcomes", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto(mdxRoute);

  const showcase = page.locator(".navbar").getByRole("button", {
    name: "Showcase",
    exact: true,
  });
  const showcaseMenu = page.locator('[data-slot="navigation-menu-content"]');
  await showcase.focus();
  await page.keyboard.press("Enter");
  await expect(
    showcaseMenu.getByRole("link", { name: "Mermaid" })
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(showcaseMenu).toBeHidden();
  await expect(showcase).toBeFocused();
  expect(
    await showcase.evaluate((element) => element.matches(":focus-visible"))
  ).toBe(true);

  const configTab = page.getByRole("tab", { name: "Config" });
  await configTab.click();
  await expect(configTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText(
    'themes: ["@docusaurus/theme-mermaid", "@aeei/docusaurus-theme"]'
  );

  await page.goto(markdownRoute);
  const details = page.getByRole("button", { name: "Expandable details" });
  await details.focus();
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("Hidden body copy can include lists, code, and links.")
  ).toBeVisible();

  const code = page.locator("figure.theme-code-block").first();
  await code.getByRole("button", { name: "Copy code to clipboard" }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(
      "export function Hello() {\n  return <span>Hello docs theme</span>;\n}"
    );
});

test("theme, paginator, and back-to-top controls complete their journeys", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(mdxRoute);

  const themeTrigger = page.getByRole("button", { name: "Color theme: Dark" });
  await themeTrigger.click();
  await page.getByRole("menuitem", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page
    .locator(".pagination-nav")
    .getByRole("button", { name: /Mermaid examples/ })
    .click();
  await expect(page).toHaveURL(/\/showcase\/mermaid$/);

  await page.goto(markdownRoute);
  await page.mouse.wheel(0, 1600);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
  await page.mouse.wheel(0, -200);
  const backToTop = page.getByRole("button", { name: "Scroll back to top" });
  await expect(backToTop).toBeVisible();
  await backToTop.click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

test("mobile Sheet exposes secondary and primary navigation with focus restoration", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(markdownRoute);

  const trigger = page.getByRole("button", { name: "Toggle navigation bar" });
  await expect(trigger).toBeVisible();
  const mobileHeaderAlignment = await page.evaluate(() => {
    const inner = document.querySelector(".navbar__inner");
    const trigger = document.querySelector("[data-mobile-navigation-trigger]");
    const triggerIcon = trigger?.querySelector("svg");
    const content = document.querySelector(".theme-doc-page__content");
    const rect = (element) => element?.getBoundingClientRect();
    const innerRect = rect(inner);
    const triggerRect = rect(trigger);
    const triggerIconRect = rect(triggerIcon);
    const contentRect = rect(content);
    return {
      inner: innerRect ? { x: innerRect.x, width: innerRect.width } : null,
      trigger: triggerRect
        ? { x: triggerRect.x, width: triggerRect.width }
        : null,
      triggerIconLeft: triggerIconRect?.x,
      content: contentRect
        ? { x: contentRect.x, right: contentRect.right }
        : null,
    };
  });
  expect(mobileHeaderAlignment).toEqual({
    inner: { x: 16, width: 358 },
    trigger: { x: 16, width: 32 },
    triggerIconLeft: 24,
    content: { x: 24, right: 366 },
  });
  await trigger.click();
  const sheet = page.locator('[data-slot="sheet-content"]');
  const header = sheet.locator('[data-slot="sheet-header"]');
  const title = header.locator('[data-slot="sheet-title"]');
  const description = header.locator('[data-slot="sheet-description"]');
  const close = sheet.locator('[data-slot="sheet-close"]');
  const docsNavigation = sheet.getByRole("navigation", {
    name: "Docs sidebar",
  });
  const backButton = sheet.getByRole("button", { name: "Back to main menu" });
  const mobileThemeButton = sheet.getByRole("button", {
    name: /Color theme:/,
  });
  const firstDocsItem = docsNavigation
    .locator('[data-slot="sidebar-menu-button"]')
    .first();

  await expect(docsNavigation).toBeVisible();
  await expect(mobileThemeButton).toBeVisible();
  await expect
    .poll(async () => {
      const [sheetBox, headerBox, backBox, navigationBox, itemBox] =
        await Promise.all(
          [sheet, header, backButton, docsNavigation, firstDocsItem].map(
            (locator) => locator.boundingBox()
          )
        );
      return {
        sheet: sheetBox && {
          x: sheetBox.x,
          width: sheetBox.width,
          height: sheetBox.height,
        },
        header: headerBox && {
          x: headerBox.x,
          width: headerBox.width,
          height: headerBox.height,
        },
        back: backBox && {
          x: backBox.x,
          width: backBox.width,
          height: backBox.height,
        },
        navigation: navigationBox && {
          x: navigationBox.x,
          width: navigationBox.width,
        },
        firstItem: itemBox && {
          x: itemBox.x,
          width: itemBox.width,
          height: itemBox.height,
        },
      };
    })
    .toEqual({
      sheet: { x: 0, width: 288, height: 844 },
      header: { x: 0, width: 288, height: 78 },
      back: { x: 8, width: 272, height: 32 },
      navigation: { x: 8, width: 272 },
      firstItem: { x: 8, width: 272, height: 32 },
    });
  await expect(header).toHaveCSS("padding", "16px");
  await expect(header).toHaveCSS("row-gap", "2px");
  const mobileSurface = await sheet.evaluate((element) => {
    const probe = document.createElement("div");
    probe.style.backgroundColor = "var(--background)";
    document.body.append(probe);
    const expectedBackground = getComputedStyle(probe).backgroundColor;
    probe.remove();
    const content = element.querySelector('[data-slot="sidebar-content"]');
    return {
      background: getComputedStyle(element).backgroundColor,
      expectedBackground,
      borderRightWidth: getComputedStyle(element).borderRightWidth,
      scrollFade: content
        ? {
            maskImage: getComputedStyle(content).maskImage,
            animationTimeline:
              getComputedStyle(content).getPropertyValue("animation-timeline"),
          }
        : null,
    };
  });
  expect(mobileSurface).toMatchObject({
    background: mobileSurface.expectedBackground,
    expectedBackground: mobileSurface.expectedBackground,
    borderRightWidth: "0px",
  });
  expect(mobileSurface.scrollFade?.maskImage).not.toBe("none");
  expect(mobileSurface.scrollFade?.animationTimeline).toContain("scroll");
  const headerAlignment = await sheet.evaluate((element) => {
    const title = element.querySelector('[data-slot="sheet-title"]');
    const description = element.querySelector(
      '[data-slot="sheet-description"]'
    );
    const close = element.querySelector('[data-slot="sheet-close"]');
    if (!title || !description || !close) return null;
    const titleRect = title.getBoundingClientRect();
    const descriptionRect = description.getBoundingClientRect();
    const closeRect = close.getBoundingClientRect();
    const sheetRect = element.getBoundingClientRect();
    return {
      title: {
        x: titleRect.x,
        y: titleRect.y,
        height: titleRect.height,
      },
      description: {
        x: descriptionRect.x,
        y: descriptionRect.y,
        height: descriptionRect.height,
      },
      close: {
        x: closeRect.x,
        y: closeRect.y,
        width: closeRect.width,
        height: closeRect.height,
        rightInset: sheetRect.right - closeRect.right,
      },
      titleCloseCenterDelta: Math.abs(
        titleRect.y +
          titleRect.height / 2 -
          (closeRect.y + closeRect.height / 2)
      ),
    };
  });
  expect(headerAlignment).toEqual({
    title: { x: 16, y: 16, height: 24 },
    description: { x: 16, y: 42, height: 20 },
    close: { x: 248, y: 12, width: 28, height: 28, rightInset: 12 },
    titleCloseCenterDelta: 2,
  });
  await expect(title).toContainText("Navigation");
  await expect(description).toContainText("Browse documentation pages.");
  await expect(close).toHaveAccessibleName("Close");

  await backButton.click();
  await expect(sheet.getByRole("link", { name: "GitHub" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("Base Nova Button size variants keep official runtime metrics", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(mdxRoute);

  const expectedHeights = new Map([
    ["Extra small button", 24],
    ["Small button", 28],
    ["Default button", 32],
    ["Large button", 36],
    ["Extra small icon button", 24],
    ["Small icon button", 28],
    ["Default icon button", 32],
    ["Large icon button", 36],
  ]);

  for (const [name, height] of expectedHeights) {
    const button = page.getByRole("button", { name, exact: true });
    await expect(button).toBeVisible();
    expect(
      await button.evaluate(
        (element) => element.getBoundingClientRect().height
      ),
      name
    ).toBe(height);
    const icon = button.locator("svg");
    if (await icon.count()) {
      const iconSize = await icon.evaluate(
        (element) => element.getBoundingClientRect().width
      );
      expect(iconSize, `${name} icon`).toBeLessThanOrEqual(height - 12);
    }
  }
});

test("Markdown fixture renders every supported authoring surface", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(markdownRoute);

  const article = page.locator(".theme-doc-page__article");
  const markdown = page.locator(".theme-doc-markdown");
  for (const level of [1, 2, 3, 4, 5, 6]) {
    await expect(
      article.locator(`h${level}`).first(),
      `h${level}`
    ).toBeVisible();
  }
  await expect(markdown.locator("strong").first()).toBeVisible();
  await expect(markdown.locator("em").first()).toBeVisible();
  await expect(markdown.locator("del").first()).toBeVisible();
  await expect(markdown.locator("ol").first()).toBeVisible();
  await expect(markdown.locator("ul").first()).toBeVisible();
  await expect(
    markdown.locator('input[type="checkbox"]').first()
  ).toBeVisible();
  await expect(markdown.locator("blockquote").first()).toBeVisible();
  await expect(markdown.locator("table").first()).toBeVisible();
  await expect(markdown.locator("figure").first()).toBeVisible();
  await expect(markdown.locator("img").first()).toBeVisible();
  await expect(markdown.locator("br").first()).toBeAttached();
  await expect(markdown.locator("sup").first()).toBeVisible();
  await expect(markdown.locator("section.footnotes")).toBeVisible();
  await expect(markdown.locator("figure.theme-code-block")).toHaveCount(3);
  await expect(markdown.locator('[data-slot="accordion"]')).toBeAttached();
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 390);
});

test("inline code keeps one component-owned surface inside Details", async ({
  page,
}) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(markdownRoute);
    await page.getByRole("button", { name: "Expandable details" }).click();

    const metrics = await page.evaluate(() => {
      const codes = Array.from(
        document.querySelectorAll(".theme-doc-markdown code:not(pre code)")
      );
      const normal = codes.find(
        (element) => element.textContent === "const ready = true"
      );
      const details = codes.find((element) => element.textContent === "code");
      const read = (element?: Element) => {
        if (!element) return null;
        const style = getComputedStyle(element);
        return {
          className: element.className,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
          padding: style.padding,
          borderRadius: style.borderRadius,
          backgroundColor: style.backgroundColor,
        };
      };
      return { normal: read(normal), details: read(details) };
    });

    expect(metrics.normal).not.toBeNull();
    expect(metrics.details).toEqual(metrics.normal);
    expect(metrics.normal?.className).toContain("theme-code-inline");
  }
});

test("table-of-contents code reuses the canonical inline code surface", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(markdownRoute);

  const metrics = await page.evaluate(() => {
    const content = Array.from(
      document.querySelectorAll(".theme-doc-markdown h3 code")
    ).find((element) => element.textContent === "provider-id");
    const toc = Array.from(
      document.querySelectorAll(".table-of-contents__link code")
    ).find((element) => element.textContent === "provider-id");
    const read = (element?: Element) => {
      if (!element) return null;
      const style = getComputedStyle(element);
      return {
        className: element.className,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        padding: style.padding,
        borderRadius: style.borderRadius,
        backgroundColor: style.backgroundColor,
      };
    };
    return { content: read(content), toc: read(toc) };
  });

  expect(metrics.content).not.toBeNull();
  expect(metrics.toc).toEqual(metrics.content);
  expect(metrics.toc?.className).toContain("theme-code-inline");
});

test("CodeBlock matches the official shadcn docs surface", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(markdownRoute);

  const blocks = page.locator("figure.theme-code-block");
  const titledBlock = blocks.first();
  const title = titledBlock.locator("figcaption");
  const copyButton = titledBlock.locator('[data-slot="copy-button"]');
  const pre = titledBlock.locator("pre");
  const numberedLines = titledBlock.locator('[class*="codeLineNumber"]');

  await expect(numberedLines).toHaveCount(3);
  const firstNumber = numberedLines.first();
  await expect(firstNumber).toHaveCSS("position", "sticky");
  await expect(firstNumber).toHaveCSS("width", "64px");
  await expect(firstNumber).toHaveCSS("padding-right", "24px");
  await expect(firstNumber).toHaveCSS("text-align", "right");
  await expect(titledBlock.locator(".token-line").first()).toHaveCSS(
    "height",
    "26.5px"
  );
  await expect(title.locator("svg")).toHaveCount(1);
  await expect(title.locator("svg")).toHaveCSS("width", "16px");
  await expect(title).toHaveCSS("padding", "10px 16px");
  await expect(title).toHaveCSS("font-size", "12.25px");
  await expect(title).toHaveCSS("line-height", "21.4375px");
  await expect(pre).toHaveCSS("padding", "14px 0px");
  await expect(titledBlock).toHaveCSS("margin-left", "0px");
  await expect(titledBlock).toHaveCSS("margin-right", "0px");
  const articleBox = await page.locator(".theme-doc-markdown").boundingBox();
  const blockBox = await titledBlock.boundingBox();
  expect({ x: blockBox?.x, width: blockBox?.width }).toEqual({
    x: articleBox?.x,
    width: articleBox?.width,
  });

  const headerGeometry = await titledBlock.evaluate((block) => {
    const caption = block.querySelector("figcaption");
    const button = block.querySelector('[data-slot="copy-button"]');
    if (!caption || !button) return null;
    const blockRect = block.getBoundingClientRect();
    const captionRect = caption.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    return {
      captionHeight: captionRect.height,
      buttonTop: buttonRect.top - blockRect.top,
      centerDelta: Math.abs(
        captionRect.top +
          captionRect.height / 2 -
          (buttonRect.top + buttonRect.height / 2)
      ),
    };
  });
  expect(headerGeometry).toEqual({
    captionHeight: 42.4375,
    buttonTop: 6,
    centerDelta: 1.21875,
  });

  const highlightedLine = blocks
    .nth(2)
    .locator(".theme-code-block-highlighted-line");
  await expect(highlightedLine).toHaveCount(1);
  const highlight = await highlightedLine.evaluate((line) => {
    const style = getComputedStyle(line);
    const marker = getComputedStyle(line, "::after");
    const probe = document.createElement("div");
    probe.style.backgroundColor = "var(--code-highlight)";
    document.body.append(probe);
    const expectedBackground = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return {
      background: style.backgroundColor,
      expectedBackground,
      markerWidth: marker.width,
      markerLeft: marker.left,
    };
  });
  expect(highlight.background).toBe(highlight.expectedBackground);
  expect(highlight.markerWidth).toBe("2px");
  expect(highlight.markerLeft).toBe("0px");

  const syntaxTokens = {
    keyword: titledBlock.locator(".token.keyword").first(),
    function: titledBlock.locator(".token.function").first(),
    tag: titledBlock.locator(".token.tag:not(.punctuation)").first(),
    tagPunctuation: titledBlock.locator(".token.tag.punctuation").first(),
    plainText: titledBlock.locator(".token.plain-text").first(),
  };
  await expect(syntaxTokens.keyword).toHaveCSS("font-style", "normal");
  await expect(syntaxTokens.keyword).toHaveCSS("font-weight", "400");
  for (const [theme, colors] of [
    [
      "dark",
      {
        keyword: "rgb(160, 160, 160)",
        function: "rgb(255, 199, 153)",
        tag: "rgb(255, 199, 153)",
        tagPunctuation: "rgb(160, 160, 160)",
        plainText: "rgb(255, 255, 255)",
      },
    ],
    [
      "light",
      {
        keyword: "rgb(207, 34, 46)",
        function: "rgb(130, 80, 223)",
        tag: "rgb(17, 99, 41)",
        tagPunctuation: "rgb(31, 35, 40)",
        plainText: "rgb(31, 35, 40)",
      },
    ],
  ] as const) {
    if ((await page.locator("html").getAttribute("data-theme")) !== theme) {
      const themeButton = page.getByRole("button", { name: /^Color theme:/ });
      if (!(await themeButton.isVisible())) {
        await page
          .getByRole("button", { name: "Toggle navigation bar" })
          .click();
      }
      await themeButton.click();
      await page
        .getByRole("menuitem", { name: theme === "dark" ? "Dark" : "Light" })
        .click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    }
    for (const [token, color] of Object.entries(colors)) {
      await expect(syntaxTokens[token as keyof typeof syntaxTokens]).toHaveCSS(
        "color",
        color
      );
    }
  }
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 390);
});

test("breadcrumb keeps the standard Docusaurus separation from the page title", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("");

  const gap = await page.evaluate(() => {
    const breadcrumb = document.querySelector('[data-slot="breadcrumb"]');
    const title = document.querySelector(".theme-doc-markdown h1");
    if (!breadcrumb || !title) return null;
    return (
      title.getBoundingClientRect().top -
      breadcrumb.getBoundingClientRect().bottom
    );
  });

  expect(gap).toBe(12.796875);
});

test("heading flow and content surfaces stay exact across viewports", async ({
  page,
}) => {
  for (const width of [390, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });

    for (const route of ["", markdownRoute, mdxRoute, "showcase/mermaid"]) {
      await page.goto(route);
      const result = await page.evaluate(() => {
        const markdown = document.querySelector(".theme-doc-markdown");
        const headingGaps = [
          ...(markdown?.querySelectorAll(
            ":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6"
          ) ?? []),
        ]
          .map((heading) => {
            const next = heading.nextElementSibling;
            if (!next) return null;
            const headingRect = heading.getBoundingClientRect();
            const nextRect = next.getBoundingClientRect();
            return {
              heading: heading.textContent?.trim(),
              next: next.tagName,
              gap: nextRect.top - headingRect.bottom,
            };
          })
          .filter(Boolean);
        const directChildren = [...(markdown?.children ?? [])];
        const componentGaps = directChildren
          .slice(1)
          .flatMap((element, index) => {
            const previous = directChildren[index];
            const previousOwnsComponent =
              previous.hasAttribute("data-slot") ||
              Boolean(previous.querySelector(":scope > [data-slot]"));
            const nextOwnsComponent =
              element.hasAttribute("data-slot") ||
              Boolean(element.querySelector(":scope > [data-slot]"));
            if (!previousOwnsComponent && !nextOwnsComponent) return [];
            return [
              {
                previous:
                  previous.getAttribute("data-slot") ?? previous.tagName,
                next: element.getAttribute("data-slot") ?? element.tagName,
                gap:
                  element.getBoundingClientRect().top -
                  previous.getBoundingClientRect().bottom,
              },
            ];
          });
        const pageHeader = markdown?.querySelector(":scope > header");
        const pageHeaderNext = pageHeader?.nextElementSibling;
        const pageTitleGap =
          pageHeader && pageHeaderNext
            ? pageHeaderNext.getBoundingClientRect().top -
              pageHeader.getBoundingClientRect().bottom
            : null;
        const wrapper = document.querySelector("[data-slot='sidebar-wrapper']");
        const codeBackgrounds = [
          ...document.querySelectorAll("figure.theme-code-block"),
        ].map((element) => getComputedStyle(element).backgroundColor);
        return {
          headingGaps,
          componentGaps,
          pageTitleGap,
          wrapperBackground: wrapper
            ? getComputedStyle(wrapper).backgroundColor
            : null,
          codeBackgrounds,
          overflow:
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        };
      });

      expect(
        result.pageTitleGap,
        `${route || "root"} page title @ ${width}px`
      ).toBe(24);
      for (const relation of result.componentGaps) {
        expect(
          relation.gap,
          `${route || "root"} ${relation.previous} → ${relation.next} @ ${width}px`
        ).toBeGreaterThanOrEqual(16);
      }
      for (const relation of result.headingGaps) {
        expect(
          relation?.gap,
          `${route || "root"} ${relation?.heading} → ${relation?.next} @ ${width}px`
        ).toBe(16);
      }
      expect(
        new Set(result.codeBackgrounds).size,
        `${route || "root"} CodeBlock surfaces @ ${width}px`
      ).toBeLessThanOrEqual(1);
      for (const background of result.codeBackgrounds) {
        expect(background, `${route || "root"} CodeBlock @ ${width}px`).toBe(
          "lab(7.22637 -0.0000149012 0)"
        );
      }
      expect(result.overflow, `${route || "root"} @ ${width}px`).toBe(0);
      if (width >= 1024) {
        expect(
          result.wrapperBackground,
          `${route || "root"} @ ${width}px`
        ).toBe("rgba(0, 0, 0, 0)");
      }
    }
  }
});
