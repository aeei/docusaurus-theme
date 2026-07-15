import fs from "fs";
import path from "path";

const packagePath = path.join(__dirname, "..", "package.json");

it("uses the public shadcn theme package identity", () => {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  expect(packageJson.name).toBe("docusaurus-theme-shadcn-docs");
  expect(packageJson.dependencies["lucide-react"]).toBeDefined();
});
