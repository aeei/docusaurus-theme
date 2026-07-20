#!/usr/bin/env node

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const {
  discoverActualRoutes,
  normalizeRoute,
  projectRoot,
} = require("./lib/actual-routes.cjs");

const baseUrl = (
  process.env.DOCS_STARTER_URL ?? "http://127.0.0.1:3001/docusaurus-theme/"
).replace(/\/?$/, "/");
const artifactDir = path.join(projectRoot, "artifacts/rendered-surfaces");
const screenshotDir = path.join(artifactDir, "inventory-screenshots");
const widths = [390, 820, 1440, 2736];
const themes = ["light", "dark"];

const slotOwners = {
  accordion: "Accordion",
  alert: "Alert",
  badge: "Badge",
  breadcrumb: "Breadcrumb",
  button: "Button",
  card: "Card",
  collapsible: "Collapsible",
  "copy-button": "Button",
  docs: "Live shadcn docs shell",
  dialog: "Dialog",
  dropdown: "DropdownMenu",
  input: "Input",
  kbd: "Kbd",
  navigation: "NavigationMenu",
  separator: "Separator",
  sheet: "Sheet",
  sidebar: "Sidebar",
  skeleton: "Skeleton",
  spinner: "Button",
  table: "Table",
  tabs: "Tabs",
  tooltip: "Tooltip",
};

function routeUrl(route) {
  return new URL(route, baseUrl).href;
}

function fileSafeRoute(route) {
  return route ? route.replaceAll("/", "-") : "root";
}

function ownerForSlot(slot) {
  if (slotOwners[slot]) return slotOwners[slot];
  const prefix = Object.keys(slotOwners).find((candidate) =>
    slot.startsWith(`${candidate}-`)
  );
  return prefix ? slotOwners[prefix] : null;
}

function fingerprint(text) {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}

async function setTheme(page, theme) {
  await page.emulateMedia({ colorScheme: theme });
  await page.addInitScript(
    (value) => localStorage.setItem("theme", value),
    theme
  );
}

async function inventoryPage(page, context) {
  const snapshot = await page.evaluate(
    ({ slotOwners }) => {
      const styleKeys = [
        "font-family",
        "font-size",
        "line-height",
        "font-weight",
        "letter-spacing",
        "box-sizing",
        "min-width",
        "max-width",
        "min-height",
        "max-height",
        "padding-top",
        "padding-right",
        "padding-bottom",
        "padding-left",
        "margin-top",
        "margin-right",
        "margin-bottom",
        "margin-left",
        "row-gap",
        "column-gap",
        "border-top-width",
        "border-right-width",
        "border-bottom-width",
        "border-left-width",
        "border-top-style",
        "border-top-color",
        "border-top-left-radius",
        "border-top-right-radius",
        "border-bottom-right-radius",
        "border-bottom-left-radius",
        "background-color",
        "color",
        "opacity",
        "box-shadow",
        "transform",
        "position",
        "display",
        "visibility",
        "overflow-x",
        "overflow-y",
      ];
      const excludedTags = new Set([
        "SCRIPT",
        "STYLE",
        "LINK",
        "META",
        "TITLE",
        "NOSCRIPT",
      ]);
      const slotOwner = (slot) => {
        if (slotOwners[slot]) return slotOwners[slot];
        const prefix = Object.keys(slotOwners).find((candidate) =>
          slot.startsWith(`${candidate}-`)
        );
        return prefix ? slotOwners[prefix] : null;
      };
      const elementPath = (element) => {
        const parts = [];
        let current = element;
        while (current && current !== document.documentElement) {
          const tag = current.tagName.toLowerCase();
          const slot = current.getAttribute("data-slot");
          const siblings = current.parentElement
            ? Array.from(current.parentElement.children).filter(
                (candidate) => candidate.tagName === current.tagName
              )
            : [];
          const index = siblings.indexOf(current) + 1;
          parts.unshift(
            `${tag}${slot ? `[data-slot="${slot}"]` : ""}:nth-of-type(${index})`
          );
          current = current.parentElement;
        }
        return `html > ${parts.join(" > ")}`;
      };
      const regionOwner = (element) => {
        const slotRoot = element.closest("[data-slot]");
        if (slotRoot) {
          const slot = slotRoot.getAttribute("data-slot");
          if (slot !== "docs" || slotRoot === element) {
            const owner = slotOwner(slot);
            return owner
              ? { owner, oracle: "official-registry", slot }
              : { owner: null, slot };
          }
        }
        if (element.closest(".docusaurus-mermaid-container")) {
          return { owner: "Mermaid", oracle: "official-mermaid", slot: null };
        }
        if (element.closest(".theme-doc-markdown")) {
          return { owner: "Typeset", oracle: "live-shadcn-docs", slot: null };
        }
        const regions = [
          ['[class*="skipToContent"]', "Skip link", "Docusaurus"],
          [".navbar", "Navbar shell", "live-shadcn-docs"],
          [".theme-doc-toc-mobile", "Mobile TOC", "Accordion"],
          [".theme-doc-page__toc", "Desktop TOC", "live-shadcn-docs"],
          [".pagination-nav", "Paginator", "Button"],
          [".theme-doc-footer", "Doc footer", "live-shadcn-docs"],
          [".footer", "Footer", "live-shadcn-docs"],
          [".theme-doc-root-layout", "Docs shell", "live-shadcn-docs"],
          [".theme-app-shell", "App shell", "live-shadcn-docs"],
          ["#__docusaurus", "Document shell", "live-shadcn-docs"],
        ];
        for (const [selector, owner, oracle] of regions) {
          if (element.closest(selector)) return { owner, oracle, slot: null };
        }
        if (element === document.body || element === document.documentElement) {
          return {
            owner: "Document shell",
            oracle: "live-shadcn-docs",
            slot: null,
          };
        }
        return { owner: null, oracle: null, slot: null };
      };

      const rows = [];
      const unknownSlots = new Set();
      const unknownElements = [];
      for (const element of document.querySelectorAll("html, body, body *")) {
        if (excludedTags.has(element.tagName)) continue;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          Number(style.opacity) === 0
        ) {
          continue;
        }
        if (rect.width <= 0 || rect.height <= 0) continue;
        const ownership = regionOwner(element);
        if (!ownership.owner) {
          if (ownership.slot) unknownSlots.add(ownership.slot);
          unknownElements.push(elementPath(element));
          continue;
        }
        const text = (
          element.childElementCount ? "" : (element.textContent ?? "")
        )
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 240);
        rows.push({
          path: elementPath(element),
          tag: element.tagName.toLowerCase(),
          role: element.getAttribute("role"),
          slot: element.getAttribute("data-slot"),
          owner: ownership.owner,
          oracle: ownership.oracle,
          text,
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            right: rect.right,
            bottom: rect.bottom,
          },
          styles: Object.fromEntries(
            styleKeys.map((key) => [key, style.getPropertyValue(key)])
          ),
        });
      }

      const internalLinks = Array.from(document.querySelectorAll("a[href]"))
        .map((anchor) => anchor.href)
        .filter((href) => href.startsWith(location.origin))
        .map((href) => new URL(href).pathname);

      return {
        title: document.title,
        rows,
        unknownSlots: [...unknownSlots].sort(),
        unknownElements: unknownElements.slice(0, 50),
        internalLinks: [...new Set(internalLinks)].sort(),
      };
    },
    { slotOwners }
  );

  return {
    ...snapshot,
    rows: snapshot.rows.map((row, index) => ({
      ...context,
      index,
      textFingerprint: fingerprint(row.text),
      ...row,
    })),
  };
}

function makeCoverage(states, routes, sourceRows) {
  const ownerCounts = new Map();
  const routeCounts = new Map();
  for (const state of states) {
    routeCounts.set(
      state.route,
      (routeCounts.get(state.route) ?? 0) + state.rows.length
    );
    for (const row of state.rows) {
      ownerCounts.set(row.owner, (ownerCounts.get(row.owner) ?? 0) + 1);
    }
  }
  return [
    "# Actual-route rendered surface coverage",
    "",
    `- routes: ${routes.length}`,
    `- source docs: ${sourceRows.length}`,
    `- states: ${states.length}`,
    `- visible element rows: ${states.reduce((sum, state) => sum + state.rows.length, 0)}`,
    `- widths: ${widths.join(", ")}`,
    `- themes: ${themes.join(", ")}`,
    "",
    "## Routes",
    "",
    ...routes.map(
      (route) => `- \`/${route}\`: ${routeCounts.get(route) ?? 0} rows`
    ),
    "",
    "## Ownership",
    "",
    ...[...ownerCounts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([owner, count]) => `- ${owner}: ${count}`),
    "",
    "## Source mapping",
    "",
    ...sourceRows.map(({ file, route }) => `- \`${file}\` → \`/${route}\``),
    "",
  ].join("\n");
}

(async () => {
  const discovery = discoverActualRoutes();
  fs.mkdirSync(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const states = [];
  const failures = [];

  try {
    for (const theme of themes) {
      for (const width of widths) {
        for (const route of discovery.routes) {
          const page = await browser.newPage({
            viewport: { width, height: 900 },
          });
          await setTheme(page, theme);
          const response = await page.goto(routeUrl(route), {
            waitUntil: "networkidle",
          });
          if (!response?.ok())
            throw new Error(`/${route}: HTTP ${response?.status()}`);
          const screenshot = path.join(
            screenshotDir,
            `${fileSafeRoute(route)}-${width}-${theme}.png`
          );
          await page.screenshot({ path: screenshot, fullPage: true });
          const inventory = await inventoryPage(page, {
            route,
            width,
            theme,
            screenshot: path
              .relative(projectRoot, screenshot)
              .replaceAll(path.sep, "/"),
          });
          if (inventory.unknownSlots.length) {
            failures.push(
              `/${route} ${width} ${theme}: unknown slots ${inventory.unknownSlots.join(", ")}`
            );
          }
          if (inventory.unknownElements.length) {
            failures.push(
              `/${route} ${width} ${theme}: unknown visible ownership ${inventory.unknownElements.join(", ")}`
            );
          }

          const known = new Set(discovery.routes);
          for (const pathname of inventory.internalLinks) {
            const relative = pathname.replace(/^\/docusaurus-theme\/?/, "");
            const target = normalizeRoute(relative);
            if (target && !known.has(target) && !target.startsWith("img/")) {
              failures.push(
                `/${route}: internal link target not audited: ${pathname}`
              );
            }
          }

          states.push({
            route,
            width,
            theme,
            screenshot,
            rows: inventory.rows,
          });
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }

  fs.writeFileSync(
    path.join(artifactDir, "inventory.json"),
    JSON.stringify({ ...discovery, widths, themes, states }, null, 2)
  );
  fs.writeFileSync(
    path.join(artifactDir, "coverage.md"),
    makeCoverage(states, discovery.routes, discovery.sourceRows)
  );

  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(
    `Inventoried ${states.length} actual-route states and ${states.reduce((sum, state) => sum + state.rows.length, 0)} visible element rows.`
  );
})();
