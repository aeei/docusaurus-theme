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

it("uses Lucide rather than inline or encoded icons", () => {
  const source = listProductionFiles(__dirname)
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");

  expect(source).not.toContain("<svg");
  expect(source).not.toMatch(/data:image\/svg|mask(?:-image)?:\s*url\(/);
  expect(source).not.toMatch(/content:\s*["'][^"']*[→←↑↓▶◀][^"']*["']/);

  for (const file of [
    "BackToTopButton/index.tsx",
    "CodeBlock/Buttons/CopyButton/index.tsx",
    "CodeBlock/Buttons/WordWrapButton/index.tsx",
    "Navbar/MobileSidebar/Toggle/index.tsx",
    "EditThisPage/index.tsx",
  ]) {
    expect(fs.readFileSync(path.join(__dirname, file), "utf8")).toContain(
      'from "lucide-react"'
    );
  }
});
