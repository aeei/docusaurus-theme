const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl =
  process.env.DOCS_STARTER_URL ?? "http://127.0.0.1:3001/docusaurus-theme/";
const cases = [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 390, height: 844 } },
];
const routes = ["", "guides/markdown-gfm", "showcase/mermaid"];
const artifacts = path.resolve("artifacts/docs-starter");

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
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth
          );
          if (overflow > 1)
            throw new Error(`horizontal overflow ${overflow}px`);
          if (
            route === "showcase/mermaid" &&
            (await page.locator(".docusaurus-mermaid-container svg").count()) <
              3
          ) {
            throw new Error("missing Mermaid diagrams");
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

      if (device.name === "mobile") {
        try {
          await page.goto(baseUrl, { waitUntil: "networkidle" });
          const toggle = page.locator(".navbar__toggle");
          await toggle.click();
          await page.keyboard.press("Escape");
          if (
            !(await toggle.evaluate(
              (element) => element === document.activeElement
            ))
          ) {
            throw new Error("mobile navigation did not restore trigger focus");
          }
        } catch (error) {
          failures.push(`mobile-${colorScheme}-navigation: ${error.message}`);
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
