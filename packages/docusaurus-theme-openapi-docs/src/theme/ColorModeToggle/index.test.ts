import fs from "fs";
import path from "path";

const componentPath = path.join(__dirname, "index.tsx");

it("uses Lucide icons with an accessible color mode button", () => {
  const source = fs.readFileSync(componentPath, "utf8");

  expect(source).toContain('from "lucide-react"');
  expect(source).toContain("aria-label");
  expect(source).toContain("respectPrefersColorScheme");
});
