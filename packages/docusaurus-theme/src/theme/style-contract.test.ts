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

it("separates official component CSS from docs-only adapters", () => {
  const stylesheet = listStyles(__dirname)
    .filter((file) => !file.includes(`${path.sep}vendor${path.sep}`))
    .filter((file) => path.basename(file) !== "shadcn.css")
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");

  expect(stylesheet).not.toMatch(/--(?:openapi|opeanpi|docs|api)-/);
  expect(stylesheet).not.toMatch(
    /#[\da-f]{3,8}\b|\b(?:rgb|hsl)a?\(|:\s*(?:white|black)\b/i
  );
  for (const slot of [
    "button",
    "accordion",
    "tabs",
    "card",
    "alert",
    "table",
  ]) {
    expect(stylesheet).not.toContain(`[data-slot="${slot}"] {`);
  }
  expect(stylesheet).toContain("var(--spacing)");

  const shadcn = fs.readFileSync(path.join(__dirname, "shadcn.css"), "utf8");
  expect(shadcn).toContain("--background: lab(100% 0 0)");
  expect(shadcn).toContain("--radius: 0.625rem");
});

it("normalizes the official scroll-fade fallback for consumer PostCSS", () => {
  const normalizer = fs.readFileSync(
    path.resolve(__dirname, "../../scripts/normalize-tailwind-css.mjs"),
    "utf8"
  );

  expect(normalizer).toContain("scrollFadeFallback");
  expect(normalizer).toContain('"var(--scroll-fade-reveal,6rem)"');
});

it("keeps the shared stylesheet docs-only", () => {
  const styles = fs.readFileSync(path.join(__dirname, "styles.scss"), "utf8");

  expect(styles).toContain('@use "./base";');
  expect(styles).toContain('@use "./adapters/docsearch";');
  expect(styles).not.toMatch(/ApiExplorer|ApiTabs|CodeSamples|Schema/i);
});
