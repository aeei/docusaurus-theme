const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl =
  process.env.DOCS_STARTER_URL ?? "http://127.0.0.1:3001/docusaurus-theme/";
const cases = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "tablet", viewport: { width: 768, height: 844 } },
  { name: "mobile", viewport: { width: 390, height: 844 } },
];
const routes = [
  "",
  "guides/markdown-gfm",
  "showcase/mdx-playground",
  "showcase/mermaid",
];
const artifacts = path.resolve("artifacts/docs-starter");

async function dispatchSidebarShortcut(page) {
  await page.evaluate(() =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "b",
        ctrlKey: true,
        bubbles: true,
      })
    )
  );
}

(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const failures = [];

  for (const device of cases) {
    for (const colorScheme of ["light", "dark"]) {
      const context = await browser.newContext({
        viewport: device.viewport,
        colorScheme,
      });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on(
        "console",
        (message) =>
          message.type() === "error" && consoleErrors.push(message.text())
      );
      page.on("pageerror", (error) => consoleErrors.push(error.message));

      for (const route of routes) {
        const id = `${device.name}-${colorScheme}-${route.replaceAll("/", "-") || "home"}`;
        try {
          const response = await page.goto(new URL(route, baseUrl).href, {
            waitUntil: "networkidle",
          });
          if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
          await page.locator("main").waitFor();
          if ((await page.locator("nav").count()) === 0)
            throw new Error("missing navigation");
          if ((await page.locator("footer").count()) === 0)
            throw new Error("missing footer");
          const overflow = await page.evaluate(() => ({
            amount: document.documentElement.scrollWidth - window.innerWidth,
            offenders: Array.from(document.querySelectorAll("*"))
              .map((element) => ({
                element,
                rect: element.getBoundingClientRect(),
              }))
              .filter(
                ({ rect }) =>
                  rect.right > window.innerWidth + 1 || rect.left < -1
              )
              .slice(0, 5)
              .map(({ element, rect }) => ({
                tag: element.tagName,
                className:
                  typeof element.className === "string"
                    ? element.className
                    : "",
                left: rect.left,
                right: rect.right,
              })),
          }));
          if (overflow.amount > 1)
            throw new Error(`horizontal overflow ${JSON.stringify(overflow)}`);
          const designTokens = await page.evaluate(() => {
            const probe = document.createElement("div");
            probe.style.cssText =
              "position:fixed;visibility:hidden;width:var(--spacing);border-left:var(--border-width) solid transparent";
            document.body.append(probe);
            const metrics = {
              spacing: probe.getBoundingClientRect().width,
              borderWidth: parseFloat(getComputedStyle(probe).borderLeftWidth),
            };
            probe.remove();
            return metrics;
          });
          if (designTokens.spacing !== 4 || designTokens.borderWidth !== 1) {
            throw new Error(
              `design token basis drifted: ${JSON.stringify(designTokens)}`
            );
          }
          const typographyIntegrity = await page.evaluate(() => {
            const root = getComputedStyle(document.documentElement);
            const tokenNames = [
              "--typography-title-1-size",
              "--typography-title-1-line-height",
              "--typography-title-2-size",
              "--typography-title-2-line-height",
              "--typography-title-3-size",
              "--typography-title-3-line-height",
              "--typography-title-4-size",
              "--typography-title-4-line-height",
              "--typography-body-size",
              "--typography-body-line-height",
              "--typography-ui-size",
              "--typography-ui-line-height",
              "--typography-small-size",
              "--typography-small-line-height",
              "--typography-caption-size",
              "--typography-caption-line-height",
            ];
            const allowedMetrics = new Set([
              "30px/40px",
              "26px/35px",
              "22px/31px",
              "20px/29px",
              "17px/25.5px",
              "15px/22.5px",
              "14px/21px",
              "12px/18px",
            ]);
            const offScale = [];
            const offFamily = [];
            const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT
            );
            while (walker.nextNode()) {
              const text = walker.currentNode.textContent
                ?.replace(/\s+/g, " ")
                .trim();
              const element = walker.currentNode.parentElement;
              if (!text || !element) continue;
              const style = getComputedStyle(element);
              const rect = element.getBoundingClientRect();
              if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                Number(style.opacity) === 0 ||
                rect.width === 0 ||
                rect.height === 0
              ) {
                continue;
              }
              const metric = `${style.fontSize}/${style.lineHeight}`;
              if (!allowedMetrics.has(metric) && offScale.length < 5) {
                offScale.push({
                  tag: element.tagName,
                  text: text.slice(0, 40),
                  metric,
                });
              }
              const family = style.fontFamily.toLowerCase();
              if (
                !family.includes("inter") &&
                !family.includes("ui-monospace") &&
                offFamily.length < 5
              ) {
                offFamily.push({
                  tag: element.tagName,
                  text: text.slice(0, 40),
                  family: style.fontFamily,
                });
              }
            }
            return {
              rootFontSize: root.fontSize,
              remTokens: Object.fromEntries(
                tokenNames.map((name) => [
                  name,
                  root.getPropertyValue(name).trim(),
                ])
              ),
              offScale,
              offFamily,
            };
          });
          if (
            typographyIntegrity.rootFontSize !== "16px" ||
            Object.values(typographyIntegrity.remTokens).some(
              (value) => !value.endsWith("rem")
            ) ||
            typographyIntegrity.offScale.length > 0 ||
            typographyIntegrity.offFamily.length > 0
          ) {
            throw new Error(
              `typography left rem SSOT: ${JSON.stringify(typographyIntegrity)}`
            );
          }
          if (device.name !== "desktop") {
            const responsiveHierarchy = await page.evaluate(() => {
              const article = document.querySelector("article");
              const h1 = document.querySelector(".theme-doc-markdown h1");
              const h2 = document.querySelector(".theme-doc-markdown h2");
              return {
                articleX: article?.getBoundingClientRect().x,
                h1Size: h1
                  ? Number.parseFloat(getComputedStyle(h1).fontSize)
                  : null,
                h2Size: h2
                  ? Number.parseFloat(getComputedStyle(h2).fontSize)
                  : null,
              };
            });
            const expectedGutter = device.name === "tablet" ? 32 : 16;
            if (
              responsiveHierarchy.articleX !== expectedGutter ||
              (responsiveHierarchy.h1Size !== null &&
                responsiveHierarchy.h2Size !== null &&
                responsiveHierarchy.h1Size <= responsiveHierarchy.h2Size)
            ) {
              throw new Error(
                `responsive hierarchy drifted: ${JSON.stringify(responsiveHierarchy)}`
              );
            }
          }
          if (
            route === "showcase/mermaid" &&
            (await page.locator(".docusaurus-mermaid-container svg").count()) <
              3
          ) {
            throw new Error("missing Mermaid diagrams");
          }
          if (route === "guides/markdown-gfm") {
            const details = page.locator(
              '.theme-doc-markdown [data-slot="collapsible"]'
            );
            if ((await details.count()) !== 1) {
              throw new Error("details does not use the Base Collapsible root");
            }
            await details.locator('[data-slot="collapsible-trigger"]').click();
            await page.waitForFunction(
              () =>
                document
                  .querySelector(
                    '.theme-doc-markdown [data-slot="collapsible"]'
                  )
                  ?.hasAttribute("data-open") === true
            );
            if (
              (await details
                .locator('[data-slot="collapsible-content"]')
                .count()) !== 1
            ) {
              throw new Error(
                "details does not use the Base Collapsible panel"
              );
            }
            const contentFlow = await page.evaluate(() => {
              const detailsBody = document.querySelector(
                '.theme-doc-markdown [data-slot="collapsible"] .theme-content-flow'
              );
              const first = detailsBody?.firstElementChild;
              const last = detailsBody?.lastElementChild;
              const bodyRect = detailsBody?.getBoundingClientRect();
              const firstRect = first?.getBoundingClientRect();
              const lastRect = last?.getBoundingClientRect();
              const alert = document.querySelector('[data-slot="alert"]');
              const alertTitle = alert?.querySelector(
                '[data-slot="alert-title"]'
              );
              const alertDescription = alert?.querySelector(
                '[data-slot="alert-description"]'
              );
              const detailsTrigger = document.querySelector(
                '.theme-doc-markdown [data-slot="collapsible-trigger"]'
              );
              const alertRect = alert?.getBoundingClientRect();
              const titleRect = alertTitle?.getBoundingClientRect();
              const descriptionRect = alertDescription?.getBoundingClientRect();
              return {
                detailsTop:
                  bodyRect && firstRect ? firstRect.top - bodyRect.top : null,
                detailsBottom:
                  bodyRect && lastRect
                    ? bodyRect.bottom - lastRect.bottom
                    : null,
                firstMarginTop: first
                  ? getComputedStyle(first).marginTop
                  : null,
                lastMarginBottom: last
                  ? getComputedStyle(last).marginBottom
                  : null,
                alertTop:
                  alertRect && titleRect ? titleRect.top - alertRect.top : null,
                alertBottom:
                  alertRect && descriptionRect
                    ? alertRect.bottom - descriptionRect.bottom
                    : null,
                alertFontSize: alertDescription
                  ? getComputedStyle(alertDescription).fontSize
                  : null,
                detailsTriggerFontSize: detailsTrigger
                  ? getComputedStyle(detailsTrigger).fontSize
                  : null,
                detailsBodyFontSize: detailsBody
                  ? getComputedStyle(detailsBody).fontSize
                  : null,
              };
            });
            if (
              contentFlow.firstMarginTop !== "0px" ||
              contentFlow.lastMarginBottom !== "0px" ||
              contentFlow.detailsTop === null ||
              contentFlow.detailsBottom === null ||
              Math.abs(contentFlow.detailsTop - contentFlow.detailsBottom) >
                1 ||
              contentFlow.alertTop !== contentFlow.alertBottom ||
              contentFlow.alertFontSize !== "14px" ||
              contentFlow.detailsTriggerFontSize !== "14px" ||
              contentFlow.detailsBodyFontSize !== "14px"
            ) {
              throw new Error(
                `content flow spacing drifted: ${JSON.stringify(contentFlow)}`
              );
            }
            const semanticScale = await page.evaluate(() => {
              const markdown = document.querySelector(".theme-doc-markdown");
              if (!markdown) return null;
              const probe = document.createElement("div");
              probe.style.position = "absolute";
              probe.style.visibility = "hidden";
              probe.innerHTML =
                "<h1>h1</h1><h2>h2</h2><h3>h3</h3><h4>h4</h4><h5>h5</h5><h6>h6</h6><p>p</p>";
              markdown.append(probe);
              const result = Object.fromEntries(
                Array.from(probe.children).map((element) => {
                  const style = getComputedStyle(element);
                  return [
                    element.tagName.toLowerCase(),
                    `${style.fontSize}/${style.lineHeight}`,
                  ];
                })
              );
              probe.remove();
              return result;
            });
            const expectedSemanticScale = {
              h1: "30px/40px",
              h2: "26px/35px",
              h3: "22px/31px",
              h4: "20px/29px",
              h5: "17px/25.5px",
              h6: "15px/22.5px",
              p: "17px/25.5px",
            };
            if (
              JSON.stringify(semanticScale) !==
              JSON.stringify(expectedSemanticScale)
            ) {
              throw new Error(
                `semantic type scale drifted: ${JSON.stringify(semanticScale)}`
              );
            }
            if (device.name === "desktop") {
              const foundationRows = await page.evaluate(() => {
                const metric = (selector) => {
                  const element = document.querySelector(selector);
                  if (!element) return null;
                  const style = getComputedStyle(element);
                  return {
                    height: element.getBoundingClientRect().height,
                    fontSize: style.fontSize,
                    lineHeight: style.lineHeight,
                    padding: style.padding,
                  };
                };
                return {
                  codeHeader: metric(".theme-code-block__header"),
                  detailsHeader: metric(
                    '.theme-doc-markdown [data-slot="collapsible-trigger"]'
                  ),
                  lnbItem: metric(
                    '.theme-doc-sidebar-menu [data-sidebar="menu-button"]'
                  ),
                  lnbSubItem: metric(
                    '.theme-doc-sidebar-menu [data-sidebar="menu-sub-button"]'
                  ),
                  lnbFooter: metric('[data-sidebar="footer"]'),
                  lnbFooterControl: metric('[data-sidebar="footer"] button'),
                };
              });
              if (
                foundationRows.codeHeader?.height !== 32 ||
                foundationRows.detailsHeader?.height !== 32 ||
                foundationRows.lnbItem?.height !== 32 ||
                foundationRows.lnbSubItem?.height !== 28 ||
                foundationRows.lnbFooter?.height !== 32 ||
                foundationRows.lnbFooter?.padding !== "0px" ||
                foundationRows.lnbFooterControl?.height !== 32 ||
                foundationRows.detailsHeader?.fontSize !== "14px" ||
                foundationRows.lnbItem?.fontSize !== "14px"
              ) {
                throw new Error(
                  `Base Nova foundation rows drifted: ${JSON.stringify(foundationRows)}`
                );
              }
            }
          }
          if (route === "guides/markdown-gfm") {
            const markdownPrimitives = await page.evaluate(() => {
              const metric = (selector) => {
                const element = document.querySelector(selector);
                if (!element) return null;
                const style = getComputedStyle(element);
                return {
                  display: style.display,
                  height: element.getBoundingClientRect().height,
                  padding: style.padding,
                  border: style.border,
                  fontSize: style.fontSize,
                };
              };
              return {
                table: metric('[data-slot="table"]'),
                tableHead: metric('[data-slot="table-head"]'),
                tableCell: metric('[data-slot="table-cell"]'),
                alert: metric('[data-slot="alert"]'),
                detailsPropsForwarded: !!document.querySelector(
                  '[data-slot="collapsible"][data-audit-details="forwarded"][title="Details attributes"]'
                ),
                summaryPropsForwarded: !!document.querySelector(
                  '[data-slot="collapsible-trigger"] [data-audit-summary="forwarded"]'
                ),
              };
            });
            if (
              markdownPrimitives.table?.display !== "table" ||
              markdownPrimitives.table?.fontSize !== "14px" ||
              markdownPrimitives.tableHead?.height !== 40 ||
              markdownPrimitives.tableHead?.padding !== "0px 8px" ||
              !markdownPrimitives.tableHead?.border.startsWith("0px") ||
              markdownPrimitives.tableCell?.padding !== "8px" ||
              markdownPrimitives.alert?.padding !== "8px 10px" ||
              markdownPrimitives.alert?.fontSize !== "14px" ||
              !markdownPrimitives.detailsPropsForwarded ||
              !markdownPrimitives.summaryPropsForwarded
            ) {
              throw new Error(
                `Base Nova Markdown primitives drifted: ${JSON.stringify(markdownPrimitives)}`
              );
            }
          }
          if (route === "showcase/mdx-playground") {
            const mdxPrimitives = await page.evaluate(() => {
              const metric = (selector) => {
                const element = document.querySelector(selector);
                if (!element) return null;
                const style = getComputedStyle(element);
                return {
                  height: element.getBoundingClientRect().height,
                  padding: style.padding,
                  gap: style.gap,
                  fontSize: style.fontSize,
                };
              };
              return {
                card: metric('[data-slot="card"]'),
                cardContent: metric('[data-slot="card-content"]'),
                tabsList: metric('[data-slot="tabs-list"]'),
                tabsTrigger: metric('[data-slot="tabs-trigger"]'),
              };
            });
            if (
              mdxPrimitives.card?.gap !== "16px" ||
              mdxPrimitives.card?.fontSize !== "14px" ||
              mdxPrimitives.cardContent?.padding !== "0px 16px" ||
              mdxPrimitives.tabsList?.height !== 32 ||
              mdxPrimitives.tabsList?.padding !== "3px" ||
              mdxPrimitives.tabsTrigger?.fontSize !== "14px"
            ) {
              throw new Error(
                `Base Nova MDX primitives drifted: ${JSON.stringify(mdxPrimitives)}`
              );
            }
          }
          if (consoleErrors.length)
            throw new Error(`console errors: ${consoleErrors.join(" | ")}`);
        } catch (error) {
          failures.push(`${id}: ${error.message}`);
          await page.screenshot({
            path: path.join(artifacts, `${id}.png`),
            fullPage: true,
          });
        }
      }

      if (device.name === "desktop") {
        try {
          await page.goto(baseUrl, { waitUntil: "networkidle" });
          const themeTrigger = page.locator(
            'button[aria-label^="Color theme:"]'
          );
          await themeTrigger.focus();
          await page.keyboard.press("Enter");
          await page.getByRole("menu").waitFor({ state: "visible" });
          await page.keyboard.press("ArrowDown");
          if (
            !(await page.evaluate(
              () => document.activeElement?.getAttribute("role") === "menuitem"
            ))
          ) {
            throw new Error(
              "theme menu keyboard navigation did not focus an item"
            );
          }
          await page.keyboard.press("Escape");
          await page.getByRole("menu").waitFor({ state: "hidden" });
          await page.waitForFunction(
            (element) => element === document.activeElement,
            await themeTrigger.elementHandle()
          );
          await themeTrigger.click();
          await page.getByRole("menuitem", { name: "Dark" }).click();
          await page.waitForFunction(
            () => document.documentElement.dataset.theme === "dark"
          );
          await themeTrigger.click();
          await page.getByRole("menuitem", { name: "Light" }).click();
          await page.waitForFunction(
            () => document.documentElement.dataset.theme === "light"
          );
          await page.waitForFunction(
            (element) => element === document.activeElement,
            await themeTrigger.elementHandle()
          );
          await page.reload({ waitUntil: "networkidle" });
          if (
            (await page.locator("html").getAttribute("data-theme")) !== "light"
          ) {
            throw new Error("selected color mode did not persist");
          }

          const navigationTrigger = page.locator(
            '[data-slot="navigation-menu-trigger"]'
          );
          await navigationTrigger.click();
          const navigationPopup = page.locator(
            '[data-slot="navigation-menu-popup"]'
          );
          await navigationPopup.waitFor({ state: "visible" });
          const navigationMetrics = await navigationPopup.evaluate((popup) => {
            const style = getComputedStyle(popup);
            const link = popup.querySelector(
              '[data-slot="navigation-menu-link"]'
            );
            const probe = document.createElement("div");
            probe.style.background = "var(--popover)";
            document.body.append(probe);
            const popover = getComputedStyle(probe).backgroundColor;
            probe.remove();
            return {
              background: style.backgroundColor,
              popover,
              radius: style.borderRadius,
              linkFontSize: link ? getComputedStyle(link).fontSize : null,
            };
          });
          if (
            navigationMetrics.background !== navigationMetrics.popover ||
            navigationMetrics.radius !== "10px" ||
            navigationMetrics.linkFontSize !== "14px"
          ) {
            throw new Error(
              `Base Nova navigation menu drifted: ${JSON.stringify(navigationMetrics)}`
            );
          }
          await page.keyboard.press("Escape");
          await navigationPopup.waitFor({ state: "hidden" });
          await page.waitForFunction(
            (element) => element === document.activeElement,
            await navigationTrigger.elementHandle()
          );

          const shell = await page.evaluate(() => {
            const sidebar = document.querySelector('[data-sidebar="sidebar"]');
            const sidebarContainer = document.querySelector(
              '[data-slot="sidebar-container"]'
            );
            const markdown = document.querySelector(".theme-doc-markdown");
            const activeMenuLink = document.querySelector(
              '.theme-doc-sidebar-menu [data-sidebar="menu-button"][data-active]'
            );
            const primaryMenuLink = document.querySelector(
              '.theme-doc-sidebar-menu [data-sidebar="menu-button"]'
            );
            const subMenuLink = document.querySelector(
              '.theme-doc-sidebar-menu [data-sidebar="menu-sub-button"]'
            );
            const root = getComputedStyle(document.documentElement);
            return {
              bodySize: getComputedStyle(document.body).fontSize,
              sidebarWidth: sidebar?.getBoundingClientRect().width,
              sidebarBackground: sidebar
                ? getComputedStyle(sidebar).backgroundColor
                : null,
              sidebarBorder: sidebarContainer
                ? getComputedStyle(sidebarContainer).borderRight
                : null,
              pageBackground: getComputedStyle(document.body).backgroundColor,
              markdownMax: markdown
                ? getComputedStyle(markdown).maxWidth
                : null,
              menuRadius: activeMenuLink
                ? getComputedStyle(activeMenuLink).borderRadius
                : null,
              menuTextDecoration: activeMenuLink
                ? getComputedStyle(activeMenuLink).textDecorationLine
                : null,
              primaryMenuHeight:
                primaryMenuLink?.getBoundingClientRect().height,
              primaryMenuFontSize: primaryMenuLink
                ? getComputedStyle(primaryMenuLink).fontSize
                : null,
              subMenuHeight: subMenuLink?.getBoundingClientRect().height,
              subMenuFontSize: subMenuLink
                ? getComputedStyle(subMenuLink).fontSize
                : null,
              bodyToken: root.getPropertyValue("--typography-body-size").trim(),
            };
          });
          if (
            shell.bodySize !== "17px" ||
            shell.bodyToken !== "1.0625rem" ||
            !shell.sidebarWidth ||
            Math.abs(shell.sidebarWidth - 256) > 1 ||
            shell.sidebarBackground !== shell.pageBackground ||
            !shell.sidebarBorder?.startsWith("1px solid") ||
            shell.markdownMax !== "832px" ||
            shell.menuRadius !== "8px" ||
            shell.menuTextDecoration !== "none" ||
            shell.primaryMenuHeight !== 32 ||
            shell.primaryMenuFontSize !== "14px"
          ) {
            throw new Error(
              `docs-shell visual contract drifted: ${JSON.stringify(shell)}`
            );
          }

          const initialSidebarState = await page
            .locator('[data-slot="sidebar"][data-state]')
            .getAttribute("data-state");
          await dispatchSidebarShortcut(page);
          await page.waitForFunction(
            (initialState) =>
              document
                .querySelector('[data-slot="sidebar"][data-state]')
                ?.getAttribute("data-state") !== initialState,
            initialSidebarState
          );
          await dispatchSidebarShortcut(page);
          await page.waitForFunction(
            (initialState) =>
              document
                .querySelector('[data-slot="sidebar"][data-state]')
                ?.getAttribute("data-state") === initialState,
            initialSidebarState
          );

          await page.goto(new URL("showcase/mdx-playground", baseUrl).href, {
            waitUntil: "networkidle",
          });
          const lineTabs = await page.evaluate(() => {
            const list = document.querySelector(
              '[data-slot="tabs-list"][data-variant="line"]'
            );
            const active = document.querySelector(
              '[data-slot="tabs-trigger"][data-active]'
            );
            const activeStyle = active ? getComputedStyle(active) : null;
            const underline = active
              ? getComputedStyle(active, "::after")
              : null;
            return {
              list: !!list,
              activeBackground: activeStyle?.backgroundColor,
              underlineOpacity: underline?.opacity,
              underlineHeight: underline?.height,
              fontSize: activeStyle?.fontSize,
              fontWeight: activeStyle?.fontWeight,
            };
          });
          if (
            !lineTabs.list ||
            lineTabs.activeBackground !== "rgba(0, 0, 0, 0)" ||
            lineTabs.underlineOpacity !== "1" ||
            lineTabs.underlineHeight !== "2px" ||
            lineTabs.fontSize !== "14px" ||
            lineTabs.fontWeight !== "500"
          ) {
            throw new Error(
              `line tabs visual contract drifted: ${JSON.stringify(lineTabs)}`
            );
          }
          const docsComponents = await page.evaluate(() => {
            const cards = Array.from(
              document.querySelectorAll('[data-slot="card"]')
            );
            const firstCard = cards[0];
            const cardTitle = firstCard?.querySelector(
              '[data-slot="card-title"]'
            );
            const cardContent = firstCard?.querySelector(
              '[data-slot="card-content"]'
            );
            const cardRect = firstCard?.getBoundingClientRect();
            const titleRect = cardTitle?.getBoundingClientRect();
            const contentRect = cardContent?.getBoundingClientRect();
            const codeBlock = document.querySelector(".theme-code-block");
            return {
              cardCount: cards.length,
              cardHeight: cardRect?.height,
              cardGap: firstCard ? getComputedStyle(firstCard).gap : null,
              cardInsetTop:
                cardRect && titleRect ? titleRect.top - cardRect.top : null,
              cardInsetRight:
                cardRect && titleRect ? cardRect.right - titleRect.right : null,
              cardInsetBottom:
                cardRect && contentRect
                  ? cardRect.bottom - contentRect.bottom
                  : null,
              cardInsetLeft:
                cardRect && titleRect ? titleRect.left - cardRect.left : null,
              cardTitleFontSize: cardTitle
                ? getComputedStyle(cardTitle).fontSize
                : null,
              cardContentFontSize: cardContent
                ? getComputedStyle(cardContent).fontSize
                : null,
              codeBlockShadow: codeBlock
                ? getComputedStyle(codeBlock).boxShadow
                : null,
              codeBlockHasShadowNoneClass:
                codeBlock?.classList.contains("shadow-none!") ?? false,
            };
          });
          if (
            docsComponents.cardCount !== 2 ||
            !docsComponents.cardHeight ||
            docsComponents.cardHeight > 140 ||
            docsComponents.cardGap !== "16px" ||
            docsComponents.cardInsetTop !== 16 ||
            docsComponents.cardInsetRight !== 16 ||
            docsComponents.cardInsetBottom !== 16 ||
            docsComponents.cardInsetLeft !== 16 ||
            docsComponents.cardTitleFontSize !== "17px" ||
            docsComponents.cardContentFontSize !== "14px" ||
            !docsComponents.codeBlockHasShadowNoneClass
          ) {
            throw new Error(
              `docs component density drifted: ${JSON.stringify(docsComponents)}`
            );
          }
          const previousRootFontSize = await page.evaluate(() => {
            const root = document.documentElement;
            const previous = root.style.fontSize;
            root.style.fontSize = "20px";
            return previous;
          });
          await page.waitForTimeout(400);
          const remScale = await page.evaluate(() => {
            const size = (selector) => {
              const element = document.querySelector(selector);
              return element ? getComputedStyle(element).fontSize : null;
            };
            return {
              h1: size(".theme-doc-markdown h1"),
              card: size('[data-slot="card-title"]'),
              tab: size('[data-slot="tabs-trigger"]'),
              code: size(".theme-code-block__content code"),
            };
          });
          await page.evaluate((previous) => {
            document.documentElement.style.fontSize = previous;
          }, previousRootFontSize);
          if (
            remScale.h1 !== "37.5px" ||
            remScale.card !== "21.25px" ||
            remScale.tab !== "17.5px" ||
            remScale.code !== "17.5px"
          ) {
            throw new Error(
              `typography does not scale from rem root: ${JSON.stringify(remScale)}`
            );
          }
        } catch (error) {
          failures.push(`desktop-${colorScheme}-theme-menu: ${error.message}`);
        }
      }

      if (device.name !== "desktop") {
        try {
          await page.goto(baseUrl, { waitUntil: "networkidle" });
          const toggle = page.locator(".navbar__toggle");
          const headerMetrics = await page.evaluate(() => {
            const button = document.querySelector(".navbar__toggle");
            const icon = button?.querySelector("svg");
            const breadcrumbs = document.querySelector(
              ".theme-doc-breadcrumbs"
            );
            const tocTrigger = document.querySelector(
              ".theme-mobile-toc-trigger"
            );
            const heading = document.querySelector(".theme-doc-markdown h1");
            return {
              button: button?.getBoundingClientRect().toJSON(),
              icon: icon?.getBoundingClientRect().toJSON(),
              breadcrumbs: breadcrumbs?.getBoundingClientRect().toJSON(),
              tocTrigger: tocTrigger?.getBoundingClientRect().toJSON(),
              tocSurface: tocTrigger?.parentElement
                ?.getBoundingClientRect()
                .toJSON(),
              tocJustify: tocTrigger
                ? getComputedStyle(tocTrigger).justifyContent
                : null,
              heading: heading?.getBoundingClientRect().toJSON(),
            };
          });
          if (
            headerMetrics.button?.width !== 32 ||
            headerMetrics.button?.height !== 32 ||
            headerMetrics.icon?.width !== 16 ||
            headerMetrics.icon?.x !== headerMetrics.breadcrumbs?.x ||
            headerMetrics.tocTrigger?.x !==
              (headerMetrics.tocSurface?.x ?? 0) + 1 ||
            headerMetrics.tocTrigger?.width !==
              (headerMetrics.tocSurface?.width ?? 0) - 2 ||
            headerMetrics.tocJustify !== "space-between" ||
            headerMetrics.tocSurface?.top -
              headerMetrics.breadcrumbs?.bottom !==
              16 ||
            headerMetrics.heading?.top - headerMetrics.tocSurface?.bottom !== 16
          ) {
            throw new Error(
              `mobile header alignment drifted: ${JSON.stringify(headerMetrics)}`
            );
          }

          await page.locator(".theme-mobile-toc-trigger").click();
          const tocSurface = await page.evaluate(() => {
            const toc = document.querySelector(".theme-doc-toc-mobile");
            const cardProbe = document.createElement("div");
            const accentProbe = document.createElement("div");
            cardProbe.style.background = "var(--card)";
            accentProbe.style.background = "var(--accent)";
            document.body.append(cardProbe, accentProbe);
            const result = {
              background: toc ? getComputedStyle(toc).backgroundColor : null,
              card: getComputedStyle(cardProbe).backgroundColor,
              accent: getComputedStyle(accentProbe).backgroundColor,
            };
            cardProbe.remove();
            accentProbe.remove();
            return result;
          });
          if (
            tocSurface.background !== tocSurface.card ||
            tocSurface.background === tocSurface.accent
          ) {
            throw new Error(
              `mobile TOC surface token drifted: ${JSON.stringify(tocSurface)}`
            );
          }
          const tocTrigger = page.locator(".theme-mobile-toc-trigger");
          const tocLink = page
            .locator(".theme-doc-toc-mobile .table-of-contents__link")
            .last();
          await tocTrigger.hover();
          await page.waitForTimeout(200);
          const triggerHover = await tocTrigger.evaluate(
            (element) => getComputedStyle(element).backgroundColor
          );
          await tocLink.hover();
          await page.waitForTimeout(200);
          const linkHover = await tocLink.evaluate(
            (element) => getComputedStyle(element).backgroundColor
          );
          if (triggerHover !== linkHover) {
            throw new Error(
              `mobile TOC hover tokens differ: ${JSON.stringify({ triggerHover, linkHover })}`
            );
          }
          await tocTrigger.click();

          await toggle.click();
          await page.waitForTimeout(350);
          const actionMetrics = await page
            .locator(".theme-mobile-sheet__actions button")
            .evaluateAll((buttons) =>
              buttons.map((button) => {
                const icon = button.querySelector("svg");
                return {
                  button: button.getBoundingClientRect().toJSON(),
                  icon: icon?.getBoundingClientRect().toJSON(),
                };
              })
            );
          if (
            actionMetrics.length !== 2 ||
            actionMetrics.some(
              ({ button, icon }) =>
                button.width !== 32 ||
                button.height !== 32 ||
                icon?.width !== 16 ||
                icon?.height !== 16
            )
          ) {
            throw new Error(
              `mobile action sizing drifted: ${JSON.stringify(actionMetrics)}`
            );
          }
          if ((await page.locator(".lucide-arrow-left").count()) !== 1) {
            throw new Error("secondary menu does not use the Lucide back icon");
          }
          const mobileSidebarItem = await page
            .locator('.theme-mobile-doc-sidebar [data-sidebar="menu-button"]')
            .first()
            .evaluate((item) => ({
              rect: item.getBoundingClientRect().toJSON(),
              fontSize: getComputedStyle(item).fontSize,
              radius: getComputedStyle(item).borderRadius,
              textDecoration: getComputedStyle(item).textDecorationLine,
            }));
          const secondaryRhythm = await page.evaluate(() => {
            const header = document
              .querySelector(".theme-mobile-sheet__header")
              ?.getBoundingClientRect();
            const back = document
              .querySelector(".navbar-sidebar__back")
              ?.getBoundingClientRect();
            const item = document
              .querySelector(
                '.theme-mobile-doc-sidebar [data-sidebar="menu-button"]'
              )
              ?.getBoundingClientRect();
            return {
              header: header?.toJSON(),
              back: back?.toJSON(),
              item: item?.toJSON(),
            };
          });
          const expectedMobileGutter = device.name === "tablet" ? 32 : 16;
          if (
            mobileSidebarItem.rect.x !== expectedMobileGutter ||
            mobileSidebarItem.rect.height !== 32 ||
            mobileSidebarItem.fontSize !== "14px" ||
            mobileSidebarItem.radius !== "8px" ||
            mobileSidebarItem.textDecoration !== "none" ||
            secondaryRhythm.back?.x !== expectedMobileGutter ||
            secondaryRhythm.back?.height !== 36 ||
            secondaryRhythm.back?.top - secondaryRhythm.header?.bottom !== 32 ||
            secondaryRhythm.item?.top - secondaryRhythm.back?.bottom !== 8
          ) {
            throw new Error(
              `mobile Base sidebar drifted: ${JSON.stringify({ mobileSidebarItem, secondaryRhythm })}`
            );
          }
          await page.locator(".navbar-sidebar__back").click();
          await page.waitForTimeout(100);
          const primaryMenu = await page.evaluate(() => {
            const list = document.querySelector(
              ".theme-mobile-sheet__panel--primary > .menu__list"
            );
            const link = list?.querySelector(".menu__link");
            return {
              padding: list ? getComputedStyle(list).padding : null,
              linkRect: link?.getBoundingClientRect().toJSON(),
              linkFont: link ? getComputedStyle(link).fontSize : null,
              lucideCaret: !!document.querySelector(
                ".theme-mobile-dropdown-caret .lucide-chevron-right"
              ),
            };
          });
          if (
            primaryMenu.padding !== `16px ${expectedMobileGutter}px 32px` ||
            primaryMenu.linkRect?.x !== secondaryRhythm.back?.x ||
            primaryMenu.linkRect?.y !== secondaryRhythm.back?.y ||
            primaryMenu.linkRect?.height !== 36 ||
            primaryMenu.linkFont !== "15px" ||
            !primaryMenu.lucideCaret
          ) {
            throw new Error(
              `mobile primary menu drifted: ${JSON.stringify(primaryMenu)}`
            );
          }

          await page.keyboard.press("Escape");
          await page.waitForFunction(
            (element) => element === document.activeElement,
            await toggle.elementHandle()
          );
          if (
            await page.evaluate(
              () => getComputedStyle(document.body).overflow === "hidden"
            )
          ) {
            throw new Error("mobile navigation left body scrolling locked");
          }
          await page.mouse.wheel(0, 400);
          await page.waitForFunction(() => window.scrollY > 0);

          await dispatchSidebarShortcut(page);
          await page.getByRole("dialog", { name: "Navigation menu" }).waitFor();
          if (
            (await page
              .locator('.theme-mobile-doc-sidebar [data-sidebar="menu-button"]')
              .count()) === 0
          ) {
            throw new Error("mobile shortcut opened an empty sidebar");
          }
          await dispatchSidebarShortcut(page);
          await page
            .getByRole("dialog", { name: "Navigation menu" })
            .waitFor({ state: "detached" });
        } catch (error) {
          failures.push(
            `${device.name}-${colorScheme}-navigation: ${error.message}`
          );
        }
      }
      await context.close();
    }
  }

  await browser.close();
  if (failures.length)
    throw new Error(`Docs starter audit failed:\n${failures.join("\n")}`);
  console.log(
    `Docs starter audit passed: ${cases.length * 2 * routes.length} route checks`
  );
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
