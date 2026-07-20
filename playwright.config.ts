import { defineConfig } from "playwright/test";

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = externalBaseUrl ?? "http://127.0.0.1:3010/docusaurus-theme/";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "line",
  use: {
    baseURL,
    browserName: "chromium",
    colorScheme: "dark",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: externalBaseUrl
    ? undefined
    : {
        command:
          "yarn workspace @aeei/docs-starter start --port 3010 --host 127.0.0.1",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
