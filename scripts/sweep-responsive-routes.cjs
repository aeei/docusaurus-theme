#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const {
  discoverActualRoutes,
  projectRoot,
} = require("./lib/actual-routes.cjs");

const baseUrl = (
  process.env.DOCS_STARTER_URL ?? "http://127.0.0.1:3001/docusaurus-theme/"
).replace(/\/?$/, "/");
const artifactDir = path.join(projectRoot, "artifacts/responsive-sweep");
const minWidth = Number(process.env.SWEEP_MIN_WIDTH ?? 320);
const maxWidth = Number(process.env.SWEEP_MAX_WIDTH ?? 3840);
const height = 900;
const themes = ["light", "dark"];
const ignoredZeroAreaTags = new Set([
  "BR",
  "WBR",
  "SOURCE",
  "TRACK",
  "DEFS",
  "SYMBOL",
  "PATH",
  "LINE",
  "POLYLINE",
  "POLYGON",
  "CIRCLE",
  "ELLIPSE",
  "RECT",
  "MARKER",
  "CLIPPATH",
  "MASK",
  "STYLE",
]);

function routeUrl(route) {
  return new URL(route, baseUrl).href;
}

async function nextLayout(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      )
  );
}

async function inspectWidth(page, route, width) {
  return page.evaluate(
    ({ route, width, ignoredZeroAreaTags }) => {
      for (const element of document.querySelectorAll(
        ".theme-doc-sidebar-container"
      )) {
        element.style.transition = "none";
      }
      const visible = (element) => {
        const style = getComputedStyle(element);
        if (style.display === "contents") return false;
        if (typeof element.checkVisibility === "function") {
          return element.checkVisibility({
            checkOpacity: true,
            checkVisibilityCSS: true,
          });
        }
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number(style.opacity) !== 0 &&
          element.getClientRects().length > 0
        );
      };
      const rect = (element) => {
        const box = element.getBoundingClientRect();
        return {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          right: box.right,
          bottom: box.bottom,
        };
      };
      const pathFor = (element) => {
        const slot = element.getAttribute("data-slot");
        const className =
          typeof element.className === "string"
            ? element.className
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .join(".")
            : "";
        return `${element.tagName.toLowerCase()}${slot ? `[data-slot=${slot}]` : ""}${className ? `.${className}` : ""}`;
      };
      const intendedHorizontalScroller = (element) => {
        let current = element.parentElement;
        while (current) {
          const style = getComputedStyle(current);
          if (
            ["auto", "scroll"].includes(style.overflowX) &&
            current.scrollWidth > current.clientWidth
          ) {
            const box = current.getBoundingClientRect();
            return box.left >= -1 / 64 && box.right <= innerWidth + 1 / 64;
          }
          current = current.parentElement;
        }
        return false;
      };

      const failures = [];
      const root = document.documentElement;
      if (root.scrollWidth > root.clientWidth) {
        failures.push({
          type: "page-overflow",
          expected: root.clientWidth,
          actual: root.scrollWidth,
        });
      }

      const zeroArea = [];
      const outside = [];
      for (const element of document.querySelectorAll("body *")) {
        if (
          !visible(element) ||
          ignoredZeroAreaTags.includes(element.tagName.toUpperCase())
        )
          continue;
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const semanticZeroArea =
          element.getAttribute("aria-hidden") === "true" &&
          !(element instanceof SVGSVGElement);
        const meaningfulBox =
          element.matches("button, a, input, select, textarea, img, svg") ||
          (element.childElementCount === 0 &&
            (element.textContent ?? "").trim().length > 0);
        if (
          meaningfulBox &&
          (box.width <= 0 || box.height <= 0) &&
          !semanticZeroArea
        ) {
          zeroArea.push(pathFor(element));
        }
        if (
          box.width > 0 &&
          box.height > 0 &&
          (box.left < -1 / 64 || box.right > innerWidth + 1 / 64) &&
          style.position !== "fixed" &&
          !intendedHorizontalScroller(element)
        ) {
          outside.push({
            path: pathFor(element),
            left: box.left,
            right: box.right,
          });
        }
      }
      if (zeroArea.length)
        failures.push({ type: "zero-area", elements: zeroArea.slice(0, 20) });
      if (outside.length)
        failures.push({
          type: "unowned-horizontal-overflow",
          elements: outside.slice(0, 20),
        });

      for (const scroller of document.querySelectorAll(
        '[data-slot="table-container"], .theme-code-block, .docusaurus-mermaid-container'
      )) {
        if (!visible(scroller)) continue;
        if (scroller.scrollWidth > scroller.clientWidth) {
          const style = getComputedStyle(scroller);
          const descendantScroller = Array.from(
            scroller.querySelectorAll("*")
          ).some((element) => {
            const childStyle = getComputedStyle(element);
            return (
              ["auto", "scroll"].includes(childStyle.overflowX) &&
              element.scrollWidth > element.clientWidth
            );
          });
          if (
            !["auto", "scroll"].includes(style.overflowX) &&
            !descendantScroller
          ) {
            failures.push({
              type: "unowned-internal-overflow",
              element: pathFor(scroller),
            });
          }
        }
      }

      for (const codeBlock of document.querySelectorAll(
        "figure.theme-code-block"
      )) {
        if (!visible(codeBlock)) continue;
        const title = codeBlock.querySelector("figcaption");
        const action = codeBlock.querySelector('[data-slot="copy-button"]');
        const lines = [...codeBlock.querySelectorAll(".token-line")];
        const codeStyle = getComputedStyle(codeBlock);
        const markdown = codeBlock.closest(".theme-doc-markdown");
        const codeRect = codeBlock.getBoundingClientRect();
        const markdownRect = markdown?.getBoundingClientRect();
        if (
          codeStyle.marginLeft !== "0px" ||
          codeStyle.marginRight !== "0px" ||
          !markdownRect ||
          codeRect.x !== markdownRect.x ||
          codeRect.width !== markdownRect.width
        ) {
          failures.push({
            type: "code-content-alignment",
            expected: markdownRect
              ? { x: markdownRect.x, width: markdownRect.width, margin: "0px" }
              : "markdown owner",
            actual: {
              x: codeRect.x,
              width: codeRect.width,
              marginLeft: codeStyle.marginLeft,
              marginRight: codeStyle.marginRight,
            },
          });
        }
        const numbers = [
          ...codeBlock.querySelectorAll('[class*="codeLineNumber"]'),
        ];
        if (lines.length > 1 && numbers.length !== lines.length) {
          failures.push({
            type: "code-line-number-count",
            expected: lines.length,
            actual: numbers.length,
          });
        }
        if (numbers[0]) {
          const numberStyle = getComputedStyle(numbers[0]);
          if (
            numberStyle.position !== "sticky" ||
            numberStyle.width !== "64px" ||
            numberStyle.paddingRight !== "24px"
          ) {
            failures.push({
              type: "code-line-number-metric",
              position: numberStyle.position,
              width: numberStyle.width,
              paddingRight: numberStyle.paddingRight,
            });
          }
        }
        if (lines[0] && lines[0].getBoundingClientRect().height !== 26.5) {
          failures.push({
            type: "code-line-height",
            expected: 26.5,
            actual: lines[0].getBoundingClientRect().height,
          });
        }
        const dark = document.documentElement.dataset.theme === "dark";
        for (const [selector, expected] of [
          [".token.keyword", dark ? "rgb(160, 160, 160)" : "rgb(207, 34, 46)"],
          [
            ".token.function",
            dark ? "rgb(255, 199, 153)" : "rgb(130, 80, 223)",
          ],
          [
            ".token.tag:not(.punctuation)",
            dark ? "rgb(255, 199, 153)" : "rgb(17, 99, 41)",
          ],
          [
            ".token.tag.punctuation",
            dark ? "rgb(160, 160, 160)" : "rgb(31, 35, 40)",
          ],
          [
            ".token.plain-text",
            dark ? "rgb(255, 255, 255)" : "rgb(31, 35, 40)",
          ],
        ]) {
          const token = codeBlock.querySelector(selector);
          if (token && getComputedStyle(token).color !== expected) {
            failures.push({
              type: "code-syntax-color",
              selector,
              expected,
              actual: getComputedStyle(token).color,
            });
          }
        }
        const keyword = codeBlock.querySelector(".token.keyword");
        if (
          keyword &&
          (getComputedStyle(keyword).fontStyle !== "normal" ||
            getComputedStyle(keyword).fontWeight !== "400")
        ) {
          failures.push({
            type: "code-syntax-font",
            expected: { style: "normal", weight: "400" },
            actual: {
              style: getComputedStyle(keyword).fontStyle,
              weight: getComputedStyle(keyword).fontWeight,
            },
          });
        }
        if (title && action) {
          const blockRect = codeBlock.getBoundingClientRect();
          const titleRect = title.getBoundingClientRect();
          const actionRect = action.getBoundingClientRect();
          const iconRect = title.querySelector("svg")?.getBoundingClientRect();
          const titleMetric = {
            height: titleRect.height,
            actionTop: actionRect.top - blockRect.top,
            centerDelta: Math.abs(
              titleRect.top +
                titleRect.height / 2 -
                (actionRect.top + actionRect.height / 2)
            ),
            iconWidth: iconRect?.width,
            iconHeight: iconRect?.height,
          };
          if (
            JSON.stringify(titleMetric) !==
            JSON.stringify({
              height: 42.4375,
              actionTop: 6,
              centerDelta: 1.21875,
              iconWidth: 16,
              iconHeight: 16,
            })
          ) {
            failures.push({
              type: "code-title-action-metric",
              expected: {
                height: 42.4375,
                actionTop: 6,
                centerDelta: 1.21875,
                iconWidth: 16,
                iconHeight: 16,
              },
              actual: titleMetric,
            });
          }
        }
        const highlighted = codeBlock.querySelector(
          ".theme-code-block-highlighted-line"
        );
        if (highlighted) {
          const probe = document.createElement("div");
          probe.style.backgroundColor = "var(--code-highlight)";
          document.body.append(probe);
          const expectedBackground = getComputedStyle(probe).backgroundColor;
          probe.remove();
          const highlightStyle = getComputedStyle(highlighted);
          const markerStyle = getComputedStyle(highlighted, "::after");
          if (
            highlightStyle.backgroundColor !== expectedBackground ||
            markerStyle.width !== "2px" ||
            markerStyle.left !== "0px"
          ) {
            failures.push({
              type: "code-highlight-metric",
              expected: {
                background: expectedBackground,
                markerWidth: "2px",
                markerLeft: "0px",
              },
              actual: {
                background: highlightStyle.backgroundColor,
                markerWidth: markerStyle.width,
                markerLeft: markerStyle.left,
              },
            });
          }
        }
      }

      const navbar = document.querySelector(".navbar");
      const shell = document.querySelector(
        ".theme-doc-root-layout > main > .container-wrapper"
      );
      const docs = document.querySelector('[data-slot="docs"]');
      const desktopSidebar = document.querySelector(
        ".theme-doc-sidebar-desktop"
      );
      const mobileTrigger = document.querySelector(
        "[data-mobile-navigation-trigger]"
      );
      const toc = document.querySelector(".theme-doc-page__toc");
      const content = document.querySelector(
        ".theme-doc-page__content, .theme-doc-page__center"
      );
      const navbarRect = navbar ? rect(navbar) : null;
      const shellRect = shell ? rect(shell) : null;
      const docsRect = docs ? rect(docs) : null;
      const sidebarRect = desktopSidebar ? rect(desktopSidebar) : null;
      const triggerRect = mobileTrigger ? rect(mobileTrigger) : null;
      const tocRect = toc ? rect(toc) : null;
      const contentRect = content ? rect(content) : null;
      const desktop = width >= 1024;
      const shellWidth = Math.min(width, 1440);
      const shellLeft = (width - shellWidth) / 2;
      const shellRight = shellLeft + shellWidth;
      const expectedNavbarHeight = desktop ? 64 : 56;
      if (
        !shellRect ||
        shellRect.x !== shellLeft ||
        shellRect.width !== shellWidth
      ) {
        failures.push({
          type: "shell-max-width",
          expected: { x: shellLeft, width: shellWidth },
          actual: shellRect ? { x: shellRect.x, width: shellRect.width } : null,
        });
      }
      if (!navbarRect || navbarRect.height !== expectedNavbarHeight) {
        failures.push({
          type: "navbar-height",
          expected: expectedNavbarHeight,
          actual: navbarRect?.height,
        });
      }
      const navbarBlur = navbar ? getComputedStyle(navbar, "::before") : null;
      if (
        !navbarBlur ||
        navbarBlur.backdropFilter !== "blur(12px)" ||
        navbarBlur.borderBottomWidth !== "1px" ||
        navbarBlur.backgroundColor === "rgba(0, 0, 0, 0)"
      ) {
        failures.push({
          type: "navbar-nextra-blur",
          expected: {
            backdropFilter: "blur(12px)",
            borderBottomWidth: "1px",
            translucentBackground: true,
          },
          actual: navbarBlur
            ? {
                backdropFilter: navbarBlur.backdropFilter,
                borderBottomWidth: navbarBlur.borderBottomWidth,
                backgroundColor: navbarBlur.backgroundColor,
              }
            : null,
        });
      }
      if (!docsRect || docsRect.y !== expectedNavbarHeight) {
        failures.push({
          type: "docs-navbar-boundary",
          expected: expectedNavbarHeight,
          actual: docsRect?.y,
        });
      }
      if (!desktop && (!triggerRect || triggerRect.width <= 0)) {
        failures.push({ type: "missing-mobile-trigger" });
      }
      if (desktop) {
        const navbarInnerRect = rect(document.querySelector(".navbar__inner"));
        const expectedNavbarInner = {
          x: shellLeft + 24,
          right: shellRight - 24,
          width: shellWidth - 48,
        };
        const actualNavbarInner = navbarInnerRect
          ? {
              x: navbarInnerRect.x,
              right: navbarInnerRect.right,
              width: navbarInnerRect.width,
            }
          : null;
        if (
          JSON.stringify(actualNavbarInner) !==
          JSON.stringify(expectedNavbarInner)
        ) {
          failures.push({
            type: "desktop-navbar-shell-cap",
            expected: expectedNavbarInner,
            actual: actualNavbarInner,
          });
        }
        const navigationWeights = Array.from(
          document.querySelectorAll(
            '.navbar__items:not(.navbar__items--right) [data-slot="navigation-menu-list"] > [data-slot="navigation-menu-item"] > :is(a, button)'
          )
        ).map((element) => getComputedStyle(element).fontWeight);
        if (
          !navigationWeights.length ||
          navigationWeights.some((weight) => weight !== "500")
        ) {
          failures.push({
            type: "desktop-gnb-font-weight",
            expected: "500",
            actual: navigationWeights,
          });
        }
      }
      if (!desktop && width <= 640) {
        const navbarInnerRect = rect(document.querySelector(".navbar__inner"));
        const triggerIconRect = rect(mobileTrigger?.querySelector("svg"));
        const expectedMobileHeader = {
          inner: { x: 16, width: width - 32 },
          trigger: { x: 16, width: 32 },
          triggerIconLeft: 24,
          content: { x: 24, right: width - 24 },
        };
        const actualMobileHeader = {
          inner: navbarInnerRect
            ? { x: navbarInnerRect.x, width: navbarInnerRect.width }
            : null,
          trigger: triggerRect
            ? { x: triggerRect.x, width: triggerRect.width }
            : null,
          triggerIconLeft: triggerIconRect?.x,
          content: contentRect
            ? { x: contentRect.x, right: contentRect.right }
            : null,
        };
        if (
          JSON.stringify(actualMobileHeader) !==
          JSON.stringify(expectedMobileHeader)
        ) {
          failures.push({
            type: "mobile-header-content-alignment",
            expected: expectedMobileHeader,
            actual: actualMobileHeader,
          });
        }
      }
      if (desktop && triggerRect && triggerRect.width > 0) {
        failures.push({
          type: "mobile-trigger-visible-on-desktop",
          actual: triggerRect.width,
        });
      }
      if (!desktop && sidebarRect && sidebarRect.width > 0) {
        failures.push({
          type: "desktop-sidebar-visible-on-mobile",
          actual: sidebarRect.width,
        });
      }
      if (
        desktop &&
        (!sidebarRect ||
          sidebarRect.x !== shellLeft ||
          sidebarRect.width !== 288)
      ) {
        failures.push({
          type: "desktop-sidebar-geometry",
          expected: { x: shellLeft, width: 288 },
          actual: sidebarRect
            ? { x: sidebarRect.x, width: sidebarRect.width }
            : null,
        });
      }
      if (desktop) {
        const sidebarGroup = document.querySelector(
          ".theme-doc-sidebar-desktop [data-slot='sidebar-group']"
        );
        const sidebarContainer = document.querySelector(
          ".theme-doc-sidebar-desktop [data-slot='sidebar-container']"
        );
        const sidebarInner = document.querySelector(
          ".theme-doc-sidebar-desktop [data-slot='sidebar-inner']"
        );
        const sidebarContent = document.querySelector(
          ".theme-doc-sidebar-desktop [data-slot='sidebar-content']"
        );
        const backgroundProbe = document.createElement("div");
        backgroundProbe.style.backgroundColor = "var(--background)";
        document.body.append(backgroundProbe);
        const expectedSidebarBackground =
          getComputedStyle(backgroundProbe).backgroundColor;
        backgroundProbe.remove();
        const firstSidebarItem = sidebarGroup?.querySelector(
          '[data-slot="sidebar-menu-button"]'
        );
        const groupRect = sidebarGroup?.getBoundingClientRect();
        const itemRect = firstSidebarItem?.getBoundingClientRect();
        const itemRange = document.createRange();
        if (firstSidebarItem) itemRange.selectNodeContents(firstSidebarItem);
        const itemTextRect = firstSidebarItem
          ? itemRange.getClientRects()[0]
          : null;
        const sidebarSpacing = {
          surface: {
            backgroundMatches:
              sidebarInner &&
              getComputedStyle(sidebarInner).backgroundColor ===
                expectedSidebarBackground,
            borderRightWidth: desktopSidebar
              ? getComputedStyle(desktopSidebar).borderRightWidth
              : null,
            position: desktopSidebar
              ? getComputedStyle(desktopSidebar).position
              : null,
            top: desktopSidebar ? getComputedStyle(desktopSidebar).top : null,
            scrollFade:
              sidebarContent &&
              getComputedStyle(sidebarContent).maskImage !== "none" &&
              getComputedStyle(sidebarContent).animationTimeline.includes(
                "scroll"
              ),
          },
          group: groupRect
            ? {
                x: groupRect.x,
                width: groupRect.width,
                padding: getComputedStyle(sidebarGroup).padding,
              }
            : null,
          firstItem: itemRect
            ? { x: itemRect.x, width: itemRect.width, height: itemRect.height }
            : null,
          firstItemTextLeft: itemTextRect?.x ?? null,
        };
        if (
          JSON.stringify(sidebarSpacing) !==
          JSON.stringify({
            surface: {
              backgroundMatches: true,
              borderRightWidth: "0px",
              position: "sticky",
              top: "64px",
              scrollFade: true,
            },
            group: {
              x: shellLeft + 8,
              width: 280,
              padding: "8px",
            },
            firstItem: {
              x: shellLeft + 16,
              width: 264,
              height: 32,
            },
            firstItemTextLeft: shellLeft + 24,
          })
        ) {
          failures.push({
            type: "desktop-sidebar-spacing",
            expected: {
              surface: {
                backgroundMatches: true,
                borderRightWidth: "0px",
                position: "sticky",
                top: "64px",
                scrollFade: true,
              },
              group: {
                x: shellLeft + 8,
                width: 280,
                padding: "8px",
              },
              firstItem: {
                x: shellLeft + 16,
                width: 264,
                height: 32,
              },
              firstItemTextLeft: shellLeft + 24,
            },
            actual: sidebarSpacing,
          });
        }
      }
      if (docsRect) {
        const expectedX = desktop ? shellLeft + 288 : 8;
        if (docsRect.x !== expectedX) {
          failures.push({
            type: "docs-x",
            expected: expectedX,
            actual: docsRect.x,
          });
        }
      }
      if (
        desktop &&
        sidebarRect &&
        docsRect &&
        sidebarRect.right > docsRect.x
      ) {
        failures.push({
          type: "sidebar-docs-overlap",
          sidebarRight: sidebarRect.right,
          docsX: docsRect.x,
        });
      }
      if (contentRect && contentRect.width > 640) {
        failures.push({
          type: "content-max-width",
          expected: 640,
          actual: contentRect.width,
        });
      }
      if (width >= 1280) {
        const breadcrumb = document.querySelector('[data-slot="breadcrumb"]');
        const title = document.querySelector(".theme-doc-markdown h1");
        const breadcrumbGap =
          breadcrumb && title
            ? title.getBoundingClientRect().top -
              breadcrumb.getBoundingClientRect().bottom
            : null;
        if (breadcrumbGap !== 12.796875) {
          failures.push({
            type: "breadcrumb-title-gap",
            expected: 12.796875,
            actual: breadcrumbGap,
          });
        }
      }

      const tocExpected =
        width >= 1280 &&
        route !== "base-nova-parity" &&
        document.querySelectorAll(".table-of-contents__link").length > 0;
      const tocVisible = Boolean(
        tocRect && tocRect.width > 0 && getComputedStyle(toc).display !== "none"
      );
      if (tocExpected !== tocVisible) {
        failures.push({
          type: "toc-visibility",
          expected: tocExpected,
          actual: tocVisible,
        });
      }
      if (tocVisible) {
        if (tocRect?.x !== shellRight - 288 || tocRect.right !== shellRight) {
          failures.push({
            type: "toc-shell-alignment",
            expected: { x: shellRight - 288, right: shellRight },
            actual: tocRect ? { x: tocRect.x, right: tocRect.right } : null,
          });
        }
        const tocHeader = document.querySelector(
          ".theme-doc-toc-desktop__header"
        );
        const tocScroll = document.querySelector(
          ".theme-doc-toc-desktop__scroll"
        );
        const tocScrollStyle = tocScroll ? getComputedStyle(tocScroll) : null;
        const tocComposition = {
          headerOutsideScroll: Boolean(
            tocHeader && tocScroll && !tocScroll.contains(tocHeader)
          ),
          scrollFade: Boolean(
            tocScrollStyle &&
            tocScrollStyle.maskImage !== "none" &&
            tocScrollStyle.animationTimeline.includes("scroll")
          ),
          belowNavbar: Boolean(
            tocHeader &&
            navbarRect &&
            tocHeader.getBoundingClientRect().top >= navbarRect.bottom
          ),
        };
        if (
          JSON.stringify(tocComposition) !==
          JSON.stringify({
            headerOutsideScroll: true,
            scrollFade: true,
            belowNavbar: true,
          })
        ) {
          failures.push({
            type: "toc-fixed-header-scroll-fade",
            expected: {
              headerOutsideScroll: true,
              scrollFade: true,
              belowNavbar: true,
            },
            actual: tocComposition,
          });
        }
      }

      const article = document.querySelector(".theme-doc-markdown");
      const insideArticleComponent = (element) => {
        const component = element.closest(
          '[data-slot]:not([data-slot="docs"])'
        );
        return Boolean(component && article?.contains(component));
      };
      const headings = article
        ? Array.from(article.querySelectorAll("h1, h2, h3, h4, h5, h6")).filter(
            (element) =>
              !insideArticleComponent(element) &&
              !element.closest(".docusaurus-mermaid-container")
          )
        : [];
      if (route !== "base-nova-parity") {
        if (!headings.length || headings[0].tagName !== "H1") {
          failures.push({
            type: "missing-leading-h1",
            actual: headings[0]?.tagName,
          });
        }
        for (let index = 1; index < headings.length; index += 1) {
          const previous = Number(headings[index - 1].tagName.slice(1));
          const current = Number(headings[index].tagName.slice(1));
          if (current > previous + 1) {
            failures.push({
              type: "heading-level-skip",
              previous,
              current,
              index,
            });
          }
        }

        const directChildren = Array.from(article?.children ?? []);
        const pageHeader = article?.querySelector(":scope > header");
        const pageHeaderNext = pageHeader?.nextElementSibling;
        if (
          pageHeader &&
          pageHeaderNext &&
          rect(pageHeaderNext).y - rect(pageHeader).bottom !== 24
        ) {
          failures.push({
            type: "page-title-flow-gap",
            expected: 24,
            actual: rect(pageHeaderNext).y - rect(pageHeader).bottom,
          });
        }
        for (const heading of directChildren.filter((element) =>
          element.matches("h1, h2, h3, h4, h5, h6")
        )) {
          const next = heading.nextElementSibling;
          if (next && rect(next).y - rect(heading).bottom !== 16) {
            failures.push({
              type: "heading-content-flow-gap",
              heading: heading.textContent?.trim(),
              expected: 16,
              actual: rect(next).y - rect(heading).bottom,
            });
          }
        }
        const ownsComponent = (element) =>
          element.hasAttribute("data-slot") ||
          Boolean(element.querySelector(":scope > [data-slot]")) ||
          element.matches(".theme-code-block, .docusaurus-mermaid-container");
        for (let index = 1; index < directChildren.length; index += 1) {
          const previous = directChildren[index - 1];
          const next = directChildren[index];
          if (
            (ownsComponent(previous) || ownsComponent(next)) &&
            rect(next).y - rect(previous).bottom < 16
          ) {
            failures.push({
              type: "component-separation-gap",
              previous: pathFor(previous),
              next: pathFor(next),
              expectedMinimum: 16,
              actual: rect(next).y - rect(previous).bottom,
            });
          }
        }
      }

      const codeBackgrounds = new Set(
        Array.from(document.querySelectorAll(".theme-code-block")).map(
          (element) => getComputedStyle(element).backgroundColor
        )
      );
      if (codeBackgrounds.size > 1) {
        failures.push({
          type: "code-surface-color-inconsistent",
          actual: Array.from(codeBackgrounds),
        });
      }

      const proseLists = article
        ? Array.from(article.querySelectorAll("ul, ol")).filter(
            (element) =>
              !insideArticleComponent(element) &&
              !element.closest(
                ".theme-code-block, .docusaurus-mermaid-container"
              ) &&
              !element.classList.contains("contains-task-list")
          )
        : [];
      for (const list of proseLists) {
        if (getComputedStyle(list).listStyleType === "none") {
          failures.push({
            type: "missing-list-marker",
            element: pathFor(list),
          });
        }
        for (const item of list.querySelectorAll(":scope > li")) {
          if (getComputedStyle(item).display !== "list-item") {
            failures.push({
              type: "invalid-list-item-display",
              element: pathFor(item),
            });
          }
        }
      }

      const signature = {
        navbarHeight: navbarRect?.height ?? 0,
        desktopSidebar: Boolean(sidebarRect && sidebarRect.width > 0),
        mobileTrigger: Boolean(triggerRect && triggerRect.width > 0),
        toc: tocVisible,
        proseFontSize: article ? getComputedStyle(article).fontSize : null,
        footerDirection: document.querySelector(".footer > .container")
          ? getComputedStyle(document.querySelector(".footer > .container"))
              .flexDirection
          : null,
        contentAtMax: contentRect ? contentRect.width === 640 : false,
        tableScrollable: Array.from(
          document.querySelectorAll('[data-slot="table-container"]')
        ).some((element) => element.scrollWidth > element.clientWidth),
        codeScrollable: Array.from(
          document.querySelectorAll(".theme-code-block pre")
        ).some((element) => element.scrollWidth > element.clientWidth),
        mermaidScrollable: Array.from(
          document.querySelectorAll(".docusaurus-mermaid-container")
        ).some((element) => element.scrollWidth > element.clientWidth),
        tabsScrollable: Array.from(
          document.querySelectorAll('[data-slot="tabs-list"]')
        ).some((element) => element.scrollWidth > element.clientWidth),
        paginatorColumns: document.querySelector(".pagination-nav")
          ? getComputedStyle(
              document.querySelector(".pagination-nav")
            ).gridTemplateColumns.split(/\s+/).length
          : null,
        cardsSideBySide: (() => {
          const cards = Array.from(
            document.querySelectorAll('.theme-doc-markdown [data-slot="card"]')
          ).filter((element) => visible(element));
          return cards.length > 1
            ? cards[0].getBoundingClientRect().y ===
                cards[1].getBoundingClientRect().y
            : null;
        })(),
        breadcrumbWrapped: (() => {
          const list = document.querySelector('[data-slot="breadcrumb-list"]');
          return list ? list.getBoundingClientRect().height > 20 : null;
        })(),
      };

      return { failures, signature };
    },
    { route, width, ignoredZeroAreaTags: [...ignoredZeroAreaTags] }
  );
}

function signatureKey(signature) {
  return JSON.stringify(signature);
}

async function setContextTheme(context, theme) {
  await context.addInitScript(
    (value) => localStorage.setItem("theme", value),
    theme
  );
}

async function genericBoundaryInteraction(page, route, width) {
  await page.goto(routeUrl(route), { waitUntil: "networkidle" });
  await nextLayout(page);
  const result = { route, width, checks: [], failures: [] };

  const firstInteractive = page
    .locator('main a[href], main button:not([disabled]), main [role="tab"]')
    .filter({ visible: true })
    .first();
  if ((await firstInteractive.count()) > 0) {
    const before = await firstInteractive.boundingBox();
    await firstInteractive.hover();
    const after = await firstInteractive.boundingBox();
    result.checks.push("hover");
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      result.failures.push("hover changed geometry");
    }
    await firstInteractive.focus();
    const focusVisible = await firstInteractive.evaluate((element) =>
      element.matches(":focus-visible")
    );
    result.checks.push("focus-visible");
    if (!focusVisible)
      result.failures.push("focused control lacks :focus-visible");
  }

  const overflow = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  if (overflow.scroll > overflow.client)
    result.failures.push("page overflow after hover/focus");
  return result;
}

async function componentBoundaryInteractions(page, width) {
  const results = [];
  const desktop = width >= 1024;

  await page.goto(routeUrl("guides/markdown-gfm"), {
    waitUntil: "networkidle",
  });
  if (desktop) {
    const navigation = page
      .locator(".navbar")
      .getByRole("button", { name: "Showcase", exact: true });
    await navigation.focus();
    await navigation.press("Enter");
    const navigationMenu = page.locator(
      '[data-slot="navigation-menu-content"]'
    );
    await navigationMenu.waitFor({ state: "visible" });
    const longLink = navigationMenu.getByRole("link", {
      name: "Markdown + GFM",
    });
    const longLinkMetrics = await longLink.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return {
        lines: range.getClientRects().length,
        height: getComputedStyle(element).height,
      };
    });
    if (longLinkMetrics.lines !== 1 || longLinkMetrics.height !== "36px") {
      results.push(
        `NavigationMenu label wrapped: ${JSON.stringify(longLinkMetrics)}`
      );
    }
    await page.keyboard.press("Escape");
    await navigationMenu.waitFor({ state: "hidden" });
    await page.waitForFunction(
      (trigger) => document.activeElement === trigger,
      await navigation.elementHandle()
    );
    if (
      !(await navigation.evaluate((element) =>
        element.matches(":focus-visible")
      ))
    ) {
      results.push("NavigationMenu Escape did not restore visible focus");
    }
  } else {
    const trigger = page.locator("[data-mobile-navigation-trigger]");
    await trigger.click();
    const sheet = page.locator('[data-slot="sheet-content"]');
    await sheet.waitFor();
    await page.waitForFunction(() => {
      const element = document.querySelector('[data-slot="sheet-content"]');
      return element && getComputedStyle(element).translate === "none";
    });
    const mobileSpacing = await sheet.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const backgroundProbe = document.createElement("div");
      backgroundProbe.style.backgroundColor = "var(--background)";
      document.body.append(backgroundProbe);
      const expectedBackground =
        getComputedStyle(backgroundProbe).backgroundColor;
      backgroundProbe.remove();
      const header = element.querySelector('[data-slot="sheet-header"]');
      const title = element.querySelector('[data-slot="sheet-title"]');
      const description = element.querySelector(
        '[data-slot="sheet-description"]'
      );
      const close = element.querySelector('[data-slot="sheet-close"]');
      const navigation = element.querySelector(
        'nav[aria-label="Docs sidebar"]'
      );
      const sidebarContent = navigation?.closest(
        '[data-slot="sidebar-content"]'
      );
      const firstItem = navigation?.querySelector(
        '[data-slot="sidebar-menu-button"]'
      );
      const headerRect = header?.getBoundingClientRect();
      const titleRect = title?.getBoundingClientRect();
      const descriptionRect = description?.getBoundingClientRect();
      const closeRect = close?.getBoundingClientRect();
      const navigationRect = navigation?.getBoundingClientRect();
      const firstItemRect = firstItem?.getBoundingClientRect();
      return {
        sheet: { x: rect.x, width: rect.width },
        surface: {
          backgroundMatches:
            getComputedStyle(element).backgroundColor === expectedBackground,
          borderRightWidth: getComputedStyle(element).borderRightWidth,
          scrollFade: Boolean(
            sidebarContent &&
            getComputedStyle(sidebarContent).maskImage !== "none" &&
            getComputedStyle(sidebarContent).animationTimeline.includes(
              "scroll"
            )
          ),
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
        close: closeRect
          ? {
              x: closeRect.x,
              y: closeRect.y,
              width: closeRect.width,
              height: closeRect.height,
              rightInset: rect.right - closeRect.right,
              titleCenterDelta: titleRect
                ? Math.abs(
                    titleRect.y +
                      titleRect.height / 2 -
                      (closeRect.y + closeRect.height / 2)
                  )
                : null,
            }
          : null,
        navigation: navigationRect
          ? { x: navigationRect.x, width: navigationRect.width }
          : null,
        firstItem: firstItemRect
          ? {
              x: firstItemRect.x,
              width: firstItemRect.width,
              height: firstItemRect.height,
            }
          : null,
      };
    });
    if (
      JSON.stringify(mobileSpacing) !==
      JSON.stringify({
        sheet: { x: 0, width: 288 },
        surface: {
          backgroundMatches: true,
          borderRightWidth: "0px",
          scrollFade: true,
        },
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
        navigation: { x: 8, width: 272 },
        firstItem: { x: 8, width: 272, height: 32 },
      })
    ) {
      results.push(
        `Sheet spacing differs from official mobile Sidebar: ${JSON.stringify(mobileSpacing)}`
      );
    }
    await page.keyboard.press("Escape");
    await page
      .locator('[data-slot="sheet-content"]')
      .waitFor({ state: "detached" });
    if (
      !(await trigger.evaluate((element) => element.matches(":focus-visible")))
    ) {
      results.push("Sheet Escape did not restore visible focus");
    }
  }

  const themeTrigger = page.getByRole("button", { name: /^Color theme:/ });
  await themeTrigger.focus();
  await themeTrigger.press("Enter");
  await page
    .getByRole("menu", { name: /^Color theme:/ })
    .waitFor({ state: "visible" });
  await page.keyboard.press("Escape");
  await page.waitForFunction(() =>
    document.activeElement?.matches('[data-slot="dropdown-menu-trigger"]')
  );
  const themeFocusVisible = await page.evaluate(() =>
    document.activeElement?.matches(
      '[data-slot="dropdown-menu-trigger"]:focus-visible'
    )
  );
  if (!themeFocusVisible) {
    results.push("Theme menu Escape did not restore visible focus");
  }

  const details = page
    .locator('.theme-doc-markdown [data-slot="accordion-trigger"]')
    .last();
  await details.click();
  if ((await details.getAttribute("aria-expanded")) !== "true") {
    results.push("Accordion did not expand");
  }
  await details.click();

  await page.goto(routeUrl("showcase/mdx-playground"), {
    waitUntil: "networkidle",
  });
  const tabs = page.locator('[data-slot="tabs-trigger"]');
  await tabs.nth(1).click();
  if ((await tabs.nth(1).getAttribute("aria-selected")) !== "true") {
    results.push("Tabs did not select second tab");
  }
  const disabled = page.getByRole("button", { name: "Disabled" });
  if (!(await disabled.isDisabled()))
    results.push("Disabled Button is enabled");
  if ((await page.locator('[data-slot="spinner"]').count()) < 1) {
    results.push("Loading Spinner missing");
  }

  await page.goto(routeUrl("showcase/mermaid"), { waitUntil: "networkidle" });
  for (const scroller of await page
    .locator(".docusaurus-mermaid-container")
    .all()) {
    const metrics = await scroller.evaluate((element) => ({
      client: element.clientWidth,
      scroll: element.scrollWidth,
    }));
    if (metrics.scroll > metrics.client) {
      await scroller.evaluate((element) => {
        element.scrollLeft = element.scrollWidth;
      });
      if ((await scroller.evaluate((element) => element.scrollLeft)) <= 0) {
        results.push("Mermaid horizontal scroll did not move");
      }
    }
  }

  return results;
}

function reportMarkdown(discovery, rows, transitions, boundaryRows) {
  const failures = rows.reduce((sum, row) => sum + row.failures.length, 0);
  return [
    "# Exhaustive responsive route sweep",
    "",
    `- primary routes: ${discovery.primaryRoutes.length}`,
    `- supplemental routes excluded from primary sweep: ${discovery.supplementalRoutes.join(", ") || "none"}`,
    `- themes: ${themes.length}`,
    `- widths: ${minWidth}..${maxWidth} inclusive (${maxWidth - minWidth + 1})`,
    `- route/theme/width rows: ${rows.length}`,
    `- failures: ${failures}`,
    `- interaction boundary rows: ${boundaryRows.length}`,
    "",
    "## Routes",
    "",
    ...discovery.primaryRoutes.map((route) => `- \`/${route}\``),
    "",
    "## Discrete transitions",
    "",
    ...transitions.map(
      (entry) =>
        `- \`/${entry.route}\` ${entry.theme} @ ${entry.width}px: ${entry.changed.join(", ")}`
    ),
    "",
    "## Boundary interactions",
    "",
    ...boundaryRows.map(
      (entry) =>
        `- ${entry.theme} ${entry.width}px ${entry.route ?? "component matrix"}: ${entry.failures.length ? entry.failures.join("; ") : "pass"}`
    ),
    "",
  ].join("\n");
}

(async () => {
  const discovery = discoverActualRoutes();
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const pages = [];
  const rows = [];
  const transitions = [];
  const previousSignatures = new Map();

  try {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: minWidth, height },
        colorScheme: theme,
      });
      await setContextTheme(context, theme);
      for (const route of discovery.primaryRoutes) {
        const page = await context.newPage();
        const response = await page.goto(routeUrl(route), {
          waitUntil: "networkidle",
        });
        if (!response?.ok())
          throw new Error(`/${route}: HTTP ${response?.status()}`);
        pages.push({ page, route, theme, context });
      }
    }

    for (let width = minWidth; width <= maxWidth; width += 1) {
      await Promise.all(
        pages.map(async ({ page }) => {
          await page.setViewportSize({ width, height });
          await nextLayout(page);
        })
      );
      const inspected = await Promise.all(
        pages.map(async ({ page, route, theme }) => ({
          route,
          theme,
          width,
          ...(await inspectWidth(page, route, width)),
        }))
      );
      for (const row of inspected) {
        rows.push(row);
        const key = `${row.route}\0${row.theme}`;
        const previous = previousSignatures.get(key);
        const currentKey = signatureKey(row.signature);
        if (previous && previous.key !== currentKey) {
          const changed = Object.keys(row.signature).filter(
            (name) => !Object.is(previous.signature[name], row.signature[name])
          );
          transitions.push({
            route: row.route,
            theme: row.theme,
            width,
            changed,
          });
        }
        previousSignatures.set(key, {
          key: currentKey,
          signature: row.signature,
        });
      }
      if (width % 100 === 0) console.log(`swept through ${width}px`);
    }

    const transitionWidths = [...new Set(transitions.map(({ width }) => width))]
      .flatMap((width) => [width - 1, width, width + 1])
      .filter((width) => width >= minWidth && width <= maxWidth)
      .filter((width, index, values) => values.indexOf(width) === index)
      .sort((a, b) => a - b);
    const boundaryRows = [];
    fs.writeFileSync(
      path.join(artifactDir, "width-rows.partial.json"),
      JSON.stringify({
        ...discovery,
        range: [minWidth, maxWidth],
        themes,
        rows,
        transitions,
      })
    );

    for (const theme of themes) {
      const context = await browser.newContext({ colorScheme: theme });
      await setContextTheme(context, theme);
      const page = await context.newPage();
      for (const width of transitionWidths) {
        await page.setViewportSize({ width, height });
        for (const route of discovery.primaryRoutes) {
          try {
            const interaction = await genericBoundaryInteraction(
              page,
              route,
              width
            );
            boundaryRows.push({ theme, ...interaction });
          } catch (error) {
            boundaryRows.push({
              theme,
              width,
              route,
              checks: ["generic-boundary"],
              failures: [
                error instanceof Error ? error.message : String(error),
              ],
            });
          }
        }
        try {
          const failures = await componentBoundaryInteractions(page, width);
          boundaryRows.push({
            theme,
            width,
            route: null,
            checks: ["component-matrix"],
            failures,
          });
        } catch (error) {
          boundaryRows.push({
            theme,
            width,
            route: null,
            checks: ["component-matrix"],
            failures: [error instanceof Error ? error.message : String(error)],
          });
        }
      }
      await context.close();
    }

    const failures = rows.filter((row) => row.failures.length);
    const interactionFailures = boundaryRows.filter(
      (row) => row.failures.length
    );
    fs.writeFileSync(
      path.join(artifactDir, "results.json"),
      JSON.stringify(
        {
          ...discovery,
          range: [minWidth, maxWidth],
          themes,
          rows,
          transitions,
          boundaryRows,
        },
        null,
        2
      )
    );
    fs.writeFileSync(
      path.join(artifactDir, "report.md"),
      reportMarkdown(discovery, rows, transitions, boundaryRows)
    );

    if (failures.length || interactionFailures.length) {
      console.error(
        `Responsive sweep failed: ${failures.length} width rows, ${interactionFailures.length} interaction rows. See artifacts/responsive-sweep/results.json`
      );
      process.exitCode = 1;
    } else {
      console.log(
        `Responsive sweep passed: ${rows.length} route/theme/width rows and ${boundaryRows.length} interaction rows.`
      );
    }
  } finally {
    await browser.close();
  }
})();
