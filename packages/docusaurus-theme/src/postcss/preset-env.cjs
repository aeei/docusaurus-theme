const postcss = require("postcss");
const presetEnv = require("postcss-preset-env");

function isThemeStylesheet(from) {
  const normalized = String(from ?? "").replaceAll("\\", "/");
  return (
    (normalized.endsWith("/lib/theme/shadcn.scss") &&
      (normalized.includes("/@aeei/docusaurus-theme/") ||
        normalized.includes("/packages/docusaurus-theme/"))) ||
    normalized.includes("/infima/dist/css/default/")
  );
}

module.exports = function scopedPresetEnv(options = {}) {
  const consumerPlugins = presetEnv(options).plugins;
  const themePlugins = presetEnv({
    ...options,
    stage: false,
    autoprefixer: options.autoprefixer ?? {},
  }).plugins;

  return {
    postcssPlugin: "aeei-scoped-postcss-preset-env",
    async Once(root, { result }) {
      const plugins = isThemeStylesheet(result.opts.from)
        ? themePlugins
        : consumerPlugins;
      const processed = await postcss(plugins).process(root, {
        ...result.opts,
        from: result.opts.from,
        map: false,
      });
      result.messages.push(...processed.messages);
    },
  };
};

module.exports.postcss = true;
module.exports.isThemeStylesheet = isThemeStylesheet;
