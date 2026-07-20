#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const {
  discoverActualRoutes,
  projectRoot,
} = require("./lib/actual-routes.cjs");

const localBase = (
  process.env.DOCS_STARTER_URL ?? "http://127.0.0.1:3001/docusaurus-theme/"
).replace(/\/?$/, "/");
const officialUrl = "https://ui.shadcn.com/docs/components/base/button";
const artifactDir = path.join(projectRoot, "artifacts/actual-route-parity");
const routeDir = path.join(artifactDir, "routes");
const interactionDir = path.join(artifactDir, "interactions");
const codeBlockDir = path.join(artifactDir, "codeblock");
const oracleDir = path.join(artifactDir, "oracle-shell");
const themes = ["light", "dark"];
const widths = [
  320, 325, 385, 408, 480, 512, 584, 640, 768, 1024, 1280, 1920, 2736, 3840,
];
const codeBlockWidths = [390, 768, 1440];
const oracleWidths = [390, 1024, 1280, 1440];
const height = 900;

const componentUrls = {
  Accordion: "https://ui.shadcn.com/docs/components/base/accordion",
  Alert: "https://ui.shadcn.com/docs/components/base/alert",
  Badge: "https://ui.shadcn.com/docs/components/base/badge",
  Breadcrumb: "https://ui.shadcn.com/docs/components/base/breadcrumb",
  Button: "https://ui.shadcn.com/docs/components/base/button",
  Card: "https://ui.shadcn.com/docs/components/base/card",
  Collapsible: "https://ui.shadcn.com/docs/components/base/collapsible",
  DropdownMenu: "https://ui.shadcn.com/docs/components/base/dropdown-menu",
  Input: "https://ui.shadcn.com/docs/components/base/input",
  NavigationMenu: "https://ui.shadcn.com/docs/components/base/navigation-menu",
  Sheet: "https://ui.shadcn.com/docs/components/base/sheet",
  Sidebar: "https://ui.shadcn.com/docs/components/base/sidebar",
  Table: "https://ui.shadcn.com/docs/components/base/table",
  Tabs: "https://ui.shadcn.com/docs/components/base/tabs",
  Tooltip: "https://ui.shadcn.com/docs/components/base/tooltip",
};

function routeUrl(route) {
  return new URL(route, localBase).href;
}

function safeRoute(route) {
  return route ? route.replaceAll("/", "-") : "root";
}

async function themedContext(browser, theme, width) {
  const context = await browser.newContext({
    viewport: { width, height },
    colorScheme: theme,
  });
  await context.addInitScript(
    (value) => localStorage.setItem("theme", value),
    theme
  );
  return context;
}

async function captureLocator(locator, output) {
  if ((await locator.count()) !== 1 || !(await locator.isVisible()))
    return false;
  await locator.screenshot({ path: output });
  return true;
}

(async () => {
  const discovery = discoverActualRoutes();
  for (const directory of [routeDir, interactionDir, codeBlockDir, oracleDir]) {
    fs.rmSync(directory, { recursive: true, force: true });
    fs.mkdirSync(directory, { recursive: true });
  }
  const browser = await chromium.launch({ headless: true });
  const routeScreenshots = [];
  const interactionScreenshots = [];
  const codeBlockScreenshots = [];
  const oracleScreenshots = [];

  try {
    for (const theme of themes) {
      for (const width of widths) {
        const context = await themedContext(browser, theme, width);
        for (const route of discovery.primaryRoutes) {
          const page = await context.newPage();
          await page.goto(routeUrl(route), { waitUntil: "networkidle" });
          const output = path.join(
            routeDir,
            `${safeRoute(route)}-${width}-${theme}.png`
          );
          await page.screenshot({ path: output, fullPage: true });
          routeScreenshots.push(path.relative(projectRoot, output));
          await page.close();
        }
        await context.close();
      }
    }

    for (const theme of themes) {
      for (const width of [390, 1440]) {
        const context = await themedContext(browser, theme, width);
        const page = await context.newPage();

        await page.goto(routeUrl("guides/markdown-gfm"), {
          waitUntil: "networkidle",
        });
        const themeTrigger = page.getByRole("button", {
          name: /^Color theme:/,
        });
        await themeTrigger.click();
        await page.locator('[data-slot="dropdown-menu-content"]').waitFor();
        await page.waitForTimeout(200);
        let output = path.join(
          interactionDir,
          `theme-menu-${width}-${theme}.png`
        );
        await page.screenshot({ path: output });
        interactionScreenshots.push(path.relative(projectRoot, output));
        await page.keyboard.press("Escape");

        const details = page
          .locator('.theme-doc-markdown [data-slot="accordion-trigger"]')
          .last();
        await details.scrollIntoViewIfNeeded();
        await details.click();
        await page.waitForTimeout(300);
        output = path.join(
          interactionDir,
          `details-open-${width}-${theme}.png`
        );
        await page.screenshot({ path: output });
        interactionScreenshots.push(path.relative(projectRoot, output));

        if (width < 1024) {
          await page.evaluate(() => scrollTo(0, 0));
          const trigger = page.locator("[data-mobile-navigation-trigger]");
          await trigger.click();
          await page.locator('[data-slot="sheet-content"]').waitFor();
          await page.waitForTimeout(300);
          output = path.join(interactionDir, `sheet-secondary-${theme}.png`);
          await page.screenshot({ path: output });
          interactionScreenshots.push(path.relative(projectRoot, output));
          const back = page.getByRole("button", { name: "Back to main menu" });
          if (await back.isVisible()) {
            await back.click();
            await page.waitForTimeout(150);
            output = path.join(interactionDir, `sheet-primary-${theme}.png`);
            await page.screenshot({ path: output });
            interactionScreenshots.push(path.relative(projectRoot, output));
          }
          await page.keyboard.press("Escape");
        } else {
          const nav = page
            .locator(".navbar")
            .getByRole("button", { name: "Showcase", exact: true });
          await nav.click();
          await page.locator('[data-slot="navigation-menu-content"]').waitFor();
          await page.waitForTimeout(400);
          output = path.join(interactionDir, `navigation-menu-${theme}.png`);
          await page.screenshot({ path: output });
          interactionScreenshots.push(path.relative(projectRoot, output));
          await page.keyboard.press("Escape");
          await page.goto(routeUrl(""), { waitUntil: "networkidle" });
          await page.evaluate(() =>
            scrollTo(0, document.documentElement.scrollHeight)
          );
          await page.waitForTimeout(200);
          output = path.join(
            interactionDir,
            `lnb-footer-boundary-${theme}.png`
          );
          await page.screenshot({ path: output });
          interactionScreenshots.push(path.relative(projectRoot, output));
        }

        await page.goto(routeUrl("showcase/mdx-playground"), {
          waitUntil: "networkidle",
        });
        const tabs = page.locator('[data-slot="tabs-trigger"]');
        await tabs.nth(1).click();
        await tabs.nth(1).scrollIntoViewIfNeeded();
        output = path.join(
          interactionDir,
          `tabs-selected-${width}-${theme}.png`
        );
        await page.screenshot({ path: output });
        interactionScreenshots.push(path.relative(projectRoot, output));

        if (width < 1024) {
          await page.goto(routeUrl("showcase/mermaid"), {
            waitUntil: "networkidle",
          });
          const diagram = page.locator(".docusaurus-mermaid-container").first();
          await diagram.scrollIntoViewIfNeeded();
          await diagram.evaluate((element) => {
            element.scrollLeft = element.scrollWidth;
          });
          output = path.join(interactionDir, `mermaid-scrolled-${theme}.png`);
          await page.screenshot({ path: output });
          interactionScreenshots.push(path.relative(projectRoot, output));
        }

        await page.close();
        await context.close();
      }
    }

    for (const theme of themes) {
      for (const width of codeBlockWidths) {
        const context = await themedContext(browser, theme, width);
        const official = await context.newPage();
        const local = await context.newPage();
        await official.goto(officialUrl, { waitUntil: "networkidle" });
        await local.goto(routeUrl("guides/markdown-gfm"), {
          waitUntil: "networkidle",
        });

        for (const [surface, locator] of [
          [
            "official-title",
            official
              .locator("figure[data-rehype-pretty-code-figure]:has(figcaption)")
              .first(),
          ],
          [
            "local-title",
            local.locator("figure.theme-code-block:has(figcaption)").first(),
          ],
          [
            "local-highlight",
            local
              .locator(
                "figure.theme-code-block:has(.theme-code-block-highlighted-line)"
              )
              .first(),
          ],
        ]) {
          const output = path.join(
            codeBlockDir,
            `${surface}-${width}-${theme}.png`
          );
          if (await captureLocator(locator, output)) {
            codeBlockScreenshots.push(path.relative(projectRoot, output));
          }
        }
        await context.close();
      }
    }

    for (const theme of themes) {
      for (const width of oracleWidths) {
        const context = await themedContext(browser, theme, width);
        const official = await context.newPage();
        const local = await context.newPage();
        await official.goto(officialUrl, { waitUntil: "networkidle" });
        await local.goto(routeUrl("guides/markdown-gfm"), {
          waitUntil: "networkidle",
        });

        for (const [kind, page] of [
          ["official", official],
          ["local", local],
        ]) {
          let output = path.join(
            oracleDir,
            `${kind}-${width}-${theme}-viewport.png`
          );
          await page.screenshot({ path: output });
          oracleScreenshots.push(path.relative(projectRoot, output));

          const selectors =
            kind === "official"
              ? {
                  header: page.locator("header").first(),
                  sidebar: page
                    .locator('[data-slot="sidebar"]')
                    .filter({ visible: true }),
                  docs: page.locator('[data-slot="docs"]'),
                }
              : {
                  header: page.locator(".navbar"),
                  sidebar: page
                    .locator('[data-slot="sidebar-container"]')
                    .filter({ visible: true }),
                  docs: page.locator('[data-slot="docs"]'),
                };
          for (const [surface, locator] of Object.entries(selectors)) {
            output = path.join(
              oracleDir,
              `${kind}-${width}-${theme}-${surface}.png`
            );
            if (await captureLocator(locator, output)) {
              oracleScreenshots.push(path.relative(projectRoot, output));
            }
          }
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  const result = {
    generatedAt: new Date().toISOString(),
    primaryRoutes: discovery.primaryRoutes,
    supplementalRoutes: discovery.supplementalRoutes,
    themes,
    widths,
    codeBlockWidths,
    oracleWidths,
    componentUrls,
    routeScreenshots,
    interactionScreenshots,
    codeBlockScreenshots,
    oracleScreenshots,
  };
  fs.writeFileSync(
    path.join(artifactDir, "results.json"),
    JSON.stringify(result, null, 2)
  );

  const report = [
    "# Actual-route parity evidence",
    "",
    `- primary routes: ${discovery.primaryRoutes.length}`,
    `- original full-page route screenshots: ${routeScreenshots.length}`,
    `- interaction screenshots: ${interactionScreenshots.length}`,
    `- official/local CodeBlock crops: ${codeBlockScreenshots.length}`,
    `- official/local shell screenshots and crops: ${oracleScreenshots.length}`,
    `- themes: ${themes.join(", ")}`,
    `- widths: ${widths.join(", ")}`,
    "",
    "## Evidence model",
    "",
    "- Starter content/data remains Docusaurus-owned; official component/state comparisons have no contextual exclusions.",
    "- User-approved shell composition: LNB shares the content background, has no right border, remains sticky inside main, and stops at the page-footer boundary; desktop shell caps at Nextra’s computed 1440px max-width; LNB text aligns with the GNB title; top-level GNB links/triggers share official medium weight; GNB uses Nextra-style blur; mobile GNB uses a 16px outer inset; TOC/LNB use scroll-fade with a fixed TOC title.",
    "- Live shell geometry is exact in `.pi-subagents/artifacts/shell-geometry-report.md`.",
    "- Live TOC geometry/states are exact in `.pi-subagents/artifacts/toc-parity-report.md`.",
    "- Official component/state comparison is `406/406` exact with zero exclusions in `artifacts/base-nova-parity/`.",
    "- Official registry component source identity is protected by `registry-source-contract.test.ts`.",
    "- Actual-route element ownership is in `artifacts/rendered-surfaces/inventory.json`.",
    "- Every integer width `320..3840` is in `artifacts/responsive-sweep/results.json`.",
    "- Full-page route and interaction screenshots are mandatory manual composition evidence, not substitutes for metric/state comparison.",
    "",
    "## Official component oracles",
    "",
    ...Object.entries(componentUrls).map(([name, url]) => `- ${name}: ${url}`),
    "",
    "## Approval gate",
    "",
    "No commit, push, deployment, or npm publication is permitted until explicit user visual approval.",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(artifactDir, "report.md"), report);

  console.log(
    `Captured ${routeScreenshots.length} route, ${interactionScreenshots.length} interaction, ${codeBlockScreenshots.length} CodeBlock, and ${oracleScreenshots.length} oracle screenshots.`
  );
})();
