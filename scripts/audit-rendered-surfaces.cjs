const fs = require("node:fs");
const path = require("node:path");

const baseUrl =
  process.env.DOCS_STARTER_URL ?? "http://127.0.0.1:3001/docusaurus-theme/";
const artifactDir = path.resolve("artifacts/rendered-surfaces");
const defaultWidths = [390, 700, 768, 1440, 2736];
const defaultThemes = ["light", "dark"];

function parseList(value, fallback, mapper = (entry) => entry) {
  return value
    ? value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map(mapper)
    : fallback;
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const part = argv[index];
    if (!part.startsWith("--")) continue;
    args[part.slice(2)] = argv[index + 1];
    index += 1;
  }

  return {
    route: args.route ?? "guides/markdown-gfm",
    widths: parseList(args.widths ?? args.width, defaultWidths, Number),
    themes: parseList(args.themes ?? args.theme, defaultThemes),
  };
}

function routeUrl(route) {
  return new URL(route, baseUrl).href;
}

function expectedRootFontSize() {
  return 15;
}

function expectedRootLineHeight(width) {
  return expectedRootFontSize(width) * 1.75;
}

async function resetFocusForKeyboardNavigation(page) {
  const proseRoot = page.locator(".theme-doc-markdown");
  const box = await proseRoot.boundingBox();
  if (!box) throw new Error("Missing .theme-doc-markdown bounding box");

  await page.mouse.click(
    box.x + Math.min(8, Math.max(box.width - 1, 1)),
    box.y + Math.min(8, Math.max(box.height - 1, 1))
  );
}

async function tabToProseLink(page, focusTargetLinkIndex, maxTabs = 100) {
  await resetFocusForKeyboardNavigation(page);

  for (let attempt = 1; attempt <= maxTabs; attempt += 1) {
    await page.keyboard.press("Tab");
    const status = await page.evaluate((index) => {
      const links = Array.from(
        document.querySelectorAll(".theme-doc-markdown a[href]")
      );
      const target = links[index];
      const activeElement = document.activeElement;
      return {
        reached: target instanceof HTMLElement && activeElement === target,
        focusVisible:
          target instanceof HTMLElement && target.matches(":focus-visible"),
        activeTag: activeElement?.tagName ?? null,
        activeText: (activeElement?.textContent || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 120),
      };
    }, focusTargetLinkIndex);

    if (status.reached) {
      if (!status.focusVisible)
        throw new Error("Reached focus target without :focus-visible");
      return;
    }
  }

  const failure = await page.evaluate((index) => {
    const links = Array.from(
      document.querySelectorAll(".theme-doc-markdown a[href]")
    );
    const target = links[index];
    const activeElement = document.activeElement;
    return {
      targetFound: target instanceof HTMLElement,
      targetText: (target?.textContent || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120),
      activeTag: activeElement?.tagName ?? null,
      activeText: (activeElement?.textContent || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120),
      activeFocusVisible:
        activeElement instanceof HTMLElement
          ? activeElement.matches(":focus-visible")
          : false,
    };
  }, focusTargetLinkIndex);
  throw new Error(
    `Failed to reach focus target with Tab within ${maxTabs} steps: ${JSON.stringify(failure)}`
  );
}

async function auditCombination(browser, { route, width, theme }) {
  const context = await browser.newContext({
    viewport: { width, height: 1400 },
    colorScheme: theme,
  });
  const page = await context.newPage();

  try {
    const response = await page.goto(routeUrl(route), {
      waitUntil: "networkidle",
    });
    if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
    await page.waitForFunction(
      (expectedTheme) =>
        document.documentElement.dataset.theme === expectedTheme,
      theme
    );
    await page.locator(".theme-doc-markdown").waitFor();
    await page.waitForFunction(() => {
      const root = document.querySelector(".theme-doc-markdown");
      const h4 = document.querySelector(".theme-doc-markdown h4");
      return (
        root &&
        getComputedStyle(root).getPropertyValue("--typeset-flow").trim() ===
          "1.25em" &&
        h4
      );
    });

    const detailsRoot = page.locator("[data-audit-details]");
    await detailsRoot.waitFor();
    const detailsTrigger = detailsRoot.locator(
      '[data-slot="accordion-trigger"]'
    );
    const detailsContent = detailsRoot.locator(
      '[data-slot="accordion-content"]'
    );
    await detailsTrigger.waitFor();
    await detailsTrigger.click();
    await detailsContent.waitFor();
    await page.waitForFunction(() => {
      const root = document.querySelector("[data-audit-details]");
      const trigger = root?.querySelector('[data-slot="accordion-trigger"]');
      const content = root?.querySelector('[data-slot="accordion-content"]');
      if (
        !(trigger instanceof HTMLElement) ||
        !(content instanceof HTMLElement)
      )
        return false;
      const rect = content.getBoundingClientRect();
      return (
        trigger.getAttribute("aria-expanded") === "true" &&
        rect.width > 0 &&
        rect.height > 0 &&
        getComputedStyle(content).display !== "none" &&
        getComputedStyle(content).visibility !== "hidden"
      );
    });

    const proseLinkCandidates = page.locator(".theme-doc-markdown a[href]");
    const proseLinkCount = await proseLinkCandidates.count();
    let focusTargetLinkIndex = -1;
    for (let index = 0; index < proseLinkCount; index += 1) {
      const candidate = proseLinkCandidates.nth(index);
      const isEligible = await candidate.evaluate((element) => {
        if (!(element instanceof HTMLElement)) return false;
        if (element.closest("h1, h2, h3, h4, h5, h6")) return false;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== "hidden" &&
          style.display !== "none"
        );
      });
      if (!isEligible) continue;
      focusTargetLinkIndex = index;
      break;
    }
    if (focusTargetLinkIndex < 0)
      throw new Error("Missing focusable prose link");
    await tabToProseLink(page, focusTargetLinkIndex);

    const result = await page.evaluate(
      ({ width, theme, focusTargetLinkIndex }) => {
        const proseRoot = document.querySelector(".theme-doc-markdown");
        if (!proseRoot) throw new Error("Missing .theme-doc-markdown");
        if (document.documentElement.dataset.theme !== theme) {
          throw new Error(
            `Theme mismatch: expected ${theme}, received ${document.documentElement.dataset.theme}`
          );
        }

        const tolerance = 0.05;
        const px = (value) => Number.parseFloat(value) || 0;
        const round = (value) => Number(value.toFixed(5));
        const flow = 1.25;
        const normalizeColor = (value) => {
          const context = document.createElement("canvas").getContext("2d");
          if (!context) throw new Error("Missing 2d canvas context");
          context.fillStyle = "#000000";
          context.fillStyle = value;
          return context.fillStyle;
        };

        const boundaryRoot = (element) => {
          if (!(element instanceof Element)) return null;
          const owner = element.closest("[data-slot], .theme-code-block");
          return owner && proseRoot.contains(owner) ? owner : null;
        };

        const isVisible = (element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== "hidden" &&
            style.display !== "none"
          );
        };

        const all = (selector, options = {}) => {
          const { allowBoundary = false, within = proseRoot } = options;
          return Array.from(within.querySelectorAll(selector)).filter(
            (element) => {
              if (!allowBoundary && boundaryRoot(element)) return false;
              return isVisible(element);
            }
          );
        };

        const parentChain = (element) => {
          const parts = [];
          let current = element.parentElement;
          while (current && current !== proseRoot) {
            parts.unshift(current.tagName.toLowerCase());
            current = current.parentElement;
          }
          return parts.join(">");
        };

        const describe = (element, index) => ({
          index,
          tag: element.tagName.toLowerCase(),
          text: (element.textContent || "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 120),
          parentChain: parentChain(element),
        });

        const previousRelevantSibling = (element) => {
          let current = element.previousElementSibling;
          while (current) {
            if (!boundaryRoot(current) && isVisible(current)) return current;
            current = current.previousElementSibling;
          }
          return null;
        };
        const previousTag = (element) =>
          previousRelevantSibling(element)?.tagName ?? null;
        const previousAdjacentTag = (element) => {
          const current = element.previousElementSibling;
          if (!current || !isVisible(current) || boundaryRoot(current))
            return null;
          return current.tagName;
        };

        const isFirstRelevantChild = (element) => {
          const parent = element.parentElement;
          if (!parent) return false;
          let current = parent.firstElementChild;
          while (current) {
            if (!boundaryRoot(current) && isVisible(current))
              return current === element;
            current = current.nextElementSibling;
          }
          return false;
        };

        const firstChildResetApplies = (element) => {
          const parent = element.parentElement;
          if (!parent) return false;
          if (
            (parent === proseRoot ||
              parent.matches("li, blockquote, td, th, dd, figure")) &&
            isFirstRelevantChild(element)
          ) {
            return true;
          }
          return false;
        };

        const numeric = (style, property) => round(px(style[property]));
        const exact = (actual, expected, label, failures, detail) => {
          if (Number.isNaN(actual) || Math.abs(actual - expected) > tolerance) {
            failures.push({
              label,
              expected: round(expected),
              actual,
              ...detail,
            });
          }
        };
        const equal = (actual, expected, label, failures, detail) => {
          if (actual !== expected)
            failures.push({ label, expected, actual, ...detail });
        };

        const rootStyle = getComputedStyle(proseRoot);
        const mutedColor = normalizeColor(
          rootStyle.getPropertyValue("--muted-foreground").trim()
        );
        const ruleColor = normalizeColor(
          rootStyle.getPropertyValue("--border").trim()
        );
        const rootFontSize = 15;
        const rootLineHeight = rootFontSize * 1.75;
        const failures = [];
        const metrics = {};

        const title =
          proseRoot.querySelector(":scope > header > h1") ??
          proseRoot.querySelector(":scope > h1:first-child");
        if (!title) throw new Error("Missing page title h1");
        const titleStyle = getComputedStyle(title);
        exact(
          numeric(rootStyle, "fontSize"),
          rootFontSize,
          "root.fontSize",
          failures
        );
        exact(
          numeric(rootStyle, "lineHeight"),
          rootLineHeight,
          "root.lineHeight",
          failures
        );
        exact(numeric(titleStyle, "fontSize"), 30, "title.fontSize", failures);
        exact(
          numeric(titleStyle, "lineHeight"),
          36,
          "title.lineHeight",
          failures
        );
        equal(titleStyle.fontWeight, "600", "title.fontWeight", failures);

        const headingConfig = {
          h2: {
            size: 1.25,
            line: 1.4,
            margin: (fontSize) => fontSize * flow * 1.4,
          },
          h3: {
            size: 1.125,
            line: 1.45,
            margin: (fontSize) => fontSize * flow,
          },
          h4: { size: 1, line: 1.5, margin: (fontSize) => fontSize * flow },
          h5: {
            size: 0.875,
            line: 1.5,
            margin: (fontSize) => (fontSize * flow) / 0.875,
            weight: "500",
          },
          h6: {
            size: 0.8125,
            line: 1.5,
            margin: (fontSize) => (fontSize * flow) / 0.8125,
            weight: "500",
            letterSpacing: 0.08,
            transform: "uppercase",
          },
        };

        for (const [tag, config] of Object.entries(headingConfig)) {
          const elements = all(tag);
          if (!elements.length)
            failures.push({
              label: `${tag}.missing`,
              expected: true,
              actual: false,
            });
          metrics[tag] = elements.map((element, index) => {
            const style = getComputedStyle(element);
            const fontSize = numeric(style, "fontSize");
            const detail = describe(element, index);
            exact(
              fontSize,
              rootFontSize * config.size,
              `${tag}.fontSize`,
              failures,
              detail
            );
            exact(
              numeric(style, "lineHeight"),
              fontSize * config.line,
              `${tag}.lineHeight`,
              failures,
              detail
            );
            const expectedMarginTop =
              previousAdjacentTag(element) &&
              /^H[1-6]$/.test(previousAdjacentTag(element))
                ? 16
                : config.margin(fontSize);
            exact(
              numeric(style, "marginTop"),
              expectedMarginTop,
              `${tag}.marginTop`,
              failures,
              detail
            );
            if (config.weight) {
              equal(
                style.fontWeight,
                config.weight,
                `${tag}.fontWeight`,
                failures,
                detail
              );
            }
            if (config.letterSpacing !== undefined) {
              exact(
                numeric(style, "letterSpacing"),
                fontSize * config.letterSpacing,
                `${tag}.letterSpacing`,
                failures,
                detail
              );
              equal(
                style.textTransform,
                config.transform,
                `${tag}.textTransform`,
                failures,
                detail
              );
            }
            return {
              text: detail.text,
              fontSize: style.fontSize,
              lineHeight: style.lineHeight,
              marginTop: style.marginTop,
            };
          });
        }

        const flowSelectors = [
          "p",
          "blockquote",
          "figure",
          "table",
          "img",
          "hr",
          "ul",
          "ol",
        ];
        for (const selector of flowSelectors) {
          const elements = all(selector);
          if (!elements.length) continue;
          metrics[selector] = elements.map((element, index) => {
            const style = getComputedStyle(element);
            const fontSize = numeric(style, "fontSize");
            const detail = describe(element, index);
            let expectedMarginTop = 0;
            if (
              element.parentElement === proseRoot &&
              previousAdjacentTag(element) === "HEADER"
            ) {
              expectedMarginTop = 0;
            } else if (
              element.parentElement === proseRoot &&
              previousAdjacentTag(element) &&
              /^H[1-6]$/.test(previousAdjacentTag(element))
            ) {
              expectedMarginTop = 16;
            } else if (firstChildResetApplies(element)) {
              expectedMarginTop = 0;
            } else if (
              element.parentElement?.matches("li") &&
              ["P", "UL", "OL", "BLOCKQUOTE", "TABLE", "FIGURE"].includes(
                element.tagName
              )
            ) {
              expectedMarginTop = fontSize * 0.5;
            } else if (element.tagName === "HR") {
              expectedMarginTop = fontSize * flow * 2.4;
            } else if (
              ["UL", "OL", "BLOCKQUOTE", "FIGURE", "TABLE"].includes(
                element.tagName
              )
            ) {
              expectedMarginTop = fontSize * flow;
            } else if (element.tagName === "IMG") {
              expectedMarginTop =
                element.parentElement?.tagName === "P" ||
                element.parentElement?.tagName === "FIGURE"
                  ? 0
                  : fontSize * flow;
            } else {
              expectedMarginTop = fontSize * flow;
            }
            exact(
              numeric(style, "marginTop"),
              expectedMarginTop,
              `${selector}.marginTop`,
              failures,
              detail
            );
            return {
              text: detail.text,
              marginTop: style.marginTop,
            };
          });
        }

        const paragraphs = all("p");
        if (paragraphs.length < 2) {
          failures.push({
            label: "p.count",
            expected: ">=2",
            actual: paragraphs.length,
          });
        }
        paragraphs.forEach((element, index) => {
          const style = getComputedStyle(element);
          exact(
            numeric(style, "marginBottom"),
            0,
            "p.marginBottom",
            failures,
            describe(element, index)
          );
        });

        const ulDepth = (element) => {
          let depth = 0;
          let current = element;
          while (current && current !== proseRoot) {
            if (current.tagName === "UL") depth += 1;
            current = current.parentElement;
          }
          return depth;
        };
        const expectedListType = (element) => {
          if (element.tagName === "UL") {
            const depth = ulDepth(element);
            if (depth >= 3) return "square";
            if (depth === 2) return "circle";
            return element.classList.contains("contains-task-list")
              ? "none"
              : "disc";
          }
          return "decimal";
        };
        const lists = all("ul, ol");
        lists.forEach((element, index) => {
          const style = getComputedStyle(element);
          const detail = describe(element, index);
          const expectedPadding = element.classList.contains(
            "contains-task-list"
          )
            ? numeric(style, "fontSize") * 0.25
            : numeric(style, "fontSize") * 1.5;
          exact(
            numeric(style, "paddingLeft"),
            expectedPadding,
            "list.paddingLeft",
            failures,
            detail
          );
          equal(
            style.listStyleType,
            expectedListType(element),
            "list.listStyleType",
            failures,
            detail
          );
        });

        const listItems = all("li");
        listItems.forEach((element, index) => {
          const style = getComputedStyle(element);
          const detail = describe(element, index);
          equal(style.display, "list-item", "li.display", failures, detail);
          if (!element.classList.contains("task-list-item")) {
            exact(
              numeric(style, "paddingLeft"),
              numeric(style, "fontSize") * 0.4,
              "li.paddingLeft",
              failures,
              detail
            );
          }
          if (!firstChildResetApplies(element)) {
            exact(
              numeric(style, "marginTop"),
              numeric(style, "fontSize") * 0.5,
              "li.marginTop",
              failures,
              detail
            );
          }
        });

        const taskCheckboxes = all(
          'li.task-list-item > input[type="checkbox"]'
        );
        if (!taskCheckboxes.length)
          failures.push({
            label: "taskCheckbox.missing",
            expected: true,
            actual: false,
          });
        taskCheckboxes.forEach((element, index) => {
          const style = getComputedStyle(element);
          const fontSize = numeric(
            getComputedStyle(element.parentElement),
            "fontSize"
          );
          exact(
            numeric(style, "marginRight"),
            fontSize * 0.5,
            "taskCheckbox.marginRight",
            failures,
            describe(element, index)
          );
          exact(
            numeric(style, "verticalAlign"),
            fontSize * -0.1,
            "taskCheckbox.verticalAlign",
            failures,
            describe(element, index)
          );
        });

        const markerLists = all("ul > li, ol > li").filter(
          (element) => !element.classList.contains("task-list-item")
        );
        markerLists.forEach((element, index) => {
          const marker = getComputedStyle(element, "::marker");
          equal(
            normalizeColor(marker.color),
            mutedColor,
            "li.markerColor",
            failures,
            describe(element, index)
          );
        });

        const proseLinks = all("a[href]", { allowBoundary: false }).filter(
          (element) => !element.closest("h1, h2, h3, h4, h5, h6")
        );
        if (!proseLinks.length)
          failures.push({
            label: "link.missing",
            expected: true,
            actual: false,
          });
        proseLinks.forEach((element, index) => {
          const style = getComputedStyle(element);
          equal(
            style.color,
            getComputedStyle(element.parentElement).color,
            "link.color",
            failures,
            describe(element, index)
          );
          if (!style.textDecorationLine.includes("underline")) {
            failures.push({
              label: "link.textDecorationLine",
              expected: "underline",
              actual: style.textDecorationLine,
              ...describe(element, index),
            });
          }
          equal(
            style.fontWeight,
            "500",
            "link.fontWeight",
            failures,
            describe(element, index)
          );
        });
        const focusTargetCandidates = Array.from(
          proseRoot.querySelectorAll("a[href]")
        );
        const focusTarget = focusTargetCandidates[focusTargetLinkIndex] ?? null;
        if (!focusTarget) {
          failures.push({
            label: "link.focusVisible.targetMissing",
            expected: true,
            actual: false,
            focusTargetLinkIndex,
          });
        } else {
          const style = getComputedStyle(focusTarget);
          const detail = describe(focusTarget, focusTargetLinkIndex);
          equal(
            focusTarget.matches(":focus-visible"),
            true,
            "link.focusVisible.matches",
            failures,
            detail
          );
          equal(
            style.outlineStyle,
            "solid",
            "link.focusVisible.outlineStyle",
            failures,
            detail
          );
          exact(
            numeric(style, "outlineWidth"),
            2,
            "link.focusVisible.outlineWidth",
            failures,
            detail
          );
          exact(
            numeric(style, "outlineOffset"),
            2,
            "link.focusVisible.outlineOffset",
            failures,
            detail
          );
          const expectedRadius = numeric(style, "fontSize") * 0.125;
          exact(
            numeric(style, "borderTopLeftRadius"),
            expectedRadius,
            "link.focusVisible.radius.topLeft",
            failures,
            detail
          );
          exact(
            numeric(style, "borderTopRightRadius"),
            expectedRadius,
            "link.focusVisible.radius.topRight",
            failures,
            detail
          );
          exact(
            numeric(style, "borderBottomRightRadius"),
            expectedRadius,
            "link.focusVisible.radius.bottomRight",
            failures,
            detail
          );
          exact(
            numeric(style, "borderBottomLeftRadius"),
            expectedRadius,
            "link.focusVisible.radius.bottomLeft",
            failures,
            detail
          );
        }

        const hashLinks = all("a.hash-link", { allowBoundary: true });
        if (!hashLinks.length)
          failures.push({
            label: "hashLink.missing",
            expected: true,
            actual: false,
          });
        hashLinks.forEach((element, index) => {
          const style = getComputedStyle(element);
          const heading = element.closest("h1, h2, h3, h4, h5, h6");
          const headingStyle = heading ? getComputedStyle(heading) : null;
          if (headingStyle) {
            equal(
              style.color,
              headingStyle.color,
              "hashLink.color",
              failures,
              describe(element, index)
            );
            equal(
              style.fontWeight,
              headingStyle.fontWeight,
              "hashLink.fontWeight",
              failures,
              describe(element, index)
            );
          }
          if (style.textDecorationLine !== "none") {
            failures.push({
              label: "hashLink.textDecorationLine",
              expected: "none",
              actual: style.textDecorationLine,
              ...describe(element, index),
            });
          }
        });

        const strongElements = all("strong, b");
        strongElements.forEach((element, index) => {
          equal(
            getComputedStyle(element).fontWeight,
            "600",
            "strong.fontWeight",
            failures,
            describe(element, index)
          );
        });
        const emphasisElements = all("em, i");
        emphasisElements.forEach((element, index) => {
          equal(
            getComputedStyle(element).fontStyle,
            "italic",
            "em.fontStyle",
            failures,
            describe(element, index)
          );
        });
        const deletedElements = all("del, s");
        if (!deletedElements.length)
          failures.push({
            label: "del.missing",
            expected: true,
            actual: false,
          });
        deletedElements.forEach((element, index) => {
          const style = getComputedStyle(element);
          equal(
            normalizeColor(style.color),
            mutedColor,
            "del.color",
            failures,
            describe(element, index)
          );
          if (!style.textDecorationLine.includes("line-through")) {
            failures.push({
              label: "del.textDecorationLine",
              expected: "line-through",
              actual: style.textDecorationLine,
              ...describe(element, index),
            });
          }
        });

        const blockquotes = all("blockquote");
        if (!blockquotes.length)
          failures.push({
            label: "blockquote.missing",
            expected: true,
            actual: false,
          });
        blockquotes.forEach((element, index) => {
          const style = getComputedStyle(element);
          exact(
            numeric(style, "paddingLeft"),
            numeric(style, "fontSize"),
            "blockquote.paddingLeft",
            failures,
            describe(element, index)
          );
          exact(
            numeric(style, "borderLeftWidth"),
            2,
            "blockquote.borderLeftWidth",
            failures,
            describe(element, index)
          );
          equal(
            normalizeColor(style.borderLeftColor),
            ruleColor,
            "blockquote.borderLeftColor",
            failures,
            describe(element, index)
          );
        });

        const horizontalRules = all("hr");
        if (!horizontalRules.length)
          failures.push({ label: "hr.missing", expected: true, actual: false });
        horizontalRules.forEach((element, index) => {
          exact(
            getComputedStyle(element).borderTopStyle === "solid" ? 1 : 0,
            1,
            "hr.borderTopStyle",
            failures,
            describe(element, index)
          );
          exact(
            numeric(getComputedStyle(element), "borderTopWidth"),
            1,
            "hr.borderTopWidth",
            failures,
            describe(element, index)
          );
        });

        const inlineCodes = all(":not(pre) > code");
        if (!inlineCodes.length)
          failures.push({
            label: "inlineCode.missing",
            expected: true,
            actual: false,
          });
        inlineCodes.forEach((element, index) => {
          const style = getComputedStyle(element);
          const fontSize = numeric(style, "fontSize");
          const parentFontSize = numeric(
            getComputedStyle(element.parentElement),
            "fontSize"
          );
          exact(
            fontSize,
            parentFontSize * 0.85,
            "inlineCode.fontSize",
            failures,
            describe(element, index)
          );
          exact(
            numeric(style, "paddingTop"),
            fontSize * 0.125,
            "inlineCode.paddingTop",
            failures,
            describe(element, index)
          );
          exact(
            numeric(style, "paddingRight"),
            fontSize * 0.3,
            "inlineCode.paddingRight",
            failures,
            describe(element, index)
          );
        });

        const images = all("img");
        if (!images.length)
          failures.push({
            label: "image.missing",
            expected: true,
            actual: false,
          });
        images.forEach((element, index) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          if (
            element.parentElement?.tagName === "P" ||
            element.parentElement?.tagName === "FIGURE"
          ) {
            exact(
              numeric(style, "marginTop"),
              0,
              "image.marginTopReset",
              failures,
              describe(element, index)
            );
          }
          if (
            element.naturalWidth > 0 &&
            !(rect.width <= element.naturalWidth + tolerance)
          ) {
            failures.push({
              label: "image.width<=naturalWidth",
              expected: true,
              actual: {
                width: round(rect.width),
                naturalWidth: element.naturalWidth,
              },
              ...describe(element, index),
            });
          }
        });

        const figures = all("figure");
        if (!figures.length)
          failures.push({
            label: "figure.missing",
            expected: true,
            actual: false,
          });
        figures.forEach((element, index) => {
          const style = getComputedStyle(element);
          exact(
            numeric(style, "marginLeft"),
            0,
            "figure.marginLeft",
            failures,
            describe(element, index)
          );
          exact(
            numeric(style, "marginRight"),
            0,
            "figure.marginRight",
            failures,
            describe(element, index)
          );
        });
        const figcaptions = all("figcaption");
        if (!figcaptions.length)
          failures.push({
            label: "figcaption.missing",
            expected: true,
            actual: false,
          });
        figcaptions.forEach((element, index) => {
          const style = getComputedStyle(element);
          const fontSize = numeric(style, "fontSize");
          exact(
            fontSize,
            rootFontSize * 0.875,
            "figcaption.fontSize",
            failures,
            describe(element, index)
          );
          exact(
            numeric(style, "marginTop"),
            fontSize * 0.857143,
            "figcaption.marginTop",
            failures,
            describe(element, index)
          );
        });

        const tables = all("table");
        const componentTables = all('[data-slot="table"]', {
          allowBoundary: true,
        });
        const actualTables = componentTables.length ? componentTables : tables;
        const tableContainers = all('[data-slot="table-container"]', {
          allowBoundary: true,
        });
        const tableRows = all('[data-slot="table-row"]', {
          allowBoundary: true,
        });
        const tableHeads = all('[data-slot="table-head"]', {
          allowBoundary: true,
        });
        const tableCells = all('[data-slot="table-cell"]', {
          allowBoundary: true,
        });
        if (!tables.length && !componentTables.length) {
          failures.push({
            label: "table.missing",
            expected: true,
            actual: false,
          });
        }
        if (!tableContainers.length)
          failures.push({
            label: "tableContainer.missing",
            expected: true,
            actual: false,
          });
        if (!tableRows.length)
          failures.push({
            label: "tableRow.missing",
            expected: true,
            actual: false,
          });
        if (!tableHeads.length)
          failures.push({
            label: "tableHead.missing",
            expected: true,
            actual: false,
          });
        if (!tableCells.length)
          failures.push({
            label: "tableCell.missing",
            expected: true,
            actual: false,
          });
        actualTables.forEach((element, index) => {
          const style = getComputedStyle(element);
          exact(
            numeric(style, "fontSize"),
            14,
            "table.fontSize",
            failures,
            describe(element, index)
          );
          exact(
            numeric(style, "lineHeight"),
            20,
            "table.lineHeight",
            failures,
            describe(element, index)
          );
        });
        tableContainers.forEach((element, index) => {
          const style = getComputedStyle(element);
          equal(
            style.overflowX,
            "auto",
            "tableContainer.overflowX",
            failures,
            describe(element, index)
          );
          equal(
            style.position,
            "relative",
            "tableContainer.position",
            failures,
            describe(element, index)
          );
        });
        tableHeads.forEach((element, index) => {
          const style = getComputedStyle(element);
          const detail = describe(element, index);
          exact(
            numeric(style, "height"),
            40,
            "tableHead.height",
            failures,
            detail
          );
          exact(
            numeric(style, "paddingTop"),
            0,
            "tableHead.paddingTop",
            failures,
            detail
          );
          exact(
            numeric(style, "paddingRight"),
            8,
            "tableHead.paddingRight",
            failures,
            detail
          );
          exact(
            numeric(style, "paddingBottom"),
            0,
            "tableHead.paddingBottom",
            failures,
            detail
          );
          exact(
            numeric(style, "paddingLeft"),
            8,
            "tableHead.paddingLeft",
            failures,
            detail
          );
          exact(
            numeric(style, "fontSize"),
            14,
            "tableHead.fontSize",
            failures,
            detail
          );
          exact(
            numeric(style, "lineHeight"),
            20,
            "tableHead.lineHeight",
            failures,
            detail
          );
          equal(
            style.fontWeight,
            "500",
            "tableHead.fontWeight",
            failures,
            detail
          );
          equal(
            style.textAlign,
            "left",
            "tableHead.textAlign",
            failures,
            detail
          );
          equal(
            style.verticalAlign,
            "middle",
            "tableHead.verticalAlign",
            failures,
            detail
          );
          equal(
            style.whiteSpace,
            "nowrap",
            "tableHead.whiteSpace",
            failures,
            detail
          );
        });
        tableCells.forEach((element, index) => {
          const style = getComputedStyle(element);
          const detail = describe(element, index);
          exact(
            numeric(style, "paddingTop"),
            8,
            "tableCell.paddingTop",
            failures,
            detail
          );
          exact(
            numeric(style, "paddingRight"),
            8,
            "tableCell.paddingRight",
            failures,
            detail
          );
          exact(
            numeric(style, "paddingBottom"),
            8,
            "tableCell.paddingBottom",
            failures,
            detail
          );
          exact(
            numeric(style, "paddingLeft"),
            8,
            "tableCell.paddingLeft",
            failures,
            detail
          );
          exact(
            numeric(style, "fontSize"),
            14,
            "tableCell.fontSize",
            failures,
            detail
          );
          exact(
            numeric(style, "lineHeight"),
            20,
            "tableCell.lineHeight",
            failures,
            detail
          );
          equal(
            style.verticalAlign,
            "middle",
            "tableCell.verticalAlign",
            failures,
            detail
          );
          equal(
            style.whiteSpace,
            "nowrap",
            "tableCell.whiteSpace",
            failures,
            detail
          );
        });
        tableRows.forEach((element, index) => {
          const style = getComputedStyle(element);
          const detail = describe(element, index);
          const inBody = element.parentElement?.matches(
            '[data-slot="table-body"]'
          );
          const isLastBodyRow = Boolean(inBody && !element.nextElementSibling);
          exact(
            numeric(style, "borderBottomWidth"),
            isLastBodyRow ? 0 : 1,
            "tableRow.borderBottomWidth",
            failures,
            detail
          );
          if (!isLastBodyRow) {
            equal(
              normalizeColor(style.borderBottomColor),
              ruleColor,
              "tableRow.borderBottomColor",
              failures,
              detail
            );
          }
          const rect = element.getBoundingClientRect();
          const cellHeight = Math.max(
            ...Array.from(element.children).map((cell) =>
              round(cell.getBoundingClientRect().height)
            )
          );
          exact(
            round(rect.height),
            cellHeight,
            "tableRow.height",
            failures,
            detail
          );
        });

        const prosePre = all("pre");
        const codeBlocks = all(".theme-code-block", { allowBoundary: true });
        if (!codeBlocks.length)
          failures.push({
            label: "codeBlock.missing",
            expected: true,
            actual: false,
          });
        equal(prosePre.length, 0, "prosePre.count", failures, {
          index: 0,
          tag: "pre",
          text: "",
          parentChain: "",
        });
        codeBlocks.forEach((element, index) => {
          const pre = element.querySelector("pre");
          if (!pre || !isVisible(pre)) {
            failures.push({
              label: "codeBlock.preMissing",
              expected: true,
              actual: false,
              ...describe(element, index),
            });
            return;
          }
          const style = getComputedStyle(pre);
          exact(
            numeric(style, "marginTop"),
            0,
            "codeBlock.pre.marginTop",
            failures,
            describe(pre, index)
          );
          exact(
            numeric(style, "fontSize"),
            14,
            "codeBlock.pre.fontSize",
            failures,
            describe(pre, index)
          );
        });

        const componentChecks = [];
        for (const slot of [
          "alert-description",
          "alert-title",
          "accordion-trigger",
        ]) {
          const elements = all(`[data-slot="${slot}"]`, {
            allowBoundary: true,
          });
          elements.forEach((element, index) => {
            const style = getComputedStyle(element);
            componentChecks.push({
              slot,
              index,
              fontSize: style.fontSize,
              lineHeight: style.lineHeight,
            });
            exact(
              numeric(style, "fontSize"),
              14,
              `${slot}.fontSize`,
              failures,
              describe(element, index)
            );
            exact(
              numeric(style, "lineHeight"),
              20,
              `${slot}.lineHeight`,
              failures,
              describe(element, index)
            );
          });
        }

        const auditDetails = proseRoot.querySelector("[data-audit-details]");
        if (!auditDetails) {
          failures.push({
            label: "auditDetails.missing",
            expected: true,
            actual: false,
          });
        } else {
          const trigger = auditDetails.querySelector(
            '[data-slot="accordion-trigger"]'
          );
          const content = auditDetails.querySelector(
            '[data-slot="accordion-content"]'
          );
          if (!(trigger instanceof HTMLElement)) {
            failures.push({
              label: "auditDetails.triggerMissing",
              expected: true,
              actual: false,
            });
          } else {
            const style = getComputedStyle(trigger);
            const detail = describe(trigger, 0);
            componentChecks.push({
              slot: "audit-details-trigger",
              index: 0,
              fontSize: style.fontSize,
              lineHeight: style.lineHeight,
            });
            equal(
              trigger.getAttribute("aria-expanded"),
              "true",
              "auditDetails.trigger.ariaExpanded",
              failures,
              detail
            );
            exact(
              numeric(style, "fontSize"),
              14,
              "auditDetails.trigger.fontSize",
              failures,
              detail
            );
            exact(
              numeric(style, "lineHeight"),
              20,
              "auditDetails.trigger.lineHeight",
              failures,
              detail
            );
            exact(
              numeric(style, "paddingTop"),
              10,
              "auditDetails.trigger.paddingTop",
              failures,
              detail
            );
            exact(
              numeric(style, "paddingBottom"),
              10,
              "auditDetails.trigger.paddingBottom",
              failures,
              detail
            );
            exact(
              numeric(style, "borderTopWidth"),
              1,
              "auditDetails.trigger.borderTopWidth",
              failures,
              detail
            );
            exact(
              numeric(style, "borderRightWidth"),
              1,
              "auditDetails.trigger.borderRightWidth",
              failures,
              detail
            );
            exact(
              numeric(style, "borderBottomWidth"),
              1,
              "auditDetails.trigger.borderBottomWidth",
              failures,
              detail
            );
            exact(
              numeric(style, "borderLeftWidth"),
              1,
              "auditDetails.trigger.borderLeftWidth",
              failures,
              detail
            );
            exact(
              numeric(style, "borderTopLeftRadius"),
              10,
              "auditDetails.trigger.radius",
              failures,
              detail
            );
          }
          if (!(content instanceof HTMLElement)) {
            failures.push({
              label: "auditDetails.contentMissing",
              expected: true,
              actual: false,
            });
          } else {
            const style = getComputedStyle(content);
            const rect = content.getBoundingClientRect();
            const detail = describe(content, 0);
            componentChecks.push({
              slot: "audit-details-content",
              index: 0,
              fontSize: style.fontSize,
              lineHeight: style.lineHeight,
            });
            exact(
              numeric(style, "fontSize"),
              14,
              "auditDetails.content.fontSize",
              failures,
              detail
            );
            exact(
              numeric(style, "lineHeight"),
              20,
              "auditDetails.content.lineHeight",
              failures,
              detail
            );
            if (!(rect.width > 0 && rect.height > 0)) {
              failures.push({
                label: "auditDetails.content.visible",
                expected: true,
                actual: false,
                ...detail,
              });
            }
            const contentInner = content.firstElementChild;
            if (!(contentInner instanceof HTMLElement)) {
              failures.push({
                label: "auditDetails.contentInner.missing",
                expected: true,
                actual: false,
                ...detail,
              });
            } else {
              const innerStyle = getComputedStyle(contentInner);
              exact(
                numeric(innerStyle, "paddingTop"),
                0,
                "auditDetails.contentInner.paddingTop",
                failures,
                describe(contentInner, 0)
              );
              exact(
                numeric(innerStyle, "paddingBottom"),
                10,
                "auditDetails.contentInner.paddingBottom",
                failures,
                describe(contentInner, 0)
              );
            }
            const contentLink = content.querySelector("a[href]");
            if (!(contentLink instanceof HTMLAnchorElement)) {
              failures.push({
                label: "auditDetails.content.linkMissing",
                expected: true,
                actual: false,
                ...detail,
              });
            } else {
              const linkStyle = getComputedStyle(contentLink);
              equal(
                new URL(contentLink.href).pathname,
                "/docusaurus-theme/showcase/mermaid",
                "auditDetails.content.linkHref",
                failures,
                describe(contentLink, 0)
              );
              if (!linkStyle.textDecorationLine.includes("underline")) {
                failures.push({
                  label: "auditDetails.content.linkUnderline",
                  expected: "underline",
                  actual: linkStyle.textDecorationLine,
                  ...describe(contentLink, 0),
                });
              }
              exact(
                numeric(linkStyle, "textUnderlineOffset"),
                3,
                "auditDetails.content.linkUnderlineOffset",
                failures,
                describe(contentLink, 0)
              );
            }
            const contentCode = content.querySelector(":not(pre) > code");
            if (!(contentCode instanceof HTMLElement)) {
              failures.push({
                label: "auditDetails.content.codeMissing",
                expected: true,
                actual: false,
                ...detail,
              });
            } else {
              equal(
                contentCode.textContent?.trim(),
                "code",
                "auditDetails.content.codeText",
                failures,
                describe(contentCode, 0)
              );
            }
          }
        }

        const ratios = {
          h2ToRoot:
            metrics.h2?.map((entry) =>
              round(px(entry.fontSize) / rootFontSize)
            ) ?? [],
          h3ToRoot:
            metrics.h3?.map((entry) =>
              round(px(entry.fontSize) / rootFontSize)
            ) ?? [],
          h4ToRoot:
            metrics.h4?.map((entry) =>
              round(px(entry.fontSize) / rootFontSize)
            ) ?? [],
          h5ToRoot:
            metrics.h5?.map((entry) =>
              round(px(entry.fontSize) / rootFontSize)
            ) ?? [],
          h6ToRoot:
            metrics.h6?.map((entry) =>
              round(px(entry.fontSize) / rootFontSize)
            ) ?? [],
        };
        ratios.h2ToRoot.forEach((value, index) =>
          exact(value, 1.25, "ratio.h2/root", failures, { index })
        );
        ratios.h3ToRoot.forEach((value, index) =>
          exact(value, 1.125, "ratio.h3/root", failures, { index })
        );
        ratios.h4ToRoot.forEach((value, index) =>
          exact(value, 1, "ratio.h4/root", failures, { index })
        );
        ratios.h5ToRoot.forEach((value, index) =>
          exact(value, 0.875, "ratio.h5/root", failures, { index })
        );
        ratios.h6ToRoot.forEach((value, index) =>
          exact(value, 0.8125, "ratio.h6/root", failures, { index })
        );

        return {
          routeTitle: document.title,
          counts: {
            paragraphs: paragraphs.length,
            headings: Object.fromEntries(
              Object.keys(headingConfig).map((tag) => [
                tag,
                metrics[tag]?.length ?? 0,
              ])
            ),
            lists: lists.length,
            listItems: listItems.length,
            links: proseLinks.length,
            hashLinks: hashLinks.length,
            inlineCode: inlineCodes.length,
            images: images.length,
            figures: figures.length,
            tables: actualTables.length,
            tableRows: tableRows.length,
            tableHeads: tableHeads.length,
            tableCells: tableCells.length,
            codeBlocks: codeBlocks.length,
            componentSlots: componentChecks.length,
          },
          metrics: {
            root: {
              fontSize: rootStyle.fontSize,
              lineHeight: rootStyle.lineHeight,
            },
            title: {
              fontSize: titleStyle.fontSize,
              lineHeight: titleStyle.lineHeight,
              fontWeight: titleStyle.fontWeight,
            },
            ratios,
            componentChecks,
          },
          failures,
        };
      },
      { width, theme, focusTargetLinkIndex }
    );

    return {
      status: result.failures.length ? "failed" : "passed",
      route,
      theme,
      width,
      title: result.routeTitle,
      counts: result.counts,
      metrics: result.metrics,
      failures: result.failures,
    };
  } finally {
    await context.close();
  }
}

function makeReport(results) {
  const lines = [
    "# Rendered surfaces focused audit",
    "",
    "| Width | Theme | Result | Root font-size | Root line-height | Notes |",
    "| --- | --- | --- | --- | --- | --- |",
  ];

  for (const result of results) {
    lines.push(
      `| ${result.width} | ${result.theme} | ${result.status} | ${result.metrics.root.fontSize} | ${result.metrics.root.lineHeight} | h2=${result.counts.headings.h2}, h3=${result.counts.headings.h3}, tableRows=${result.counts.tableRows}, tableCells=${result.counts.tableCells}, codeBlocks=${result.counts.codeBlocks} |`
    );
  }

  const failed = results.filter((result) => result.status !== "passed");
  lines.push("");
  if (failed.length) {
    lines.push("## Failures");
    lines.push("");
    failed.forEach((result) => {
      lines.push(`### ${result.width}px / ${result.theme}`);
      result.failures.forEach((failure) => {
        lines.push(
          `- ${failure.label}: expected ${JSON.stringify(failure.expected)}, actual ${JSON.stringify(failure.actual)}`
        );
      });
      lines.push("");
    });
  } else {
    lines.push(
      "All focused responsive/theme combinations passed exact rendered-surface checks."
    );
  }

  return `${lines.join("\n")}\n`;
}

async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const { chromium } = require("playwright");
  const browser = await chromium.launch({ headless: true });

  try {
    const results = [];
    for (const width of options.widths) {
      for (const theme of options.themes) {
        results.push(
          await auditCombination(browser, {
            route: options.route,
            width,
            theme,
          })
        );
      }
    }

    const singleRun = results.length === 1;
    if (!singleRun) {
      fs.mkdirSync(artifactDir, { recursive: true });
      fs.writeFileSync(
        path.join(artifactDir, "focused-audit.json"),
        `${JSON.stringify(results, null, 2)}\n`
      );
      fs.writeFileSync(
        path.join(artifactDir, "report.md"),
        makeReport(results)
      );
    }

    const failed = results.filter((result) => result.status !== "passed");
    if (failed.length) {
      throw new Error(JSON.stringify(failed, null, 2));
    }

    if (singleRun) {
      console.log(JSON.stringify(results[0], null, 2));
      return;
    }

    console.log(
      JSON.stringify(
        {
          status: "passed",
          route: options.route,
          widths: options.widths,
          themes: options.themes,
          artifactDir,
        },
        null,
        2
      )
    );
  } finally {
    await browser.close();
  }
}

module.exports = {
  parseArgs,
  main,
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
