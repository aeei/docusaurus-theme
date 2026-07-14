# Shadcn Docusaurus Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 다른 Docusaurus 사용자가 Tailwind 설정 없이 설치할 수 있는 Nextra형 shadcn docs/OpenAPI theme를 만든다.

**Architecture:** Docusaurus classic preset의 content/routing contract와 기존 OpenAPI React behavior는 유지한다. Theme package가 component override와 compiled CSS를 제공하고, 소비 site만 shadcn semantic token 값을 정의한다.

**Tech Stack:** Docusaurus 3.10.x, React 19, TypeScript, Sass/CSS, Tailwind CSS v4 build tooling, Jest, Cypress/Playwright

## Global Constraints

- Nextra/Fumadocs/Redocusaurus dependency를 추가하지 않는다.
- Theme package에서 `--docs-*`, `--api-*`, `--openapi-*`, hardcoded color, raw Tailwind palette를 사용하지 않는다.
- Primary action 및 active state는 `--primary`를 사용한다.
- 소비 project에 Tailwind/Sass config를 요구하지 않는다.
- Generated OpenAPI MDX를 수정하지 않는다.
- DeskPie OAS/OAuth 구현을 포함하지 않는다.

---

### Task 1: Local preview와 semantic token baseline

**Files:**
- Create: `demo/src/css/tokens.css`
- Modify: `demo/docusaurus.config.ts`
- Modify: `demo/src/css/custom.css`

**Interfaces:**
- Consumes: shadcn Nova Neutral semantic token contract
- Produces: `:root`/`[data-theme="dark"]` token values와 Infima adapter aliases

- [ ] **Step 1: dependency 설치와 기존 build 확인**

Run:

```bash
yarn install --frozen-lockfile
yarn build-packages
```

Expected: package build exit 0.

- [ ] **Step 2: demo token stylesheet 작성**

`tokens.css`에 light/dark `--background`, `--foreground`, card/popover/primary/secondary/muted/accent/destructive/border/input/ring/chart/radius/sidebar token을 정의한다. 같은 파일에서 Infima 값을 다음처럼 alias한다.

```css
:root {
  --ifm-color-primary: var(--primary);
  --ifm-background-color: var(--background);
  --ifm-font-color-base: var(--foreground);
  --ifm-navbar-background-color: var(--background);
  --ifm-toc-border-color: var(--border);
  --ifm-menu-color-active: var(--primary);
  --ifm-global-radius: var(--radius);
}
```

- [ ] **Step 3: token stylesheet를 structural CSS보다 먼저 로드**

```ts
theme: {
  customCss: ["./src/css/tokens.css", "./src/css/custom.css"],
},
```

- [ ] **Step 4: demo-specific hardcoded theme/palette 규칙 제거**

Run:

```bash
rg -n '#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(' demo/src/css/custom.css
```

Expected: color literal 0건.

- [ ] **Step 5: local hot-reload server 실행**

Run:

```bash
yarn watch:demo
```

Expected: `http://localhost:3000` 응답 200.

- [ ] **Step 6: commit**

```bash
git add demo/src/css/tokens.css demo/src/css/custom.css demo/docusaurus.config.ts
git commit -m "feat: add neutral semantic theme baseline"
```

### Task 2: Reusable package shell styling

**Files:**
- Create: `packages/docusaurus-theme-openapi-docs/src/theme/base.scss`
- Modify: `packages/docusaurus-theme-openapi-docs/src/theme/styles.scss`
- Modify: `packages/docusaurus-theme-openapi-docs/src/theme/ApiItem/Layout/styles.module.css`

**Interfaces:**
- Consumes: Task 1 semantic tokens
- Produces: sticky header, compact sidebar, wide content, right rail, typography, focus style

- [ ] **Step 1: token contract test 추가**

Package stylesheet를 검사해 forbidden variable과 color literal을 거부하는 Jest test를 추가한다. 허용 literal은 data URI와 demo token owner file뿐이다.

- [ ] **Step 2: test 실패 확인**

```bash
yarn test --runInBand token-contract
```

Expected: 기존 `--openapi-*`와 color literal 때문에 FAIL.

- [ ] **Step 3: package base shell CSS 구현**

`base.scss`는 token 값 정의 없이 semantic token만 소비한다.

```scss
html,
body {
  background: var(--background);
  color: var(--foreground);
}

.navbar {
  position: sticky;
  top: 0;
  height: 3.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--background);
  box-shadow: none;
}

.theme-doc-sidebar-container {
  width: 16rem;
  border-right: 1px solid var(--sidebar-border);
  background: var(--sidebar);
  color: var(--sidebar-foreground);
}

.menu__link--active {
  background: var(--sidebar-primary);
  color: var(--sidebar-primary-foreground);
}

:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

- [ ] **Step 4: package stylesheet entry에 base import**

```scss
@use "./base";
```

- [ ] **Step 5: focused test/build**

```bash
yarn test --runInBand token-contract
yarn workspace docusaurus-theme-openapi-docs build
```

Expected: PASS 및 build exit 0.

- [ ] **Step 6: commit**

```bash
git add packages/docusaurus-theme-openapi-docs/src/theme
git commit -m "feat: style reusable docs shell"
```

### Task 3: Docs navigation과 responsive UX

**Files:**
- Create/modify Docusaurus theme overrides under `packages/docusaurus-theme-openapi-docs/src/theme/Navbar/`
- Create/modify overrides under `packages/docusaurus-theme-openapi-docs/src/theme/DocSidebar/`
- Create/modify overrides under `packages/docusaurus-theme-openapi-docs/src/theme/DocItem/TOC/`
- Modify: `demo/docusaurus.config.ts`

**Interfaces:**
- Consumes: Docusaurus classic theme aliases and metadata
- Produces: command search trigger, mobile drawer, breadcrumbs/version/TOC styling

- [ ] **Step 1: component tests 작성**

검증 항목: search accessible name/shortcut, drawer Escape close/focus recovery, current page `aria-current`, dark-mode button accessible name.

- [ ] **Step 2: tests 실패 확인**

```bash
yarn test --runInBand Navbar DocSidebar
```

Expected: override가 없어 FAIL.

- [ ] **Step 3: 최소 override 구현**

Classic component contract를 wrapper로 재사용하고 DOM 전체 복사를 피한다. Search provider 미설치 시 dead trigger를 렌더링하지 않는다.

- [ ] **Step 4: responsive CSS 구현**

Desktop은 3-column, mobile은 sidebar drawer/inline TOC/API panel로 매핑한다. Breakpoint는 기존 Docusaurus `996px` 경계를 유지한다.

- [ ] **Step 5: tests/build**

```bash
yarn test --runInBand Navbar DocSidebar
yarn build-demo
```

Expected: PASS 및 production build exit 0.

- [ ] **Step 6: commit**

```bash
git add packages/docusaurus-theme-openapi-docs/src/theme demo/docusaurus.config.ts
git commit -m "feat: add compact docs navigation"
```

### Task 4: OpenAPI visual integration

**Files:**
- Modify: `packages/docusaurus-theme-openapi-docs/src/theme/styles.scss`
- Modify: `packages/docusaurus-theme-openapi-docs/src/theme/ApiExplorer/**/*.scss`
- Modify: `packages/docusaurus-theme-openapi-docs/src/theme/{ApiTabs,CodeSamples,Example,MimeTabs,OperationTabs,ParamsItem,SchemaItem,SchemaTabs}/**/*.scss`

**Interfaces:**
- Consumes: existing OpenAPI component props/state and semantic tokens
- Produces: token-compliant forms, tabs, schemas, request/code/response panels

- [ ] **Step 1: existing OpenAPI behavior tests 실행**

```bash
yarn test --runInBand
```

Expected: baseline PASS.

- [ ] **Step 2: forbidden OpenAPI token 제거**

`--openapi-*` alias를 만들지 않고 각 declaration이 allowed semantic token을 직접 참조하도록 변경한다. DELETE/error만 `--destructive`; method badge 기본은 muted/foreground를 사용한다.

- [ ] **Step 3: right panel과 controls 스타일링**

Input은 `--input`, focus는 `--ring`, selected tab/action은 `--primary`, panel은 `--card`, border는 `--border`, radius는 `--radius`를 사용한다.

- [ ] **Step 4: regression 검증**

```bash
yarn test --runInBand
yarn build-demo
```

Expected: PASS 및 build exit 0.

- [ ] **Step 5: commit**

```bash
git add packages/docusaurus-theme-openapi-docs/src/theme
git commit -m "feat: apply semantic styles to OpenAPI docs"
```

### Task 5: Package consumer smoke test와 release validation

**Files:**
- Modify: `packages/docusaurus-theme-openapi-docs/package.json`
- Create: `scripts/check-theme-tokens.mjs`
- Modify: root `package.json`
- Modify: `README.md`

**Interfaces:**
- Consumes: completed theme package
- Produces: installable tarball and documented consumer config

- [ ] **Step 1: package identity/build output 정리**

Package name을 `docusaurus-theme-shadcn-docs`로 변경하고 compiled CSS 및 theme components가 tarball에 포함되도록 확인한다.

- [ ] **Step 2: token audit script 연결**

```json
{
  "scripts": {
    "check:theme-tokens": "node scripts/check-theme-tokens.mjs"
  }
}
```

- [ ] **Step 3: consumer install 문서 작성**

README에 install, Docusaurus `themes` 등록, required token stylesheet, OpenAPI plugin 조합, local example을 포함한다.

- [ ] **Step 4: full validation**

```bash
yarn check:theme-tokens
yarn format
yarn lint
yarn test --runInBand
yarn build
npm pack --dry-run ./packages/docusaurus-theme-openapi-docs
```

Expected: 모두 exit 0; tarball에 JS/types/CSS 포함.

- [ ] **Step 5: clean consumer smoke test**

생성 tarball을 별도 clean Docusaurus 3.10.x fixture에 설치하고 일반 docs와 generated OpenAPI docs production build를 실행한다.

- [ ] **Step 6: commit**

```bash
git add packages/docusaurus-theme-openapi-docs/package.json scripts/check-theme-tokens.mjs package.json README.md
git commit -m "chore: prepare reusable theme package"
```
