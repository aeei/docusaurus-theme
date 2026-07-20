import fs from "fs";
import path from "path";

const read = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, relativePath), "utf8");

describe("official Base Nova Sidebar contract", () => {
  it("vendors the complete composable Sidebar surface", () => {
    const source = read("components/ui/sidebar.tsx");

    expect(source).toContain('from "@base-ui/react/merge-props"');
    for (const slot of [
      "sidebar-wrapper",
      "sidebar-content",
      "sidebar-footer",
      "sidebar-trigger",
      "sidebar-menu-button",
      "sidebar-menu-sub-button",
    ]) {
      expect(source).toMatch(new RegExp(`(?:data-slot=|slot: )"${slot}"`));
    }
    expect(source).toContain(
      "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width)"
    );
  });

  it("connects Docusaurus routing to official Sidebar composition", () => {
    const layout = read("DocRoot/Layout/index.tsx");
    const rootSidebar = read("DocRoot/Layout/Sidebar/index.tsx");
    const desktop = read("DocSidebar/Desktop/index.tsx");
    const desktopContent = read("DocSidebar/Desktop/Content/index.tsx");
    const mobile = read("DocSidebar/Mobile/index.tsx");
    const mobileLayout = read("Navbar/MobileSidebar/Layout/index.tsx");
    const mobileHeader = read("Navbar/MobileSidebar/Header/index.tsx");
    const mobilePrimary = read("Navbar/MobileSidebar/PrimaryMenu/index.tsx");
    const mobileSecondary = read(
      "Navbar/MobileSidebar/SecondaryMenu/index.tsx"
    );
    const link = read("DocSidebarItem/Link/index.tsx");
    const category = read("DocSidebarItem/Category/index.tsx");

    const mainLayout = read("DocRoot/Layout/Main/index.tsx");
    const docItemLayout = read("DocItem/Layout/index.tsx");
    const mobileHook = read("hooks/use-mobile.ts");

    expect(layout).toContain(
      '<main className="flex min-h-0 min-w-0 flex-1 flex-col"'
    );
    expect(layout).toContain(
      'className="container-wrapper flex flex-1 flex-col px-2"'
    );
    expect(layout).toContain("<SidebarProvider");
    expect(layout).toContain(
      'className="min-h-min flex-1 items-start px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--column-top-spacing:calc(var(--spacing)*6)] 3xl:fixed:container 3xl:fixed:px-3"'
    );
    expect(layout).toContain('"--sidebar-width": "18rem"');
    expect(layout).toContain('"--sidebar-width-icon": "5rem"');
    expect(rootSidebar).toContain('variant="sidebar"');
    expect(rootSidebar).toContain('collapsible={hideable ? "icon" : "none"}');
    expect(rootSidebar).toContain('className="theme-doc-sidebar-container"');
    expect(rootSidebar).not.toContain("useDocsShellDesktop");
    expect(rootSidebar).not.toContain("matchMedia");
    expect(rootSidebar).toContain("<DocSidebarDesktop");
    expect(rootSidebar).toContain("<DocSidebarMobile");
    expect(rootSidebar).toContain(
      'className="theme-doc-sidebar-desktop hidden lg:block"'
    );
    expect(rootSidebar).toContain(
      "<ResetOnSidebarChange>\n      <DocSidebarMobile"
    );
    expect(rootSidebar).toContain(
      'className="theme-doc-sidebar-desktop hidden lg:block"'
    );
    expect(rootSidebar).toContain('data-collapsed={state === "collapsed"}');
    expect(mainLayout).not.toContain("<SidebarInset");
    expect(mainLayout).toContain('data-slot="docs"');
    expect(mainLayout).toContain('className="h-full w-full"');
    expect(mainLayout).not.toContain("max-w-160");
    // Docusaurus main must opt into min-width: 0 so official table cells with
    // whitespace-nowrap stay contained inside docs instead of widening the 390px shell.
    expect(layout).toContain(
      '<main className="flex min-h-0 min-w-0 flex-1 flex-col"'
    );
    expect(docItemLayout).toContain(
      'className="mx-auto flex w-full max-w-160 min-w-0 flex-1 flex-col gap-6 px-4 py-6 text-foreground md:px-0 dark:text-foreground"'
    );
    expect(docItemLayout).toContain('"theme-doc-page__content"');
    expect(docItemLayout).toContain('className="theme-doc-page__toc"');
    expect(docItemLayout).not.toContain("useWindowSize");
    expect(mobileHook).toContain("export const MOBILE_BREAKPOINT = 768;");
    expect(desktop).toContain(
      '<SidebarContent className="theme-doc-sidebar-content scroll-fade">'
    );
    expect(desktop).toContain(
      '<SidebarFooter className="theme-doc-sidebar-footer">'
    );
    expect(desktop).toContain("<SidebarFooter");
    expect(desktop).toContain("<SidebarTrigger");
    expect(desktop).toContain('aria-keyshortcuts="Control+B Meta+B"');
    expect(desktop).toContain("<TooltipContent");
    expect(desktopContent).toContain("<SidebarGroup>");
    expect(desktopContent).toContain("<SidebarMenu>");
    expect(mobileLayout).toContain("<SidebarProvider");
    expect(mobileLayout).toContain("theme-mobile-sidebar-content");
    expect(mobileLayout).toContain('"--sidebar-width": "18rem"');
    expect(mobileHeader).toContain("<SheetHeader>");
    expect(mobilePrimary).toContain('<SidebarContent className="scroll-fade">');
    expect(mobilePrimary).toContain("<SidebarGroup>");
    expect(mobileSecondary).toContain(
      '<SidebarContent className="scroll-fade">'
    );
    expect(mobileSecondary).toContain("<SidebarGroup>");
    expect(mobileSecondary).toContain("<SidebarMenuButton");
    expect(mobile).toContain("<SidebarMenu>");
    expect(link).toContain("<SidebarMenuButton");
    expect(link).toContain("<SidebarMenuSubButton");
    expect(category).toContain("components/ui/collapsible");
    expect(category).toContain('className="group/collapsible"');
    expect(category).toContain("<SidebarMenuSub>");
    expect(category).toContain("useVisibleSidebarItems");
    expect(category).toContain("findFirstSidebarItemLink");
    expect(category).toContain("useDocSidebarItemsExpandedState");
    expect(category).toContain("isCurrentPage");
    expect(category).toContain("item.collapsed");
    expect(category).toContain("autoCollapseCategories");
  });

  it("keeps the desktop LNB sticky within the main/footer boundary", () => {
    const css = read("base.scss");
    const rootSidebar = read("DocRoot/Layout/Sidebar/index.tsx");

    expect(css).toMatch(
      /\.theme-doc-sidebar-desktop \{[\s\S]*position: sticky;[\s\S]*top: var\(--ifm-navbar-height\);[\s\S]*height: calc\(100svh - var\(--ifm-navbar-height\)\);/
    );
    expect(css).toMatch(
      /\.theme-doc-sidebar-desktop > :first-child \{[\s\S]*height: 100%;/
    );
    expect(css).toMatch(
      /\.theme-doc-sidebar-container \{[\s\S]*position: static !important;[\s\S]*height: 100% !important;/
    );
    expect(rootSidebar).toContain('data-collapsed={state === "collapsed"}');
    expect(css).toContain(
      '.container-wrapper:has(.theme-doc-sidebar-desktop[data-collapsed="true"])'
    );
  });

  it("aligns the desktop LNB to the centered GNB shell", () => {
    const css = read("base.scss");

    expect(css).toMatch(
      /\.theme-doc-root-layout > main > \.container-wrapper \{[\s\S]*max-width: var\(--theme-shell-max-width\);[\s\S]*margin-inline: auto;/
    );
    expect(css).toMatch(
      /\.theme-doc-sidebar-container \{[\s\S]*inset: auto !important;/
    );
    expect(css).toMatch(
      /\.theme-doc-sidebar-desktop\s+\[data-state="expanded"\][\s\S]*\.theme-doc-sidebar-content[\s\S]*padding-top: calc\([\s\S]*var\(--column-top-spacing\) - calc\(var\(--spacing\) \* 3\.5\)[\s\S]*padding-left: calc\(var\(--spacing\) \* 2\);/
    );
  });

  it("does not generate an unused scroll-fade compatibility surface", () => {
    const toc = read("DocItem/TOC/Desktop/index.tsx");
    const css = read("shadcn.css");

    expect(toc).not.toContain("scroll-fade-y");
    expect(css).toContain('@source "./**/*.tsx"');
  });
});
