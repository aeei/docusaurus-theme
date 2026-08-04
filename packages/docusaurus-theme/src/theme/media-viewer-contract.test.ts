import fs from "node:fs";
import path from "node:path";

const root = __dirname;
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("Media viewer ownership contract", () => {
  it("maps global MDX images, links, and Mermaid through shared adapters", () => {
    const mdx = read("MDXComponents/index.tsx");
    expect(mdx).toContain("ZoomableImage");
    expect(mdx).toContain("ZoomableMermaid");
    expect(mdx).toContain("MediaAwareLink");
    expect(mdx).toContain("img: ZoomableImage");
    expect(mdx).toContain("mermaid: ZoomableMermaid");
    expect(mdx).toContain("a: MediaAwareLink");
  });

  it("reuses the CodeBlock action SSOT without an unsolicited Tooltip", () => {
    const viewer = read("components/media-viewer/index.tsx");
    expect(viewer).toContain("CodeBlockButton");
    expect(viewer).toContain("<Dialog");
    expect(viewer).toContain("Maximize2");
    expect(viewer).toContain("onClick={openFromMedia}");
    expect(viewer).toContain('target.closest("a,button")');
    expect(viewer).toContain("document.getElementById(actionId)?.focus()");
    expect(viewer).not.toContain("ref={actionRef}");
    expect(viewer).not.toContain("<Tooltip");
    expect(viewer).not.toMatch(/data-slot[^\n]*className/);
  });

  it("keeps linked images out of nested viewer controls", () => {
    const adapters = read("components/media-viewer/mdx-media.tsx");
    expect(adapters).toContain("LinkedMediaContext.Provider");
    expect(adapters).toContain("useContext(LinkedMediaContext)");
    expect(adapters).toContain("return <MDXImg {...props} />");
  });

  it("limits CSS to semantic viewer layout selectors", () => {
    const css = read("base.scss");
    expect(css).toMatch(
      /\.theme-media-viewer\s*\{[^}]*position: relative;[^}]*margin-block: var\(--typeset-flow\);/
    );
    expect(css).toMatch(
      /:where\(h1, h2, h3, h4, h5, h6\)[\s\S]*\+ \.theme-media-viewer\s*\{[^}]*margin-block-start: calc\(var\(--spacing\) \* 4\) !important;/
    );
    expect(css).toContain(".theme-media-viewer__viewport");
    expect(css).toMatch(
      /\.theme-media-viewer__action\s*\{[^}]*opacity: 0;[^}]*pointer-events: none;/
    );
    expect(css).toMatch(
      /\.theme-media-viewer__action:focus-visible\s*\{[^}]*opacity: 1;[^}]*pointer-events: auto;/
    );
    expect(css).toContain("@media (hover: hover) and (pointer: fine)");
    expect(css).toMatch(
      /\.theme-media-viewer:hover > \.theme-media-viewer__action\s*\{[^}]*opacity: 1;[^}]*pointer-events: auto;/
    );
    expect(css).not.toMatch(/\[data-slot=[^\]]+\][^{]*theme-media-viewer/);
  });
});
