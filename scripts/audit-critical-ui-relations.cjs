#!/usr/bin/env node

const { chromium } = require("playwright");

const baseUrl =
  process.env.BASE_URL ?? "http://127.0.0.1:3001/docusaurus-theme/";
const failures = [];

function expect(condition, message, details) {
  if (!condition) failures.push({ message, details });
}

async function openPage(browser, width, route = "showcase/mdx-playground") {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    colorScheme: "dark",
  });
  await context.addInitScript(() => localStorage.setItem("theme", "dark"));
  const page = await context.newPage();
  await page.goto(new URL(route, baseUrl).href, { waitUntil: "networkidle" });
  return { context, page };
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  const { context, page } = await openPage(browser, 1368);
  const sidebar = page.getByRole("navigation", { name: "Docs sidebar" });
  const desktopSidebarSpacing = await sidebar.evaluate((element) => {
    const group = element.closest('[data-slot="sidebar-group"]');
    const firstItem = element.querySelector(
      '[data-slot="sidebar-menu-button"]'
    );
    const groupRect = group?.getBoundingClientRect();
    const itemRect = firstItem?.getBoundingClientRect();
    const itemRange = document.createRange();
    if (firstItem) itemRange.selectNodeContents(firstItem);
    const itemTextRect = firstItem ? itemRange.getClientRects()[0] : null;
    return {
      group: groupRect
        ? {
            x: groupRect.x,
            width: groupRect.width,
            padding: getComputedStyle(group).padding,
          }
        : null,
      firstItem: itemRect
        ? { x: itemRect.x, width: itemRect.width, height: itemRect.height }
        : null,
      firstItemTextLeft: itemTextRect?.x ?? null,
    };
  });
  expect(
    JSON.stringify(desktopSidebarSpacing) ===
      JSON.stringify({
        group: { x: 8, width: 280, padding: "8px" },
        firstItem: { x: 16, width: 264, height: 32 },
        firstItemTextLeft: 24,
      }),
    "Desktop LNB must align its first item with the GNB content edge",
    desktopSidebarSpacing
  );

  const guides = sidebar.getByRole("button", { name: "Showcase", exact: true });
  const guideChild = sidebar.getByText("MDX playground", { exact: true });
  const expandedBefore = await guides.getAttribute("aria-expanded");
  await guides.click();
  await page.waitForTimeout(50);
  const expandedAfter = await guides.getAttribute("aria-expanded");
  expect(
    expandedBefore === "true" && expandedAfter === "false",
    "LNB category trigger must expose and change aria-expanded",
    { expandedBefore, expandedAfter }
  );
  expect(
    !(await guideChild.isVisible()),
    "Collapsed LNB category must hide children"
  );

  const navbar = await page.evaluate(() => {
    const brand = document.querySelector(".navbar__brand");
    const items = [
      ...document.querySelectorAll(
        ".navbar__items:not(.navbar__items--right) [data-slot='navigation-menu-list'] > [data-slot='navigation-menu-item'] > :is(a, button)"
      ),
    ];
    const rect = (element) => element?.getBoundingClientRect().toJSON();
    const brandRect = rect(brand);
    const itemRects = items.map(rect);
    return {
      brandRect,
      itemRects,
      itemWeights: items.map((item) => getComputedStyle(item).fontWeight),
      brandToFirst: itemRects[0]?.x - brandRect?.right,
      itemGaps: itemRects
        .slice(1)
        .map((item, index) => item.x - itemRects[index].right),
    };
  });
  expect(
    desktopSidebarSpacing.firstItemTextLeft === navbar.brandRect?.x,
    "Desktop LNB text and GNB title must share the same left content edge",
    { desktopSidebarSpacing, navbar }
  );
  expect(
    navbar.itemWeights.every((weight) => weight === "500"),
    "Top-level GNB links and triggers must share the official medium weight",
    navbar
  );
  expect(
    navbar.brandToFirst >= 8,
    "GNB brand and first menu need a visible gap",
    navbar
  );

  const gnbTrigger = page
    .locator(".navbar")
    .getByRole("button", { name: "Showcase", exact: true });
  await gnbTrigger.click();
  const longGnbLink = page
    .locator('[data-slot="navigation-menu-content"]')
    .getByRole("link", { name: "Markdown + GFM" });
  await longGnbLink.waitFor();
  const longGnbLinkMetrics = await longGnbLink.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return {
      lines: range.getClientRects().length,
      height: getComputedStyle(element).height,
    };
  });
  expect(
    longGnbLinkMetrics.lines === 1 && longGnbLinkMetrics.height === "36px",
    "GNB navigation labels must stay on one line",
    longGnbLinkMetrics
  );
  await page.keyboard.press("Escape");

  const breadcrumbGap = await page.evaluate(() => {
    const breadcrumb = document.querySelector('[data-slot="breadcrumb"]');
    const title = document.querySelector(".theme-doc-markdown h1");
    return breadcrumb && title
      ? title.getBoundingClientRect().top -
          breadcrumb.getBoundingClientRect().bottom
      : null;
  });
  expect(
    breadcrumbGap === 12.796875,
    "Breadcrumb must keep the standard Docusaurus title separation",
    { breadcrumbGap }
  );

  const tabsGap = await page.evaluate(() => {
    const heading = [
      ...document.querySelectorAll(".theme-doc-markdown h2"),
    ].find((element) => element.textContent?.trim().startsWith("Tabs"));
    const tabs = document.querySelector(
      ".theme-doc-markdown [data-slot='tabs']"
    );
    if (!heading || !tabs) return null;
    return (
      tabs.getBoundingClientRect().top - heading.getBoundingClientRect().bottom
    );
  });
  expect(tabsGap >= 16, "Tabs need external flow spacing after their heading", {
    tabsGap,
  });

  const desktopSurface = await page.evaluate(() => {
    const wrapper = document.querySelector("[data-slot='sidebar-wrapper']");
    const sidebarContent = document.querySelector(
      ".theme-doc-sidebar-desktop [data-slot='sidebar-content']"
    );
    const tocHeader = document.querySelector(".theme-doc-toc-desktop__header");
    const tocScroll = document.querySelector(".theme-doc-toc-desktop__scroll");
    const code = document.querySelector("figure.theme-code-block");
    const navbar = document.querySelector(".navbar");
    const navbarBlur = getComputedStyle(navbar, "::before");
    const fadeActive = (element) =>
      element &&
      getComputedStyle(element).maskImage !== "none" &&
      getComputedStyle(element).animationTimeline.includes("scroll");
    return {
      wrapperBackground: getComputedStyle(wrapper).backgroundColor,
      codeBackground: getComputedStyle(code).backgroundColor,
      pageBackground: getComputedStyle(
        document.documentElement
      ).getPropertyValue("--background"),
      sidebarScrollFade: fadeActive(sidebarContent),
      navbarBlur: {
        backdropFilter: navbarBlur.backdropFilter,
        borderBottomWidth: navbarBlur.borderBottomWidth,
        backgroundColor: navbarBlur.backgroundColor,
      },
      toc: {
        headerOutsideScroll: Boolean(
          tocHeader && tocScroll && !tocScroll.contains(tocHeader)
        ),
        scrollFade: fadeActive(tocScroll),
      },
    };
  });
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(50);
  const sidebarFooterBoundary = await page.evaluate(() => {
    const sidebar = document.querySelector(".theme-doc-sidebar-container");
    const sidebarFooter = sidebar?.querySelector(
      '[data-slot="sidebar-footer"]'
    );
    const pageFooter = document.querySelector(".theme-layout-footer");
    if (!sidebar || !sidebarFooter || !pageFooter) return null;
    const sidebarRect = sidebar.getBoundingClientRect();
    const sidebarFooterRect = sidebarFooter.getBoundingClientRect();
    const pageFooterRect = pageFooter.getBoundingClientRect();
    return {
      position: getComputedStyle(sidebar).position,
      sidebarBoundaryDelta: sidebarRect.bottom - pageFooterRect.top,
      sidebarFooterBoundaryDelta: sidebarFooterRect.bottom - pageFooterRect.top,
    };
  });
  expect(
    JSON.stringify(sidebarFooterBoundary) ===
      JSON.stringify({
        position: "sticky",
        sidebarBoundaryDelta: 0,
        sidebarFooterBoundaryDelta: 0,
      }),
    "Desktop LNB and its footer must stop at the page footer boundary",
    sidebarFooterBoundary
  );
  await context.close();

  const mobile = await openPage(browser, 390);
  await mobile.page
    .getByRole("button", { name: "Toggle navigation bar" })
    .click();
  const mobileSheet = mobile.page.locator('[data-slot="sheet-content"]');
  await mobileSheet.waitFor();
  await mobile.page.waitForFunction(() => {
    const element = document.querySelector('[data-slot="sheet-content"]');
    return element && getComputedStyle(element).translate === "none";
  });
  const mobileSurface = await mobile.page.evaluate(() => {
    const sheet = document.querySelector('[data-slot="sheet-content"]');
    const header = sheet?.querySelector('[data-slot="sheet-header"]');
    const title = sheet?.querySelector('[data-slot="sheet-title"]');
    const description = sheet?.querySelector('[data-slot="sheet-description"]');
    const close = sheet?.querySelector('[data-slot="sheet-close"]');
    const navbarInner = document.querySelector(".navbar__inner");
    const mobileTrigger = document.querySelector(
      "[data-mobile-navigation-trigger]"
    );
    const mobileTriggerIcon = mobileTrigger?.querySelector("svg");
    const content = document.querySelector(".theme-doc-page__content");
    const sidebarContent = sheet?.querySelector(
      '[data-slot="sidebar-content"]'
    );
    const rect = (element) => element?.getBoundingClientRect();
    const sheetRect = rect(sheet);
    const headerRect = rect(header);
    const titleRect = rect(title);
    const descriptionRect = rect(description);
    const closeRect = rect(close);
    return {
      codeBackground: getComputedStyle(
        document.querySelector("figure.theme-code-block")
      ).backgroundColor,
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      sidebarScrollFade: Boolean(
        sidebarContent &&
        getComputedStyle(sidebarContent).maskImage !== "none" &&
        getComputedStyle(sidebarContent).animationTimeline.includes("scroll")
      ),
      mobileHeader: {
        inner: (() => {
          const value = rect(navbarInner);
          return value ? { x: value.x, width: value.width } : null;
        })(),
        trigger: (() => {
          const value = rect(mobileTrigger);
          return value ? { x: value.x, width: value.width } : null;
        })(),
        triggerIconLeft: rect(mobileTriggerIcon)?.x,
        content: (() => {
          const value = rect(content);
          return value ? { x: value.x, right: value.right } : null;
        })(),
      },
      header: headerRect
        ? {
            x: headerRect.x,
            width: headerRect.width,
            height: headerRect.height,
            padding: getComputedStyle(header).padding,
            gap: getComputedStyle(header).rowGap,
          }
        : null,
      title: titleRect
        ? { x: titleRect.x, y: titleRect.y, height: titleRect.height }
        : null,
      description: descriptionRect
        ? {
            x: descriptionRect.x,
            y: descriptionRect.y,
            height: descriptionRect.height,
          }
        : null,
      close:
        closeRect && sheetRect
          ? {
              x: closeRect.x,
              y: closeRect.y,
              width: closeRect.width,
              height: closeRect.height,
              rightInset: sheetRect.right - closeRect.right,
              titleCenterDelta: titleRect
                ? Math.abs(
                    titleRect.y +
                      titleRect.height / 2 -
                      (closeRect.y + closeRect.height / 2)
                  )
                : null,
            }
          : null,
    };
  });
  await mobile.context.close();

  expect(
    desktopSurface.navbarBlur.backdropFilter === "blur(12px)" &&
      desktopSurface.navbarBlur.borderBottomWidth === "1px" &&
      desktopSurface.navbarBlur.backgroundColor !== "rgba(0, 0, 0, 0)",
    "GNB must match Nextra's translucent blurred surface",
    desktopSurface.navbarBlur
  );
  expect(
    desktopSurface.sidebarScrollFade === true &&
      desktopSurface.toc.headerOutsideScroll === true &&
      desktopSurface.toc.scrollFade === true &&
      mobileSurface.sidebarScrollFade === true,
    "LNB and TOC scroll viewports must use scroll-fade while the TOC header remains fixed",
    { desktopSurface, mobileSurface }
  );
  expect(
    desktopSurface.wrapperBackground === "rgba(0, 0, 0, 0)",
    "Desktop docs wrapper must not replace the page surface color",
    desktopSurface
  );
  expect(
    desktopSurface.codeBackground === mobileSurface.codeBackground,
    "CodeBlock surface color must be viewport invariant",
    { desktopSurface, mobileSurface }
  );
  expect(
    JSON.stringify(mobileSurface.mobileHeader) ===
      JSON.stringify({
        inner: { x: 16, width: 358 },
        trigger: { x: 16, width: 32 },
        triggerIconLeft: 24,
        content: { x: 24, right: 366 },
      }),
    "Mobile GNB icons must align with the content edges",
    mobileSurface.mobileHeader
  );
  expect(
    JSON.stringify({
      header: mobileSurface.header,
      title: mobileSurface.title,
      description: mobileSurface.description,
      close: mobileSurface.close,
    }) ===
      JSON.stringify({
        header: {
          x: 0,
          width: 288,
          height: 78,
          padding: "16px",
          gap: "2px",
        },
        title: { x: 16, y: 16, height: 24 },
        description: { x: 16, y: 42, height: 20 },
        close: {
          x: 248,
          y: 12,
          width: 28,
          height: 28,
          rightInset: 12,
          titleCenterDelta: 2,
        },
      }),
    "Mobile Sheet header must match the official Sheet composition",
    mobileSurface
  );

  await browser.close();

  if (failures.length) {
    console.error(JSON.stringify({ failures }, null, 2));
    process.exit(1);
  }
  console.log("Critical UI relations and interactions passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
