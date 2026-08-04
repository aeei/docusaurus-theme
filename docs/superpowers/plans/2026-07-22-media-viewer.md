# Media Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared Base Nova modal viewer for Markdown images and Mermaid diagrams, opened by direct media click or an official expand action.

**Architecture:** Add one controlled `MediaViewer` adapter composed from the existing official Button, Tooltip, and Dialog primitives. Add MDX image, Mermaid, and link adapters that preserve Docusaurus rendering while routing viewable media through the shared adapter. Keep all visual primitive sources unchanged; only semantic placement, viewport, containment, and overflow layout are new.

**Tech Stack:** React 19, TypeScript 6, Docusaurus 3.10, Base UI 1.6, shadcn 4.12 Base Nova, Lucide, Jest source contracts, Playwright.

## Global Constraints

- Pinned visual oracle: shadcn 4.12 Base Nova, Base UI, Neutral, Lucide.
- Do not modify official `Button`, `Dialog`, or `Tooltip` source or visual state classes.
- Do not add consumer CSS, `[data-slot]` overrides, duplicate primitives, or service-specific viewer implementations.
- Approved layout exception only: media action placement, Dialog media viewport dimensions, media containment, and overflow.
- Use `Button variant="ghost" size="icon-sm"`; do not reuse `CodeBlockButton` custom classes.
- Viewer targets global Markdown images and Mermaid diagrams. Linked images retain link behavior and receive no viewer controls.
- No zoom, pan, rotate, download, video, iframe, chart, table, or per-document opt-in support.
- TDD: run each focused test red before implementation and green afterward.
- Do not commit/push implementation before local screenshot evidence and explicit user visual approval.

---

## File Map

- Modify: `AGENTS.md` — record the approved media-viewer layout exception.
- Create: `packages/docusaurus-theme/src/theme/components/media-viewer/index.tsx` — controlled Dialog behavior, action, tooltip, focus restoration, pointer handling.
- Create: `packages/docusaurus-theme/src/theme/components/media-viewer/mdx-media.tsx` — image, Mermaid, and link adapters plus linked-media context.
- Modify: `packages/docusaurus-theme/src/theme/MDXComponents/index.tsx` — global adapter registration.
- Modify: `packages/docusaurus-theme/src/theme/base.scss` — semantic placement, containment, and overflow only.
- Create: `packages/docusaurus-theme/src/theme/media-viewer-contract.test.ts` — source/ownership/no-override contracts.
- Modify: `examples/docs-starter/docs/guides/markdown-gfm.md` — linked-image fixture.
- Modify: `examples/docs-starter/docs/showcase/mermaid.md` — reuse existing Mermaid as viewer fixture; add stable audit heading only if selectors require it.
- Create: `tests/media-viewer.spec.ts` — actual browser interaction, accessibility, geometry, responsive, light/dark tests.

---

### Task 1: Lock the ownership and no-override contract

**Files:**
- Modify: `AGENTS.md`
- Create: `packages/docusaurus-theme/src/theme/media-viewer-contract.test.ts`

**Interfaces:**
- Consumes: project Base Nova parity contract.
- Produces: source contracts for `MediaViewer`, `ZoomableImage`, `ZoomableMermaid`, and `MediaAwareLink`.

- [ ] **Step 1: Add the approved exception to `AGENTS.md`**

Append under user-approved visual exceptions:

```markdown
- Media viewer는 official Base Nova Button, Tooltip, Dialog source와 state style을 그대로 사용한다. Semantic adapter는 action 위치, Dialog media viewport 크기, image/SVG containment, overflow만 소유한다. Consumer CSS와 `[data-slot]` override는 금지한다.
```

- [ ] **Step 2: Write the failing source contract**

Create `packages/docusaurus-theme/src/theme/media-viewer-contract.test.ts`:

```ts
import fs from "node:fs";
import path from "node:path";

const root = __dirname;
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("Media viewer ownership contract", () => {
  it("maps global MDX images, links, and Mermaid through shared adapters", () => {
    const mdx = read("MDXComponents/index.tsx");
    expect(mdx).toContain("ZoomableImage");
    expect(mdx).toContain("ZoomableMermaid");
    expect(mdx).toContain("MediaAwareLink");
    expect(mdx).toContain("img: ZoomableImage");
    expect(mdx).toContain("mermaid: ZoomableMermaid");
    expect(mdx).toContain("a: MediaAwareLink");
  });

  it("composes only official Base Nova actions and dialog", () => {
    const viewer = read("components/media-viewer/index.tsx");
    expect(viewer).toContain('variant="ghost"');
    expect(viewer).toContain('size="icon-sm"');
    expect(viewer).toContain("<Dialog");
    expect(viewer).toContain("<Tooltip");
    expect(viewer).toContain("Maximize2");
    expect(viewer).not.toContain("CodeBlockButton");
    expect(viewer).not.toMatch(/data-slot[^\n]*className/);
  });

  it("keeps linked images out of nested viewer controls", () => {
    const adapters = read("components/media-viewer/mdx-media.tsx");
    expect(adapters).toContain("LinkedMediaContext.Provider");
    expect(adapters).toContain("useContext(LinkedMediaContext)");
    expect(adapters).toContain("return <MDXImg {...props} />");
  });

  it("limits CSS to semantic viewer layout selectors", () => {
    const css = read("base.scss");
    expect(css).toContain(".theme-media-viewer");
    expect(css).toContain(".theme-media-viewer__viewport");
    expect(css).not.toMatch(/\[data-slot=[^\]]+\][^{]*theme-media-viewer/);
  });
});
```

- [ ] **Step 3: Run the focused contract and confirm red**

Run:

```bash
yarn jest packages/docusaurus-theme/src/theme/media-viewer-contract.test.ts --runInBand
```

Expected: FAIL because viewer files and MDX mappings do not exist.

---

### Task 2: Implement the shared viewer and MDX adapters

**Files:**
- Create: `packages/docusaurus-theme/src/theme/components/media-viewer/index.tsx`
- Create: `packages/docusaurus-theme/src/theme/components/media-viewer/mdx-media.tsx`
- Modify: `packages/docusaurus-theme/src/theme/MDXComponents/index.tsx`
- Modify: `packages/docusaurus-theme/src/theme/base.scss`
- Test: `packages/docusaurus-theme/src/theme/media-viewer-contract.test.ts`

**Interfaces:**
- Produces:
  - `MediaViewer(props: MediaViewerProps): ReactNode`
  - `ZoomableImage(props: ImgProps): ReactNode`
  - `ZoomableMermaid(props: MermaidProps): ReactNode`
  - `MediaAwareLink(props: ComponentProps<typeof MDXA>): ReactNode`
- `MediaViewerProps`:

```ts
type MediaViewerProps = {
  as: "span" | "div";
  kind: "image" | "diagram";
  title: string;
  preview: ReactNode;
  expanded: ReactNode;
};
```

- [ ] **Step 1: Implement the controlled `MediaViewer`**

Create `packages/docusaurus-theme/src/theme/components/media-viewer/index.tsx` with these behaviors:

```tsx
import React, {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";

import { translate } from "@docusaurus/Translate";
import { Maximize2 } from "lucide-react";

import { Button } from "@theme/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@theme/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@theme/components/ui/tooltip";

export type MediaViewerProps = {
  as: "span" | "div";
  kind: "image" | "diagram";
  title: string;
  preview: ReactNode;
  expanded: ReactNode;
};

export default function MediaViewer({
  as,
  kind,
  title,
  preview,
  expanded,
}: MediaViewerProps): ReactNode {
  const [open, setOpen] = useState(false);
  const actionRef = useRef<HTMLButtonElement>(null);
  const Root = as;
  const viewLabel = translate({
    id: "theme.mediaViewer.viewLarger",
    message: "View larger",
  });
  const description = translate({
    id: "theme.mediaViewer.description",
    message: "Expanded media preview. Press Escape to close.",
  });

  const changeOpen = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) requestAnimationFrame(() => actionRef.current?.focus());
  }, []);

  const openFromMedia = useCallback((event: MouseEvent<HTMLElement>) => {
    const target = event.target as Element;
    if (target.closest("a,button")) return;
    setOpen(true);
  }, []);

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <Root
        className="theme-media-viewer"
        data-media-kind={kind}
        onClick={openFromMedia}
      >
        {preview}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                ref={actionRef}
                type="button"
                variant="ghost"
                size="icon-sm"
                className="theme-media-viewer__action"
                aria-label={viewLabel}
                onClick={() => setOpen(true)}
              >
                <Maximize2 aria-hidden="true" />
              </Button>
            }
          />
          <TooltipContent>{viewLabel}</TooltipContent>
        </Tooltip>
      </Root>
      <DialogContent className="max-h-[calc(100dvh-2rem)] sm:max-w-[calc(100vw-2rem)]">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="theme-media-viewer__viewport" data-media-kind={kind}>
          {expanded}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Implement linked-media, image, and Mermaid adapters**

Create `packages/docusaurus-theme/src/theme/components/media-viewer/mdx-media.tsx`:

```tsx
import React, {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
} from "react";

import { translate } from "@docusaurus/Translate";
import MDXA from "@theme/MDXComponents/A";
import MDXImg from "@theme/MDXComponents/Img";
import Mermaid from "@theme/Mermaid";
import type { Props as ImgProps } from "@theme/MDXComponents/Img";
import type { Props as MermaidProps } from "@theme/Mermaid";

import MediaViewer from "@theme/components/media-viewer";

const LinkedMediaContext = createContext(false);

export function MediaAwareLink(
  props: ComponentProps<typeof MDXA>
): ReactNode {
  return (
    <LinkedMediaContext.Provider value>
      <MDXA {...props} />
    </LinkedMediaContext.Provider>
  );
}

export function ZoomableImage(props: ImgProps): ReactNode {
  const linked = useContext(LinkedMediaContext);
  if (linked) return <MDXImg {...props} />;

  const title =
    props.alt?.trim() ||
    translate({
      id: "theme.mediaViewer.imageTitle",
      message: "Image preview",
    });
  const {
    className: _className,
    style: _style,
    loading: _loading,
    decoding: _decoding,
    ...expandedProps
  } = props;

  return (
    <MediaViewer
      as="span"
      kind="image"
      title={title}
      preview={<MDXImg {...props} />}
      expanded={
        <MDXImg
          {...expandedProps}
          loading="eager"
          decoding="async"
          className="theme-media-viewer__expanded-image"
        />
      }
    />
  );
}

export function ZoomableMermaid(props: MermaidProps): ReactNode {
  const title = translate({
    id: "theme.mediaViewer.diagramTitle",
    message: "Diagram preview",
  });
  return (
    <MediaViewer
      as="div"
      kind="diagram"
      title={title}
      preview={<Mermaid {...props} />}
      expanded={<Mermaid {...props} />}
    />
  );
}
```

- [ ] **Step 3: Register adapters globally**

Modify `packages/docusaurus-theme/src/theme/MDXComponents/index.tsx`:

```tsx
import {
  MediaAwareLink,
  ZoomableImage,
  ZoomableMermaid,
} from "@theme/components/media-viewer/mdx-media";
```

Replace only these mappings:

```tsx
a: MediaAwareLink,
img: ZoomableImage,
mermaid: ZoomableMermaid,
```

Keep the existing original `MDXA`, `MDXImg`, and `Mermaid` ownership inside `mdx-media.tsx`; remove now-unused imports from `MDXComponents/index.tsx`.

- [ ] **Step 4: Add semantic layout CSS**

Append to `packages/docusaurus-theme/src/theme/base.scss`:

```scss
.theme-media-viewer {
  position: relative;
}

span.theme-media-viewer {
  display: block;
}

.theme-media-viewer__action {
  position: absolute;
  z-index: 1;
  inset-block-start: calc(var(--spacing) * 2);
  inset-inline-end: calc(var(--spacing) * 2);
}

.theme-media-viewer__viewport {
  display: grid;
  min-width: 0;
  min-height: 0;
  max-height: calc(100dvh - 4rem);
  place-items: center;
  overflow: auto;
}

.theme-media-viewer__expanded-image {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: calc(100dvh - 4rem);
  object-fit: contain;
}

.theme-media-viewer__viewport .docusaurus-mermaid-container {
  max-width: 100%;
  margin: 0;
}

.theme-media-viewer__viewport .docusaurus-mermaid-container > svg {
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: calc(100dvh - 4rem);
}
```

Do not add color, background, border, radius, shadow, typography, opacity, hover, focus, active, or `[data-slot]` rules.

- [ ] **Step 5: Run focused contract and TypeScript diagnostics**

Run:

```bash
yarn jest packages/docusaurus-theme/src/theme/media-viewer-contract.test.ts --runInBand
yarn workspace @aeei/docusaurus-theme build
```

Expected: focused test PASS and package build PASS. Fix only type/API mismatches while preserving the defined interfaces and constraints.

---

### Task 3: Add actual browser fixtures and interaction tests

**Files:**
- Modify: `examples/docs-starter/docs/guides/markdown-gfm.md`
- Create: `tests/media-viewer.spec.ts`

**Interfaces:**
- Consumes: `data-media-kind`, `.theme-media-viewer__action`, `.theme-media-viewer__viewport`, official `[data-slot="dialog-content"]`.
- Produces: reproducible pointer/keyboard/focus/geometry/light-dark/mobile evidence.

- [ ] **Step 1: Add a linked-image fixture**

Under the existing image fixtures in `examples/docs-starter/docs/guides/markdown-gfm.md`, add:

```md
- Linked image keeps navigation and receives no viewer control:

[![Linked hero art](/img/docs-hero.svg)](../showcase/mdx-playground)
```

- [ ] **Step 2: Write failing Playwright tests**

Create `tests/media-viewer.spec.ts` with tests that:

```ts
import { expect, test } from "playwright/test";

const markdownRoute = "guides/markdown-gfm";
const mermaidRoute = "showcase/mermaid";

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(colorScheme, () => {
    test.use({ colorScheme });

    for (const viewport of [
      { name: "desktop", width: 1440, height: 900 },
      { name: "mobile", width: 375, height: 812 },
    ]) {
      test(`${viewport.name} image opens and closes an accessible viewer`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await page.goto(markdownRoute);
        const media = page.locator('[data-media-kind="image"]').first();
        const action = media.getByRole("button", { name: "View larger" });
        await expect(action).toBeVisible();

        const inlineBox = await media.locator("img").boundingBox();
        await action.focus();
        await page.keyboard.press("Enter");
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await expect(dialog).toContainText("Hero art");
        const expandedBox = await dialog.locator("img").boundingBox();
        if (viewport.name === "desktop") {
          expect(expandedBox!.width).toBeGreaterThan(inlineBox!.width);
        } else {
          const dialogBox = await dialog.boundingBox();
          expect(dialogBox!.width).toBeGreaterThanOrEqual(viewport.width - 32);
        }

        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(action).toBeFocused();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth)
        ).toBeLessThanOrEqual(viewport.width);
      });
    }
  });
}

test("media pointer click opens while linked image keeps navigation", async ({
  page,
}) => {
  await page.goto(markdownRoute);
  await page.locator('[data-media-kind="image"]').first().locator("img").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");

  const linkedImage = page.getByRole("img", { name: "Linked hero art" });
  await expect(linkedImage.locator("xpath=ancestor::a")).toHaveAttribute(
    "href",
    /mdx-playground/
  );
  await expect(
    linkedImage.locator("xpath=ancestor::a").getByRole("button")
  ).toHaveCount(0);
});

test("Mermaid viewer renders unique readable SVG copies", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(mermaidRoute);
  const media = page.locator('[data-media-kind="diagram"]').first();
  await media.getByRole("button", { name: "View larger" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("svg")).toBeVisible();
  const duplicateIds = await page.evaluate(() => {
    const ids = [...document.querySelectorAll("[id]")].map((node) => node.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  expect(duplicateIds).toEqual([]);
});
```

Adjust selectors only for actual accessible output; do not weaken outcomes to mere element existence.

- [ ] **Step 3: Run Playwright red, then green after Task 2**

Run:

```bash
yarn playwright test tests/media-viewer.spec.ts
```

Expected before Task 2: FAIL because viewer controls are absent. Expected after Task 2: all new tests PASS.

- [ ] **Step 4: Run complete upstream validation**

Run:

```bash
yarn prettier --check \
  packages/docusaurus-theme/src/theme/components/media-viewer/index.tsx \
  packages/docusaurus-theme/src/theme/components/media-viewer/mdx-media.tsx \
  packages/docusaurus-theme/src/theme/MDXComponents/index.tsx \
  packages/docusaurus-theme/src/theme/media-viewer-contract.test.ts \
  tests/media-viewer.spec.ts \
  examples/docs-starter/docs/guides/markdown-gfm.md
yarn test
yarn build
yarn workspace @aeei/docs-starter build
yarn playwright test
git diff --check
```

Expected: all commands PASS. Use LSP diagnostics on changed TS/TSX files and require zero errors.

---

### Task 4: Build a local tar and validate actual Deck routes

**Files:**
- No upstream source changes.
- Local-only downstream preview worktree: `/Users/kelly/w/deck-worktrees/260722-media-viewer-preview`
- Local-only archive replacement: `docs/manual/vendor/docusaurus-theme.tgz`

**Interfaces:**
- Consumes: built upstream package with media viewer.
- Produces: local App, LinkPie, DeskPie route evidence without committing downstream files.

- [ ] **Step 1: Pack the upstream theme**

Run:

```bash
cd /Users/kelly/w/docs-worktrees/260722-media-viewer/packages/docusaurus-theme
npm pack --pack-destination /tmp/media-viewer-theme
```

Expected: one `.tgz` containing `components/media-viewer`, compiled CSS, license files, and the current package version.

- [ ] **Step 2: Create a clean Deck preview worktree**

Run:

```bash
cd /Users/kelly/w/deck
git fetch origin develop
git worktree add -b 260722-media-viewer-preview \
  /Users/kelly/w/deck-worktrees/260722-media-viewer-preview origin/develop
cp /tmp/media-viewer-theme/*.tgz \
  /Users/kelly/w/deck-worktrees/260722-media-viewer-preview/docs/manual/vendor/docusaurus-theme.tgz
```

- [ ] **Step 3: Regenerate local lockfiles and build all manuals**

Run:

```bash
base=/Users/kelly/w/deck-worktrees/260722-media-viewer-preview/docs/manual
for site in app linkpie deskpie; do
  pnpm --dir "$base/$site" install --lockfile-only
  pnpm --dir "$base/$site" install --frozen-lockfile
  pnpm --dir "$base/$site" typecheck
done
pnpm --dir "$base" test
pnpm --dir "$base" build:github-pages
```

Expected: all tests/typechecks/builds PASS using the same local tar integrity.

- [ ] **Step 4: Serve and audit actual routes**

Serve:

```bash
python3 -m http.server 3422 --directory "$base/_site"
```

Use Playwright against:

- `http://127.0.0.1:3422/app/docs/developer/organization-oauth-client/` — Mermaid
- `http://127.0.0.1:3422/linkpie/docs/developer/aip-gateway-org-path-routing/` — Mermaid
- `http://127.0.0.1:3422/deskpie/docs/user/license-requests/` — screenshot image

For each route:

- open by pointer and keyboard
- verify dialog role/title, Escape close, focus restoration
- verify no viewport overflow
- verify light/dark at desktop 1440×900 and mobile 375×812
- save original-resolution screenshots under `/tmp/manual-media-viewer/`

- [ ] **Step 5: Present evidence and stop at approval gate**

Present:

- docs-starter screenshots
- App/LinkPie/DeskPie screenshots
- test/build commands and results
- primitive parity report
- known residual risks

Do not commit, push, replace the reviewed Deck artifact permanently, or deploy until the user explicitly approves the screenshots.

---

### Task 5: Commit only after visual approval

**Files:** all upstream implementation and test files from Tasks 1–3.

- [ ] **Step 1: Confirm explicit visual approval in chat**

Expected: user explicitly approves the shown local screenshots. Automated checks alone are insufficient.

- [ ] **Step 2: Commit the upstream implementation**

Run:

```bash
cd /Users/kelly/w/docs-worktrees/260722-media-viewer
git add \
  AGENTS.md \
  packages/docusaurus-theme/src/theme/components/media-viewer \
  packages/docusaurus-theme/src/theme/MDXComponents/index.tsx \
  packages/docusaurus-theme/src/theme/base.scss \
  packages/docusaurus-theme/src/theme/media-viewer-contract.test.ts \
  examples/docs-starter/docs/guides/markdown-gfm.md \
  tests/media-viewer.spec.ts
git commit -m "feat(theme): add modal media viewer"
```

Expected: clean committed upstream implementation. Push/PR and downstream Deck artifact replacement remain a separate release step requiring the project's normal approval and validation gates.
