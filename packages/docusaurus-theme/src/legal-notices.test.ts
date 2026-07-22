import fs from "fs";
import os from "os";
import path from "path";

import { copyThemeLegalNotices } from "./index";

it("copies the theme license and every bundled third-party notice into consumer builds", () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "aeei-theme-legal-"));

  copyThemeLegalNotices(outDir);

  const licensesDir = path.join(outDir, "licenses");
  expect(fs.existsSync(path.join(licensesDir, "THEME-MIT.txt"))).toBe(true);
  expect(fs.existsSync(path.join(licensesDir, "THIRD_PARTY_NOTICES.md"))).toBe(
    true
  );
  expect(fs.existsSync(path.join(licensesDir, "Geist-OFL.txt"))).toBe(true);
  expect(fs.existsSync(path.join(licensesDir, "Pretendard-OFL-1.1.txt"))).toBe(
    true
  );

  fs.rmSync(outDir, { recursive: true, force: true });
});
