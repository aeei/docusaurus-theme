import fs from "node:fs";
import path from "node:path";

const read = (file: string) =>
  fs.readFileSync(path.join(__dirname, file), "utf8");

describe("Local search trigger contract", () => {
  it("uses the shared semantic placeholder color and official Kbd shortcut", () => {
    const search = read("components/local-search/index.tsx");
    expect(search).toContain('import { Kbd, KbdGroup } from "../ui/kbd"');
    expect(search).toContain("text-muted-foreground");
    expect(search).toContain("<KbdGroup");
    expect(search).toContain("<Kbd>⌘</Kbd>");
    expect(search).toContain("<Kbd>K</Kbd>");
  });

  it("maps the command input placeholder to the semantic token", () => {
    const css = read("vendor/search-nova.css");
    expect(css).toMatch(
      /\.cn-command-input\s*\{[^}]*placeholder:text-muted-foreground/
    );
  });
});
