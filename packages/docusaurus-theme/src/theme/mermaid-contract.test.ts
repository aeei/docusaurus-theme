import fs from "node:fs";
import path from "node:path";

const stylesheet = fs.readFileSync(path.join(__dirname, "base.scss"), "utf8");

describe("Mermaid ownership contract", () => {
  it("lets Mermaid own generated label typography", () => {
    const blockStart = stylesheet.indexOf(
      "\n.theme-doc-markdown .docusaurus-mermaid-container {\n"
    );
    const blockEnd = stylesheet.indexOf(
      ".theme-paginator-link--next",
      blockStart
    );
    const mermaidCss = stylesheet.slice(blockStart, blockEnd);

    expect(mermaidCss).not.toContain("font-family");
    expect(mermaidCss).not.toContain("font-size");
    expect(mermaidCss).not.toContain("line-height");
    expect(mermaidCss).not.toContain("!important");
    expect(stylesheet).toMatch(
      /\.theme-doc-markdown \.docusaurus-mermaid-container \*\s*\)\s*\)/
    );
  });

  it("keeps wide actual-route diagrams readable in a horizontal scroll surface", () => {
    expect(stylesheet).toMatch(
      /\.docusaurus-mermaid-container\s*\{[\s\S]*justify-content: safe center;[\s\S]*overflow-x: auto;/
    );
    expect(stylesheet).toContain(
      '> svg:is(.flowchart, [aria-roledescription="sequence"]) {'
    );
    expect(stylesheet).toContain("min-width: 40rem;");
  });
});
