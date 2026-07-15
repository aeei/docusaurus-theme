# docusaurus-theme-shadcn-docs

This theme is developed in [`aeei/docusaurus-openapi-shadcn-theme`](https://github.com/aeei/docusaurus-openapi-shadcn-theme), a modified fork of [`PaloAltoNetworks/docusaurus-openapi-docs`](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs). The original copyright and MIT License are preserved.

Reusable Docusaurus theme for Markdown docs and `docusaurus-plugin-openapi-docs` API references.

- Nextra-inspired documentation shell
- shadcn Nova / Neutral semantic-token contract
- Lucide Icons
- responsive navigation, command search provider styling, light/dark mode
- OpenAPI request, schema, response, and code-sample UI

## Install

```bash
npm install docusaurus-theme-shadcn-docs docusaurus-plugin-openapi-docs docusaurus-plugin-sass
```

No Tailwind or Sass consumer configuration is required.

## Configure Docusaurus

```ts
// docusaurus.config.ts
export default {
  themes: ["docusaurus-theme-shadcn-docs"],
  presets: [
    [
      "classic",
      {
        docs: {
          docItemComponent: "@theme/ApiItem",
        },
      },
    ],
  ],
};
```

Use `docItemComponent: "@theme/ApiItem"` only for docs instances that render generated OpenAPI MDX.

## Provide semantic tokens

The theme consumes, but never defines, these CSS custom properties:

```css
:root {
  --background: ...;
  --foreground: ...;
  --card: ...;
  --card-foreground: ...;
  --popover: ...;
  --popover-foreground: ...;
  --primary: ...;
  --primary-foreground: ...;
  --secondary: ...;
  --secondary-foreground: ...;
  --muted: ...;
  --muted-foreground: ...;
  --accent: ...;
  --accent-foreground: ...;
  --destructive: ...;
  --border: ...;
  --input: ...;
  --ring: ...;
  --chart-1: ...;
  --chart-2: ...;
  --chart-3: ...;
  --chart-4: ...;
  --chart-5: ...;
  --radius-xs-value: 0.25rem;
  --radius-sm-value: 0.375rem;
  --radius-md-value: 0.5rem;
  --radius-lg-value: 0.625rem;
  --radius-xl-value: 0.75rem;
  --radius: var(--radius-lg-value);
  --radius-sm: var(--radius-sm-value);
  --sidebar: ...;
  --sidebar-foreground: ...;
  --sidebar-primary: ...;
  --sidebar-primary-foreground: ...;
  --sidebar-accent: ...;
  --sidebar-accent-foreground: ...;
  --sidebar-border: ...;
  --sidebar-ring: ...;
}
```

Define the same token names for `[data-theme="dark"]`. The theme maps Infima variables to these tokens internally.

## OpenAPI

Use the standard `docusaurus-plugin-openapi-docs` generator. Generated MDX remains source-owned by the OpenAPI specification; do not manually edit generated files.
