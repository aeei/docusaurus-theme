# @aeei/docusaurus-theme

Compiled shadcn `4.12.0` Base Nova theme for Docusaurus docs: Base UI primitives, Neutral tokens, Geist, Lucide, local/Algolia search, Markdown copy, GFM, MDX, and Mermaid support.

Consumers need no Tailwind or Sass configuration.

## Install

```bash
npm install @aeei/docusaurus-theme \
  @docusaurus/core @docusaurus/plugin-content-docs \
  @docusaurus/preset-classic @docusaurus/theme-common
```

```ts
const config = {
  presets: ["classic"],
  themes: ["@aeei/docusaurus-theme"],
  themeConfig: {
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },
  },
};
```

Docusaurus defaults `hideable` and `respectPrefersColorScheme` to `false`. Set the values above for the complete Base Nova/Nextra shell behavior.

## Options

```ts
themes: [
  [
    "@aeei/docusaurus-theme",
    {
      search: false, // false | "local" | "algolia"
      copyPage: false,
    },
  ],
];
```

### Local search

```ts
themes: [["@aeei/docusaurus-theme", { search: "local" }]];
```

Production builds generate `build/search-index.json` automatically. Keep it behind the same auth/network boundary as private docs.

### Algolia

Use `search: "algolia"` with complete standard `themeConfig.algolia` values. Only expose a Search API key.

### Copy Page

Install the Markdown-route backend and disable its injected UI:

```bash
npm install docusaurus-plugin-copy-page-button
```

```ts
plugins: [
  [
    "docusaurus-plugin-copy-page-button",
    { injectButton: false, generateMarkdownRoutes: true },
  ],
],
themes: [["@aeei/docusaurus-theme", { copyPage: true }]],
```

The theme renders the official Base Nova `ButtonGroup`; the plugin only emits `.md` routes.

## Mermaid

```ts
markdown: { mermaid: true },
themes: ["@docusaurus/theme-mermaid", "@aeei/docusaurus-theme"],
```

Install `@docusaurus/theme-mermaid` and `@mermaid-js/layout-elk` when enabled.

## More

Repository, starter, screenshots, development, and publishing instructions:

https://github.com/aeei/docusaurus-theme

## License

MIT. See `LICENSE`, `THIRD_PARTY_NOTICES.md`, `VENDORED_SOURCES.md`, and `LICENSES/`.
