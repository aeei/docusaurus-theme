---
sidebar_position: 2
title: Search and Copy Page
---

# Search and Copy Page

## Local search

Enable build-time search in the theme options:

```ts
const config = {
  themes: [["@aeei/docusaurus-theme", { search: "local" }]],
};
```

`docusaurus build` extracts rendered Markdown and MDX routes into `build/search-index.json`. New and edited docs are included automatically on every production build.

The browser loads the index only when search opens. Keep both the rendered docs and `search-index.json` behind the same auth and network boundary.

### Verify locally

```bash
npm run build
npm run serve
```

Development mode does not create the production index. Use build + serve when validating results.

## Algolia

Public documentation can use Algolia instead:

```ts
const config = {
  themes: [["@aeei/docusaurus-theme", { search: "algolia" }]],
  themeConfig: {
    algolia: {
      appId: process.env.ALGOLIA_APP_ID,
      apiKey: process.env.ALGOLIA_SEARCH_API_KEY,
      indexName: process.env.ALGOLIA_INDEX_NAME,
    },
  },
};
```

Use a Search API key. Never expose an Admin API key in browser configuration.

## Copy Page

Install the Markdown-route backend:

```bash
npm install docusaurus-plugin-copy-page-button
```

Disable its injected UI and let the theme render Base Nova controls:

```ts
const config = {
  plugins: [
    [
      "docusaurus-plugin-copy-page-button",
      { injectButton: false, generateMarkdownRoutes: true },
    ],
  ],
  themes: [["@aeei/docusaurus-theme", { copyPage: true }]],
};
```

The primary action copies the current page as Markdown. The menu can open the generated `.md` route or copy its URL.

## Troubleshooting

- No local results: run a production build and confirm `build/search-index.json` exists.
- Copy fails: confirm the matching `.md` route returns HTTP 200.
- Search trigger missing: verify `search` is exactly `"local"` or `"algolia"`.
- Copy control missing: enable `copyPage` and configure the plugin with `generateMarkdownRoutes: true`.
