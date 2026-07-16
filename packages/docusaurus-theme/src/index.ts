/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import path from "path";

import type { Plugin } from "@docusaurus/types";

export default function docusaurusTheme(): Plugin<void> {
  return {
    name: "@aeei/docusaurus-theme",

    getClientModules() {
      return [
        require.resolve(path.join(__dirname, "theme", "shadcn.scss")),
        require.resolve(path.join(__dirname, "theme", "styles.scss")),
      ];
    },

    getThemePath() {
      return path.join(__dirname, "theme");
    },

    getTypeScriptThemePath() {
      return path.resolve(__dirname, "..", "src", "theme");
    },

    configureWebpack(config, isServer, { getStyleLoaders }) {
      const hasSassLoader = (config.module?.rules ?? []).some(
        (rule: any) => String(rule.test) === String(/\.s[ca]ss$/)
      );

      if (hasSassLoader) return {};

      return {
        module: {
          rules: [
            {
              test: /\.s[ac]ss$/,
              include: path.resolve(__dirname, "theme"),
              use: [
                ...getStyleLoaders(isServer, {}),
                { loader: require.resolve("sass-loader") },
              ],
            },
          ],
        },
      };
    },
  };
}
