# Actual UI parity recovery test plan

## Source

- User rejection and screenshots from 2026-07-19.
- `AGENTS.md` Base Nova Visual Parity Contract.
- Oracle: `https://ui.shadcn.com/docs/components/base/*`.

## Acceptance

- Card shadow removal is the only visual exception.
- Missing selectors, states, routes, or interaction outcomes fail.
- No contextual exclusions.
- Chromium raw geometry retains 1/64 CSS-pixel values.
- Automation does not replace original-resolution manual review or user approval.

## Minimal Playwright E2E

Target: `tests/theme-parity.spec.ts`

### 1. Desktop navigation controls change real state

Precondition: Markdown route at desktop width.

Steps/outcomes:

- Collapse and expand each LNB category by accessible button.
- `aria-expanded` changes and descendants become hidden/visible.
- Collapse and expand the whole LNB; content allocation changes and focusable restore control appears.
- Open GNB NavigationMenu; menu links become visible; Escape closes it and restores focus.

### 2. Content controls preserve user-visible behavior

Precondition: MDX and Markdown routes.

Steps/outcomes:

- Select another Tab; selected state and panel content change.
- Expand Details; body becomes visible; keyboard activation works.
- Copy CodeBlock; clipboard receives exact code and feedback state appears.
- Theme menu changes light/dark and persists through navigation.

### 3. Critical visual relations are viewport-consistent

Precondition: `390`, `1024`, and `1440`; light/dark.

Outcomes:

- GNB branding/menu separation is nonzero and follows the approved official composition.
- Every rendered prose heading has the approved next-sibling flow spacing; component roots are not accidentally excluded.
- Tabs heading-to-root spacing is exact.
- CodeBlock owned background is identical across viewport sizes.
- Desktop shell does not substitute a different content surface from mobile.
- No page-level horizontal overflow.

## Broader checks

- Source contracts verify every rendered shared component imports the one official registry SSOT.
- Existing route inventory and integer-width sweep remain supplemental; assertions are strengthened around state change and visual relations.
- Original screenshots are inspected manually after all automated checks pass.
