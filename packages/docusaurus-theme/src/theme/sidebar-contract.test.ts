import fs from "fs";
import path from "path";

const themeRoot = __dirname;
const read = (relativePath: string) =>
  fs.readFileSync(path.join(themeRoot, relativePath), "utf8");

describe("shadcn Base Nova sidebar contract", () => {
  it("vendors the official composable sidebar surface", () => {
    const source = read("components/ui/sidebar.tsx");

    expect(source).toContain('from "@base-ui/react/merge-props"');
    expect(source).toContain('data-slot="sidebar-wrapper"');
    expect(source).toContain('data-slot="sidebar-content"');
    expect(source).toContain('data-slot="sidebar-footer"');
    expect(source).toContain('data-slot="sidebar-trigger"');
  });

  it("connects Docusaurus docs layout to sidebar primitives", () => {
    const layout = read("DocRoot/Layout/index.tsx");
    const rootSidebar = read("DocRoot/Layout/Sidebar/index.tsx");
    const desktop = read("DocSidebar/Desktop/index.tsx");
    const desktopContent = read("DocSidebar/Desktop/Content/index.tsx");
    const mobile = read("DocSidebar/Mobile/index.tsx");
    const link = read("DocSidebarItem/Link/index.tsx");
    const category = read("DocSidebarItem/Category/index.tsx");
    const mobileNavbar = read("Navbar/MobileSidebar/index.tsx");

    expect(layout).toContain("<SidebarProvider");
    expect(rootSidebar).toContain('windowSize === "mobile" && docSidebar');
    expect(rootSidebar).toContain('windowSize !== "mobile" && (');
    expect(mobileNavbar).toContain('event.key.toLowerCase() === "b"');
    expect(mobileNavbar).toContain('window.matchMedia("(max-width: 996px)")');
    expect(rootSidebar).toContain('collapsible={hideable ? "icon" : "none"}');
    expect(rootSidebar).not.toContain("<SidebarRail");
    expect(desktop).toContain("<SidebarContent");
    expect(desktopContent).toContain("<SidebarMenu");
    expect(mobile).toContain("<SidebarProvider");
    expect(mobile).toContain("<SidebarContent");
    expect(mobile).toContain("<SidebarMenu");
    expect(link).toContain("<SidebarMenuButton");
    expect(link).toContain("<SidebarMenuSubButton");
    expect(category).toContain("<SidebarMenuButton");
    expect(category).toContain("<SidebarMenuSub");
    expect(desktop).toContain('className="scroll-fade-y overflow-x-hidden"');
    expect(desktop).toContain("<SidebarFooter");
    expect(desktop).toContain("<SidebarTrigger");
    expect(desktop).toContain('aria-keyshortcuts="Control+B Meta+B"');
    expect(desktop).toContain("<TooltipContent");
    expect(desktop).toContain('side={collapsed ? "right" : "top"}');
    expect(desktop).toContain('"CMD" | "CTRL"');
    expect(desktop).toContain("/Mac|iPhone|iPad|iPod/");
  });

  it("applies the official vertical scroll fade to the desktop TOC", () => {
    const toc = read("DocItem/TOC/Desktop/index.tsx");
    const utilities = read("shadcn.css");

    expect(toc).toContain("scroll-fade-y");
    expect(utilities).toContain("@utility scroll-fade-y");
    expect(utilities).toContain("animation-timeline: scroll(self y)");
  });
});
