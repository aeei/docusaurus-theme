import fs from "fs";
import path from "path";

const stylesheetPath = path.join(__dirname, "base.scss");

it("uses only the public semantic color token contract", () => {
  const stylesheet = fs.readFileSync(stylesheetPath, "utf8");
  const forbiddenToken = /--(?:docs|api|openapi|nextra|fumadocs)-/;
  const hardcodedColor = /#[\da-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i;

  expect(stylesheet).not.toMatch(forbiddenToken);
  expect(stylesheet).not.toMatch(hardcodedColor);
});

it("keeps pointer and keyboard focus signifiers on interactive controls", () => {
  const stylesheet = fs.readFileSync(stylesheetPath, "utf8");

  expect(stylesheet).toContain(
    ":where(a, button, input, select, textarea, [tabindex]):focus-visible"
  );
  expect(stylesheet).toMatch(/\[role="tab"\][\s\S]*cursor: pointer;/);
  expect(stylesheet).toMatch(
    /\[aria-disabled="true"\][\s\S]*cursor: not-allowed;/
  );
});

it("maps every semantic docs text tag to the typography token scale", () => {
  const stylesheet = fs.readFileSync(stylesheetPath, "utf8");
  const headingTokens = [
    ["h1", "title-1"],
    ["h2", "title-2"],
    ["h3", "title-3"],
    ["h4", "title-4"],
    ["h5", "body"],
    ["h6", "ui"],
  ];

  for (const [tag, token] of headingTokens) {
    expect(stylesheet).toMatch(
      new RegExp(
        `\\.theme-doc-markdown ${tag} \\{[\\s\\S]*?font-size: var\\(--typography-${token}-size\\);[\\s\\S]*?line-height: var\\(--typography-${token}-line-height\\);`
      )
    );
  }
  expect(stylesheet).toContain(
    'p:not(.docusaurus-mermaid-container *):not([data-slot="alert"] *)'
  );
  expect(stylesheet).toContain(
    "font-size: var(--typography-body-size);\n  line-height: var(--typography-body-line-height);"
  );
});

it("normalizes every text renderer onto the rem token system", () => {
  const stylesheet = fs.readFileSync(stylesheetPath, "utf8");

  expect(stylesheet).toMatch(/html \{[\s\S]*font-size: 100%;/);
  expect(stylesheet).toMatch(
    /:where\(button, input, select, textarea\) \{[\s\S]*font-family: inherit;/
  );
  expect(stylesheet).toMatch(
    /\.pagination-nav__label \{[\s\S]*font-size: var\(--typography-body-size\);[\s\S]*line-height: var\(--typography-body-line-height\);/
  );
  expect(stylesheet).toMatch(
    /\.pagination-nav__sublabel \{[\s\S]*font-size: var\(--typography-small-size\);[\s\S]*line-height: var\(--typography-small-line-height\);/
  );
  expect(stylesheet).toMatch(
    /\.theme-code-block__content pre[\s\S]*font-size: var\(--typography-small-size\);[\s\S]*line-height: var\(--typography-small-line-height\);/
  );
  expect(stylesheet).toMatch(
    /\.docusaurus-mermaid-container > svg[\s\S]*font-family: var\(--ifm-font-family-base\) !important;[\s\S]*font-size: var\(--typography-small-size\) !important;/
  );
});

it("keeps responsive hierarchy and tablet gutters token-driven", () => {
  const stylesheet = fs.readFileSync(stylesheetPath, "utf8");

  expect(stylesheet).toMatch(
    /@media \(max-width: 996px\)[\s\S]*\.theme-doc-markdown h1 \{[\s\S]*var\(--typography-title-1-size\)/
  );
  expect(stylesheet).toMatch(
    /@media \(min-width: 640px\) and \(max-width: 996px\)[\s\S]*--layout-gutter:[\s\S]*\.theme-doc-shell main > \.container/
  );
  expect(stylesheet).toMatch(
    /\.docusaurus-mermaid-container \{[\s\S]*justify-content: center;/
  );
});

it("overrides the semantic b element used for the navbar title", () => {
  const stylesheet = fs.readFileSync(stylesheetPath, "utf8");

  expect(stylesheet).toMatch(
    /\.navbar__title\s*{[\s\S]*?font-weight: 600;[\s\S]*?}/
  );
});
