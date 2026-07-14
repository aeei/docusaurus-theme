import fs from "fs";
import path from "path";

const iconComponents = [
  "SchemaExpansion/index.tsx",
  "ApiExplorer/ApiCodeBlock/CopyButton/index.tsx",
  "ApiExplorer/ApiCodeBlock/ExpandButton/index.tsx",
  "ApiExplorer/ApiCodeBlock/ExitButton/index.tsx",
  "ApiExplorer/ApiCodeBlock/WordWrapButton/index.tsx",
];

it("uses Lucide rather than inline SVGs for interactive icons", () => {
  for (const file of iconComponents) {
    const source = fs.readFileSync(path.join(__dirname, file), "utf8");

    expect(source).toContain('from "lucide-react"');
    expect(source).not.toContain("<svg");
  }
});
