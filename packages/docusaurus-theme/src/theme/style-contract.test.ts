import fs from "fs";
import path from "path";

function listStyles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listStyles(entryPath);
    return entry.name.endsWith(".scss") || entry.name.endsWith(".css")
      ? [entryPath]
      : [];
  });
}

it("does not render nested borders around the DocSearch escape key", () => {
  const docSearchStyles = fs.readFileSync(
    path.join(__dirname, "adapters", "_docsearch.scss"),
    "utf8"
  );

  expect(docSearchStyles).not.toMatch(
    /\.DocSearch-Commands-Key,\s*\.DocSearch-Escape-Key/
  );
});

it("keeps docs styles within the public semantic token contract", () => {
  const stylesheet = listStyles(__dirname)
    .filter((file) => path.basename(file) !== "shadcn.css")
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");

  expect(stylesheet).not.toMatch(/--(?:openapi|opeanpi|docs|api)-/);
  expect(stylesheet).not.toContain("Toss");
  expect(stylesheet).not.toMatch(
    /#[\da-f]{3,8}\b|\b(?:rgb|hsl)a?\(|:\s*(?:white|black)\b/i
  );
  expect(stylesheet).not.toMatch(/\d+(?:\.\d+)?rem\b/);
  expect(stylesheet).not.toMatch(
    /^[ \t]*(?:padding|margin|gap|width|height|border(?:-(?:top|right|bottom|left))?|outline(?:-offset)?|backdrop-filter):[^;]*\d+(?:\.\d+)?(?:px|rem)\b/m
  );
  expect(stylesheet).toContain("var(--spacing)");
});

it("keeps the shared stylesheet docs-only", () => {
  const styles = fs.readFileSync(path.join(__dirname, "styles.scss"), "utf8");

  expect(styles).toContain('@use "./base";');
  expect(styles).toContain('@use "./adapters/docsearch";');
  expect(styles).not.toMatch(/ApiExplorer|ApiTabs|CodeSamples|Schema/i);
});
