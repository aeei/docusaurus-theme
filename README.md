<h1 align="center">@aeei/docusaurus-theme</h1>

<p align="center">A shadcn Base Nova theme for Docusaurus docs.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@aeei/docusaurus-theme"><img alt="npm" src="https://img.shields.io/npm/v/%40aeei%2Fdocusaurus-theme" /></a>
  <a href="./LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <a href="https://aeei.github.io/docusaurus-theme/"><img alt="Live demo" src="https://img.shields.io/badge/demo-GitHub%20Pages-222" /></a>
</p>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/theme-dark.webp">
  <img alt="aeei Docusaurus Theme documentation layout" src=".github/assets/theme-light.webp">
</picture>

## Features

- shadcn Base Nova components backed only by [Base UI](https://base-ui.com/)
- responsive navbar, collapsible sidebar, table of contents, paginator, and compact footer
- Markdown, GFM, MDX, admonitions, tabs, code blocks, and [Mermaid](https://mermaid.js.org/)
- semantic light/dark tokens owned by the consuming site
- Lucide icons and accessible keyboard/focus behavior
- precompiled theme CSS; consumers do not configure Tailwind
- optional Docusaurus Algolia DocSearch styling

## Quick start

Install the theme alongside Docusaurus classic:

```bash
npm install @aeei/docusaurus-theme \
  @docusaurus/core @docusaurus/plugin-content-docs \
  @docusaurus/preset-classic @docusaurus/theme-common
```

Register it after the classic preset:

```ts
// docusaurus.config.ts
import type { Config } from "@docusaurus/types";

const config: Config = {
  presets: ["classic"],
  themes: ["@aeei/docusaurus-theme"],
};

export default config;
```

The theme consumes semantic CSS variables rather than shipping brand values. Start from [`examples/docs-starter/src/css/tokens.css`](./examples/docs-starter/src/css/tokens.css), then edit values in your own site.

## Markdown and Mermaid

The starter demonstrates the supported authoring surface:

- [Markdown and GFM](./examples/docs-starter/docs/guides/markdown-gfm.md)
- [MDX components](./examples/docs-starter/docs/showcase/mdx-playground.mdx)
- [Mermaid diagrams](./examples/docs-starter/docs/showcase/mermaid.md)

For Mermaid, install the official Docusaurus theme and enable it:

```bash
npm install @docusaurus/theme-mermaid @mermaid-js/layout-elk
```

```ts
const config = {
  markdown: { mermaid: true },
  themes: ["@docusaurus/theme-mermaid", "@aeei/docusaurus-theme"],
};
```

## Starter

[`examples/docs-starter`](./examples/docs-starter) is both the live demo source and a copyable docs-first starter. Routine authors edit:

```text
docs/**/*.md
docs/**/*.mdx
static/**
```

Navigation is generated from the docs filesystem. Use front matter such as `sidebar_position` when ordering is needed.

## Development

```bash
yarn install
yarn workspace @aeei/docusaurus-theme build
yarn workspace @aeei/docs-starter start
```

Production checks:

```bash
yarn workspace @aeei/docusaurus-theme build
yarn workspace @aeei/docs-starter build
```

The project uses OpenSpec. Current launch artifacts live in [`openspec/changes/launch-docs-theme`](./openspec/changes/launch-docs-theme).

## Search

The first release does not reuse the upstream project's Algolia credentials. Search activates only after this site's own DocSearch application provides `ALGOLIA_APP_ID`, `ALGOLIA_SEARCH_API_KEY`, and `ALGOLIA_INDEX_NAME`. Admin keys are never accepted by the frontend.

## Roadmap

The core package is docs-only. OpenAPI rendering may return later as an optional `@aeei/docusaurus-theme-openapi` addon rather than adding API dependencies to every docs site.

## Attribution

This repository is a modified fork of [PaloAltoNetworks/docusaurus-openapi-docs](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs). It is maintained independently and is not an official Palo Alto Networks project.

See [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) and [`LICENSES/`](./LICENSES/) for Docusaurus, shadcn/ui, Base UI, Lucide, Mermaid, and upstream notices.

## License

[MIT](./LICENSE). Existing upstream copyright and permission notices are preserved.
