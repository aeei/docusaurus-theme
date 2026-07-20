# Optional Docs Search Providers Design

## Objective

Add optional local and Algolia search providers to `@aeei/docusaurus-theme` without consumer Tailwind/Sass configuration. Internal docs use the self-hosted local index; public docs/blogs may use Docusaurus’ first-class Algolia integration.

The local feature is intentionally modest: reliable title, heading, and body keyword search with a Base Nova command dialog. It does not provide analytics, typo-tolerant AI search, synonyms, or cross-site federation.

## Consumer API

Search is disabled by default. Consumers choose one provider through the existing Docusaurus theme registration.

Internal/self-hosted docs use the built-in local provider; no separate plugin is required:

```ts
themes: [
  "@docusaurus/theme-mermaid",
  ["@aeei/docusaurus-theme", { search: "local" }],
];
```

Public documentation or blogs can use Docusaurus’ first-class Algolia integration:

```ts
themes: [
  "@docusaurus/theme-mermaid",
  ["@aeei/docusaurus-theme", { search: "algolia" }],
];

themeConfig: {
  algolia: {
    appId: process.env.ALGOLIA_APP_ID,
    apiKey: process.env.ALGOLIA_SEARCH_API_KEY,
    indexName: process.env.ALGOLIA_INDEX_NAME,
  },
}
```

The theme exports this stable option:

```ts
export type DocusaurusThemeOptions = {
  search?: false | "local" | "algolia";
};
```

Behavior:

- `search` omitted or `false`: no trigger, no local index, and no search request.
- `search: "local"`: generate the local index and render the Base Nova command dialog.
- `search: "algolia"`: do not generate a local index; use Docusaurus’ Algolia provider behind the same Base Nova trigger and a token-driven Base Nova DocSearch adapter.
- `search: "algolia"` without a complete `themeConfig.algolia` fails the build with an actionable configuration error.
- The included internal starter enables `search: "local"` as the working example.
- Result limits and ranking remain theme-owned defaults; no speculative configuration surface is exposed.

## Security boundary

- Search queries and indexed content never leave the browser or the internal server.
- `search-index.json` contains searchable documentation text and must remain behind the same network/auth boundary as the rendered documentation.
- Navigation, footer, test fixtures, and elements explicitly marked for exclusion are not indexed.

## Index generation

When `search: "local"`, `@aeei/docusaurus-theme` generates `search-index.json` in the Docusaurus production output during `postBuild`. Algolia and disabled modes never emit this file.

The generator scans rendered HTML, selects the rendered documentation article, and emits section records containing:

```ts
type SearchRecord = {
  id: string;
  url: string;
  pageTitle: string;
  sectionTitle: string;
  text: string;
};
```

Rules:

- One page-level record plus one record per rendered heading section.
- Index page title, heading text, paragraphs, lists, tables, and inline code.
- Exclude navigation, footer, hidden content, the `/base-nova-parity` fixture, and elements marked `data-search-exclude`.
- Normalize whitespace and Unicode with `NFKC`; preserve original text for snippets.
- Generate deterministic JSON ordering so unchanged docs produce unchanged output.
- Every Markdown/MDX route added to Docusaurus is automatically included on the next production build; consumers never maintain a page list.
- Edited documents update and removed documents disappear on the next clean build.
- Search is supported in production `build` + `serve`; the dialog shows a clear unavailable state if the index is absent during development.

## Search behavior

The browser lazily fetches the index the first time the dialog opens and caches it for the session.

Matching is deliberately simple and dependency-free:

- Normalize the query with `NFKC` and lowercase it.
- Split on Unicode letter/number boundaries.
- Require every query token to occur in the record.
- Rank page-title matches above section-title matches, and section-title matches above body matches.
- Prefer exact and prefix matches over body substring matches.
- Return at most eight results.
- Generate a short plain-text snippet around the first body match.

No fuzzy typo correction, stemming, remote requests, or analytics.

## UI composition

Use official shadcn 4.12.0 Base Nova registry components for the shared trigger and local provider:

- Existing official `Button` trigger.
- Official `Dialog`, `Command`, and `InputGroup` sources.
- Lucide `Search`, `FileText`, and `CornerDownLeft` icons.

Algolia owns its modal DOM. Its adapter must map every visible rest/hover/focus/selected/loading/empty/mobile/dark metric to the corresponding Base Nova Command/Dialog surface without changing Algolia behavior or accessibility.

Desktop trigger: `Search` plus `⌘ K`/`Ctrl K`. Mobile trigger: icon-only Button with `Search documentation` accessible name.

Dialog behavior:

- Open from trigger or Mod+K.
- Autofocus the command input.
- Show loading, empty-query guidance, no-results, unavailable-index, and result states.
- Arrow keys move selection; Enter navigates; Escape closes and restores trigger focus.
- Results show page title, optional section title, and one snippet.
- Use Docusaurus routing for same-site navigation.
- Light/dark, mobile/desktop, focus-visible, selected, loading, empty, error, and open states follow official Base Nova metrics.

## Documentation

Add `examples/docs-starter/docs/guides/search.md` and include it in the Guides sidebar. It explains:

- Choosing `false`, `"local"`, or `"algolia"` in the theme options.
- Local search requires no credentials and keeps content internal.
- Algolia setup for public docs/blogs, including Search-only key usage, crawler requirements, and the prohibition on exposing an Admin API key.
- Production build/serve behavior.
- What content is indexed and excluded.
- `data-search-exclude` usage.
- Index refresh on each deployment.
- The requirement that `search-index.json` remain behind the same auth/network boundary.
- Troubleshooting for a missing or stale index.

Remove the unused Algolia environment/config branch and DocSearch-only adapter styles from the starter/theme.

## Validation

- Unit tests for provider option validation, disabled/local/Algolia output, Algolia configuration failure, automatic new-route indexing, deterministic HTML extraction, normalization, ranking, snippets, exclusions, and result limits.
- Contract tests for exact official Dialog/Command/InputGroup registry sources.
- Playwright tests for trigger, Mod+K, lazy loading, query results, keyboard selection, routing, Escape focus restoration, mobile, light/dark, empty, and unavailable-index states.
- Confirm index generation in starter production build and isolated npm tarball consumer build.
- Re-run the full `320..3840` responsive sweep, route inventory, Base Nova comparison, builds, LSP, Prettier, and `git diff --check`.
- No commit, push, deployment, or publication before explicit user visual approval.
