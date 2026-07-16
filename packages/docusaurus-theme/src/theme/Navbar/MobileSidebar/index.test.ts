import fs from "fs";
import path from "path";

const componentPath = path.join(__dirname, "index.tsx");
const navbarContentPath = path.join(__dirname, "../Content/index.tsx");
const baseStylesPath = path.join(__dirname, "../../base.scss");

it("closes the mobile navigation drawer when Escape is pressed", () => {
  const source = fs.readFileSync(componentPath, "utf8");

  expect(source).toContain('event.key !== "Escape"');
  expect(source).toContain("mobileSidebar.toggle()");
});

it("keeps the mobile brand visible and desktop navigation hidden", () => {
  const navbarContent = fs.readFileSync(navbarContentPath, "utf8");
  const baseStyles = fs.readFileSync(baseStylesPath, "utf8");

  expect(navbarContent).toContain("theme-navbar-desktop-navigation");
  expect(baseStyles).toContain(".theme-navbar-desktop-navigation,");
  expect(baseStyles).toContain(".navbar__brand {");
  expect(baseStyles).toContain("display: inline-flex !important;");
  expect(baseStyles).toContain(".theme-mobile-sheet .navbar-sidebar__back");
  expect(baseStyles).toContain("background: transparent;");
});

it("restores focus to the mobile navigation toggle after closing", () => {
  const layout = fs.readFileSync(
    path.join(__dirname, "Layout/index.tsx"),
    "utf8"
  );

  expect(layout).toContain("onOpenChangeComplete");
  expect(layout).toContain(
    'querySelector<HTMLButtonElement>(".navbar__toggle")'
  );
  expect(layout).toContain("?.focus()");
});
