import fs from "fs";
import path from "path";

const stylesheet = fs.readFileSync(path.join(__dirname, "base.scss"), "utf8");
const canonicalStylesheet = stylesheet
  .replace(/\s+/g, " ")
  .replace(/\s*([(),])\s*/g, "$1");

it("keeps docs CSS on semantic color tokens", () => {
  expect(stylesheet).not.toMatch(/--(?:docs|api|openapi|nextra|fumadocs)-/);
  expect(stylesheet).not.toMatch(/#[\da-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i);
});

it("leaves component focus visuals to official primitives", () => {
  expect(stylesheet).not.toContain(
    ":where(a, button, input, select, textarea, [tabindex]):focus-visible"
  );
  expect(stylesheet).toMatch(/\[role="tab"\][\s\S]*cursor: pointer;/);
  expect(stylesheet).toMatch(
    /\[aria-disabled="true"\][\s\S]*cursor: not-allowed;/
  );
});

it("keeps article prose size stable across responsive widths", () => {
  expect(stylesheet).toContain("--theme-prose-body-size: 0.9375rem;");
  expect(stylesheet).toContain("--theme-prose-leading: 1.75;");
  expect(stylesheet).toContain("--typeset-size: var(--theme-prose-body-size);");
  expect(stylesheet).toContain("--typeset-flow: 1.25em;");
  expect(stylesheet).toContain("--typeset-body-size: var(--typeset-size);");
  expect(stylesheet).toContain("font-size: var(--typeset-body-size);");
  expect(stylesheet).toContain("line-height: var(--typeset-leading);");
  expect(stylesheet).toContain("font-size: 1.875rem !important;");
  expect(stylesheet).toContain("line-height: 2.25rem !important;");
  expect(stylesheet).toContain("font-size: 1.25em !important;");
  expect(stylesheet).toContain(
    "margin-block-start: calc(var(--typeset-flow) * 1.4) !important;"
  );
  expect(stylesheet).toContain("font-size: 1.125em !important;");
  expect(stylesheet).toContain(
    "margin-block-start: var(--typeset-flow) !important;"
  );
  expect(stylesheet).toContain(
    "border-inline-start: 2px solid var(--typeset-rule) !important;"
  );
  expect(stylesheet).toContain(
    "border-block-start: 1px solid var(--typeset-rule);"
  );
  expect(stylesheet).toContain(
    "margin-block-start: calc(var(--typeset-flow) * 2.4) !important;"
  );
  expect(stylesheet).toMatch(
    /\.theme-code-inline \{[\s\S]*border-radius: min\(calc\(var\(--radius\) \* 0\.6\), 0\.35em\);/
  );
  expect(stylesheet).toContain("border-radius: var(--radius) !important;");
  expect(stylesheet).not.toContain("--typeset-size: 1.05rem;");
  expect(stylesheet).not.toContain(
    "--typeset-body-size: calc(var(--typeset-size) * 1.125);"
  );
});

it("keeps single-class arbitrary selectors quoted during Docusaurus SSG", () => {
  const breadcrumbs = fs.readFileSync(
    path.join(__dirname, "DocBreadcrumbs/index.tsx"),
    "utf8"
  );

  expect(breadcrumbs).toContain(
    '<BreadcrumbSeparator className="theme-breadcrumb-separator" />'
  );
});

it("gives official alerts an external prose-flow wrapper", () => {
  const admonition = fs.readFileSync(
    path.join(__dirname, "Admonition/Layout/index.tsx"),
    "utf8"
  );

  expect(admonition).toContain('<div className="theme-admonition-flow">');
  expect(stylesheet).toMatch(
    /\.theme-admonition-flow \{[\s\S]*margin-block-start: var\(--typeset-flow\);/
  );
  expect(stylesheet).not.toMatch(
    /\[data-slot=["']alert["']\][^{]*\{[^}]*margin/i
  );
});

it("keeps prose ownership outside official UI interiors", () => {
  expect(canonicalStylesheet).toContain(
    ":not(:where(.theme-doc-markdown [data-slot],.theme-doc-markdown [data-slot] *,.theme-doc-markdown .theme-code-block,.theme-doc-markdown .theme-code-block *,.theme-doc-markdown .docusaurus-mermaid-container,.theme-doc-markdown .docusaurus-mermaid-container *))"
  );
  expect(stylesheet).not.toContain(":where(img, picture img, video, svg)");
  expect(stylesheet).not.toContain(":not([data-slot] *)");
});

it("matches the rendered shadcn docs code surface", () => {
  expect(stylesheet).toMatch(
    /\.theme-code-block \{[\s\S]*border-radius: calc\(var\(--radius\) \+ 8px\);[\s\S]*background: var\(--code\);/
  );
  expect(stylesheet).toMatch(
    /\.theme-code-block pre \{[\s\S]*padding: calc\(var\(--spacing\) \* 3\.5\) calc\(var\(--spacing\) \* 4\);[\s\S]*font-size: 0\.875rem;[\s\S]*line-height: 1\.53125rem;/
  );
  expect(stylesheet).toMatch(
    /\.theme-code-block__title \{[\s\S]*padding: calc\(var\(--spacing\) \* 2\.5\) calc\(var\(--spacing\) \* 4\);[\s\S]*font-size: 0\.765625rem;[\s\S]*line-height: 1\.33984375rem;/
  );
  expect(stylesheet).toMatch(
    /\.theme-code-block \[class\*="codeLineNumber"\] \{[\s\S]*width: calc\(var\(--spacing\) \* 16\) !important;[\s\S]*padding: 0 calc\(var\(--spacing\) \* 6\) 0 0 !important;[\s\S]*color: var\(--code-number\);/
  );
  expect(stylesheet).toMatch(
    /\.theme-code-block-highlighted-line \{[\s\S]*background: var\(--code-highlight\);/
  );
  expect(stylesheet).toMatch(
    /\.theme-code-block \.token \{[\s\S]*font-style: normal !important;[\s\S]*font-weight: 400 !important;/
  );
  expect(stylesheet).toMatch(
    /\.theme-code-block \.token\.keyword[\s\S]*color: var\(--code-syntax-keyword\) !important;/
  );
  expect(stylesheet).toMatch(
    /\.theme-code-block \.token\.function[\s\S]*color: var\(--code-syntax-function\) !important;/
  );
});

it("keeps structural Docusaurus integration separate from component visuals", () => {
  expect(stylesheet).toContain(".theme-navbar-mobile-trigger");
  expect(stylesheet).toContain(".theme-doc-sidebar-container");
  expect(stylesheet).toMatch(
    /\.theme-doc-sidebar-desktop,[\s\S]*\.theme-mobile-sidebar-content \{[\s\S]*--sidebar: var\(--background\);[\s\S]*--sidebar-foreground: var\(--foreground\);/
  );
  expect(stylesheet).toMatch(
    /\.theme-doc-sidebar-container \{[\s\S]*border-right: 0 !important;/
  );
  expect(stylesheet).toMatch(
    /\.theme-mobile-sidebar-content \{[\s\S]*border-right: 0 !important;/
  );
  expect(stylesheet).toContain("position: relative;");
  expect(stylesheet).not.toContain(".theme-doc-sidebar-chevron");
  expect(stylesheet).not.toContain(".theme-details-content");
  expect(stylesheet).not.toContain(".theme-mobile-toc-content");
});

it("uses Geist and live shell geometry tokens", () => {
  expect(stylesheet).toContain(
    '--ifm-font-family-base: Geist, "Geist Fallback";'
  );
  expect(stylesheet).toContain(
    "--ifm-navbar-height: calc(var(--spacing) * 14);"
  );
  expect(stylesheet).toMatch(
    /@media \(min-width: 1024px\)[\s\S]*--ifm-navbar-height: calc\(var\(--spacing\) \* 16\);/
  );
  expect(stylesheet).toContain(".theme-doc-root-layout");
  expect(stylesheet).toContain(".theme-doc-page__content");
  expect(stylesheet).toContain(".theme-doc-page__toc");
  expect(stylesheet).toContain("max-width: 40rem;");
  expect(stylesheet).toContain("width: 18rem;");
});
