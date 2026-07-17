import fs from "node:fs";
import path from "node:path";

const source = path.resolve("src/theme");
const destination = path.resolve("lib-theme/theme");

fs.cpSync(source, destination, {
  recursive: true,
  filter(file) {
    return !/\.tsx?$|\.test\.[jt]sx?$/.test(file);
  },
});
