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

it("keeps pointer and keyboard focus signifiers on interactive controls", () => {
  const stylesheet = fs.readFileSync(stylesheetPath, "utf8");

  expect(stylesheet).toContain(
    ":where(a, button, input, select, textarea, [tabindex]):focus-visible"
  );
  expect(stylesheet).toMatch(/\[role="tab"\][\s\S]*cursor: pointer;/);
  expect(stylesheet).toMatch(
    /\[aria-disabled="true"\][\s\S]*cursor: not-allowed;/
  );
});

it("overrides the semantic b element used for the navbar title", () => {
  const stylesheet = fs.readFileSync(stylesheetPath, "utf8");

  expect(stylesheet).toMatch(/\.navbar__title\s*{\s*font-weight: 600;/);
});
