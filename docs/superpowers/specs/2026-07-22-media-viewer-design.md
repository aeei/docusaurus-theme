# Media Viewer Design

## Goal

Markdown images and Mermaid diagrams in every consumer manual can open in a larger modal viewer through media click/tap or the same action button used by CodeBlock.

## Scope

Included:

- Images rendered through the global MDX `img` mapping
- Mermaid diagrams rendered through the global MDX `mermaid` mapping
- Mouse, touch, keyboard, screen-reader, light/dark, desktop/mobile behavior
- App, LinkPie, DeskPie, and docs-starter validation through the shared theme

Excluded from the first release:

- Wheel zoom, pinch zoom, zoom percentage controls, rotation, download, or pan controls
- Video, iframe, chart, table, and CodeBlock viewing
- Per-document opt-in syntax
- Viewer behavior for linked images; linked images keep normal link navigation and do not expose viewer controls

## Constraints

- Use the pinned Base Nova `Button` and `Dialog` registry sources unchanged.
- Do not add consumer CSS, `[data-slot]` overrides, duplicate primitives, or service-specific implementations.
- Do not change official component typography, color, border, radius, shadow, animation, or state styles.
- The approved visual exception is limited to semantic media-viewer layout: prose flow spacing, responsive action visibility and placement, dialog viewport size, media containment, and overflow. Keep this exception recorded in `AGENTS.md`.
- Keep the existing CodeBlock action unchanged. The media action reuses `CodeBlockButton` itself so action visuals remain one SSOT without copied classes.

## Chosen Approach

Use one shared semantic `MediaViewer` adapter composed from official Base Nova primitives.

Alternatives rejected:

1. Bottom Sheet: supports full width without a dialog size exception, but the drawer conceptual model does not match inspecting an isolated image.
2. New browser tab: requires no modal layout, but loses context and creates inconsistent navigation.
3. Third-party image zoom package: introduces a second dialog/interaction system and violates the shared Base Nova component SSOT.

## Architecture

### `MediaViewer`

A behavior/layout adapter. It owns open state and receives:

- accessible title
- inline preview node
- expanded media node
- media kind: image or diagram

It renders:

- a semantic relative media root
- the inline media
- the existing `CodeBlockButton`, including its official callsite placement and state style
- an official `Dialog` containing the expanded media
- an `sr-only` official `DialogHeader`, `DialogTitle`, and `DialogDescription`

The adapter may define only structural classes needed for prose flow spacing, relative/absolute placement, responsive action visibility, viewport bounds, containment, and overflow. Media block rhythm uses the existing `--typeset-flow` token. It does not change primitive surfaces or visual state metrics.

### `ZoomableImage`

The global MDX image adapter renders the existing Docusaurus `MDXImg` for both preview and expanded content. The preview preserves every authored prop, including `loading`, `decoding`, and `className`. The expanded copy preserves media and accessibility props such as `src`, `srcSet`, `sizes`, and `alt`, sets `loading="eager"`, and does not carry preview-only authored layout classes that could constrain the modal copy.

The image `alt` value becomes the dialog title when present. Missing alt remains an authoring/accessibility defect; the dialog uses the generic localized title `Image preview` without inventing filename-derived alt text. Consumer validation inventories missing alt text before release.

### `ZoomableMermaid`

The global MDX Mermaid adapter renders the existing Docusaurus Mermaid component from the same source text in preview and dialog contexts. Each render keeps Docusaurus error handling and Mermaid interaction binding. The implementation must verify that generated SVG IDs remain unique while both copies exist.

### MDX integration

`MDXComponents/index.tsx` maps:

- `img` → `ZoomableImage`
- `mermaid` → `ZoomableMermaid`

The existing MDX link adapter additionally identifies a direct image child and marks it non-viewable before rendering the official link. This prevents nested interactive controls: linked images preserve link navigation and do not open the viewer.

No document callsite changes are required.

## Interaction

### Open

- Clicking or tapping a viewable image or diagram opens the viewer.
- On fine-pointer desktop, the expand action is hidden at rest and appears when the media is hovered or the action receives keyboard focus.
- On coarse touch, the action remains visually hidden so it does not cover media; tapping the media opens the viewer.
- The action stays in the accessibility tree and is the canonical keyboard trigger with Enter or Space.
- The action uses a Lucide expand icon and the localized accessible label `View larger`.
- No Tooltip is rendered.

### Dialog

- The official Dialog traps focus, makes background content inert, and provides overlay/transition behavior.
- Content uses the approved media viewport layout up to the browser viewport minus the official outer inset, capped by the shared `--theme-shell-max-width` token. This viewport sizing is the sole Dialog metric excluded from official parity; Dialog chrome and every primitive state remain unchanged.
- Images preserve aspect ratio with `object-fit: contain`.
- Mermaid SVGs scale into the available viewport; oversized content remains scrollable rather than clipped.
- No upscale beyond intrinsic raster resolution is required.

### Close

- Escape, backdrop click, or the official close button closes the viewer.
- Focus returns to the source media's expand action.
- Route state and URL do not change.

## Responsive Behavior

- Desktop: centered Dialog with a large bounded media viewport.
- Mobile: Dialog keeps the official outer inset and uses the remaining viewport.
- Portrait and landscape content preserve aspect ratio.
- No horizontal page overflow is introduced while the dialog is closed.

## Failure Behavior

- Image loading and failure use native browser/Docusaurus behavior; the viewer does not invent a second error surface.
- Mermaid render failures continue through the existing Docusaurus Mermaid error boundary.
- If expanded rendering fails, closing the dialog always remains available.
- Server rendering emits a stable wrapper, inline preview, and action button. The expanded media portal mounts only after the dialog opens in the browser, avoiding duplicate initial media and hydration divergence.

## Testing

### Unit and contract tests

- MDX image and Mermaid mappings use the shared viewer adapters.
- Viewer reuses the existing CodeBlock action component and official Base Nova Dialog.
- No consumer CSS or `[data-slot]` visual override is added.
- Dialog title/description and action accessible name exist.
- Clicking/tapping media or activating the action opens; Escape/backdrop/close closes; focus returns.
- Mermaid preview and expanded SVG IDs do not conflict.
- Linked images render as links without nested viewer controls.
- Consumer image inventory contains no missing non-decorative alt text before release.

### Browser tests

Use actual docs-starter routes and authored fixtures for the full interaction matrix:

- one landscape screenshot
- one portrait screenshot
- one linked image
- one Mermaid diagram
- desktop/mobile × light/dark
- desktop pointer media click and hover-revealed action
- touch media tap with visually hidden action
- keyboard action open/close
- focus trap and focus restoration
- dialog geometry larger than constrained inline media
- no page overflow
- image/SVG readable without clipping

Then run one App, LinkPie, and DeskPie actual-route smoke each: open through pointer and keyboard, close, verify focus restoration, confirm no overflow, and save screenshot evidence.

### Visual acceptance

Compare official Base Nova Button and Dialog states against `ui.shadcn.com` at identical viewport/state. Primitive chrome and state metrics must remain identical; the explicitly approved media viewport dimensions are excluded. Manually review original-resolution screenshots before implementation commit or push.

## Delivery

### Upstream implementation acceptance

1. Implement and validate in the upstream theme worktree.
2. Show local docs-starter plus App, LinkPie, and DeskPie screenshots and interaction evidence.
3. Wait for explicit visual approval.
4. After approval, commit/push the implementation.

### Downstream release acceptance

1. Build a new theme tar archive after upstream approval.
2. Replace the Deck vendored artifact and regenerate all three lockfiles.
3. Rebuild all three manuals and the DeskPie Spring artifact.
4. Show downstream comparison evidence and wait for release approval before Deck commit, push, or deployment.
