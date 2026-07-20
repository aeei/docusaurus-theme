# Exhaustive rendered parity design

## Objective

Restore every rendered starter element—not only synthetic fixtures—to the live shadcn Base Nova oracle, then prove coverage across every horizontal width from 320px through 3840px, including zoom-out/wide-shell behavior, without hiding integration defects.

## Diagnosis

The current prose selectors use exclusions such as `:not([data-slot] *)`. Every docs article sits inside the official Sidebar shell, whose ancestors have `data-slot`. Consequently every Markdown descendant matches `[data-slot] *` and is excluded from the prose rules. Tailwind preflight then wins: headings inherit `15px`, lists keep `list-style: none`, margins collapse, and media expands to the content width.

The existing comparator cannot catch this because it primarily targets a synthetic fixture route, mutates body typography and fixture widths, and injects floating context. The browser audit captures screenshots but neither evaluates them nor asserts Markdown semantics.

## Considered approaches

1. **Keep synthetic fixture parity and add isolated prose patches** — rejected. It repeats the blind spot and cannot prove actual-route integration.
2. **Screenshot baseline only** — rejected. It detects raster changes but cannot explain missing semantics, distinguish intended content changes, or prove element coverage.
3. **Actual-route DOM/metric contract + responsive sweep + full-resolution visual review** — selected. It combines deterministic semantic assertions, exact oracle-backed component metrics, continuous responsive coverage, and human-readable visual evidence.

## Architecture

### 1. Rendered surface inventory

Generate the route list from all starter Markdown/MDX docs and Docusaurus navigation data. On each route, enumerate every visible article and shell element with a stable surface category, selector, element index, semantic role, text fingerprint, and owning theme adapter. The validation report fails if a source route or required surface lacks coverage.

### 2. Prose isolation

Scope prose exclusions only to official component roots located _inside_ `.theme-doc-markdown`. An outer shell `[data-slot]` must never suppress article typography. Keep component interiors isolated from prose rules. Validate headings, paragraphs, lists, task lists, links, emphasis, blockquotes, inline code, code blocks, images, tables, admonitions, details, Tabs, and Mermaid containers.

Use the live `ui.shadcn.com` `.typeset` CSS snapshot as the prose SSOT, adapted only where Docusaurus integration requires it:

- preserve the separate page-title oracle for the synthetic or first content `h1`;
- exclude only article-local `[data-slot]` component roots and `.theme-code-block` interiors;
- never treat raw `svg` as prose media.

### 3. Oracle ownership

- Registry-backed UI uses the official Base Nova component source and live rendered component state.
- CodeBlock uses the live shadcn documentation code surface.
- Plain prose, TOC, Mermaid, pagination, footer, and shell-only surfaces use the live shadcn documentation shell because no registry component exists.
- No fixture width/body-font/attribute/floating-context mutation may count as actual-route proof.

### 4. Responsive verification

Sweep every integer width from `320` through `3840` for every real route in light and dark mode. At every width assert no unintended horizontal overflow, clipping, overlap, zero-area content, lost list markers, broken heading hierarchy, incorrect responsive shell mode, or uncapped wide-shell drift. Explicitly record breakpoint transitions and test `-1 / exact / +1` widths with interactions.

Full state screenshots are captured at representative widths and every discovered breakpoint boundary. Screenshots remain full resolution; contact sheets are navigation aids only and never validation evidence.

### 5. Validation outputs

Produce:

- actual-route surface inventory with coverage totals;
- responsive sweep JSON listing all widths/routes/themes;
- semantic/metric failures with selector and element index;
- original screenshots and official/local comparisons;
- focused diff images where a common oracle surface exists;
- standard Jest, TypeScript/LSP, clean builds, browser interaction audit, isolated tarball consumer build, Prettier, and diff-check logs.

## Boundaries

- Generated OpenAPI content remains untouched.
- No commit, push, deployment, or npm publication before explicit user visual approval.
- The synthetic parity fixture may remain supplemental but cannot satisfy actual-route acceptance.
- Card shadow remains the only pre-existing visual exception unless the user explicitly changes it.

## Completion rule

Work is incomplete if any rendered element is uninventoried, any width in `320–3840` is untested, any actual route/state fails, any screenshot mismatch is unexplained, or the user has not visually approved the original-resolution evidence.
