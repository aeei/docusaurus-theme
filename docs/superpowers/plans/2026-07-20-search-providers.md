# Optional Search Providers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional `false | "local" | "algolia"` search providers to `@aeei/docusaurus-theme`, with automatic production indexing for local search and the live shadcn command-menu UI.

**Architecture:** The theme plugin validates and publishes the selected provider through Docusaurus global data. Local mode extracts deterministic section records from rendered docs during `postBuild`; the browser lazily fetches and searches that static JSON. Algolia mode keeps the Docusaurus provider but uses the same shadcn trigger and the existing token adapter.

**Tech Stack:** Docusaurus 3.10 plugin lifecycle, React 18/19, TypeScript, Cheerio, official shadcn 4.12.0 Base Nova Dialog/Command/InputGroup, Base UI, cmdk, Playwright, Jest.

## Global Constraints

- Search defaults to disabled and emits no trigger, index, or request.
- `search: "local"` automatically indexes every rendered Markdown/MDX route on each production build.
- `search: "algolia"` emits no local index and requires complete standard Docusaurus Algolia config.
- Local queries and content never leave the internal server/browser.
- Search UI follows the live `ui.shadcn.com` command-menu trigger, dialog, list, selected row, and footer geometry.
- No consumer Tailwind/Sass configuration.
- No generated OpenAPI source modification.
- No commit, push, deployment, or publication before explicit visual approval.

---

### Task 1: Provider options and deterministic local index

**Files:**

- Create: `packages/docusaurus-theme/src/search/types.ts`
- Create: `packages/docusaurus-theme/src/search/build-index.ts`
- Create: `packages/docusaurus-theme/src/search/build-index.test.ts`
- Modify: `packages/docusaurus-theme/src/index.ts`
- Modify: `packages/docusaurus-theme/package.json`

**Interfaces:**

- Produces `SearchProvider = false | "local" | "algolia"`.
- Produces `SearchRecord`, `SearchIndex`, `buildSearchIndex()` and `writeSearchIndex()`.
- Publishes `{search: {provider}}` as plugin global data.

- [ ] Write failing tests covering invalid options, disabled/Algolia no-index behavior, local route extraction, `noIndex`, fixture exclusion, heading anchors, Unicode normalization, deterministic ordering, and removed-page cleanup.
- [ ] Run `yarn jest packages/docusaurus-theme/src/search/build-index.test.ts --runInBand`; expect missing module/API failures.
- [ ] Add direct `cheerio` dependency and implement deterministic rendered-HTML extraction from `postBuild` routes into `build/search-index.json` only for local mode.
- [ ] Validate Algolia mode against `themeConfig.algolia.appId`, `apiKey`, and `indexName`; throw an actionable build error when incomplete.
- [ ] Re-run the focused Jest test; expect all assertions to pass.

### Task 2: Official Base Nova command primitives

**Files:**

- Create: `packages/docusaurus-theme/src/theme/components/ui/dialog.tsx`
- Create: `packages/docusaurus-theme/src/theme/components/ui/command.tsx`
- Create: `packages/docusaurus-theme/src/theme/components/ui/input-group.tsx`
- Create: `packages/docusaurus-theme/src/theme/components/ui/textarea.tsx`
- Create: `packages/docusaurus-theme/src/theme/components/ui/spinner.tsx`
- Modify: `packages/docusaurus-theme/src/theme/registry-source-contract.test.ts`
- Modify: `packages/docusaurus-theme/VENDORED_SOURCES.md`
- Modify: `packages/docusaurus-theme/THIRD_PARTY_NOTICES.md`
- Modify: `packages/docusaurus-theme/package.json`

**Interfaces:**

- Produces official Dialog, Command, InputGroup, Textarea, and Spinner exports.
- Command depends on `cmdk`; placeholder icons are replaced only with corresponding Lucide icons.

- [ ] Extend registry hash/source tests with the five official Base Nova files and fail before files exist.
- [ ] Copy official shadcn 4.12.0 Base sources, changing only import paths and Lucide placeholder imports.
- [ ] Add direct `cmdk` dependency and attribution/source entries.
- [ ] Run registry contract, theme build, and LSP; expect source identity and types to pass.

### Task 3: Dependency-free local ranking and live shadcn UI

**Files:**

- Create: `packages/docusaurus-theme/src/theme/components/local-search/search.ts`
- Create: `packages/docusaurus-theme/src/theme/components/local-search/search.test.ts`
- Create: `packages/docusaurus-theme/src/theme/components/local-search/index.tsx`
- Modify: `packages/docusaurus-theme/src/theme/Navbar/Content/index.tsx`
- Modify: `packages/docusaurus-theme/src/theme/base.scss`

**Interfaces:**

- Produces `searchRecords(records, query, limit = 8)`.
- Produces `<LocalSearch />` reading `/search-index.json` lazily.
- Consumes plugin global provider data.

- [ ] Write failing ranking tests for NFKC/lowercase normalization, Unicode tokens, all-token matching, title > section > body ranking, deterministic ties, snippets, and eight-result limit.
- [ ] Implement minimal dependency-free ranking and pass focused tests.
- [ ] Add the live shadcn trigger (`Search documentation…`/`Search…`), Dialog, Command input/list, selected row, loading/empty/error states, footer Enter hint, Mod+K, routing, and focus restoration.
- [ ] Keep Algolia mode behind the same trigger; disabled mode returns `null`.
- [ ] Add Playwright RED tests for disabled, local production index, open/query/select/navigate, keyboard, empty/error, mobile, light/dark, and focus restoration.
- [ ] Build and serve the starter; make Playwright tests green without local visual overrides outside the approved search composition.

### Task 4: Consumer configuration and search guide

**Files:**

- Modify: `examples/docs-starter/docusaurus.config.ts`
- Modify: `examples/docs-starter/config-contract.test.ts`
- Create: `examples/docs-starter/docs/guides/search.md`
- Modify: `examples/docs-starter/sidebars.ts`
- Modify: `packages/docusaurus-theme/README.md`
- Modify: `packages/docusaurus-theme/src/package-contract.test.ts`

**Interfaces:**

- Starter registers `["@aeei/docusaurus-theme", {search: "local"}]`.
- Public consumer example documents `{search: "algolia"}` plus standard `themeConfig.algolia`.

- [ ] Write failing config/package/docs assertions for all three provider modes and automatic MD/MDX indexing.
- [ ] Enable local mode in the starter and add the search guide with security, build/serve, exclusion, refresh, and troubleshooting sections.
- [ ] Document Algolia for public docs/blogs and prohibit Admin API keys.
- [ ] Build the starter and assert `build/search-index.json` contains the new guide route and excludes `/base-nova-parity`.

### Task 5: Exhaustive verification and evidence

**Files:**

- Modify: `scripts/sweep-responsive-routes.cjs`
- Modify: `scripts/capture-actual-route-evidence.cjs`
- Modify: `artifacts/validation/README.md`
- Modify: `artifacts/visual-approval.md`

**Interfaces:**

- Search states become mandatory actual-route evidence.

- [ ] Add search trigger/dialog/result/keyboard/focus assertions to the responsive and critical audits.
- [ ] Capture original-resolution desktop/mobile × light/dark search screenshots and compare them with live shadcn at matching states.
- [ ] Run Playwright, scoped Jest, type/LSP, theme build, starter build, isolated npm tarball build, Base Nova `406/406`, route inventory, rendered audit, shell/TOC audits, and every integer width `320..3840`.
- [ ] Run focused Prettier and `git diff --check`.
- [ ] Update validation counts and present screenshots for explicit user approval; do not commit or publish.
