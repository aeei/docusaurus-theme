const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl =
  process.env.DOCS_STARTER_URL ?? "http://127.0.0.1:3001/docusaurus-theme/";
const artifacts = path.resolve("artifacts/docs-starter");
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 820, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];
const routes = [
  "",
  "guides/markdown-gfm",
  "showcase/mdx-playground",
  "showcase/mermaid",
];

const expectedTokens = {
  light: { background: "lab(100% 0 0)", foreground: "lab(0% 0 0)" },
  dark: { background: "lab(2.75381% 0 0)", foreground: "lab(98.26% 0 0)" },
};

function routeUrl(route) {
  return new URL(route, baseUrl).href;
}

async function applyTheme(page, theme) {
  await page.emulateMedia({ colorScheme: theme });
  await page.evaluate(
    (value) => document.documentElement.setAttribute("data-theme", value),
    theme
  );
}

async function visible(page, selector) {
  const candidates = page.locator(selector);
  for (let index = 0; index < (await candidates.count()); index += 1) {
    if (await candidates.nth(index).isVisible()) return candidates.nth(index);
  }
  throw new Error(`No visible element: ${selector}`);
}

async function dispatchSidebarShortcut(page) {
  await page.evaluate(() =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "b", ctrlKey: true, bubbles: true })
    )
  );
}

async function auditRoute(page, viewport, theme, route) {
  const response = await page.goto(routeUrl(route), {
    waitUntil: "networkidle",
  });
  if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
  await applyTheme(page, theme);
  await page.locator("main").waitFor();
  await page.locator(".theme-layout-footer").waitFor();

  const result = await page.evaluate(
    ({ viewportName, themeName, expected }) => {
      const root = getComputedStyle(document.documentElement);
      const body = getComputedStyle(document.body);
      const overflow = document.documentElement.scrollWidth - window.innerWidth;
      const offenders = Array.from(document.querySelectorAll("body *"))
        .map((element) => ({ element, rect: element.getBoundingClientRect() }))
        .filter(({ element, rect }) => {
          if (
            element.closest('[data-slot="table-container"], .theme-code-block')
          )
            return false;
          return rect.right > window.innerWidth + 1 || rect.left < -1;
        })
        .slice(0, 5)
        .map(({ element, rect }) => ({
          tag: element.tagName,
          slot: element.getAttribute("data-slot"),
          className:
            typeof element.className === "string" ? element.className : "",
          left: rect.left,
          right: rect.right,
        }));

      const componentChecks = [];
      const check = (selector, expectedStyle) => {
        const element = Array.from(document.querySelectorAll(selector)).find(
          (candidate) => {
            const rect = candidate.getBoundingClientRect();
            const style = getComputedStyle(candidate);
            return (
              rect.width > 0 && rect.height > 0 && style.visibility !== "hidden"
            );
          }
        );
        if (!element) return;
        const style = getComputedStyle(element);
        const actual = Object.fromEntries(
          Object.keys(expectedStyle).map((key) => [key, style[key]])
        );
        const differences = Object.entries(expectedStyle).filter(
          ([key, value]) => actual[key] !== value
        );
        if (differences.length)
          componentChecks.push({ selector, expectedStyle, actual });
      };

      check('[data-slot="button"]', {
        fontFamily: 'Geist, "Geist Fallback"',
        fontSize: "14px",
        lineHeight: "20px",
        borderTopLeftRadius: "10px",
      });
      check('[data-slot="accordion-trigger"]', {
        fontFamily: 'Geist, "Geist Fallback"',
        fontSize: "14px",
        lineHeight: "20px",
        paddingTop: "10px",
        paddingBottom: "10px",
      });
      check('[data-slot="tabs-list"]', {
        height: "32px",
        borderTopLeftRadius: "10px",
        paddingTop: "3px",
      });
      check('[data-slot="tabs-trigger"]', {
        fontSize: "14px",
        lineHeight: "20px",
        borderTopLeftRadius: "8px",
      });
      check('[data-slot="card"]', {
        fontSize: "14px",
        lineHeight: "20px",
        borderTopLeftRadius: "14px",
      });
      check('[data-slot="alert"]', {
        fontSize: "14px",
        lineHeight: "20px",
        borderTopLeftRadius: "10px",
        paddingTop: "8px",
        paddingLeft: "10px",
      });
      check('[data-slot="table-head"]', {
        height: "40px",
        paddingLeft: "8px",
        paddingRight: "8px",
        fontSize: "14px",
        lineHeight: "20px",
      });
      check('[data-slot="sidebar-menu-button"]', {
        height: "32px",
        fontSize: "14px",
        lineHeight: "20px",
      });

      const desktopSidebar = document.querySelector(
        '[data-slot="sidebar-container"]'
      );
      const mobileTrigger = document.querySelector(
        "[data-mobile-navigation-trigger]"
      );
      const responsiveFailure =
        viewportName === "desktop"
          ? !desktopSidebar ||
            getComputedStyle(desktopSidebar).position !== "fixed" ||
            mobileTrigger?.getBoundingClientRect().width
          : !!desktopSidebar?.getBoundingClientRect().width ||
            !mobileTrigger?.getBoundingClientRect().width;

      return {
        overflow,
        offenders,
        bodyFont: body.fontFamily,
        background: root.getPropertyValue("--background").trim(),
        foreground: root.getPropertyValue("--foreground").trim(),
        expected,
        themeName,
        componentChecks,
        responsiveFailure,
      };
    },
    {
      viewportName: viewport.name,
      themeName: theme,
      expected: expectedTokens[theme],
    }
  );

  if (result.overflow > 1 && result.offenders.length) {
    throw new Error(`document overflow: ${JSON.stringify(result.offenders)}`);
  }
  if (!result.bodyFont.startsWith("Geist"))
    throw new Error(`font drift: ${result.bodyFont}`);
  if (
    result.background !== result.expected.background ||
    result.foreground !== result.expected.foreground
  ) {
    throw new Error(`token drift: ${JSON.stringify(result)}`);
  }
  if (result.componentChecks.length)
    throw new Error(
      `component metric drift: ${JSON.stringify(result.componentChecks)}`
    );
  if (result.responsiveFailure)
    throw new Error("responsive Sidebar/mobile trigger mismatch");
}

async function auditDesktopInteractions(page, theme) {
  await page.goto(routeUrl("showcase/mdx-playground"), {
    waitUntil: "networkidle",
  });
  await applyTheme(page, theme);

  const navigationTrigger = await visible(
    page,
    '[data-slot="dropdown-menu-trigger"]'
  );
  await navigationTrigger.click();
  await page
    .locator('[data-slot="dropdown-menu-content"]')
    .waitFor({ state: "visible" });
  await page.keyboard.press("Escape");

  const tabTriggers = page.locator('[data-slot="tabs-trigger"]');
  await tabTriggers.nth(1).click();
  if ((await tabTriggers.nth(1).getAttribute("aria-selected")) !== "true")
    throw new Error("Tabs selection failed");

  await page.goto(routeUrl("guides/markdown-gfm"), {
    waitUntil: "networkidle",
  });
  await applyTheme(page, theme);
  const details = page
    .locator('.theme-doc-markdown [data-slot="accordion-trigger"]')
    .last();
  await details.click();
  if ((await details.getAttribute("aria-expanded")) !== "true")
    throw new Error("Accordion expansion failed");

  const sidebar = page.locator('[data-slot="sidebar"]').first();
  await dispatchSidebarShortcut(page);
  await page.waitForTimeout(250);
  if ((await sidebar.getAttribute("data-state")) !== "collapsed")
    throw new Error("Sidebar collapse shortcut failed");
  await dispatchSidebarShortcut(page);
  await page.waitForTimeout(250);
  if ((await sidebar.getAttribute("data-state")) !== "expanded")
    throw new Error("Sidebar expand shortcut failed");

  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight)
  );
  await page.waitForTimeout(100);
  const sidebarContainer = await visible(
    page,
    '[data-slot="sidebar-container"]'
  );
  const sidebarRect = await sidebarContainer.boundingBox();
  const sidebarFooter = await visible(page, '[data-slot="sidebar-footer"]');
  const footerRect = await sidebarFooter.boundingBox();
  if (
    !sidebarRect ||
    !footerRect ||
    sidebarRect.y < 40 ||
    footerRect.y + footerRect.height > 901
  ) {
    throw new Error("fixed Sidebar/footer scroll state failed");
  }

  const themeTrigger = page.getByRole("button", { name: /^Color theme:/ });
  await themeTrigger.waitFor({ state: "visible" });
  await themeTrigger.focus();
  await page.keyboard.press("Enter");
  const firstItem = await visible(page, '[data-slot="dropdown-menu-item"]');
  await firstItem.focus();
  if (
    !(await firstItem.evaluate((element) => element.matches(":focus-visible")))
  ) {
    throw new Error("theme menu focus-visible failed");
  }
  await page.keyboard.press("Escape");

  const tooltipTrigger = await visible(page, '[data-slot="tooltip-trigger"]');
  await tooltipTrigger.hover();
  await visible(page, '[data-slot="tooltip-content"]');
}

async function auditMobileInteractions(page, theme, id) {
  await page.goto(routeUrl("guides/markdown-gfm"), {
    waitUntil: "networkidle",
  });
  await applyTheme(page, theme);
  const trigger = page.locator("[data-mobile-navigation-trigger]");
  await trigger.click();
  await visible(page, '[data-slot="sheet-overlay"]');
  await visible(page, '[data-slot="sheet-content"]');
  await visible(page, '[data-slot="sheet-close"]');
  await page.screenshot({
    path: path.join(artifacts, `${id}-sheet-secondary.png`),
    fullPage: false,
  });

  const back = page.getByRole("button", { name: /Back to main menu/i });
  if (await back.isVisible()) {
    await back.click();
    await page.screenshot({
      path: path.join(artifacts, `${id}-sheet-primary.png`),
      fullPage: false,
    });
  }

  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);
  if (await page.locator('[data-slot="sheet-content"]').isVisible())
    throw new Error("Sheet Escape dismissal failed");
  if (
    !(await trigger.evaluate((element) => document.activeElement === element))
  )
    throw new Error("Sheet focus restoration failed");

  const tocTrigger = await visible(page, '[data-slot="accordion-trigger"]');
  await tocTrigger.click();
  if ((await tocTrigger.getAttribute("aria-expanded")) !== "true")
    throw new Error("mobile TOC expansion failed");
}

(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const failures = [];

  for (const viewport of viewports) {
    for (const theme of ["light", "dark"]) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        colorScheme: theme,
      });
      const page = await context.newPage();
      const errors = [];
      page.on(
        "console",
        (message) => message.type() === "error" && errors.push(message.text())
      );
      page.on("pageerror", (error) => errors.push(error.message));

      for (const route of routes) {
        const id = `${viewport.name}-${theme}-${route.replaceAll("/", "-") || "home"}`;
        try {
          await auditRoute(page, viewport, theme, route);
          await page.screenshot({
            path: path.join(artifacts, `${id}.png`),
            fullPage: true,
          });
        } catch (error) {
          failures.push(`${id}: ${error.message}`);
        }
      }

      try {
        if (viewport.name === "desktop")
          await auditDesktopInteractions(page, theme);
        else
          await auditMobileInteractions(
            page,
            theme,
            `${viewport.name}-${theme}`
          );
      } catch (error) {
        failures.push(
          `${viewport.name}-${theme}-interactions: ${error.message}`
        );
      }

      if (errors.length)
        failures.push(
          `${viewport.name}-${theme}-console: ${errors.join(" | ")}`
        );
      await context.close();
    }
  }

  await browser.close();
  if (failures.length) {
    console.error(`Docs starter audit failed:\n${failures.join("\n")}`);
    process.exit(1);
  }
  console.log(
    `Docs starter audit passed: ${viewports.length * 2 * routes.length} route states + interactions`
  );
  console.log(`Screenshots: ${artifacts}`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
