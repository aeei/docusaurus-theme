#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const localBase = (
  process.env.LOCAL_BASE_URL ?? "http://127.0.0.1:3001/docusaurus-theme/"
).replace(/\/?$/, "/");
const officialUrl = "https://ui.shadcn.com/docs/components/base/button";
const localRoute = "guides/markdown-gfm";
const widths = [
  390, 700, 768, 820, 996, 997, 1000, 1023, 1024, 1025, 1440, 1920, 2736,
];
const themes = ["light", "dark"];
const reportPath = path.resolve(
  ".pi-subagents/artifacts/shell-geometry-report.md"
);

const OFFICIAL_SIDEBAR_WRAPPER_CLASS =
  "group/sidebar-wrapper flex w-full has-data-[variant=inset]:bg-sidebar min-h-min flex-1 items-start px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:calc(var(--spacing)*4)] 3xl:fixed:container 3xl:fixed:px-3";
const OFFICIAL_CONTENT_CLASS =
  "mx-auto flex w-full max-w-160 min-w-0 flex-1 flex-col gap-6 px-4 py-6 text-foreground md:px-0 lg:py-8 dark:text-foreground";
const LOCAL_CONTENT_CLASS =
  "mx-auto flex w-full max-w-160 min-w-0 flex-1 flex-col gap-6 px-4 py-6 text-foreground md:px-0 dark:text-foreground";
const OFFICIAL_TOC_CLASS =
  "sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[90svh] w-(--sidebar-width) flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex";
const OFFICIAL_SIDEBAR_CLASS =
  "w-(--sidebar-width) flex-col text-sidebar-foreground sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-10rem)] overflow-hidden overscroll-none bg-transparent [--sidebar-menu-width:--spacing(56)] lg:flex";
const MAIN_CONTAINER_CLASS = "container-wrapper flex flex-1 flex-col px-2";
const DOCS_CLASS =
  "flex scroll-mt-24 items-stretch pb-8 text-[1.05rem] sm:text-[15px] xl:w-full";
const DESKTOP_WRAPPER_CLASS = "theme-doc-sidebar-desktop hidden lg:block";
const NO_JS_WIDTHS = [768, 1023, 1024];

function routeUrl(route) {
  return new URL(route, localBase).href;
}

async function measure(page, kind) {
  return page.evaluate(
    ({
      kind,
      officialSidebarWrapperClass,
      officialContentClass,
      localContentClass,
      officialTocClass,
      officialSidebarClass,
      mainContainerClass,
      docsClass,
    }) => {
      const all = Array.from(document.querySelectorAll("*"));
      const byExactClass = (className) =>
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
      const style = (element) =>
        element ? getComputedStyle(element) : { display: "none" };
      const rect = (element) => {
        if (!element) {
          return { x: 0, y: 0, width: 0, height: 0, right: 0, bottom: 0 };
        }
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

      const header = one(
        "header",
        kind === "official"
          ? Array.from(document.querySelectorAll("body > div header"))
          : Array.from(document.querySelectorAll(".navbar"))
      );
      const main = one("main", Array.from(document.querySelectorAll("main")));
      const mainContainer = one(
        "main-container",
        byExactClass(mainContainerClass).filter(
          (element) => element.parentElement === main
        )
      );
      const navbarInner = one(
        "navbar-inner",
        kind === "official"
          ? Array.from(
              header.querySelectorAll(":scope .container-wrapper > div")
            )
          : Array.from(document.querySelectorAll(".navbar__inner"))
      );
      const sidebarWrapper = one(
        "sidebar-wrapper",
        kind === "official"
          ? Array.from(
              document.querySelectorAll('[data-slot="sidebar-wrapper"]')
            ).filter(
              (element) => element.className === officialSidebarWrapperClass
            )
          : Array.from(
              document.querySelectorAll('[data-slot="sidebar-wrapper"]')
            )
      );
      const docs = one(
        "docs",
        Array.from(document.querySelectorAll('[data-slot="docs"]')).filter(
          (element) => element.className === docsClass
        )
      );
      const contentClass =
        kind === "official" ? officialContentClass : localContentClass;
      const content = one("content", byExactClass(contentClass));
      const sidebarRoot = maybeOne(
        "sidebar",
        Array.from(document.querySelectorAll('[data-slot="sidebar"]')).filter(
          (element) => {
            if (kind === "official") {
              return element.className === officialSidebarClass;
            }
            return (
              element.getAttribute("data-side") === "left" &&
              element.getAttribute("data-variant") === "sidebar"
            );
          }
        )
      );
      const sidebar =
        kind === "official"
          ? sidebarRoot
          : maybeOne(
              "sidebar-gap",
              Array.from(
                document.querySelectorAll(
                  '.theme-doc-sidebar-desktop [data-slot="sidebar-gap"]'
                )
              )
            );
      const toc = maybeOne(
        "toc",
        kind === "official"
          ? byExactClass(officialTocClass)
          : Array.from(document.querySelectorAll(".theme-doc-page__toc"))
      );

      const headerStyle = style(header);
      const headerBlurStyle = getComputedStyle(header, "::before");
      const sidebarStyle = style(sidebar);
      const tocStyle = style(toc);

      return {
        counts: {
          header:
            kind === "official"
              ? document.querySelectorAll("body > div header").length
              : document.querySelectorAll(".navbar").length,
          main: document.querySelectorAll("main").length,
          mainContainer: byExactClass(mainContainerClass).length,
          sidebarWrapper: document.querySelectorAll(
            '[data-slot="sidebar-wrapper"]'
          ).length,
          exactOfficialSidebarWrapper: byExactClass(officialSidebarWrapperClass)
            .length,
          docs: document.querySelectorAll('[data-slot="docs"]').length,
          content: byExactClass(contentClass).length,
          officialToc: byExactClass(officialTocClass).length,
        },
        shellMode:
          sidebarStyle.display !== "none" && rect(sidebar).width > 0
            ? "desktop"
            : "mobile",
        navbar: {
          ...rect(header),
          backgroundColor: headerStyle.backgroundColor,
          borderBottomWidth: headerStyle.borderBottomWidth,
          boxShadow: headerStyle.boxShadow,
          backdropFilter: headerStyle.backdropFilter,
          position: headerStyle.position,
        },
        navbarBlur: {
          backgroundColor: headerBlurStyle.backgroundColor,
          borderBottomWidth: headerBlurStyle.borderBottomWidth,
          backdropFilter: headerBlurStyle.backdropFilter,
        },
        navbarInner: rect(navbarInner),
        main: rect(main),
        mainContainer: rect(mainContainer),
        sidebarWrapper: {
          rect: rect(sidebarWrapper),
          display: style(sidebarWrapper).display,
        },
        sidebar: {
          present: Boolean(sidebar),
          display: sidebarStyle.display,
          variant: sidebarRoot?.getAttribute("data-variant") ?? null,
          rect: rect(sidebar),
        },
        docs: rect(docs),
        content: rect(content),
        toc: {
          present: Boolean(toc),
          display: tocStyle.display,
          rect: rect(toc),
        },
      };
    },
    {
      kind,
      officialSidebarWrapperClass: OFFICIAL_SIDEBAR_WRAPPER_CLASS,
      officialContentClass: OFFICIAL_CONTENT_CLASS,
      localContentClass: LOCAL_CONTENT_CLASS,
      officialTocClass: OFFICIAL_TOC_CLASS,
      officialSidebarClass: OFFICIAL_SIDEBAR_CLASS,
      mainContainerClass: MAIN_CONTAINER_CLASS,
      docsClass: DOCS_CLASS,
    }
  );
}

async function measureNoJsDesktopWrapper(page) {
  return page.evaluate((desktopWrapperClass) => {
    const wrapper = Array.from(document.querySelectorAll("div")).filter(
      (element) => element.className === desktopWrapperClass
    );

    if (wrapper.length !== 1) {
      throw new Error(
        `local:no-js:desktop-wrapper: expected 1, got ${wrapper.length}`
      );
    }

    const desktopSidebar = wrapper[0].querySelector(
      '[data-slot="sidebar-gap"]'
    );

    return {
      wrapperDisplay: getComputedStyle(wrapper[0]).display,
      sidebarDisplay: desktopSidebar
        ? getComputedStyle(desktopSidebar).display
        : null,
      sidebarWidth: desktopSidebar?.getBoundingClientRect().width ?? 0,
    };
  }, DESKTOP_WRAPPER_CLASS);
}

function compareRow(official, local) {
  const width = local.navbar.width;
  const desktop = local.shellMode === "desktop";
  const shellWidth = Math.min(width, 1440);
  const shellLeft = (width - shellWidth) / 2;
  const shellRight = shellLeft + shellWidth;
  const expectedNavbarInner = desktop
    ? { x: shellLeft + 24, right: shellRight - 24 }
    : { x: 16, right: width - 16 };
  const expectedMainContainer = desktop
    ? { x: shellLeft, width: shellWidth }
    : { x: 0, width };
  const expectedSidebarWrapper = desktop
    ? { x: shellLeft, width: shellWidth }
    : official.sidebarWrapper.rect;
  const expectedDocs = desktop
    ? { x: shellLeft + 288, width: shellWidth - 288 }
    : official.docs;
  const tocVisible = local.toc.display !== "none";
  const pairs = [
    ["shellMode", official.shellMode, local.shellMode],
    ["navbar.height", official.navbar.height, local.navbar.height],
    [
      "navbar.backgroundColor",
      "rgba(0, 0, 0, 0)",
      local.navbar.backgroundColor,
    ],
    ["navbar.borderBottomWidth", "0px", local.navbar.borderBottomWidth],
    ["navbar.boxShadow", "none", local.navbar.boxShadow],
    ["navbar.backdropFilter", "none", local.navbar.backdropFilter],
    ["navbar.position", official.navbar.position, local.navbar.position],
    [
      "navbarBlur.backdropFilter",
      "blur(12px)",
      local.navbarBlur.backdropFilter,
    ],
    ["navbarBlur.borderBottomWidth", "1px", local.navbarBlur.borderBottomWidth],
    [
      "navbarBlur.translucentBackground",
      true,
      local.navbarBlur.backgroundColor !== "rgba(0, 0, 0, 0)",
    ],
    ["navbarInner.x", expectedNavbarInner.x, local.navbarInner.x],
    ["navbarInner.right", expectedNavbarInner.right, local.navbarInner.right],
    ["mainContainer.x", expectedMainContainer.x, local.mainContainer.x],
    [
      "mainContainer.width",
      expectedMainContainer.width,
      local.mainContainer.width,
    ],
    [
      "sidebarWrapper.display",
      official.sidebarWrapper.display,
      local.sidebarWrapper.display,
    ],
    ["sidebarWrapper.x", expectedSidebarWrapper.x, local.sidebarWrapper.rect.x],
    [
      "sidebarWrapper.width",
      expectedSidebarWrapper.width,
      local.sidebarWrapper.rect.width,
    ],
    ["docs.x", expectedDocs.x, local.docs.x],
    ["docs.width", expectedDocs.width, local.docs.width],
    ["content.x", official.content.x, local.content.x],
    ["content.width", official.content.width, local.content.width],
    [
      "sidebar.x",
      desktop ? shellLeft : official.sidebar.rect.x,
      local.sidebar.rect.x,
    ],
    ["sidebar.width", official.sidebar.rect.width, local.sidebar.rect.width],
    ["toc.present", official.toc.present, local.toc.present],
    ["toc.display", official.toc.display, local.toc.display],
    [
      "toc.width",
      tocVisible ? 288 : official.toc.rect.width,
      local.toc.rect.width,
    ],
    [
      "toc.x",
      tocVisible ? shellRight - 288 : official.toc.rect.x,
      local.toc.rect.x,
    ],
  ];

  if (desktop) {
    pairs.push(["sidebar.variant", "sidebar", local.sidebar.variant]);
  }

  return pairs
    .filter(([, expected, actual]) => !Object.is(expected, actual))
    .map(([metric, expected, actual]) => ({ metric, expected, actual }));
}

function rowLine(row) {
  return `| ${row.theme} | ${row.width} | ${row.official.shellMode} | ${row.local.shellMode} | ${row.official.navbar.height} | ${row.local.navbar.height} | ${row.official.docs.x} / ${row.official.docs.width} | ${row.local.docs.x} / ${row.local.docs.width} | ${row.official.content.x} / ${row.official.content.width} | ${row.local.content.x} / ${row.local.content.width} | ${String(row.official.toc.present)} / ${row.official.toc.display} | ${String(row.local.toc.present)} / ${row.local.toc.display} | ${row.mismatches.length} |`;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const rows = [];
  const noJsRows = [];

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
        await officialPage.waitForTimeout(200);
        await localPage.waitForTimeout(200);

        const official = await measure(officialPage, "official");
        const local = await measure(localPage, "local");
        const mismatches = compareRow(official, local);

        rows.push({ theme, width, official, local, mismatches });

        await officialPage.close();
        await localPage.close();
      }
    }
    for (const width of NO_JS_WIDTHS) {
      const noJsContext = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width, height: 900 },
        colorScheme: "light",
      });
      try {
        const page = await noJsContext.newPage();
        await page.goto(routeUrl(localRoute), { waitUntil: "load" });
        noJsRows.push({ width, ...(await measureNoJsDesktopWrapper(page)) });
        await page.close();
      } finally {
        await noJsContext.close();
      }
    }
  } finally {
    await browser.close();
  }

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(
    reportPath,
    [
      "# Shell geometry report",
      "",
      `- official: ${officialUrl}`,
      `- local: ${routeUrl(localRoute)}`,
      `- widths: ${widths.join(", ")}`,
      `- themes: ${themes.join(", ")}`,
      `- selector assertions: main, main > .container-wrapper, [data-slot=sidebar-wrapper], [data-slot=docs], official content class, official toc class`,
      `- no-JS assertions: .theme-doc-sidebar-desktop hidden lg:block display at 768/1023/1024`,
      `- approved local shell composition: Nextra-style 90rem centered max-width, 24px GNB/LNB alignment, and translucent 12px GNB blur`,
      `- approved local mobile GNB optical inset: 16px; icon glyphs align to the 24px content edge`,
      "",
      "| theme | width | official mode | local mode | official navbar h | local navbar h | official docs x/w | local docs x/w | official content x/w | local content x/w | official toc | local toc | mismatches |",
      "| --- | ---: | --- | --- | ---: | ---: | --- | --- | --- | --- | --- | --- | ---: |",
      ...rows.map(rowLine),
      "",
      "## Selector counts",
      "",
      ...rows.map(
        (row) =>
          `- ${row.theme} ${row.width}: official ${JSON.stringify(row.official.counts)}, local ${JSON.stringify(row.local.counts)}`
      ),
      "",
      "## No-JS desktop wrapper",
      "",
      "| width | wrapper display | sidebar display | sidebar width |",
      "| ---: | --- | --- | ---: |",
      ...noJsRows.map(
        (row) =>
          `| ${row.width} | ${row.wrapperDisplay} | ${String(row.sidebarDisplay)} | ${row.sidebarWidth} |`
      ),
      "",
      "## Mismatches",
      "",
      ...rows.flatMap((row) => {
        if (!row.mismatches.length) {
          return [`- ${row.theme} ${row.width}: none`];
        }
        return [
          `- ${row.theme} ${row.width}:`,
          ...row.mismatches.map(
            (mismatch) =>
              `  - ${mismatch.metric} → expected ${JSON.stringify(mismatch.expected)}, actual ${JSON.stringify(mismatch.actual)}`
          ),
        ];
      }),
      "",
    ].join("\n")
  );

  const failures = rows.filter((row) => row.mismatches.length > 0);
  const noJsFailures = noJsRows.filter((row) => {
    const expectedDisplay = row.width >= 1024 ? "block" : "none";
    return row.wrapperDisplay !== expectedDisplay;
  });

  if (failures.length || noJsFailures.length) {
    const parts = [];
    if (failures.length)
      parts.push(`geometry drift in ${failures.length} snapshots`);
    if (noJsFailures.length)
      parts.push(
        `no-JS desktop wrapper drift in ${noJsFailures.length} snapshots`
      );
    console.error(`Shell audit failed: ${parts.join(", ")}. See ${reportPath}`);
    process.exit(1);
  }

  console.log(
    `Shell geometry exact across ${rows.length} snapshots and no-JS desktop wrapper CSS exact across ${noJsRows.length} widths. Report: ${reportPath}`
  );
})();
