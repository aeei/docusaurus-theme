import fs from "fs";
import path from "path";

const read = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, relativePath), "utf8");

it("leaves Escape dismissal to Base Dialog and keeps the mobile shortcut", () => {
  const source = read("index.tsx");

  expect(source).not.toContain('event.key === "Escape"');
  expect(source).toContain("mobileSidebar.toggle()");
  expect(source).toContain('event.key.toLowerCase() === "b"');
  expect(source).toContain('window.matchMedia("(max-width: 1023px)")');
  expect(source).toContain("if (mobileSidebar.disabled) return null;");
  expect(source).not.toContain("if (!mobileSidebar.shouldRender) return null;");
});

it("uses official Sheet, Button, and Sidebar composition", () => {
  const layout = read("Layout/index.tsx");
  const header = read("Header/index.tsx");
  const toggle = read("Toggle/index.tsx");
  const navbarContent = read("../Content/index.tsx");

  expect(layout).toContain("<SheetContent");
  expect(layout).toContain("<SidebarProvider");
  expect(header).toContain("<SheetHeader>");
  expect(header).not.toContain("<SidebarHeader>");
  expect(header).not.toContain("SidebarThemeMenu");
  expect(toggle).toContain('variant="ghost"');
  expect(toggle).toContain('size="icon"');
  expect(toggle).not.toContain('className="navbar__toggle"');
  expect(navbarContent).toContain("theme-navbar-mobile-trigger");
  expect(navbarContent).not.toContain("SidebarThemeMenu");
  expect(layout).toContain('<SidebarThemeMenu side="top" align="start" />');
});

it("removes the legacy text arrow when the back action already has an icon", () => {
  const secondaryMenu = read("SecondaryMenu/index.tsx");

  expect(secondaryMenu).toContain(".replace(/^←\\s*/u, \"\")");
  expect(secondaryMenu).toContain("<ArrowLeft");
  expect(secondaryMenu).not.toContain("<Translate");
});

it("restores focus to the official mobile navigation Button", () => {
  const layout = read("Layout/index.tsx");

  expect(layout).toContain("onOpenChangeComplete");
  expect(layout).toMatch(
    /querySelector<HTMLButtonElement>\([\s\S]*"\[data-mobile-navigation-trigger\]"/
  );
  expect(layout).toContain("?.focus()");
});
