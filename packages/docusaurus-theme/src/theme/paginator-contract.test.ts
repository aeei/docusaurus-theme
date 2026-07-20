import fs from "node:fs";
import path from "node:path";

const themeRoot = path.resolve(__dirname);
const read = (relativePath: string) =>
  fs.readFileSync(path.join(themeRoot, relativePath), "utf8");

describe("paginator component ownership", () => {
  it("uses the official Button without visual callsite overrides", () => {
    const source = read("PaginatorNavLink/index.tsx");

    expect(source).toContain(
      'import { Button } from "@theme/components/ui/button"'
    );
    expect(source).toContain('variant="outline"');
    expect(source).toContain('size="default"');
    expect(source).toContain("render={<Link to={permalink} />}");
    expect(source).toContain("nativeButton={false}");
    expect(source).toContain('data-icon="inline-start"');
    expect(source).toContain('data-icon="inline-end"');
    expect(source).not.toContain("pagination-nav__link");
    expect(source).not.toContain("pagination-nav__label");
  });

  it("keeps only grid placement in adapter CSS", () => {
    const css = read("base.scss");

    expect(css).toContain(
      ".theme-paginator-link--next {\n  grid-column: 2;\n}"
    );
    expect(css).toContain("@media (max-width: 26.25rem)");
    expect(css).toContain("grid-template-columns: minmax(0, 1fr);");
    expect(css).not.toContain(".pagination-nav__link {");
    expect(css).not.toContain(".pagination-nav__label {");
  });
});
