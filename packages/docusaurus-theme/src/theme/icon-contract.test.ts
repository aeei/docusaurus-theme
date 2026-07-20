import fs from "fs";
import path from "path";

function listProductionFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listProductionFiles(entryPath);
    if (/\.test\.[jt]sx?$/.test(entry.name)) return [];
    return /\.[jt]sx?$/.test(entry.name) ? [entryPath] : [];
  });
}

it("uses Lucide except for official shadcn code-language marks", () => {
  const files = listProductionFiles(__dirname);
  const source = files
    .filter((file) => !file.endsWith("components/code-language-icon.tsx"))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  const codeLanguageIcon = fs.readFileSync(
    path.join(__dirname, "components/code-language-icon.tsx"),
    "utf8"
  );

  expect(source).not.toContain("<svg");
  expect(codeLanguageIcon).toContain("Adapted from shadcn/ui");
  expect(codeLanguageIcon).toContain("function TypeScriptIcon");
  expect(codeLanguageIcon).toContain("function CssIcon");
  expect(source).not.toMatch(/data:image\/svg|mask(?:-image)?:\s*url\(/);
  expect(source).not.toMatch(/content:\s*["'][^"']*[→←↑↓▶◀][^"']*["']/);

  for (const file of [
    "BackToTopButton/index.tsx",
    "CodeBlock/Buttons/CopyButton/index.tsx",
    "Navbar/MobileSidebar/Toggle/index.tsx",
    "EditThisPage/index.tsx",
  ]) {
    expect(fs.readFileSync(path.join(__dirname, file), "utf8")).toContain(
      'from "lucide-react"'
    );
  }
});
