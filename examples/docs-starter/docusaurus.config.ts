import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import { themes as prismThemes } from "prism-react-renderer";

const algolia =
  process.env.ALGOLIA_APP_ID &&
  process.env.ALGOLIA_SEARCH_API_KEY &&
  process.env.ALGOLIA_INDEX_NAME
    ? {
        appId: process.env.ALGOLIA_APP_ID,
        apiKey: process.env.ALGOLIA_SEARCH_API_KEY,
        indexName: process.env.ALGOLIA_INDEX_NAME,
      }
    : undefined;

const config: Config = {
  title: "Docusaurus Theme",
  tagline: "A docs-first starter for @aeei/docusaurus-theme.",
  favicon: "img/favicon.svg",
  url: "https://aeei.github.io",
  baseUrl: "/docusaurus-theme/",
  organizationName: "aeei",
  projectName: "docusaurus-theme",
  onBrokenLinks: "throw",
  onBrokenAnchors: "throw",
  trailingSlash: false,

  markdown: { mermaid: true },
  themes: ["@docusaurus/theme-mermaid", "@aeei/docusaurus-theme"],

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/aeei/docusaurus-theme/edit/shadcn-theme/examples/docs-starter/",
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        },
        blog: false,
        pages: false,
        theme: {
          customCss: ["./src/css/tokens.css", "./src/css/custom.css"],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/social-card.svg",
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: { hideable: true, autoCollapseCategories: false },
    },
    navbar: {
      title: "Docusaurus Theme",
      items: [
        { type: "doc", docId: "intro", label: "Docs", position: "left" },
        {
          label: "Showcase",
          position: "left",
          items: [
            { label: "Markdown + GFM", to: "/guides/markdown-gfm" },
            { label: "MDX", to: "/showcase/mdx-playground" },
            { label: "Mermaid", to: "/showcase/mermaid" },
          ],
        },
        {
          href: "https://github.com/aeei/docusaurus-theme",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Docs",
          items: [
            { label: "Getting started", to: "/" },
            { label: "Markdown + GFM", to: "/guides/markdown-gfm" },
            { label: "Mermaid", to: "/showcase/mermaid" },
          ],
        },
        {
          title: "Project",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/aeei/docusaurus-theme",
            },
            {
              label: "MIT",
              href: "https://github.com/aeei/docusaurus-theme/blob/shadcn-theme/LICENSE",
            },
            {
              label: "Third-party notices",
              href: "https://github.com/aeei/docusaurus-theme/blob/shadcn-theme/THIRD_PARTY_NOTICES.md",
            },
          ],
        },
        {
          title: "Credits",
          items: [
            { label: "Docusaurus", href: "https://docusaurus.io" },
            {
              label: "Docusaurus OpenAPI Docs",
              href: "https://github.com/PaloAltoNetworks/docusaurus-openapi-docs",
            },
          ],
        },
      ],
      copyright:
        "Docusaurus Theme · Maintained by aeei · Based on Docusaurus OpenAPI Docs by Palo Alto Networks",
    },
    ...(algolia ? { algolia } : {}),
    prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula },
  } satisfies Preset.ThemeConfig,
};

export default config;
