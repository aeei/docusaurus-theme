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

it("keeps OpenAPI styles within the public semantic token contract", () => {
  const stylesheet = listStyles(__dirname)
    .filter((file) => path.basename(file) !== "shadcn.css")
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");

  expect(stylesheet).not.toMatch(/--(?:openapi|opeanpi)-/);
  expect(stylesheet).not.toMatch(
    /#[\da-f]{3,8}\b|\b(?:rgb|hsl)a?\(|:\s*(?:white|black)\b/i
  );
});
