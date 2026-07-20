#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const localBase = (
  process.env.LOCAL_BASE_URL ?? "http://127.0.0.1:3001/docusaurus-theme/"
).replace(/\/?$/, "/");
const officialUrl = "https://ui.shadcn.com/docs/components/base/button";
const localRoute = process.env.LOCAL_ROUTE ?? "guides/markdown-gfm";
const widths = [1280, 1440];
const mobileWidths = [390, 820];
const themes = ["light", "dark"];
const reportPath = path.resolve(".pi-subagents/artifacts/toc-parity-report.md");

const OFFICIAL = {
  rail: "sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[90svh] w-(--sidebar-width) flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex",
  spacer: "h-(--top-spacing) shrink-0",
  scroll: "flex scroll-fade scrollbar-none flex-col gap-8 overflow-y-auto px-8",
  list: "flex flex-col gap-2 p-4 pt-0 text-sm",
  label: "h-6 bg-background text-xs font-medium text-muted-foreground",
  activeLink:
    "text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground data-[active=true]:font-medium data-[active=true]:text-foreground data-[depth=3]:pl-4 data-[depth=4]:pl-6",
};

function routeUrl(route) {
  return new URL(route, localBase).href;
}

function normalize(value) {
  return value;
}

async function hoverAndMeasure(page, selector) {
  const locator = page.locator(selector).first();
  await locator.hover();
  return normalize(
    await locator.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = style.color;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      const color = `rgba(${r}, ${g}, ${b}, ${a})`;
      return {
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        },
        color,
        fontWeight: style.fontWeight,
      };
    })
  );
}

async function measure(page, kind) {
  return normalize(
    await page.evaluate(
      ({ official, kind }) => {
        const all = Array.from(document.querySelectorAll("*"));
        const byClass = (className) =>
          all.filter((element) => element.className === className);
        const one = (label, elements) => {
          if (elements.length !== 1) {
            throw new Error(
              `${kind}:${label}: expected 1, got ${elements.length}`
            );
          }
          return elements[0];
        };
        const maybeOne = (label, elements) => {
          if (elements.length > 1) {
            throw new Error(
              `${kind}:${label}: expected <=1, got ${elements.length}`
            );
          }
          return elements[0] ?? null;
        };
        const rect = (element) => {
          const box = element.getBoundingClientRect();
          return {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
          };
        };
        const textRect = (element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          const box = range.getClientRects()[0];
          return box ? rect({ getBoundingClientRect: () => box }) : null;
        };
        const normalizeColor = (value) => {
          const canvas = document.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          const context = canvas.getContext("2d");
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = value;
          context.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
          return `rgba(${r}, ${g}, ${b}, ${a})`;
        };
        const metric = (element, picks = {}) => {
          const style = getComputedStyle(element);
          const base = {
            rect: rect(element),
          };
          for (const [key, prop] of Object.entries(picks)) {
            const value = style.getPropertyValue(prop).trim();
            base[key] = key.toLowerCase().includes("color")
              ? normalizeColor(value)
              : value;
          }
          return base;
        };

        const rail =
          kind === "official"
            ? one("rail", byClass(official.rail))
            : one(
                "rail",
                Array.from(document.querySelectorAll(".theme-doc-page__toc"))
              );
        const toc =
          kind === "official"
            ? rail.firstElementChild
            : one(
                "toc",
                Array.from(document.querySelectorAll(".theme-doc-toc-desktop"))
              );
        const spacer =
          kind === "official"
            ? one(
                "spacer",
                Array.from(rail.children).filter(
                  (element) => element.className === official.spacer
                )
              )
            : one(
                "spacer",
                Array.from(toc.children).filter(
                  (element) => element.className === official.spacer
                )
              );
        const scroll =
          kind === "official"
            ? one(
                "scroll",
                Array.from(rail.children).filter(
                  (element) => element.className === official.scroll
                )
              )
            : one(
                "scroll",
                Array.from(
                  document.querySelectorAll(".theme-doc-toc-desktop__scroll")
                )
              );
        const list =
          kind === "official"
            ? one(
                "list",
                Array.from(scroll.children).filter(
                  (element) => element.className === official.list
                )
              )
            : one(
                "list",
                Array.from(
                  document.querySelectorAll(".theme-doc-toc-desktop__list")
                )
              );
        const label =
          kind === "official"
            ? one(
                "label",
                Array.from(list.children).filter(
                  (element) => element.className === official.label
                )
              )
            : maybeOne(
                "label",
                Array.from(
                  document.querySelectorAll(".theme-doc-toc-desktop__header")
                )
              );

        const activeLink =
          kind === "official"
            ? one(
                "active-link",
                Array.from(list.querySelectorAll("a")).filter(
                  (element) => element.getAttribute("data-active") === "true"
                )
              )
            : one(
                "active-link",
                Array.from(
                  list.querySelectorAll("a.table-of-contents__link--active")
                )
              );
        const inactiveLinks =
          kind === "official"
            ? Array.from(list.querySelectorAll("a")).filter(
                (element) => element.getAttribute("data-active") === "false"
              )
            : Array.from(
                list.querySelectorAll("a.table-of-contents__link")
              ).filter(
                (element) =>
                  !element.classList.contains("table-of-contents__link--active")
              );
        if (!inactiveLinks.length) {
          throw new Error(`${kind}:inactive-link: expected >=1, got 0`);
        }
        const inactiveLink = inactiveLinks[0];
        const depth3Links = Array.from(
          list.querySelectorAll('a[data-depth="3"]')
        );
        if (!depth3Links.length) {
          throw new Error(`${kind}:depth3-link: expected >=1, got 0`);
        }
        const depth3Link = depth3Links[0];

        return {
          viewportWidth: window.innerWidth,
          rail: metric(rail, {
            top: "top",
            gap: "gap",
            paddingBottom: "padding-bottom",
            display: "display",
            position: "position",
          }),
          spacer: metric(spacer, { heightCss: "height" }),
          scroll: metric(scroll, {
            paddingLeft: "padding-left",
            paddingRight: "padding-right",
            gap: "gap",
            overflowY: "overflow-y",
            maskImage: "mask-image",
            animationTimeline: "animation-timeline",
          }),
          headerInScroll: Boolean(label) && scroll.contains(label),
          list: metric(list, {
            paddingLeft: "padding-left",
            paddingRight: "padding-right",
            paddingBottom: "padding-bottom",
            gap: "gap",
            fontSize: "font-size",
          }),
          label: label
            ? {
                ...metric(label, {
                  fontSize: "font-size",
                  lineHeight: "line-height",
                  fontWeight: "font-weight",
                  color: "color",
                }),
                textRect: textRect(label),
              }
            : null,
          activeLink: metric(activeLink, {
            fontSize: "font-size",
            lineHeight: "line-height",
            fontWeight: "font-weight",
            color: "color",
            paddingLeft: "padding-left",
          }),
          inactiveLink: metric(inactiveLink, {
            fontSize: "font-size",
            lineHeight: "line-height",
            fontWeight: "font-weight",
            color: "color",
            paddingLeft: "padding-left",
          }),
          depth3Link: metric(depth3Link, {
            paddingLeft: "padding-left",
          }),
        };
      },
      { official: OFFICIAL, kind }
    )
  );
}

function compare(official, local) {
  const shellWidth = Math.min(local.viewportWidth, 1440);
  const shellLeft = (local.viewportWidth - shellWidth) / 2;
  const expectedRailX = shellLeft + shellWidth - 288;
  const xOffset = expectedRailX - official.rail.rect.x;
  const pairs = [
    ["rail.rect.x", expectedRailX, local.rail.rect.x],
    ["rail.rect.y", official.rail.rect.y, local.rail.rect.y],
    ["rail.rect.width", official.rail.rect.width, local.rail.rect.width],
    ["rail.rect.height", official.rail.rect.height, local.rail.rect.height],
    ["rail.position", official.rail.position, local.rail.position],
    ["rail.top", official.rail.top, local.rail.top],
    ["rail.gap", official.rail.gap, local.rail.gap],
    [
      "rail.paddingBottom",
      official.rail.paddingBottom,
      local.rail.paddingBottom,
    ],
    [
      "spacer.rect.height",
      official.spacer.rect.height,
      local.spacer.rect.height,
    ],
    ["list.rect.x", official.list.rect.x + xOffset, local.list.rect.x],
    ["list.rect.width", official.list.rect.width, local.list.rect.width],
    ["list.paddingLeft", official.list.paddingLeft, local.list.paddingLeft],
    ["list.paddingRight", official.list.paddingRight, local.list.paddingRight],
    [
      "list.paddingBottom",
      official.list.paddingBottom,
      local.list.paddingBottom,
    ],
    [
      "activeLink.rect.x",
      official.activeLink.rect.x + xOffset,
      local.activeLink.rect.x,
    ],
    [
      "activeLink.fontSize",
      official.activeLink.fontSize,
      local.activeLink.fontSize,
    ],
    [
      "activeLink.fontWeight",
      official.activeLink.fontWeight,
      local.activeLink.fontWeight,
    ],
    [
      "inactiveLink.rect.x",
      official.inactiveLink.rect.x + xOffset,
      local.inactiveLink.rect.x,
    ],
    [
      "inactiveLink.fontSize",
      official.inactiveLink.fontSize,
      local.inactiveLink.fontSize,
    ],
    [
      "inactiveLink.fontWeight",
      official.inactiveLink.fontWeight,
      local.inactiveLink.fontWeight,
    ],
    [
      "depth3Link.paddingLeft",
      official.depth3Link.paddingLeft,
      local.depth3Link.paddingLeft,
    ],
    [
      "depth3Link.rect.x",
      official.depth3Link.rect.x + xOffset,
      local.depth3Link.rect.x,
    ],
  ];
  pairs.push(
    ["local.headerInScroll", false, local.headerInScroll],
    ["local.scrollFadeMask", true, local.scroll.maskImage !== "none"],
    [
      "local.scrollFadeTimeline",
      true,
      local.scroll.animationTimeline.includes("scroll"),
    ]
  );

  return pairs
    .filter(([, expected, actual]) => !Object.is(expected, actual))
    .map(([metric, expected, actual]) => ({ metric, expected, actual }));
}

function compareHover(official, local, xOffset) {
  const pairs = [
    ["fontWeight", official.fontWeight, local.fontWeight],
    ["rect.x", official.rect.x + xOffset, local.rect.x],
    ["rect.width", official.rect.width, local.rect.width],
  ];

  return pairs
    .filter(([, expected, actual]) => !Object.is(expected, actual))
    .map(([metric, expected, actual]) => ({ metric, expected, actual }));
}

async function measureMobileRegression(page) {
  return page.evaluate(() => {
    const rails = Array.from(document.querySelectorAll(".theme-doc-page__toc"));
    const visibleRails = rails.filter((element) => {
      const rect = element.getBoundingClientRect();
      return getComputedStyle(element).display !== "none" && rect.width > 0;
    });
    const accordions = Array.from(
      document.querySelectorAll('.theme-doc-toc-mobile [data-slot="accordion"]')
    );
    const triggers = Array.from(
      document.querySelectorAll(
        '.theme-doc-toc-mobile [data-slot="accordion-trigger"]'
      )
    ).filter((element) => element.textContent?.trim() === "On this page");
    const expanded = triggers.filter(
      (element) => element.getAttribute("aria-expanded") === "true"
    );

    return {
      rails: rails.length,
      visibleRails: visibleRails.length,
      accordions: accordions.length,
      triggers: triggers.length,
      expanded: expanded.length,
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const rows = [];
  const mobileRows = [];

  try {
    for (const theme of themes) {
      for (const width of widths) {
        const viewport = { width, height: 900 };
        const officialPage = await browser.newPage({
          viewport,
          colorScheme: theme,
        });
        const localPage = await browser.newPage({
          viewport,
          colorScheme: theme,
        });

        await officialPage.goto(officialUrl, { waitUntil: "networkidle" });
        await localPage.goto(routeUrl(localRoute), {
          waitUntil: "networkidle",
        });
        const officialLabel = officialPage.getByText("On This Page", {
          exact: true,
        });
        await officialLabel.waitFor();
        await localPage.waitForSelector(
          ".theme-doc-toc-desktop__list .table-of-contents__link"
        );

        const officialCurrentLink = officialLabel
          .locator("..")
          .locator('a[data-depth="2"]')
          .nth(1);
        const localCurrentLink = localPage
          .locator(
            '.theme-doc-toc-desktop__list .table-of-contents__link[data-depth="2"]'
          )
          .nth(1);
        await officialCurrentLink.click();
        await officialLabel
          .locator("..")
          .locator('a[data-active="true"]')
          .waitFor();
        await localCurrentLink.click();
        await localPage
          .locator(
            ".theme-doc-toc-desktop__list .table-of-contents__link--active"
          )
          .waitFor();

        const official = await measure(officialPage, "official");
        const local = await measure(localPage, "local");
        const hoverOfficial = await hoverAndMeasure(
          officialPage,
          '.flex.flex-col.gap-2.p-4.pt-0.text-sm a[data-active="false"]'
        );
        const hoverLocal = await hoverAndMeasure(
          localPage,
          ".theme-doc-toc-desktop__list .table-of-contents__link:not(.table-of-contents__link--active)"
        );
        const hoverMismatches = compareHover(
          hoverOfficial,
          hoverLocal,
          local.rail.rect.x - official.rail.rect.x
        );
        const mismatches = [
          ...compare(official, local),
          ...hoverMismatches.map((entry) => ({
            metric: `hover.${entry.metric}`,
            expected: entry.expected,
            actual: entry.actual,
          })),
        ];

        rows.push({
          theme,
          width,
          official,
          local,
          hoverOfficial,
          hoverLocal,
          mismatches,
        });

        await officialPage.close();
        await localPage.close();
      }
    }

    for (const theme of themes) {
      for (const width of mobileWidths) {
        const page = await browser.newPage({
          viewport: { width, height: 900 },
          colorScheme: theme,
        });
        await page.goto(routeUrl(localRoute), { waitUntil: "networkidle" });
        await page.waitForSelector(
          '.theme-doc-toc-mobile [data-slot="accordion-trigger"]'
        );
        const actual = await measureMobileRegression(page);
        const expected = {
          rails: 1,
          visibleRails: 0,
          accordions: 1,
          triggers: 1,
          expanded: 0,
          viewportWidth: width,
          scrollWidth: width,
        };
        const mismatches = Object.entries(expected)
          .filter(([key, value]) => !Object.is(value, actual[key]))
          .map(([metric, value]) => ({
            metric,
            expected: value,
            actual: actual[metric],
          }));
        mobileRows.push({ theme, width, actual, mismatches });
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(
    reportPath,
    [
      "# TOC parity report",
      "",
      `- official: ${officialUrl}`,
      `- local: ${routeUrl(localRoute)}`,
      `- desktop widths: ${widths.join(", ")}`,
      `- mobile regression widths: ${mobileWidths.join(", ")}`,
      `- themes: ${themes.join(", ")}`,
      `- states: rest, actual scroll-spy current, hover, mobile collapsed`,
      `- approved local composition: \`On This Page\` remains outside the scroll-faded link viewport`,
      "",
      "| theme | width | rail x/y/w/h | label x/y/w/h | active x | depth3 pad | mismatches |",
      "| --- | ---: | --- | --- | ---: | --- | ---: |",
      ...rows.map(
        (row) =>
          `| ${row.theme} | ${row.width} | ${row.local.rail.rect.x}/${row.local.rail.rect.y}/${row.local.rail.rect.width}/${row.local.rail.rect.height} | ${row.local.label ? `${row.local.label.rect.x}/${row.local.label.rect.y}/${row.local.label.rect.width}/${row.local.label.rect.height}` : "none"} | ${row.local.activeLink.rect.x} | ${row.local.depth3Link.paddingLeft} | ${row.mismatches.length} |`
      ),
      "",
      "## Mismatches",
      "",
      ...rows.flatMap((row) => {
        if (!row.mismatches.length)
          return [`- ${row.theme} ${row.width}: none`];
        return [
          `- ${row.theme} ${row.width}:`,
          ...row.mismatches.map(
            (entry) =>
              `  - ${entry.metric} → expected ${JSON.stringify(entry.expected)}, actual ${JSON.stringify(entry.actual)}`
          ),
        ];
      }),
      "",
      "## Mobile regression",
      "",
      "| theme | width | desktop rails | accordion | trigger | expanded | scroll width | mismatches |",
      "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
      ...mobileRows.map(
        (row) =>
          `| ${row.theme} | ${row.width} | ${row.actual.visibleRails} | ${row.actual.accordions} | ${row.actual.triggers} | ${row.actual.expanded} | ${row.actual.scrollWidth} | ${row.mismatches.length} |`
      ),
      "",
      ...mobileRows.flatMap((row) => {
        if (!row.mismatches.length)
          return [`- ${row.theme} ${row.width}: none`];
        return [
          `- ${row.theme} ${row.width}:`,
          ...row.mismatches.map(
            (entry) =>
              `  - ${entry.metric} → expected ${JSON.stringify(entry.expected)}, actual ${JSON.stringify(entry.actual)}`
          ),
        ];
      }),
      "",
    ].join("\n")
  );

  const failures = rows.filter((row) => row.mismatches.length > 0);
  const mobileFailures = mobileRows.filter((row) => row.mismatches.length > 0);
  if (failures.length || mobileFailures.length) {
    console.error(
      `TOC audit failed in ${failures.length} desktop and ${mobileFailures.length} mobile snapshots. See ${reportPath}`
    );
    process.exit(1);
  }

  console.log(
    `TOC parity exact across ${rows.length} desktop snapshots; mobile regression clean across ${mobileRows.length} snapshots. Report: ${reportPath}`
  );
})();
