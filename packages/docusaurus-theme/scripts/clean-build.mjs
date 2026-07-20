import fs from "node:fs";

for (const directory of ["lib", "lib-theme"]) {
  fs.rmSync(directory, { recursive: true, force: true });
}
