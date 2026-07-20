import fs from "fs";
import path from "path";

const componentPath = path.join(__dirname, "index.tsx");

it("renders configured external navbar icons with Lucide", () => {
  const source = fs.readFileSync(componentPath, "utf8");

  expect(source).toContain('from "lucide-react"');
  expect(source).toContain("theme-navbar-github-link");
  expect(source).toContain("theme-navbar-rss-link");
});

it("uses the official NavigationMenu for the primary desktop GNB", () => {
  const content = fs.readFileSync(
    path.join(__dirname, "../Navbar/Content/index.tsx"),
    "utf8"
  );

  expect(content).toContain("<NavigationMenu");
  expect(content).toContain("<NavigationMenuList>");
  expect(content).toContain("<NavigationMenuTrigger>");
  expect(content).toContain("<NavigationMenuContent>");
  expect(content).toContain("<NavigationMenuLink");
  expect(content).toContain("NavbarNavigationMenuDocItem");
  expect(content).not.toContain('className="w-');
});

it("keeps the official Button-sized DropdownMenu fallback", () => {
  const dropdown = fs.readFileSync(
    path.join(__dirname, "DropdownNavbarItem/index.tsx"),
    "utf8"
  );
  const defaultItem = fs.readFileSync(
    path.join(__dirname, "DefaultNavbarItem/Desktop/index.tsx"),
    "utf8"
  );

  expect(dropdown).toContain("<DropdownMenuTrigger");
  expect(dropdown).toContain("<DropdownMenuContent");
  expect(dropdown).toContain("<DropdownMenuItem");
  expect(dropdown).toContain('render={<Button variant="ghost" />}');
  expect(defaultItem).toContain('variant="ghost"');
  expect(dropdown).not.toContain('className="min-w-48 p-1"');
  expect(dropdown).not.toContain('className="px-2 py-1.5"');
});

it("gives each mobile dropdown toggle a specific accessible name", () => {
  const dropdown = fs.readFileSync(
    path.join(__dirname, "DropdownNavbarItem/Mobile/index.tsx"),
    "utf8"
  );

  expect(dropdown).toContain('message: "Toggle the {label} dropdown"');
  expect(dropdown).toContain("{ label: accessibleLabel }");
  expect(dropdown).not.toContain('message: "Toggle the dropdown"');
  expect(dropdown).not.toContain("<SidebarMenuButton aria-label={toggleLabel}");
});
