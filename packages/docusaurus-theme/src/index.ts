/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import fs from "fs";
import path from "path";

import type { LoadContext, Plugin } from "@docusaurus/types";

import { writeSearchIndex } from "./search/build-index";
import type { DocusaurusThemeOptions, SearchProvider } from "./search/types";

export type { DocusaurusThemeOptions, SearchProvider } from "./search/types";

const PLUGIN_NAME = "@aeei/docusaurus-theme";

export function copyThemeLegalNotices(
  outDir: string,
  packageRoot = path.resolve(__dirname, "..")
) {
  const targetDir = path.join(outDir, "licenses");
  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(
    path.join(packageRoot, "LICENSE"),
    path.join(targetDir, "THEME-MIT.txt")
  );
  fs.copyFileSync(
    path.join(packageRoot, "THIRD_PARTY_NOTICES.md"),
    path.join(targetDir, "THIRD_PARTY_NOTICES.md")
  );
  for (const filename of fs.readdirSync(path.join(packageRoot, "LICENSES"))) {
    fs.copyFileSync(
      path.join(packageRoot, "LICENSES", filename),
      path.join(targetDir, filename)
    );
  }
}

export function resolveSearchProvider(
  options: DocusaurusThemeOptions = {}
): SearchProvider {
  const provider = options.search ?? false;
  if (provider !== false && provider !== "local" && provider !== "algolia") {
    throw new Error(
      `[${PLUGIN_NAME}] "search" must be false, "local", or "algolia". Received: ${JSON.stringify(provider)}`
    );
  }
  return provider;
}

function assertAlgoliaConfig(context: LoadContext) {
  const algolia = (
    context.siteConfig.themeConfig as { algolia?: Record<string, unknown> }
  ).algolia;
  const missing = ["appId", "apiKey", "indexName"].filter(
    (key) => typeof algolia?.[key] !== "string" || !algolia[key]
  );
  if (missing.length) {
    throw new Error(
      `[${PLUGIN_NAME}] search: "algolia" requires themeConfig.algolia.${missing.join(
        ", themeConfig.algolia."
      )}.`
    );
  }
}

export default function docusaurusTheme(
  context: LoadContext,
  options: DocusaurusThemeOptions = {}
): Plugin<{ provider: SearchProvider; copyPage: boolean }> {
  const provider = resolveSearchProvider(options);
  const copyPage = options.copyPage ?? false;
  if (typeof copyPage !== "boolean") {
    throw new Error(
      `[${PLUGIN_NAME}] "copyPage" must be true or false. Received: ${JSON.stringify(options.copyPage)}`
    );
  }
  if (provider === "algolia") assertAlgoliaConfig(context);

  return {
    name: PLUGIN_NAME,

    loadContent() {
      return { provider, copyPage };
    },

    contentLoaded({ content, actions }) {
      actions.setGlobalData({
        search: { provider: content.provider },
        copyPage: { enabled: content.copyPage },
      });
    },

    async postBuild({ outDir, baseUrl, routesPaths, routesBuildMetadata }) {
      copyThemeLegalNotices(outDir);
      if (provider !== "local") return;
      const noIndexRoutes = new Set(
        Object.entries(routesBuildMetadata)
          .filter(([, metadata]) => metadata.noIndex)
          .map(([route]) => route)
      );
      await writeSearchIndex({ outDir, baseUrl, routesPaths, noIndexRoutes });
    },

    getClientModules() {
      return [
        require.resolve(path.join(__dirname, "theme", "shadcn.scss")),
        require.resolve(path.join(__dirname, "theme", "styles.scss")),
      ];
    },

    configurePostCss(postCssOptions) {
      for (const plugin of postCssOptions.plugins ?? []) {
        if (
          Array.isArray(plugin) &&
          String(plugin[0]).includes("postcss-preset-env")
        ) {
          plugin[0] = require.resolve(
            path.join(__dirname, "postcss", "preset-env.cjs")
          );
        }
      }
      return postCssOptions;
    },

    getThemePath() {
      return path.resolve(__dirname, "..", "lib-theme", "theme");
    },

    getTypeScriptThemePath() {
      return path.resolve(__dirname, "..", "src", "theme");
    },

    configureWebpack(config, isServer, { getStyleLoaders }) {
      const hasSassLoader = (config.module?.rules ?? []).some(
        (rule: any) => String(rule.test) === String(/\.s[ca]ss$/)
      );
      const layerLoader = path.join(__dirname, "loaders", "layer-infima.cjs");
      const infimaPattern =
        /(?:^|[\\/])infima[\\/]dist[\\/]css[\\/]default[\\/]default(?:-rtl)?\.css$/;

      return {
        module: {
          rules: [
            {
              test: infimaPattern,
              enforce: "pre",
              use: [{ loader: layerLoader }],
            },
            ...(!hasSassLoader
              ? [
                  {
                    test: /\.s[ac]ss$/,
                    include: path.resolve(__dirname, "theme"),
                    use: [
                      ...getStyleLoaders(isServer, {}),
                      { loader: require.resolve("sass-loader") },
                    ],
                  },
                ]
              : []),
          ],
        },
      };
    },
  };
}
