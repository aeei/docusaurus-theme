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
const tokens = fs.readFileSync(
  path.join(__dirname, "src/css/tokens.css"),
  "utf8"
);

it("uses the Pages project URL and official Mermaid integration", () => {
  expect(config).toContain('url: "https://aeei.github.io"');
  expect(config).toContain('baseUrl: "/docusaurus-theme/"');
  expect(config).toContain("markdown: { mermaid: true }");
  expect(config).toContain('"@docusaurus/theme-mermaid"');
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
  expect(tokens).toContain("--spacing: 0.25rem");
  expect(tokens).toContain("--border-width: 1px");
  expect(tokens).toContain("--focus-ring-width: 2px");
});

it("keeps project and upstream attribution links in the footer", () => {
  expect(config).toContain("Third-party notices");
  expect(config).toContain("PaloAltoNetworks/docusaurus-openapi-docs");
  expect(config).toContain("Maintained by aeei");
});
