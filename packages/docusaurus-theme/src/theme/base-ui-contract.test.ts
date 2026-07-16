import fs from "fs";
import path from "path";

const read = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, relativePath), "utf8");

function productionSource(directory: string): string {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return [productionSource(entryPath)];
      if (/\.test\.[jt]sx?$/.test(entry.name)) return [];
      return /\.[jt]sx?$/.test(entry.name)
        ? [fs.readFileSync(entryPath, "utf8")]
        : [];
    })
    .join("\n");
}

describe("shadcn Base Nova primitive contract", () => {
  it.each(["components/ui/sidebar.tsx", "components/ui/breadcrumb.tsx"])(
    "%s uses Base UI render composition",
    (componentPath) => {
      const source = read(componentPath);
      expect(source).toContain('from "@base-ui/react/merge-props"');
      expect(source).toContain('from "@base-ui/react/use-render"');
    }
  );

  it.each([
    ["components/ui/button.tsx", "@base-ui/react/button"],
    ["components/ui/sheet.tsx", "@base-ui/react/dialog"],
    ["components/ui/dropdown-menu.tsx", "@base-ui/react/menu"],
    ["components/ui/tabs.tsx", "@base-ui/react/tabs"],
    ["components/ui/navigation-menu.tsx", "@base-ui/react/navigation-menu"],
    ["components/ui/tooltip.tsx", "@base-ui/react/tooltip"],
    ["components/ui/separator.tsx", "@base-ui/react/separator"],
  ])("%s uses %s", (file, primitive) => {
    expect(read(file)).toContain(`from "${primitive}"`);
  });

  it("uses Base render composition for Badge", () => {
    const badge = read("components/ui/badge.tsx");
    expect(badge).toContain('from "@base-ui/react/merge-props"');
    expect(badge).toContain('from "@base-ui/react/use-render"');
  });

  it("contains no Radix production source", () => {
    expect(productionSource(__dirname)).not.toMatch(
      /@radix-ui|from ["']radix-ui["']/
    );
  });

  it("includes official Base data variants", () => {
    const utilities = read("shadcn.css");
    for (const variant of [
      "data-open",
      "data-closed",
      "data-active",
      "data-horizontal",
      "data-vertical",
    ]) {
      expect(utilities).toContain(`@custom-variant ${variant}`);
    }
  });
});
