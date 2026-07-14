import fs from "fs";
import path from "path";

const componentPath = path.join(__dirname, "index.tsx");

it("closes the mobile navigation drawer when Escape is pressed", () => {
  const source = fs.readFileSync(componentPath, "utf8");

  expect(source).toContain('event.key !== "Escape"');
  expect(source).toContain("mobileSidebar.toggle()");
});
