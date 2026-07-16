import fs from "fs";
import path from "path";

const componentPath = path.join(__dirname, "index.tsx");

it("renders configured external navbar icons with Lucide", () => {
  const source = fs.readFileSync(componentPath, "utf8");

  expect(source).toContain('from "lucide-react"');
  expect(source).toContain("theme-navbar-github-link");
  expect(source).toContain("theme-navbar-rss-link");
});

it("keeps desktop dropdown navigation compact", () => {
  const dropdown = fs.readFileSync(
    path.join(__dirname, "DropdownNavbarItem/index.tsx"),
    "utf8"
  );

  expect(dropdown).toContain('className="min-w-48 p-1"');
  expect(dropdown).toContain('className="px-2 py-1.5"');
  expect(dropdown).not.toContain("--radius-sm");
});
