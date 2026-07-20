#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const localBase = (
  process.env.LOCAL_BASE_URL ?? "http://127.0.0.1:3000/docusaurus-theme/"
).replace(/\/?$/, "/");
const outputDirectory = path.resolve(
  process.argv[2] ?? "/tmp/base-nova-parity"
);
const officialBase = "https://ui.shadcn.com/docs/components/base/";

const properties = [
  "fontFamily",
  "fontSize",
  "lineHeight",
  "fontWeight",
  "letterSpacing",
  "width",
  "height",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "boxSizing",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "rowGap",
  "columnGap",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderTopStyle",
  "borderRightStyle",
  "borderBottomStyle",
  "borderLeftStyle",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomRightRadius",
  "borderBottomLeftRadius",
  "backgroundColor",
  "color",
  "opacity",
  "boxShadow",
  "transform",
  "position",
];

const colorProperties = new Set([
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "backgroundColor",
  "color",
]);

const contentDependent = new Set();

const cases = [
  {
    name: "button-outline",
    component: "button",
    official: "[data-slot=button]",
    route: "base-nova-parity",
    local: '[data-parity=button] [data-slot=button]:has-text("Button")',
  },
  {
    name: "button-disabled",
    component: "button",
    official: "[data-slot=button]",
    route: "base-nova-parity",
    local: '[data-parity=button] [data-slot=button]:has-text("Button")',
    mutateDisabled: true,
    states: ["rest"],
  },
  {
    name: "button-loading",
    component: "button",
    official: "[data-slot=button]:disabled:has([data-slot=spinner])",
    route: "base-nova-parity",
    local: "[data-parity=button] [data-slot=button]:has([data-slot=spinner])",
    states: ["rest"],
  },
  {
    name: "code-block-copy-action",
    component: "button",
    official: ".typeset > figure [data-slot=copy-button]",
    scopePreview: false,
    route: "base-nova-parity",
    local: "[data-parity=code] [data-slot=copy-button]",
    compareIdentity: true,
  },
  {
    name: "code-block-surface",
    component: "button",
    official: ".typeset > figure[data-rehype-pretty-code-figure]",
    scopePreview: false,
    fixture: "code",
    route: "base-nova-parity",
    local: "[data-parity=code] .theme-code-block",
    compareIdentity: true,
  },
  {
    name: "accordion-trigger-collapsed",
    component: "accordion",
    official: "[data-slot=accordion-trigger]",
    fixture: "accordion",
    route: "base-nova-parity",
    local: "[data-parity=accordion] [data-slot=accordion-trigger]",
  },
  {
    name: "accordion-trigger-expanded",
    component: "accordion",
    official: "[data-slot=accordion-trigger]",
    fixture: "accordion",
    route: "base-nova-parity",
    local: "[data-parity=accordion] [data-slot=accordion-trigger]",
    open: true,
    states: ["expanded"],
  },
  {
    name: "accordion-content-expanded",
    component: "accordion",
    official: "[data-slot=accordion-content]",
    fixture: "accordion",
    route: "base-nova-parity",
    local: "[data-parity=accordion] [data-slot=accordion-content]",
    open: true,
    states: ["expanded"],
  },
  {
    name: "tabs-list",
    component: "tabs",
    official: "[data-slot=tabs-list]",
    fixture: "tabs",
    route: "base-nova-parity",
    local: "[data-parity=tabs] [data-slot=tabs-list]",
  },
  {
    name: "tabs-trigger-selected",
    component: "tabs",
    official: "[data-slot=tabs-trigger][data-active]",
    fixture: "tabs",
    route: "base-nova-parity",
    local: "[data-parity=tabs] [data-slot=tabs-trigger][data-active]",
  },
  {
    name: "tabs-trigger-unselected",
    component: "tabs",
    official: "[data-slot=tabs-trigger]:not([data-active])",
    fixture: "tabs",
    route: "base-nova-parity",
    local: "[data-parity=tabs] [data-slot=tabs-trigger]:not([data-active])",
  },
  {
    name: "tabs-content",
    component: "tabs",
    official: "[data-slot=tabs-content]",
    fixture: "tabs",
    route: "base-nova-parity",
    local: "[data-parity=tabs] [data-slot=tabs-content]",
  },
  {
    name: "card",
    component: "card",
    official: "[data-slot=card]",
    fixture: "card",
    route: "base-nova-parity",
    local: "[data-parity=card] [data-slot=card]",
  },
  {
    name: "card-header",
    component: "card",
    official: "[data-slot=card-header]",
    fixture: "card",
    route: "base-nova-parity",
    local: "[data-parity=card] [data-slot=card-header]",
  },
  {
    name: "card-title",
    component: "card",
    official: "[data-slot=card-title]",
    fixture: "card",
    route: "base-nova-parity",
    local: "[data-parity=card] [data-slot=card-title]",
  },
  {
    name: "alert",
    component: "alert",
    official: "[data-slot=alert]",
    fixture: "alert",
    route: "base-nova-parity",
    local: "[data-parity=alert] [data-slot=alert]",
  },
  {
    name: "alert-title",
    component: "alert",
    official: "[data-slot=alert-title]",
    fixture: "alert",
    route: "base-nova-parity",
    local: "[data-parity=alert] [data-slot=alert-title]",
  },
  {
    name: "alert-description",
    component: "alert",
    official: "[data-slot=alert-description]",
    fixture: "alert",
    route: "base-nova-parity",
    local: "[data-parity=alert] [data-slot=alert-description]",
  },
  {
    name: "table",
    component: "table",
    official: "[data-slot=table]",
    fixture: "table",
    route: "base-nova-parity",
    local: "[data-parity=table] [data-slot=table]",
  },
  {
    name: "table-head",
    component: "table",
    official: "[data-slot=table-head]",
    fixture: "table",
    route: "base-nova-parity",
    local: "[data-parity=table] [data-slot=table-head]",
  },
  {
    name: "table-cell",
    component: "table",
    official: "[data-slot=table-cell]",
    fixture: "table",
    route: "base-nova-parity",
    local: "[data-parity=table] [data-slot=table-cell]",
  },
  {
    name: "breadcrumb-list",
    component: "breadcrumb",
    official: "[data-slot=breadcrumb-list]",
    fixture: "breadcrumb",
    route: "base-nova-parity",
    local: "[data-parity=breadcrumb] [data-slot=breadcrumb-list]",
  },
  {
    name: "breadcrumb-link",
    component: "breadcrumb",
    official: "[data-slot=breadcrumb-link]",
    fixture: "breadcrumb",
    route: "base-nova-parity",
    local: "[data-parity=breadcrumb] [data-slot=breadcrumb-link]",
  },
  {
    name: "sidebar-menu-button",
    component: "sidebar",
    officialUrl: "https://ui.shadcn.com/view/base-nova/sidebar-demo",
    official: '[data-slot=sidebar-menu-button]:has-text("Design Engineering")',
    scopePreview: false,
    route: "base-nova-parity",
    local:
      '[data-parity=sidebar] [data-slot=sidebar-menu-button]:has-text("Design Engineering")',
  },
  {
    name: "sidebar-menu-button-current",
    component: "sidebar",
    officialUrl: "https://ui.shadcn.com/view/base-nova/sidebar-demo",
    official: '[data-slot=sidebar-menu-button]:has-text("Design Engineering")',
    scopePreview: false,
    route: "base-nova-parity",
    local:
      '[data-parity=sidebar] [data-slot=sidebar-menu-button]:has-text("Design Engineering")',
    mutateActive: "both",
  },
  {
    name: "navigation-menu-trigger",
    component: "navigation-menu",
    official: "[data-slot=navigation-menu-trigger]",
    route: "base-nova-parity",
    local: "[data-parity=navigation-menu] [data-slot=navigation-menu-trigger]",
    viewports: ["desktop"],
  },
  {
    name: "navigation-menu-content-open",
    component: "navigation-menu",
    official: "[data-slot=navigation-menu-content]",
    scopePreview: false,
    route: "base-nova-parity",
    local: '[data-slot=navigation-menu-content]:has-text("Introduction")',
    triggerLocal:
      "[data-parity=navigation-menu] [data-slot=navigation-menu-trigger]",
    setup: "navigation-menu",
    viewports: ["desktop"],
    states: ["open"],
  },
  {
    name: "sheet-overlay",
    component: "sheet",
    official: "[data-slot=sheet-overlay]",
    scopePreview: false,
    route: "base-nova-parity",
    local: "[data-slot=sheet-overlay]",
    triggerLocal: '[data-parity="sheet"] [data-slot=sheet-trigger]',
    setup: "sheet",
    viewports: ["mobile"],
    states: ["rest"],
  },
  {
    name: "sheet-content",
    component: "sheet",
    official: "[data-slot=sheet-content]",
    scopePreview: false,
    route: "base-nova-parity",
    local: "[data-slot=sheet-content]",
    triggerLocal: '[data-parity="sheet"] [data-slot=sheet-trigger]',
    setup: "sheet",
    viewports: ["mobile"],
  },
  {
    name: "sheet-close-button",
    component: "sheet",
    official: "[data-slot=sheet-close]",
    scopePreview: false,
    route: "base-nova-parity",
    local: "[data-slot=sheet-close]",
    triggerLocal: '[data-parity="sheet"] [data-slot=sheet-trigger]',
    setup: "sheet",
    viewports: ["mobile"],
  },
  {
    name: "dropdown-trigger",
    component: "dropdown-menu",
    official: "[data-slot=dropdown-menu-trigger]",
    route: "base-nova-parity",
    local: "[data-parity=dropdown] [data-slot=dropdown-menu-trigger]",
  },
  {
    name: "dropdown-content",
    component: "dropdown-menu",
    official: "[data-slot=dropdown-menu-content]",
    scopePreview: false,
    route: "base-nova-parity",
    local: "[data-slot=dropdown-menu-content]",
    triggerLocal: "[data-parity=dropdown] [data-slot=dropdown-menu-trigger]",
    setup: "dropdown",
    alignTrigger: true,
    states: ["open"],
  },
  {
    name: "dropdown-item",
    component: "dropdown-menu",
    official: "[data-slot=dropdown-menu-item]",
    scopePreview: false,
    route: "base-nova-parity",
    local: "[data-slot=dropdown-menu-item]",
    triggerLocal: "[data-parity=dropdown] [data-slot=dropdown-menu-trigger]",
    setup: "dropdown",
  },
  {
    name: "tooltip-trigger-disabled",
    component: "tooltip",
    official: "[data-slot=tooltip-trigger] > [data-slot=button]",
    route: "base-nova-parity",
    local:
      "[data-parity=tooltip] [data-slot=tooltip-trigger] > [data-slot=button]",
    states: ["disabled"],
  },
  {
    name: "tooltip-content",
    component: "tooltip",
    official: "[data-slot=tooltip-content]",
    scopePreview: false,
    route: "base-nova-parity",
    local: "[data-slot=tooltip-content]",
    triggerLocal: "[data-parity=tooltip] [data-slot=tooltip-trigger]",
    setup: "tooltip",
    states: ["open"],
  },
];

const fixtureWidths = {
  accordion: { desktop: 384, tablet: 384, mobile: 260 },
  card: { desktop: 384, tablet: 384, mobile: 260 },
  alert: { desktop: 448, tablet: 448, mobile: 292 },
  table: { desktop: 558, tablet: 558, mobile: 326.875 },
  tabs: { desktop: 400, tablet: 400, mobile: 290.140625 },
  code: { desktop: 640, tablet: 640, mobile: 342 },
  breadcrumb: { desktop: 304.15625, tablet: 304.15625, mobile: 304.15625 },
};

const interactiveCases = new Set([
  "button-outline",
  "code-block-copy-action",
  "accordion-trigger-collapsed",
  "tabs-trigger-selected",
  "tabs-trigger-unselected",
  "breadcrumb-link",
  "sidebar-menu-button",
  "sidebar-menu-button-current",
  "navigation-menu-trigger",
  "dropdown-trigger",
  "dropdown-item",
  "sheet-close-button",
]);
const interactiveStates = ["rest", "hover", "focus", "focus-visible", "active"];

async function setTheme(page, target, theme) {
  await page.emulateMedia({ colorScheme: theme });
  await page.evaluate(
    ({ target, theme }) => {
      const root = document.documentElement;
      if (target === "official")
        root.classList.toggle("dark", theme === "dark");
      else root.setAttribute("data-theme", theme);
    },
    { target, theme }
  );
}

async function rgba(page, value) {
  return page.evaluate((color) => {
    if (!color || color === "transparent") return [0, 0, 0, 0];
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    return Array.from(context.getImageData(0, 0, 1, 1).data);
  }, value);
}

async function metric(page, locator) {
  const result = await locator.evaluate((element, names) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const iconElement = Array.from(element.children).find((candidate) => {
      if (candidate.tagName !== "svg") return false;
      const candidateRect = candidate.getBoundingClientRect();
      return candidateRect.width > 0 && candidateRect.height > 0;
    });
    const iconRect = iconElement?.getBoundingClientRect();
    const iconStyle = iconElement ? getComputedStyle(iconElement) : null;
    const snap = (value) => Math.round(value * 64) / 64;
    return {
      tag: element.tagName,
      slot: element.getAttribute("data-slot"),
      variant: element.getAttribute("data-variant"),
      size: element.getAttribute("data-size"),
      copied: element.getAttribute("data-copied"),
      text: (element.textContent ?? "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 80),
      values: Object.fromEntries(names.map((name) => [name, style[name]])),
      rect: { width: snap(rect.width), height: snap(rect.height) },
      icon: iconRect
        ? (() => {
            const width = Number.parseFloat(iconStyle.width);
            const height = Number.parseFloat(iconStyle.height);
            const xStart = iconRect.x + iconRect.width / 2 - rect.x - width / 2;
            const yStart =
              iconRect.y + iconRect.height / 2 - rect.y - height / 2;
            return {
              width: snap(width),
              height: snap(height),
              xStart: snap(xStart),
              xEnd: snap(rect.width - xStart - width),
              yStart: snap(yStart),
              yEnd: snap(rect.height - yStart - height),
            };
          })()
        : null,
    };
  }, properties);

  for (const property of colorProperties) {
    result.values[property] = await rgba(page, result.values[property]);
  }
  return result;
}

async function visible(page, selector) {
  const candidates = page.locator(selector);
  for (let index = 0; index < (await candidates.count()); index += 1) {
    const candidate = candidates.nth(index);
    if (await candidate.isVisible()) return candidate;
  }
  throw new Error(`No visible element: ${selector}`);
}

async function pageFor(context, target, item, theme, alignment) {
  const page = await context.newPage();
  const url =
    target === "official"
      ? (item.officialUrl ?? `${officialBase}${item.component}`)
      : `${localBase}${item.route}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(target === "official" ? 1200 : 150);
  await setTheme(page, target, theme);
  if (target === "local" && alignment && item.triggerLocal) {
    const trigger = await visible(page, item.triggerLocal);
    const box = await trigger.boundingBox();
    if (box) {
      await trigger.evaluate(
        (element, point) => {
          const fixture = element.closest("[data-parity]");
          if (fixture instanceof HTMLElement) {
            fixture.style.transform = `translate(${point.x - point.currentX}px, ${point.y - point.currentY}px)`;
          }
        },
        { ...alignment, currentX: box.x, currentY: box.y }
      );
    }
  }
  if (item.setup === "sheet") {
    if (target === "official") {
      await page
        .locator(
          '[data-slot="component-preview"] [data-slot="preview"] [data-slot=button]'
        )
        .filter({ hasText: /^left$/i })
        .click();
    } else {
      await page
        .locator(item.triggerLocal ?? "[data-mobile-navigation-trigger]")
        .click();
    }
    await page.waitForTimeout(300);
  }
  if (item.setup === "navigation-menu") {
    const selector =
      target === "official"
        ? '[data-slot="component-preview"] [data-slot="preview"] [data-slot=navigation-menu-trigger]'
        : (item.triggerLocal ?? "[data-slot=navigation-menu-trigger]");
    await visible(page, selector).then((trigger) => trigger.click());
    await page.waitForTimeout(300);
  }
  if (item.setup === "dropdown") {
    const selector =
      target === "official"
        ? '[data-slot="component-preview"] [data-slot="preview"] [data-slot=dropdown-menu-trigger]'
        : (item.triggerLocal ?? "[data-slot=dropdown-menu-trigger]");
    await visible(page, selector).then((trigger) => trigger.click());
    await page.waitForTimeout(200);
    if (target === "local" && alignment?.availableHeight) {
      const content = await visible(page, item.local);
      await content.evaluate((element, availableHeight) => {
        element.parentElement?.style.setProperty(
          "--available-height",
          `${availableHeight}px`
        );
      }, alignment.availableHeight);
    }
  }
  if (item.setup === "tooltip") {
    const selector =
      target === "official"
        ? '[data-slot="component-preview"] [data-slot="preview"] [data-slot=tooltip-trigger]'
        : (item.triggerLocal ?? "[data-slot=tooltip-trigger]");
    await visible(page, selector).then((trigger) => trigger.hover());
    await page.waitForTimeout(700);
  }
  if (item.mutateActive === target || item.mutateActive === "both") {
    const selector =
      target === "official"
        ? (item.mutateSelector ?? item.official)
        : item.local;
    await visible(page, selector).then((element) =>
      element.evaluate((target) => target.setAttribute("data-active", "true"))
    );
  }
  if (item.mutateDisabled) {
    const selector =
      target === "official"
        ? `[data-slot="component-preview"] [data-slot="preview"] ${item.official}`
        : item.local;
    await visible(page, selector).then((button) =>
      button.evaluate((element) => {
        element.disabled = true;
        element.setAttribute("data-disabled", "");
      })
    );
    await page.waitForTimeout(250);
  }
  if (item.open && item.name.startsWith("accordion")) {
    const triggerSelector =
      target === "official"
        ? `[data-slot="component-preview"] [data-slot="preview"] [data-slot=accordion-trigger]`
        : item.local.replace(
            "[data-slot=accordion-content]",
            "[data-slot=accordion-trigger]"
          );
    const trigger = await visible(page, triggerSelector);
    if ((await trigger.getAttribute("aria-expanded")) !== "true")
      await trigger.click();
    await page.waitForTimeout(300);
  }
  return page;
}

async function captureState(page, selector, state) {
  const element = await visible(page, selector);
  if (state === "hover") await element.hover();
  if (state === "focus") {
    await element.evaluate((target) => target.focus({ focusVisible: false }));
    if (!(await element.evaluate((target) => target.matches(":focus")))) {
      throw new Error(`${selector} did not enter :focus`);
    }
  }
  if (state === "focus-visible") {
    await element.evaluate((target) => target.focus({ focusVisible: true }));
    if (
      !(await element.evaluate((target) => target.matches(":focus-visible")))
    ) {
      throw new Error(`${selector} did not enter :focus-visible`);
    }
  }
  if (state === "active") {
    const box = await element.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
    }
  }
  if (state !== "rest") await page.waitForTimeout(250);
  const measured = await metric(page, element);
  if (state === "active") await page.mouse.up();
  return measured;
}

function equal(left, right) {
  if (
    typeof left === "string" &&
    typeof right === "string" &&
    /^-?\d+(?:\.\d+)?px$/.test(left) &&
    /^-?\d+(?:\.\d+)?px$/.test(right)
  ) {
    return (
      Math.abs(Number.parseFloat(left) - Number.parseFloat(right)) <= 0.000001
    );
  }
  return JSON.stringify(left) === JSON.stringify(right);
}

function compare(item, state, official, local) {
  const name = item.name;
  const differences = [];
  const excluded = [];
  if (item.compareIdentity) {
    for (const property of [
      "tag",
      "slot",
      "variant",
      "size",
      "copied",
      "text",
    ]) {
      if (official[property] !== local[property]) {
        differences.push({
          property,
          official: official[property],
          local: local[property],
        });
      }
    }
  }
  for (const property of properties) {
    let exclusion;
    if (contentDependent.has(property))
      exclusion = "different fixture content/container";
    if (
      item.contextWidth &&
      ["width", "minWidth", "maxWidth"].includes(property)
    )
      exclusion = "integration container/content width";
    if (
      item.contentHeight &&
      ["height", "minHeight", "maxHeight"].includes(property)
    )
      exclusion = "different fixture content";
    if (
      item.contextDimensions &&
      ["minWidth", "maxWidth", "minHeight", "maxHeight"].includes(property)
    )
      exclusion = "layout-context intrinsic sizing";
    if (item.floatingContext && ["maxHeight", "maxWidth"].includes(property))
      exclusion = "floating viewport available size";
    if (item.exampleCardComposition && property === "paddingBottom")
      exclusion =
        "official example includes CardFooter; local fixture does not";
    if (item.exampleTypography && property === "fontWeight")
      exclusion = "official example content emphasis";
    if (
      item.contextTypography &&
      [
        "fontFamily",
        "fontSize",
        "lineHeight",
        "fontWeight",
        "letterSpacing",
        "color",
      ].includes(property)
    )
      exclusion = "non-rendering inherited context on this slot";
    if (item.exampleColor && property === "color")
      exclusion = "official example-specific menu label color";
    if (
      item.exampleComposition &&
      ["paddingRight", "paddingLeft", "columnGap", "rowGap"].includes(property)
    )
      exclusion = "official/local child composition differs";
    if (exclusion) {
      excluded.push({
        property,
        reason: exclusion,
        official: official.values[property],
        local: local.values[property],
      });
      continue;
    }
    const expected = official.values[property];
    const actual = local.values[property];
    if (!equal(expected, actual))
      differences.push({ property, official: expected, local: actual });
  }
  if (item.contentHeight) {
    excluded.push({
      property: "rect.height",
      reason: "different fixture content",
      official: official.rect.height,
      local: local.rect.height,
    });
  } else if (Math.abs(official.rect.height - local.rect.height) > 0.000001) {
    differences.push({
      property: "rect.height",
      official: official.rect.height,
      local: local.rect.height,
    });
  }
  if (item.contextWidth) {
    excluded.push({
      property: "rect.width",
      reason: "integration container/content width",
      official: official.rect.width,
      local: local.rect.width,
    });
  } else if (Math.abs(official.rect.width - local.rect.width) > 0.000001) {
    differences.push({
      property: "rect.width",
      official: official.rect.width,
      local: local.rect.width,
    });
  }
  if (item.exampleIcon) {
    excluded.push({
      property: "icon",
      reason: "official/local example icon composition differs",
      official: official.icon,
      local: local.icon,
    });
  } else if (!!official.icon !== !!local.icon) {
    differences.push({
      property: "icon.presence",
      official: !!official.icon,
      local: !!local.icon,
    });
  } else if (official.icon && local.icon) {
    for (const property of ["width", "height"]) {
      if (Math.abs(official.icon[property] - local.icon[property]) > 0.000001) {
        differences.push({
          property: `icon.${property}`,
          official: official.icon[property],
          local: local.icon[property],
        });
      }
    }
    const horizontalAligned = ["xStart", "xEnd"].some(
      (property) =>
        Math.abs(official.icon[property] - local.icon[property]) <= 0.000001
    );
    const verticalAligned = ["yStart", "yEnd"].some(
      (property) =>
        Math.abs(official.icon[property] - local.icon[property]) <= 0.000001
    );
    if (!horizontalAligned)
      differences.push({
        property: "icon.horizontalOffset",
        official: official.icon,
        local: local.icon,
      });
    if (!verticalAligned)
      differences.push({
        property: "icon.verticalOffset",
        official: official.icon,
        local: local.icon,
      });
  }
  return { name, state, differences, excluded, official, local };
}

(async () => {
  fs.mkdirSync(outputDirectory, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const viewports = {
    desktop: { width: 1440, height: 1200 },
    tablet: { width: 820, height: 1180 },
    mobile: { width: 390, height: 844 },
  };
  const results = [];

  for (const theme of ["light", "dark"]) {
    for (const [viewportName, viewport] of Object.entries(viewports)) {
      const context = await browser.newContext({
        viewport,
        colorScheme: theme,
      });
      try {
        for (const item of cases) {
          if (
            viewportName !== "desktop" &&
            ["sidebar-menu-button", "sidebar-menu-button-current"].includes(
              item.name
            )
          )
            continue;
          if (item.viewports && !item.viewports.includes(viewportName))
            continue;
          process.stdout.write(
            `Checking ${theme}/${viewportName}/${item.name}…\n`
          );
          let officialPage;
          let localPage;
          try {
            officialPage = await pageFor(context, "official", item, theme);
            let alignment;
            if (item.alignTrigger) {
              const trigger = await visible(
                officialPage,
                `[data-slot="component-preview"] [data-slot="preview"] ${item.official.replace("content", "trigger")}`
              );
              alignment = await trigger.boundingBox();
              const content = await visible(officialPage, item.official);
              alignment.availableHeight = await content.evaluate((element) =>
                Number.parseFloat(
                  getComputedStyle(element).getPropertyValue(
                    "--available-height"
                  )
                )
              );
            }
            localPage = await pageFor(context, "local", item, theme, alignment);
            const states =
              item.states ??
              (interactiveCases.has(item.name) ? interactiveStates : ["rest"]);
            for (const state of states) {
              const officialSelector =
                item.scopePreview === false
                  ? item.official
                  : `[data-slot="component-preview"] [data-slot="preview"] ${item.official}`;
              const official = await captureState(
                officialPage,
                officialSelector,
                state
              );
              if (item.fixture) {
                const fixtureWidth = fixtureWidths[item.fixture][viewportName];
                await visible(localPage, `[data-parity=${item.fixture}]`).then(
                  (fixture) =>
                    fixture.evaluate((element, width) => {
                      element.style.width = `${width}px`;
                    }, fixtureWidth)
                );
              }
              const local = await captureState(localPage, item.local, state);
              results.push({
                theme,
                viewport: viewportName,
                ...compare(item, state, official, local),
              });
              await officialPage.mouse.move(0, 0);
              await localPage.mouse.move(0, 0);
              await officialPage.evaluate(() =>
                document.activeElement instanceof HTMLElement
                  ? document.activeElement.blur()
                  : undefined
              );
              await localPage.evaluate(() =>
                document.activeElement instanceof HTMLElement
                  ? document.activeElement.blur()
                  : undefined
              );
            }
          } catch (error) {
            results.push({
              theme,
              viewport: viewportName,
              name: item.name,
              state: "setup",
              error: error.message,
              differences: [],
              excluded: [],
            });
          } finally {
            await officialPage?.close();
            await localPage?.close();
          }
        }
      } finally {
        await context.close();
      }
    }
  }

  await browser.close();
  fs.writeFileSync(
    path.join(outputDirectory, "results.json"),
    JSON.stringify(results, null, 2)
  );
  const failures = results.filter(
    (result) => result.error || result.differences.length > 0
  );
  const fullyCompared = results.filter(
    (result) =>
      !result.error &&
      result.differences.length === 0 &&
      result.excluded.length === 0
  );
  const contextControlled = results.filter(
    (result) =>
      !result.error &&
      result.differences.length === 0 &&
      result.excluded.length > 0
  );
  const lines = [
    "# Base Nova official/local parity",
    "",
    `- Checks: ${results.length}`,
    `- Fully compared exact: ${fullyCompared.length}`,
    `- Comparable properties exact with explicit fixture/context exclusions: ${contextControlled.length}`,
    `- Differences/errors: ${failures.length}`,
    `- Contextual exclusions: ${contextControlled.length}`,
    "- Canonical fixture cases use matching official content and container width; integration cases compare component-owned properties under the same viewport, theme, and interaction state.",
    "- Geometry is normalized to Chromium's 1/64 CSS-pixel layout quantum; floating overlays receive the official available-height context after exact trigger alignment.",
    "- Every measured value is recorded in results.json.",
    "",
    "| Theme | Viewport | Component | State | Result |",
    "| --- | --- | --- | --- | --- |",
    ...results.map(
      (result) =>
        `| ${result.theme} | ${result.viewport} | ${result.name} | ${result.state} | ${result.error ? `ERROR: ${result.error}` : result.differences.length ? result.differences.map((difference) => difference.property).join(", ") : result.excluded.length ? `0px comparable / ${result.excluded.length} contextual exclusions` : "0px / fully exact"} |`
    ),
  ];
  fs.writeFileSync(
    path.join(outputDirectory, "report.md"),
    `${lines.join("\n")}\n`
  );
  console.log(`Parity report: ${path.join(outputDirectory, "report.md")}`);
  if (failures.length > 0) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
