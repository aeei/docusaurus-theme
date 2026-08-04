import fs from "fs";
import path from "path";

const read = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, relativePath), "utf8");

describe("desktop TOC parity contract", () => {
  it("renders the live shadcn right-rail structure in the desktop adapter", () => {
    const source = read("DocItem/TOC/Desktop/index.tsx");

    expect(source).toContain('from "@docusaurus/Translate"');
    expect(source).toContain('from "@theme/TOCItems"');
    expect(source).not.toContain('from "@theme/TOC"');
    expect(source).toContain(
      'className="theme-doc-toc-desktop flex min-h-0 flex-1 flex-col gap-4"'
    );
    expect(source).toContain('className="h-(--top-spacing) shrink-0"');
    expect(source).toContain(
      'className="theme-doc-toc-desktop__body flex min-h-0 flex-1 flex-col px-8"'
    );
    expect(source).toContain(
      'className="theme-doc-toc-desktop__scroll flex min-h-0 flex-1 scroll-fade scrollbar-none flex-col overflow-y-auto"'
    );
    expect(source).toContain(
      'className="theme-doc-toc-desktop__list flex flex-col gap-2 p-4 pt-0 text-sm"'
    );
    expect(source).toContain(
      'className="theme-doc-toc-desktop__header h-6 bg-background text-xs font-medium text-muted-foreground"'
    );
    expect(source).toContain("On this page");
    expect(source).toContain("linkClassName={LINK_CLASS_NAME}");
    expect(source).toContain("linkActiveClassName={LINK_ACTIVE_CLASS_NAME}");
  });

  it("preserves semantic nested lists while exposing live depth hooks", () => {
    const source = read("TOCItems/Tree.tsx");

    expect(source).toContain(
      'className={isChild ? "table-of-contents__sublist" : className}'
    );
    expect(source).toContain('className="table-of-contents__item"');
    expect(source).toContain("data-depth={heading.level}");
    expect(source).toContain("<HeadingLabel html={heading.value} />");
  });

  it("moves stickiness to the outer rail and matches live depth spacing", () => {
    const css = read("base.scss");

    expect(css).toContain(".theme-doc-page__toc {");
    expect(css).toContain("position: sticky;");
    expect(css).toContain("top: var(--ifm-navbar-height);");
    expect(css).toContain("height: calc(100svh - var(--ifm-navbar-height));");
    expect(css).toMatch(
      /\.theme-doc-toc-desktop__body \{[\s\S]*padding-top: calc\([\s\S]*var\(--column-top-spacing\) - calc\(var\(--spacing\) \* 4\)/
    );
    expect(css).toContain(".theme-doc-toc-desktop__scroll {");
    expect(css).toContain('.table-of-contents__link[data-depth="3"]');
    expect(css).toContain("padding-left: calc(var(--spacing) * 4);");
    expect(css).toContain('.table-of-contents__link[data-depth="4"]');
    expect(css).toContain("padding-left: calc(var(--spacing) * 6);");
    expect(css).toContain(".table-of-contents__link:hover");
    expect(css).toContain(".table-of-contents__link--active");
  });
});
