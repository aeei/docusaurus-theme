# Base Nova 0px Parity — Root Cause Diagnosis

Status: root causes confirmed and restoration implemented; final full-matrix validation in progress.

## Oracle

- Rendered reference: `https://ui.shadcn.com/docs/components/base/*`
- Registry reference: `npx shadcn@4.12.0 add ...` with:
  - `style: base-nova`
  - Base UI
  - `baseColor: neutral`
  - Lucide
- Reproducible generated reference: `/tmp/base-nova-exact/src/components/ui`
- Official rendered metric inventory: `/tmp/official-slot-inventory.json`
- Current local metric inventory: `/tmp/local-slot-inventory.json`

## Root causes

### 1. Tailwind preflight is missing

`packages/docusaurus-theme/src/theme/shadcn.css` imports only:

```css
@import "tailwindcss/theme";
@import "tailwindcss/utilities";
```

It does not import Tailwind preflight. Official examples use the full official CSS stack. As a result, native browser styles remain active on Base UI elements.

Observed effect:

- official ghost/icon Button rest background: transparent
- local hamburger, CodeBlock action, and disclosure trigger rest background: browser `buttonface`, `rgb(239, 239, 239)`
- local buttons also retain native box metrics in some Docusaurus seams

This is the direct cause of the unexpected gray hamburger and CodeBlock button backgrounds.

### 2. Official text scale was overwritten (resolved)

The previous implementation remapped Tailwind UI text tokens to consumer prose tokens. The current theme keeps the official Base Nova/Tailwind text scale intact and owns separate `--theme-text-*` aliases only for Docusaurus shell typography.

### 3. Official registry files were locally forked

Examples:

- `components/ui/button.tsx`
  - local additions: `cursor-pointer`, `disabled:cursor-not-allowed`
- `components/ui/card.tsx`
  - official: `text-base leading-snug font-medium`
  - former local fork: custom heading/line-height classes
- `components/ui/badge.tsx`
  - local-only `code` and `codeCompact` variants
- `components/ui/alert.tsx`
  - local content-flow behavior inside the official primitive
- `components/ui/sidebar.tsx`
  - local reset/behavior classes mixed into registry source

The official component files are therefore not the actual SSOT.

### 4. Callsites alter official visual behavior

Examples:

- `components/theme-tab-list.tsx`
  - forces `variant="line"`
  - adds horizontal scroller, border, `rounded-none`, width rules
- `DocCard/Layout/index.tsx`
  - adds hover background and layout classes
- `Details/index.tsx` and `TOCCollapsible/*`
  - separately compose and style the same disclosure behavior
- `Navbar/MobileSidebar/Layout/index.tsx`
  - applies a custom Sheet shell
- `DocSidebar/Desktop/index.tsx`
  - forces sticky/custom footer sizing and surface classes
- CodeBlock action adapters pass Docusaurus class names into Button

The final DOM class list is not the official example class list.

### 5. Global adapter CSS overrides component slots

`packages/docusaurus-theme/src/theme/base.scss` visually restyles official seams:

- mobile Sheet width/padding/header/actions
- Sidebar position/height/background
- Sidebar menu/link/font/radius/padding
- mobile TOC trigger/background
- Table head/cell/row behavior
- dropdown/focus behavior
- global focus outline

The Sidebar registry source declares a fixed container, but `base.scss` changes it to sticky. This causes the LNB to leave the viewport near the document footer.

The Sheet uses `z-50`, while the Docusaurus navbar remains above it. The Sheet header is rendered behind the navbar, hiding theme and close actions and making the panel appear to start below the header.

### 6. The wrong disclosure component is used

Official rendered reference provides styled `Accordion`:

- trigger: `384 × 42px`
- trigger padding: `10px 0`
- trigger text: `14px / 20px`, weight `500`
- icon: `16 × 16px`
- transparent rest background

Local `On this page` and `Expandable details` use separately styled Collapsible + Button compositions:

- local trigger: `32px` high
- padding: `1px 10px`
- text: `14px / 21px`
- rest background: `rgb(239, 239, 239)`
- bordered/card wrappers differ between the two callsites

They cannot be identical because they do not share the official Accordion component.

### 7. Official Tabs are replaced by a custom line-tab composition

Official default example:

- Tabs gap: `8px`
- TabsList: height `32px`, padding `3px`, radius `10px`, muted background
- TabsTrigger: height `25px`, padding `2px 6px`, radius `8px`, `14px / 20px`
- selected trigger: background + shadow from official default variant

Local Docusaurus Tabs:

- forces line variant
- TabsList radius: `0px`
- TabsList background: transparent
- custom bottom border/indicator
- trigger line-height: `21px`

The small/inconsistent appearance is caused by intentionally selecting and modifying a different variant.

### 8. Official animation CSS stack is incomplete

DropdownMenu and Tooltip use `animate-in`, `fade-in`, `zoom-in`, and related utilities, but the package does not include/import the official animation CSS dependency. Open/close state parity is therefore not guaranteed.

### 9. Current tests preserve the fork

Current contract tests assert local inline class fragments and custom variants. They do not compare official registry output or official rendered metrics. A green test run therefore proves internal consistency, not official parity.

## Measured rest-state deltas

| Component        | Official rendered example                    | Current local                                 | Confirmed delta/cause                       |
| ---------------- | -------------------------------------------- | --------------------------------------------- | ------------------------------------------- |
| Button text      | Geist, `14/20px`                             | Inter, `14/21px`                              | font + line-height token remap              |
| Ghost Button bg  | transparent                                  | `rgb(239,239,239)`                            | missing preflight/native buttonface         |
| TabsList         | `32px`, `p:3px`, `r:10px`, muted bg          | `32px`, `p:3px`, `r:0px`, transparent         | forced custom line variant                  |
| TabsTrigger      | `25px`, `14/20px`                            | `25px`, `14/21px`                             | text token remap                            |
| Card             | `gap:16px`, `r:14px`, `14/20px`              | `gap:16px`, `r:12px`, `14/21px`               | radius/token and type remap                 |
| CardTitle        | `16/22px`                                    | `17/25.5px`                                   | local CardTitle fork + `text-base` remap    |
| Alert            | `p:8px 10px`, `r:10px`, `14/20px`            | same padding/radius, `14/21px`, tone surfaces | type remap + callsite tone visual overrides |
| TableHead        | `40px`, `p:0 8px`, `14/20px`                 | `40px`, `p:0 8px`, `14/21px`                  | type remap                                  |
| TableCell        | official row `37px`, `14/20px`               | local rows `37.5–39.3px`, `14/21px`           | type remap/prose content metrics            |
| AccordionTrigger | `42px`, `p:10px 0`, transparent              | `32px`, `p:1px 10px`, native gray             | wrong component + missing preflight         |
| Mobile Sheet     | viewport overlay with visible header/actions | panel appears below navbar; actions hidden    | z-index conflict/custom shell               |
| Desktop Sidebar  | fixed viewport panel                         | constrained sticky panel                      | `base.scss` position override               |

## Required correction order

1. Restore official CSS stack/preflight and official UI font/text/radius metrics.
2. Replace local UI files with exact generated Base Nova registry files.
3. Use official Accordion for both disclosure callsites.
4. Remove visual callsite classes and `[data-slot]` global overrides.
5. Re-measure all states and iterate until every required delta is zero.

No implementation is considered complete until the state matrix includes rest, hover, focus, focus-visible, active/pressed, open/expanded, selected/current, disabled, loading, light, and dark.

## Restoration result

- Full Tailwind preflight, official Base Nova variants, `tw-animate-css`, Geist Sans/Mono, and Neutral light/dark tokens now ship in compiled package CSS.
- The used `components/ui/**` files match the `shadcn@4.12.0` generated `base-nova` sources after normalizing only import paths and required React imports.
- `Details` and mobile `On this page` now share the official Accordion.
- Docusaurus Tabs use the official default Tabs composition.
- Hamburger, theme, Sheet close, BackToTop, edit, and CodeBlock actions use official Button variants/sizes without incoming visual classes.
- Mobile navigation uses official Sheet and Sidebar composition; Sheet now layers above the Docusaurus navbar.
- Desktop docs navigation retains the official fixed Sidebar container, offset only for the structural Docusaurus navbar.
- The Infima stylesheet is isolated in a lower cascade layer and its generic global table skin is removed before compilation, so the untouched official Table source remains the visual SSOT.
- Tailwind color-mix fallbacks are normalized without reordering state rules; this preserves official selected/focus/dark precedence after Docusaurus production minification.
- Docusaurus CSS minification had shortened Tailwind's exact `calc(1.25 / .875)` `text-sm` line-height ratio to `1.42857`. That produced accumulated `0.015625px`–`0.484375px` component-height drift. The theme now emits exact spacing-derived Tailwind line-height tokens, so production CSS retains the official `16/20/24/28px` metrics.
- `base.scss` contains no direct official `[data-slot]` visual rule. Docs prose selectors explicitly exclude component interiors.
- The live shadcn CodeBlock composition is reproduced directly: semantic `figure`, official surface spacing, code-line grid/padding, and the official Button-based copy action. Docusaurus-only word-wrap UI is omitted because it is absent from the rendered oracle.
- The PostCSS exception is scoped to the packaged `shadcn.scss` and layered Infima input. Consumer CSS continues through its original `postcss-preset-env` options; `src/postcss/preset-env.test.ts` protects this boundary.
- The comparison tool is `scripts/compare-base-nova.cjs`; it uses matched official content/container context, exact trigger alignment for floating surfaces, Chromium's 1/64 CSS-pixel layout quantum, normalized computed colors, and the required geometry/state properties across desktop/tablet/mobile and light/dark.
- The user-facing report is `artifacts/base-nova-parity/report.md` with raw measurements in `results.json`: 406 checks, 406 fully compared exact, 0 contextual exclusions, and 0 differences/errors.
- Automated parity is complete, but user visual approval remains required.
