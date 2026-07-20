import fs from "fs";
import path from "path";

const read = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, relativePath), "utf8");

function stripNotSelectors(selector: string): string {
  let result = selector;
  let start = result.indexOf(":not(");
  while (start >= 0) {
    let depth = 0;
    let end = start;
    for (; end < result.length; end += 1) {
      if (result[end] === "(") depth += 1;
      if (result[end] === ")" && --depth === 0) break;
    }
    result = `${result.slice(0, start)}${result.slice(end + 1)}`;
    start = result.indexOf(":not(");
  }
  return result;
}

function productionSource(directory: string): string {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return [productionSource(entryPath)];
      if (/\.test\.[jt]sx?$/.test(entry.name)) return [];
      return /\.[jt]sx?$/.test(entry.name)
        ? [fs.readFileSync(entryPath, "utf8")]
        : [];
    })
    .join("\n");
}

describe("official shadcn Base Nova contract", () => {
  it.each([
    ["components/ui/accordion.tsx", "@base-ui/react/accordion"],
    ["components/ui/button.tsx", "@base-ui/react/button"],
    ["components/ui/collapsible.tsx", "@base-ui/react/collapsible"],
    ["components/ui/dropdown-menu.tsx", "@base-ui/react/menu"],
    ["components/ui/navigation-menu.tsx", "@base-ui/react/navigation-menu"],
    ["components/ui/separator.tsx", "@base-ui/react/separator"],
    ["components/ui/sheet.tsx", "@base-ui/react/dialog"],
    ["components/ui/tabs.tsx", "@base-ui/react/tabs"],
    ["components/ui/tooltip.tsx", "@base-ui/react/tooltip"],
  ])("%s uses %s", (file, primitive) => {
    expect(read(file)).toContain(`from "${primitive}"`);
  });

  it.each(["components/ui/sidebar.tsx", "components/ui/breadcrumb.tsx"])(
    "%s preserves Base UI render composition",
    (file) => {
      expect(read(file)).toContain('from "@base-ui/react/merge-props"');
      expect(read(file)).toContain('from "@base-ui/react/use-render"');
    }
  );

  it("preserves registry metrics and variants", () => {
    expect(read("components/ui/button.tsx")).toContain(
      "rounded-lg border border-transparent"
    );
    expect(read("components/ui/button.tsx")).toContain('"icon-sm":');
    expect(read("components/ui/button.tsx")).toContain(
      '"size-7 rounded-[min(var(--radius-md),12px)]'
    );
    expect(read("components/ui/accordion.tsx")).toContain(
      "rounded-lg border border-transparent py-2.5 text-left text-sm"
    );
    expect(read("components/ui/card.tsx")).toContain(
      "[--card-spacing:--spacing(4)]"
    );
    expect(read("components/ui/alert.tsx")).toContain(
      "px-2.5 py-2 text-left text-sm"
    );
    expect(read("components/ui/tabs.tsx")).toContain('variant: "default",');
    expect(read("components/ui/table.tsx")).toContain(
      'className="relative w-full overflow-x-auto"'
    );
    expect(read("components/ui/sheet.tsx")).toContain("bg-black/10");
  });

  it("uses one official Accordion SSOT for docs disclosures", () => {
    for (const file of ["Details/index.tsx", "TOCCollapsible/index.tsx"]) {
      const source = read(file);
      expect(source).toContain("components/ui/accordion");
      expect(source).toContain("<Accordion");
      expect(source).not.toContain("<DetailsGeneric");
    }
  });

  it("uses official default Tabs composition", () => {
    const tabs = read("Tabs/index.tsx");
    expect(tabs).toContain("<TabsList>");
    expect(tabs).toContain("<TabsTrigger");
    expect(tabs).not.toContain('variant="line"');
    expect(
      fs.existsSync(path.join(__dirname, "components/theme-tab-list.tsx"))
    ).toBe(false);
  });

  it("does not pass Docusaurus visual classes into official actions", () => {
    expect(read("Navbar/MobileSidebar/Toggle/index.tsx")).not.toContain(
      "navbar__toggle"
    );
    const codeAction = read("CodeBlock/Buttons/Button/index.tsx");
    expect(codeAction).toContain('size="icon"');
    expect(codeAction).toContain(
      "theme-code-block__action absolute top-3 right-2 z-10 size-7 min-h-0 min-w-0 gap-2 rounded-md border-0 border-border bg-code"
    );
    expect(codeAction).toContain(
      'fontFamily: "var(--ifm-font-family-monospace)"'
    );
    expect(read("CodeBlock/Buttons/CopyButton/index.tsx")).toContain(
      'from "@theme/CodeBlock/Buttons/Button"'
    );
    const codeActions = read("CodeBlock/Buttons/index.tsx");
    expect(codeActions).toContain("<CopyButton />");
    expect(codeActions).not.toContain("WordWrapButton");
    const codeLayout = read("CodeBlock/Layout/index.tsx");
    const codeContent = read("CodeBlock/Content/String.tsx");
    expect(codeLayout).toContain("<figure");
    expect(codeLayout).toContain('data-rehype-pretty-code-figure=""');
    expect(codeLayout).toContain('data-rehype-pretty-code-title=""');
    expect(codeLayout).toContain("<CodeLanguageIcon");
    expect(codeLayout).not.toContain("CodeBlock/Container");
    expect(codeContent).toContain(
      'const isMultiline = props.children.replace(/\\n$/, "").includes("\\n")'
    );
    expect(codeContent).toContain(
      "showLineNumbers: props.showLineNumbers || isMultiline"
    );
    expect(read("ColorModeToggle/index.tsx")).not.toContain("buttonClassName}");
    expect(read("Navbar/Content/index.tsx")).toMatch(
      /aria-label=\{[\s\S]*windowSize === "mobile"[\s\S]*"Search documentation"/
    );
  });

  it("ships preflight, Neutral tokens, Docusaurus dark integration, and animations", () => {
    const css = read("shadcn.css");
    expect(css).toContain('@import "tailwindcss" source(none)');
    expect(css).toContain('@import "./vendor/tw-animate.css"');
    expect(css).toContain('@import "./vendor/shadcn-tailwind.css"');
    expect(css).toContain('@custom-variant dark (&:is([data-theme="dark"] *)');
    expect(css).toContain("--radius: 0.625rem");
    expect(css).toContain("--background: lab(100% 0 0)");
    expect(css).toContain("--background: lab(2.75381% 0 0)");
    expect(css).toContain("--code-highlight: lab(95.36% 0 0)");
    expect(css).toContain("--code-number: lab(48.96% 0 0)");
    expect(css).toContain("--code-highlight: lab(15.32% 0 0)");
    expect(css).toContain("--code-number: lab(67.52% -0.0000298023 0)");
    expect(css).toContain("--code-syntax-keyword: #cf222e");
    expect(css).toContain("--code-syntax-function: #8250df");
    expect(css).toContain("--code-syntax-keyword: #a0a0a0");
    expect(css).toContain("--code-syntax-function: #ffc799");
    expect(css).not.toMatch(/--text-(?:xs|sm|base|lg|xl|[2-9]xl):/);
    expect(css).toContain("--text-sm--line-height: calc(var(--spacing) * 5)");
    expect(css).toContain("--text-xs--line-height: calc(var(--spacing) * 4)");
  });

  it("keeps global docs CSS away from official data-slot visuals", () => {
    const css = read("base.scss");
    const selectors = Array.from(css.matchAll(/(?:^|})([^{}]+)\{/gm), (match) =>
      match[1].trim()
    ).filter((selector) => selector.includes("[data-slot"));

    expect(selectors.length).toBeGreaterThan(0);
    for (const selector of selectors) {
      expect(stripNotSelectors(selector)).not.toContain("[data-slot");
    }
  });

  it("contains no Radix production source", () => {
    expect(productionSource(__dirname)).not.toMatch(
      /@radix-ui|from ["']radix-ui["']/
    );
  });
});
