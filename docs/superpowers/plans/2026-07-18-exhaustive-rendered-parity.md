# Exhaustive Rendered Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore every actual starter route surface and prove correct rendering at every horizontal width from 320px through 3840px, including zoom-out/wide-shell behavior.

**Architecture:** Replace the broken prose exclusion boundary at its source, then make actual-route DOM inventory and responsive sweep the primary acceptance path. Keep synthetic component parity only as supplemental evidence. Full-resolution screenshots and live-oracle comparisons remain mandatory before user approval.

**Tech Stack:** Docusaurus 3.10, React, TypeScript, Sass, Tailwind CSS 4, Base UI, shadcn Base Nova, Playwright, Jest.

## Global Constraints

- Live `ui.shadcn.com` rendered examples win when registry source conflicts.
- Registry-backed UI stays on official Base Nova component source.
- Plain prose/shell surfaces use the live shadcn docs shell oracle.
- Generated OpenAPI content is not modified.
- No commit, push, deployment, or publication before explicit visual approval.
- Card shadow removal remains the only pre-approved visual exception.
- Missing selectors, routes, surfaces, widths, themes, or states fail validation.

---

### Task 1: Actual-route prose regression contract

**Files:**

- Create: `scripts/audit-rendered-surfaces.cjs`
- Create: `artifacts/rendered-surfaces/inventory.json`
- Test: `packages/docusaurus-theme/src/theme/prose-contract.test.ts`

**Interfaces:**

- Produces: `inventoryRoute(page, route, viewport, theme): Promise<RouteInventory>`.
- Produces: a JSON row for every visible article element with route, selector, index, text fingerprint, role, computed metrics, and screenshot path.

- [ ] **Step 1: Write a failing source contract**

Assert that every prose selector excludes only `.theme-doc-markdown [data-slot]` descendants and never uses bare `:not([data-slot] *)`.

- [ ] **Step 2: Write failing browser assertions**

For `/guides/markdown-gfm`, require:

```js
assert(h1.fontSize !== paragraph.fontSize);
assert(h2.fontSize !== paragraph.fontSize);
assert(ul.listStyleType !== "none");
assert(ol.listStyleType !== "none");
assert(li.display === "list-item");
assert(blockquote.paddingLeft !== "0px");
assert(image.rect.width <= image.naturalWidth);
```

Missing required selectors throw instead of returning.

- [ ] **Step 3: Run and preserve the red result**

Run: `node scripts/audit-rendered-surfaces.cjs --route guides/markdown-gfm --width 1440 --theme dark`

Expected: FAIL for heading scale, list markers, blockquote spacing, and oversized image.

---

### Task 2: Repair prose/component cascade ownership

**Files:**

- Modify: `packages/docusaurus-theme/src/theme/base.scss:346-526`
- Modify: `packages/docusaurus-theme/src/theme/base.test.ts`
- Test: `packages/docusaurus-theme/src/theme/prose-contract.test.ts`

**Interfaces:**

- Consumes: failing selectors and metrics from Task 1.
- Produces: prose rules that apply to article elements while excluding official components nested inside the article.

- [ ] **Step 1: Replace the invalid exclusion boundary**

Use article-local component exclusions equivalent to:

```scss
:not(
  .theme-doc-markdown [data-slot],
  .theme-doc-markdown [data-slot] *
)
```

Do not match outer shell slots such as `sidebar-inset`.

- [ ] **Step 2: Restore semantic visual surfaces**

Set explicit oracle-backed heading scale/rhythm, paragraph rhythm, list markers/indentation/nesting, task-list alignment, blockquote spacing, inline-code treatment, and bounded media behavior. Keep table, Alert, Accordion, Tabs, Card, and CodeBlock interiors outside prose selectors.

- [ ] **Step 3: Run focused tests**

Run:

```bash
yarn jest packages/docusaurus-theme/src/theme/base.test.ts packages/docusaurus-theme/src/theme/prose-contract.test.ts --runInBand
node scripts/audit-rendered-surfaces.cjs --route guides/markdown-gfm --width 1440 --theme dark
```

Expected: PASS with no suppressed Markdown surfaces.

---

### Task 3: Exhaustive real-route surface inventory

**Files:**

- Modify: `scripts/audit-rendered-surfaces.cjs`
- Create: `artifacts/rendered-surfaces/inventory.json`
- Create: `artifacts/rendered-surfaces/coverage.md`

**Interfaces:**

- Produces: `discoverRoutes(): string[]` from docs source, sidebar, navbar, and footer data.
- Produces: coverage counts by route, category, selector, state, viewport, and theme.

- [ ] **Step 1: Discover routes instead of hard-coding them**

Map every `examples/docs-starter/docs/**/*.{md,mdx}` file to a route and merge internal routes from Docusaurus output. Fail when any source doc lacks an audited URL.

- [ ] **Step 2: Enumerate every rendered category**

Inventory article prose plus Navbar, NavigationMenu, Sidebar, Breadcrumb, TOC, footer, pagination, edit link, BackToTop, Sheet, theme menu, Tooltip, Alert, Accordion, Tabs, Card, Table, CodeBlock, Mermaid, and every visible child instance.

- [ ] **Step 3: Add semantic and ownership checks**

Each row records its official component or shell oracle. Unknown ownership fails coverage generation.

---

### Task 4: Continuous responsive sweep and real interactions

**Files:**

- Create: `scripts/sweep-responsive-routes.cjs`
- Modify: `scripts/audit-docs-starter.cjs`
- Create: `artifacts/responsive-sweep/results.json`
- Create: `artifacts/responsive-sweep/report.md`

**Interfaces:**

- Consumes: discovered routes and surface categories from Task 3.
- Produces: one result per route × theme × width (`320..3840`).

- [ ] **Step 1: Sweep every integer width**

At each width, use a fixed representative height and assert:

```js
scrollWidth <= clientWidth
no visible element has zero width or height
no element overlaps fixed Navbar/Sidebar/Sheet boundaries
all list markers and heading hierarchy remain valid
shell mode matches the observed breakpoint state
```

- [ ] **Step 2: Detect breakpoint transitions**

Record every width where Navbar, Sidebar, TOC, Sheet, table, code, or content geometry changes mode. Re-run `-1 / exact / +1` with hover, keyboard focus, active, open, expanded, selected, disabled, loading, Escape, focus restoration, and scroll states.

- [ ] **Step 3: Remove blind exceptions**

Do not exempt table containers or CodeBlocks from overflow checks. Require intended internal scrolling and prohibit page-level overflow/clipping.

---

### Task 5: Oracle comparison, original screenshots, and release validation

**Files:**

- Modify: `scripts/compare-base-nova.cjs`
- Create: `artifacts/actual-route-parity/report.md`
- Create: `artifacts/actual-route-parity/results.json`
- Create: original screenshots and focused diffs under `artifacts/actual-route-parity/`
- Modify: `artifacts/visual-approval.md`

**Interfaces:**

- Consumes: actual-route inventory and breakpoint results.
- Produces: element-indexed official/local evidence without body/font/width/attribute/floating-context mutation.

- [ ] **Step 1: Compare actual callsites**

Use real user routes and interactions. Synthetic fixtures remain supplemental and cannot satisfy completion.

- [ ] **Step 2: Capture original-resolution evidence**

Capture every route in light/dark at discovered breakpoints and interaction states. Contact sheets are indexes only. Review original PNGs and store focused official/local comparisons.

- [ ] **Step 3: Run final validation**

```bash
yarn jest --runInBand --testPathIgnorePatterns='packages/docusaurus-plugin-openapi-docs/src/markdown/createSchema.test.ts'
yarn tsc -p examples/docs-starter/tsconfig.json --noEmit
yarn workspace @aeei/docusaurus-theme build
yarn workspace @aeei/docs-starter build
node scripts/audit-rendered-surfaces.cjs
node scripts/sweep-responsive-routes.cjs
node scripts/audit-docs-starter.cjs
git diff --check
```

Pack `@aeei/docusaurus-theme@0.1.0`, install it into an isolated copy of the starter, and run its production build.

- [ ] **Step 4: Stop at visual approval**

Present original screenshots, coverage, responsive sweep, actual-route parity, and residual risks. Do not commit, push, deploy, or publish until the user explicitly approves.
