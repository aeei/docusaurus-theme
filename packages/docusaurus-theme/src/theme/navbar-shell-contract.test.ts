import fs from "node:fs";
import path from "node:path";

const themeRoot = path.resolve(__dirname);
const read = (relativePath: string) =>
  fs.readFileSync(path.join(themeRoot, relativePath), "utf8");

describe("live shadcn navbar shell contract", () => {
  it("uses the official NavigationMenu trigger style for direct GNB links", () => {
    const navbar = read("Navbar/Content/index.tsx");

    expect(navbar).toContain("navigationMenuTriggerStyle");
    expect(navbar).toContain("className={navigationMenuTriggerStyle()}");
  });

  it("keeps theme controls in the Nextra-style desktop and mobile sidebar footers", () => {
    const navbar = read("Navbar/Content/index.tsx");
    const desktopSidebar = read("DocSidebar/Desktop/index.tsx");
    const mobileLayout = read("Navbar/MobileSidebar/Layout/index.tsx");

    expect(navbar).not.toContain("SidebarThemeMenu");
    expect(navbar).not.toContain("theme-navbar-color-mode");
    expect(desktopSidebar).toContain("SidebarThemeMenu");
    expect(desktopSidebar).toContain("compact={collapsed}");
    expect(desktopSidebar).toContain("<SidebarTrigger");
    expect(mobileLayout).toContain("SidebarFooter");
    expect(mobileLayout).toContain(
      '<SidebarThemeMenu side="top" align="start" />'
    );
  });

  it("hydrates the theme control with a stable system icon", () => {
    const themeMenu = read("components/sidebar-theme-menu.tsx");

    expect(themeMenu).toContain(
      'import useIsBrowser from "@docusaurus/useIsBrowser"'
    );
    expect(themeMenu).toContain("const isBrowser = useIsBrowser();");
    expect(themeMenu).toContain(
      'const value = isBrowser ? (colorModeChoice ?? "system") : "system";'
    );
    expect(themeMenu).toContain("disabled={!isBrowser}");
  });

  it("aligns mobile action glyphs to the content edge", () => {
    const css = read("base.scss");

    expect(css).toMatch(
      /@media \(max-width: 1023px\) \{[\s\S]*\.navbar__inner \{[\s\S]*width: calc\(100% - calc\(var\(--spacing\) \* 8\)\);/
    );
  });

  it("matches the Nextra translucent blurred header surface", () => {
    const css = read("base.scss");
    const navbarBlock = css.match(/\.navbar \{([\s\S]*?)\n\}/)?.[1] ?? "";
    const blurBlock = css.match(/\.navbar::before \{([\s\S]*?)\n\}/)?.[1] ?? "";

    expect(navbarBlock).toContain("background: transparent;");
    expect(navbarBlock).toContain("isolation: isolate;");
    expect(blurBlock).toContain("backdrop-filter: blur(12px);");
    expect(blurBlock).toContain("background: color-mix(");
    expect(blurBlock).toContain("70%");
    expect(blurBlock).toContain("border-bottom: 1px solid var(--border);");
  });

  it("caps and centers the shared desktop shell at 90rem", () => {
    const css = read("base.scss");

    expect(css).toContain("--theme-shell-max-width: 90rem;");
    expect(css).toMatch(
      /\.navbar__inner \{[\s\S]*max-width: calc\([\s\S]*var\(--theme-shell-max-width\)[\s\S]*var\(--spacing\) \* 12/
    );
    expect(css).toMatch(
      /\.theme-doc-root-layout > main > \.container-wrapper \{[\s\S]*max-width: var\(--theme-shell-max-width\);[\s\S]*margin-inline: auto;/
    );
    expect(css).toMatch(
      /\.footer > \.container \{[\s\S]*max-width: var\(--theme-shell-max-width\);/
    );
  });
});
