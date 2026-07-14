import fs from "fs";
import path from "path";

const componentPath = path.join(__dirname, "index.tsx");

it("renders configured external navbar icons with Lucide", () => {
  const source = fs.readFileSync(componentPath, "utf8");

  expect(source).toContain('from "lucide-react"');
  expect(source).toContain("theme-navbar-github-link");
  expect(source).toContain("theme-navbar-rss-link");
});
