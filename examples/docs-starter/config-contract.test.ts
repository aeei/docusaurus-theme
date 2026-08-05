import fs from "fs";
import path from "path";

const config = fs.readFileSync(
  path.join(__dirname, "docusaurus.config.ts"),
  "utf8"
);
const customStyles = fs.readFileSync(
  path.join(__dirname, "src/css/custom.css"),
  "utf8"
);
const themeStyles = fs.readFileSync(
  path.join(__dirname, "../../packages/docusaurus-theme/src/theme/shadcn.css"),
  "utf8"
);
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8")
);
const demoPackageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../demo/package.json"), "utf8")
);

it("uses the Pages project URL and official Mermaid integration", () => {
  expect(config).toContain('url: "https://aeei.github.io"');
  expect(config).toContain('baseUrl: "/docusaurus-theme/"');
  expect(config).toContain("markdown: { mermaid: true }");
  expect(config).toContain('"@docusaurus/theme-mermaid"');
  expect(config).toContain('favicon: "img/favicon.ico"');
  expect(fs.existsSync(path.join(__dirname, "static/img/favicon.ico"))).toBe(
    true
  );
  expect(fs.existsSync(path.join(__dirname, "static/img/favicon.svg"))).toBe(
    false
  );
});

it("keeps one Docusaurus runtime version across the starter and workspace", () => {
  const docusaurusVersions = Object.entries({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  })
    .filter(([name]) => name.startsWith("@docusaurus/"))
    .map(([, version]) => version);

  expect(new Set(docusaurusVersions)).toEqual(
    new Set([demoPackageJson.dependencies["@docusaurus/core"]])
  );
});

it("enables local search and the theme-native Copy Page control", () => {
  expect(config).toContain('{ search: "local", copyPage: true }');
  expect(config).toContain('"docusaurus-plugin-copy-page-button"');
  expect(config).toContain("injectButton: false");
  expect(config).toContain("generateMarkdownRoutes: true");
});

it("enables only a complete project-owned Algolia configuration", () => {
  for (const variable of [
    "ALGOLIA_APP_ID",
    "ALGOLIA_SEARCH_API_KEY",
    "ALGOLIA_INDEX_NAME",
  ]) {
    expect(config).toContain(`process.env.${variable}`);
  }
  expect(config).toContain("...(algolia ? { algolia } : {})");
  expect(config).not.toMatch(
    /J0EABTYI1A|indexName:\s*["']docusaurus-openapi|441074cace/
  );
});

it("uses the shared spacing token outside the token owner", () => {
  expect(customStyles).not.toMatch(/\d+(?:\.\d+)?rem\b/);
  expect(customStyles).not.toMatch(
    /^[ \t]*(?:padding|margin|gap|width|height|border(?:-(?:top|right|bottom|left))?):[^;]*\d+(?:\.\d+)?(?:px|rem)\b/m
  );
  expect(customStyles).toContain("var(--spacing)");
  expect(fs.existsSync(path.join(__dirname, "src/css/tokens.css"))).toBe(false);
  expect(themeStyles).toContain("--border-width: 1px");
});

it("keeps the visible footer concise while legal notices ship as files", () => {
  expect(config).toContain("Maintained by aeei");
  expect(config).not.toContain('title: "Credits"');
  expect(config).not.toContain('label: "MIT"');
  expect(config).not.toContain("Third-party notices");
  expect(fs.existsSync(path.join(__dirname, "../../LICENSE"))).toBe(true);
  expect(
    fs.existsSync(path.join(__dirname, "../../THIRD_PARTY_NOTICES.md"))
  ).toBe(true);
});
