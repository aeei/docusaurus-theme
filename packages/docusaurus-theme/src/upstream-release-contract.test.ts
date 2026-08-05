import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../../..");
const versionScript = fs.readFileSync(
  path.join(root, "scripts/version.ts"),
  "utf8"
);
const templatePackage = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "packages/create-docusaurus-openapi-docs/templates/default/package.json"
    ),
    "utf8"
  )
);

it("bumps the theme dependency that the generated template actually uses", () => {
  expect(templatePackage.dependencies).toHaveProperty(
    "docusaurus-theme-openapi-docs"
  );
  expect(versionScript).toContain(
    'templatePkg.dependencies["docusaurus-theme-openapi-docs"] = nextVersion;'
  );
  expect(versionScript).not.toContain("docusaurus-theme-shadcn-docs");
});
