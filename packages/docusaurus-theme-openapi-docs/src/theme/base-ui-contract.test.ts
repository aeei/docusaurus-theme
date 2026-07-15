import fs from "fs";
import path from "path";

const read = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, relativePath), "utf8");

describe("shadcn Base Nova primitive contract", () => {
  it.each(["components/ui/sidebar.tsx", "components/ui/breadcrumb.tsx"])(
    "%s uses Base UI render composition",
    (componentPath) => {
      const source = read(componentPath);
      expect(source).toContain('from "@base-ui/react/merge-props"');
      expect(source).toContain('from "@base-ui/react/use-render"');
    }
  );

  it("includes the official shadcn Base data variants", () => {
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

  it("uses the official Base UI Tabs primitive", () => {
    const tabs = read("components/ui/tabs.tsx");

    expect(tabs).toContain('from "@base-ui/react/tabs"');
    expect(tabs).not.toContain('from "radix-ui"');
    expect(tabs).toContain("<TabsPrimitive.Tab");
    expect(tabs).toContain("<TabsPrimitive.Panel");
    expect(tabs).toContain("data-active");
  });

  it("uses Base Nova controls for code tabs", () => {
    const codeTabs = read("ApiExplorer/CodeTabs/index.tsx");

    expect(codeTabs).toContain('from "@theme/components/ui/tabs"');
    expect(codeTabs).toContain("<TabsList");
    expect(codeTabs).toContain('variant="line"');
    expect(codeTabs).toContain('data-slot="tabs-scroller"');
    expect(codeTabs).toContain(
      "overflow-x-auto border-b border-border [scrollbar-width:none]"
    );
    expect(codeTabs).toContain("<TabsTrigger");
    expect(codeTabs).not.toContain('role="tablist"');
    expect(codeTabs).not.toContain('role="tab"');
  });

  it("keeps horizontal scrolling outside the official TabsList", () => {
    const tabList = read("components/openapi-tab-list.tsx");

    expect(tabList).toContain('data-slot="tabs-scroller"');
    expect(tabList).toContain(
      '"max-w-full overflow-x-auto [scrollbar-width:none]"'
    );
    expect(tabList).toContain('"border-b border-border"');
  });

  it("keeps the table wrapper from doubling the last row border", () => {
    const table = read("components/ui/table.tsx");

    expect(table).toContain("[&_tr:last-child]:!border-0");
  });

  it("keeps Base Nova tooltip side positioning", () => {
    const tooltip = read("components/ui/tooltip.tsx");

    expect(tooltip).toContain("data-[side=right]:-left-1");
    expect(tooltip).toContain("data-[side=left]:-right-1");
    expect(tooltip).toContain("**:data-[slot=kbd]:z-50");
  });

  it("uses Base UI NavigationMenu for the GNB", () => {
    const primitive = read("components/ui/navigation-menu.tsx");
    const navbar = read("Navbar/Content/index.tsx");

    expect(primitive).toContain('from "@base-ui/react/navigation-menu"');
    expect(primitive).toContain('data-slot="navigation-menu-popup"');
    expect(primitive).toContain("z-[1000]");
    expect(navbar).toContain("<NavigationMenu");
    expect(navbar).toContain("<NavigationMenuList");
  });
});
