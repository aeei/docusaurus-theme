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
    ["components/ui/collapsible.tsx", "@base-ui/react/collapsible"],
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

  it("uses the Base UI menu activation event for color mode changes", () => {
    const menu = read("components/sidebar-theme-menu.tsx");
    expect(menu).toContain("onClick={() =>");
    expect(menu).not.toContain("onSelect={() =>");
  });

  it("preserves the official Base Nova foundation metrics", () => {
    expect(read("components/ui/button.tsx")).toContain(
      '"h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2'
    );
    expect(read("components/ui/badge.tsx")).toContain("h-5");
    expect(read("components/ui/badge.tsx")).toContain("rounded-4xl");
    expect(read("components/ui/sheet.tsx")).toContain("bg-black/10");
    expect(read("components/ui/sheet.tsx")).toContain(
      "supports-backdrop-filter:backdrop-blur-xs"
    );
    expect(read("components/ui/dropdown-menu.tsx")).toContain(
      "rounded-lg bg-popover p-1"
    );
  });

  it("keeps component density and typography in primitive SSOT", () => {
    const card = read("components/ui/card.tsx");
    const alert = read("components/ui/alert.tsx");
    const tabs = read("components/ui/tabs.tsx");
    const badge = read("components/ui/badge.tsx");
    const codeInline = read("CodeInline/index.tsx");
    const sidebar = read("components/ui/sidebar.tsx");
    const input = read("components/ui/input.tsx");
    const table = read("components/ui/table.tsx");
    const details = read("Details/index.tsx");
    const navigationMenu = read("components/ui/navigation-menu.tsx");
    const tocTree = read("TOCItems/Tree.tsx");
    const docCard = read("DocCard/Layout/index.tsx");
    const kbd = read("components/ui/kbd.tsx");
    const sidebarAdapters = [
      read("DocSidebarItem/Category/index.tsx"),
      read("DocSidebarItem/Link/index.tsx"),
    ].join("\n");

    expect(card).toContain('size?: "default" | "sm"');
    expect(card).toContain("[--card-spacing:--spacing(4)]");
    expect(alert).toContain("px-2.5 py-2 text-left text-sm");
    expect(tabs).toContain("text-sm");
    expect(badge).toContain('code: "max-w-full rounded-[var(--radius-sm)]');
    expect(badge).toContain("whitespace-normal break-all");
    expect(codeInline).toContain('variant="code"');
    expect(codeInline).not.toContain("0.75em");
    expect(sidebar).not.toContain("comfortable");
    expect(sidebar).toContain(
      'className={cn("flex flex-col gap-2 p-2", className)}'
    );
    expect(sidebarAdapters).not.toContain('size="comfortable"');
    expect(input).toContain("h-8 w-full min-w-0 rounded-lg");
    expect(table).toContain('className="relative w-full overflow-x-auto"');
    expect(details).not.toContain("h-auto");
    expect(details).not.toContain("!text-base");
    expect(navigationMenu).toContain("text-sm");
    expect(tocTree).toContain('variant="codeCompact"');
    expect(tocTree).not.toMatch(/text-\[[^\]]*em/);
    expect(docCard).not.toMatch(/leading-[56]/);
    expect(kbd).not.toContain("leading-none");
  });

  it("keeps Docusaurus tabs and mobile navigation on the accepted Base/Lucide seams", () => {
    expect(read("Tabs/index.tsx")).toContain("ThemeTabList");
    expect(read("TOCCollapsible/index.tsx")).toContain("<Collapsible");
    expect(read("Details/index.tsx")).toContain("<Collapsible");
    expect(read("Details/index.tsx")).not.toContain("<DetailsGeneric");
    expect(read("TOCCollapsible/index.tsx")).toContain("<CollapsibleTrigger");
    expect(read("TOCCollapsible/index.tsx")).toContain("<CollapsibleContent");
    expect(read("components/theme-tab-list.tsx")).toContain('variant = "line"');
    expect(read("Navbar/MobileSidebar/Toggle/index.tsx")).toContain(
      'size="icon"'
    );
    expect(read("NavbarItem/DropdownNavbarItem/Mobile/index.tsx")).toContain(
      "ChevronRight"
    );
    expect(read("Navbar/MobileSidebar/SecondaryMenu/index.tsx")).toContain(
      "ArrowLeft"
    );
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
