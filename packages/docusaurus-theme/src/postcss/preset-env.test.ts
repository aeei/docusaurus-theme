import postcss from "postcss";

const scopedPresetEnv = require("./preset-env.cjs");

it("limits the Base Nova PostCSS exception to the packaged theme stylesheet", async () => {
  const css = ":root { --color: lab(50% 0 0); }";
  const plugin = scopedPresetEnv({ stage: 2 });
  const theme = await postcss([plugin]).process(css, {
    from: "/app/node_modules/@aeei/docusaurus-theme/lib/theme/shadcn.scss",
  });
  const consumer = await postcss([scopedPresetEnv({ stage: 2 })]).process(css, {
    from: "/app/src/css/custom.css",
  });

  expect(theme.css).toContain("lab(50% 0 0)");
  expect(consumer.css).not.toContain("lab(50% 0 0)");
  expect(
    scopedPresetEnv.isThemeStylesheet(
      "/repo/packages/docusaurus-theme/lib/theme/shadcn.scss"
    )
  ).toBe(true);
  expect(
    scopedPresetEnv.isThemeStylesheet(
      "/repo/node_modules/infima/dist/css/default/default.css"
    )
  ).toBe(true);
  expect(
    scopedPresetEnv.isThemeStylesheet(
      "/repo/packages/other-theme/lib/theme/shadcn.scss"
    )
  ).toBe(false);
});
