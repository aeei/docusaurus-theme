import crypto from "crypto";
import fs from "fs";
import path from "path";

const packagePath = path.join(__dirname, "..", "package.json");
const themeRoot = path.join(__dirname, "theme");

function listProductionFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listProductionFiles(entryPath);
    if (/\.test\.[jt]sx?$/.test(entry.name) || entry.name.endsWith(".d.ts")) {
      return [];
    }
    return /\.[jt]sx?$/.test(entry.name) ? [entryPath] : [];
  });
}

it("uses the public docs-only package identity and metadata", () => {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  expect(packageJson.name).toBe("@aeei/docusaurus-theme");
  expect(packageJson.version).toBe("0.1.8");
  expect(packageJson.description).toBe(
    "A shadcn Base Nova theme for Docusaurus docs."
  );
  expect(packageJson.repository).toEqual({
    type: "git",
    url: "git+https://github.com/aeei/docusaurus-theme.git",
    directory: "packages/docusaurus-theme",
  });
  expect(packageJson.bugs).toEqual({
    url: "https://github.com/aeei/docusaurus-theme/issues",
  });
  expect(packageJson.license).toBe("MIT");
  expect(packageJson.types).toBe("src/theme-classic.d.ts");
  expect(packageJson.files).toEqual(
    expect.arrayContaining([
      "lib",
      "src/theme-classic.d.ts",
      "README.md",
      "VENDORED_SOURCES.md",
    ])
  );
  expect(packageJson.keywords).toEqual(
    expect.arrayContaining(["docusaurus", "theme", "shadcn", "mermaid"])
  );
  expect(packageJson.keywords).not.toContain("openapi");
});

it("keeps only docs runtime dependencies", () => {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  const sections = [
    packageJson.dependencies,
    packageJson.devDependencies,
    packageJson.peerDependencies,
  ];

  for (const dependency of [
    "docusaurus-plugin-openapi-docs",
    "radix-ui",
    "@reduxjs/toolkit",
    "allof-merge",
    "buffer",
    "crypto-js",
    "file-saver",
    "lodash",
    "pako",
    "path-browserify",
    "postman-code-generators",
    "postman-collection",
    "process",
    "react-hook-form",
    "react-live",
    "react-magic-dropzone",
    "react-modal",
    "react-redux",
    "url",
    "xml-formatter",
    "@types/crypto-js",
    "@types/file-saver",
    "@types/lodash",
    "@types/pako",
    "@types/postman-collection",
    "@types/react-modal",
  ]) {
    for (const section of sections) {
      expect(section?.[dependency]).toBeUndefined();
    }
  }

  expect(packageJson.dependencies["@base-ui/react"]).toBeDefined();
  expect(packageJson.dependencies["lucide-react"]).toBeDefined();
  expect(packageJson.dependencies["copy-text-to-clipboard"]).toBeDefined();
  expect(packageJson.dependencies["parse-numeric-range"]).toBeDefined();
  expect(packageJson.dependencies["prism-react-renderer"]).toBeDefined();
  expect(packageJson.peerDependencies.react).toBeDefined();
  expect(packageJson.peerDependencies["react-dom"]).toBeDefined();
});

it("packs required license and provenance files", () => {
  const packageRoot = path.join(__dirname, "..");

  for (const file of [
    "LICENSE",
    "README.md",
    "THIRD_PARTY_NOTICES.md",
    "VENDORED_SOURCES.md",
  ]) {
    expect(fs.existsSync(path.join(packageRoot, file))).toBe(true);
  }

  const licenses = fs.readdirSync(path.join(packageRoot, "LICENSES"));
  expect(licenses).toContain("Pretendard-OFL-1.1.txt");

  const pretendardPath = path.join(
    packageRoot,
    "src/theme/fonts/PretendardVariable.woff2"
  );
  expect(fs.existsSync(pretendardPath)).toBe(true);
  expect(
    crypto
      .createHash("sha256")
      .update(fs.readFileSync(pretendardPath))
      .digest("hex")
  ).toBe("9599f12fd42fc0bce1cd50b47a0c022e108d7aa64dd0d1bb0ed44f3282d900b4");

  const notices = fs.readFileSync(
    path.join(packageRoot, "THIRD_PARTY_NOTICES.md"),
    "utf8"
  );
  expect(notices).toContain("orioncactus/pretendard");
  expect(notices).toContain("Pretendard-OFL-1.1.txt");
});

it("contains only docs theme production source", () => {
  const productionFiles = listProductionFiles(themeRoot).map((file) =>
    path.relative(themeRoot, file)
  );

  for (const file of productionFiles) {
    expect(file).not.toMatch(
      /(^|\/)(ApiExplorer|ApiItem|ApiTabs|DiscriminatorTabs|MimeTabs|OperationTabs|ParamsItem|Request|Response|Schema|SchemaExpansion|SchemaItem|SchemaTabs)(\/|$)/
    );
  }

  const productionSource = productionFiles
    .map((file) => fs.readFileSync(path.join(themeRoot, file), "utf8"))
    .join("\n");

  expect(productionSource).not.toContain("docusaurus-plugin-openapi-docs");
  expect(productionSource).not.toContain("schemaExpansion");
  expect(productionSource).not.toContain("authPersistence");
});
