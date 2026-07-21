import fs from "fs";
import path from "path";

const stylesheet = fs.readFileSync(path.join(__dirname, "base.scss"), "utf8");
const canonicalize = (value: string) =>
  value.replace(/\s+/g, " ").replace(/\s*([(),])\s*/g, "$1");
const canonicalStylesheet = canonicalize(stylesheet);

const proseSelectors = [
  ":where(p)",
  ":where(h1, h2, h3, h4, h5, h6)",
  ":where(h2)",
  ":where(h3)",
  ":where(a)",
  ":where(:is(h1, h2, h3, h4, h5, h6) :is(a))",
  ":where(ul, ol)",
  ":where(li)",
  ":where(blockquote)",
  ":where(img, picture img, video)",
  ":where(table)",
];

const localBoundary = String.raw`:not(:where(.theme-doc-markdown [data-slot], .theme-doc-markdown [data-slot] *, .theme-doc-markdown .theme-code-block, .theme-doc-markdown .theme-code-block *, .theme-doc-markdown .docusaurus-mermaid-container, .theme-doc-markdown .docusaurus-mermaid-container *))`;

describe("prose ownership contract", () => {
  it("rejects bare data-slot descendant exclusions", () => {
    expect(stylesheet).not.toContain(":not([data-slot] *)");
  });

  it("scopes typeset selectors to article-local component roots only", () => {
    for (const selector of proseSelectors) {
      expect(canonicalStylesheet).toContain(
        canonicalize(`${localBoundary}${selector}`)
      );
    }
  });

  it("keeps inline code styling component-owned across UI boundaries", () => {
    const codeInline = fs.readFileSync(
      path.join(__dirname, "CodeInline/index.tsx"),
      "utf8"
    );

    expect(codeInline).toContain(
      'className={cn("theme-code-inline", className)}'
    );
    expect(stylesheet).toContain("--typeset-body-size:");
    expect(stylesheet).toContain(".theme-code-inline {");
    expect(stylesheet).not.toContain(":where(:not(pre) > code)");
  });

  it("reuses canonical inline code styling in table-of-contents labels", () => {
    const tocTree = fs.readFileSync(
      path.join(__dirname, "TOCItems/Tree.tsx"),
      "utf8"
    );

    expect(tocTree).toContain('className="theme-code-inline"');
    expect(stylesheet).not.toContain(".table-of-contents__link code {");
    expect(stylesheet).toContain("--theme-prose-body-size: 0.9375rem;");
    expect(stylesheet).toContain("--theme-prose-leading: 1.75;");
    expect(stylesheet).toContain(
      "var(--typeset-font-mono, var(--ifm-font-family-monospace))"
    );
    expect(stylesheet).toContain(
      "var(--typeset-body-size, var(--theme-prose-body-size))"
    );
    expect(stylesheet).toContain(
      "var(--typeset-leading, var(--theme-prose-leading))"
    );
  });

  it("keeps heading hash links on the official inherit contract", () => {
    expect(canonicalStylesheet).toContain(
      canonicalize(`${localBoundary}:where(:is(h1, h2, h3, h4, h5, h6) :is(a))`)
    );
    expect(stylesheet).toContain("font-weight: inherit !important;");
    expect(stylesheet).toContain("text-decoration-line: none !important;");
  });

  it("does not target raw svg as prose media", () => {
    expect(stylesheet).toContain(":where(img, picture img, video)");
    expect(stylesheet).not.toContain(":where(img, picture img, video, svg)");
  });
});
