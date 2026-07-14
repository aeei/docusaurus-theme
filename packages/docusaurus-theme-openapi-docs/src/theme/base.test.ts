import fs from "fs";
import path from "path";

const stylesheetPath = path.join(__dirname, "base.scss");

it("uses only the public semantic color token contract", () => {
  const stylesheet = fs.readFileSync(stylesheetPath, "utf8");
  const forbiddenToken = /--(?:docs|api|openapi|nextra|fumadocs)-/;
  const hardcodedColor = /#[\da-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i;

  expect(stylesheet).not.toMatch(forbiddenToken);
  expect(stylesheet).not.toMatch(hardcodedColor);
});
