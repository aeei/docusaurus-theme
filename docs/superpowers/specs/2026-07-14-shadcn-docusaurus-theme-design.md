# Shadcn Docusaurus Theme 설계

## 목표

다른 Docusaurus 사용자가 설치해 일반 문서와 `docusaurus-openapi-docs` 기반 API 문서에 함께 적용할 수 있는 reusable theme package를 만든다. 정보 구조는 Nextra, navigation/search interaction은 Fumadocs를 참고하되 코드는 독자 구현한다.

## 범위

- 기존 `docusaurus-theme-openapi-docs`의 OpenAPI rendering 동작 유지
- 일반 docs와 OpenAPI docs를 하나의 visual system으로 통합
- 얇은 sticky header, compact left sidebar, 넓은 본문, right TOC/API panel
- command search, breadcrumbs, docs/API version selector
- responsive sidebar drawer, light/dark mode
- demo를 package reference 및 local preview site로 사용
- Tailwind는 package build-time에만 사용하고 배포물에는 완성된 CSS를 포함

범위 밖:

- DeskPie OAS 및 OAuth 구현
- generated MDX 수동 수정
- 검색 index/provider 구현
- Nextra, Fumadocs, Redocusaurus dependency

## Package 모델

현재 monorepo의 `packages/docusaurus-theme-openapi-docs`를 일반 docs까지 담당하는 full theme로 확장한다. 구현 중 package source 위치와 OpenAPI public component contract를 유지해 기존 test와 demo를 재사용한다. 배포 이름은 `docusaurus-theme-shadcn-docs`를 사용한다.

소비자는 package를 설치하고 Docusaurus `themes`에 등록한다. 소비자 project에는 Tailwind 또는 Sass 설정을 요구하지 않는다. Theme package가 component와 compiled CSS를 제공하며 Docusaurus classic preset의 content/routing을 재사용한다.

## Token contract

Theme은 token consumer이며 값을 소유하지 않는다. Package CSS가 참조할 수 있는 semantic token:

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`
- `--border`, `--input`, `--ring`
- `--chart-1` … `--chart-5`
- `--radius`
- `--sidebar-*`

금지:

- `--docs-*`, `--api-*`, `--openapi-*`, `--nextra-*`, `--fumadocs-*`
- hardcoded color 및 raw Tailwind palette
- component-local theme token 및 별도 design token 체계
- 별도 spacing token

Infima variable은 adapter alias로만 정의한다. 모든 primary action과 active state는 `--primary`를 사용한다. Spacing/layout은 Tailwind standard scale을 사용한다.

Token value는 소비 site가 제공한다. Demo는 shadcn Nova preset b0, Neutral light/dark 값을 reference stylesheet로 제공하지만 package runtime stylesheet에는 값을 넣지 않는다.

## Layout

### Desktop

- Header: sticky, compact, logo/navigation/version/search/color mode 배치
- Left sidebar: compact tree navigation, active row는 primary token
- Standard docs: centered wide content + sticky right TOC
- OpenAPI operation: content + sticky right request/code panel
- Breadcrumbs는 본문 제목 위
- Quiet 1px borders, shadow 최소

### Tablet/mobile

- Left sidebar는 header trigger로 여는 drawer
- TOC는 본문 상단 collapsible section
- OpenAPI right panel은 본문 아래로 이동
- Search는 full-screen command dialog
- Drawer/dialog는 focus management, Escape close, focus-visible ring 제공

## Component 경계

- `Navbar`: shell과 responsive actions
- `SearchBar`: Docusaurus search provider UI를 호출하는 command trigger; indexing은 소유하지 않음
- `DocRoot/Layout`: header/sidebar/content/right rail grid
- `DocSidebar`: navigation tree, collapse, active state
- `DocBreadcrumbs`, `DocVersionDropdown`, `DocPaginator`: classic data contract 재사용
- `DocItem/TOC`: desktop rail 및 mobile collapse
- `ApiItem/Layout`: standard docs shell 안에서 OpenAPI right panel 선택
- OpenAPI explorer/schema/input/tab components: 기존 behavior 유지, semantic styling만 교체

각 override는 Docusaurus theme alias를 유지해 site-level swizzle이 가능해야 한다.

## Search

Theme은 command-style trigger와 modal visual/keyboard behavior를 제공한다. 실제 검색 결과는 Docusaurus에 등록된 search provider가 공급한다. Provider가 없으면 search action을 렌더링하지 않아 dead control을 만들지 않는다.

## Styling/build

- Tailwind CSS v4를 dev/build dependency로만 사용
- Theme source에서 사용한 utility를 static CSS로 compile
- Package `getClientModules()`가 compiled CSS를 로드
- 소비 site에 Tailwind content scan/config 요구 없음
- Lucide icons는 package dependency로 제공
- Inter는 CSS font stack을 기본으로 참조하고 network font를 강제 fetch하지 않음

## 접근성

- 모든 action에 accessible name
- keyboard navigation과 visible `--ring` focus state
- active/current page는 color 외 `aria-current`와 font/background 변화로 구분
- mobile drawer와 command dialog focus trap 및 Escape recovery
- light/dark 양쪽 WCAG AA 대비 검증
- reduced-motion 존중

## 검증

- unit/component tests: navigation/search/drawer state 및 accessibility semantics
- generated OpenAPI fixtures: existing schema/request/response behavior regression
- E2E: docs navigation, command search, version selection, responsive drawer, color mode
- visual regression: docs 및 OpenAPI 대표 화면의 light/dark/desktop/mobile
- token audit: forbidden custom property, hex/rgb/hsl/raw palette 검사
- package smoke test: `npm pack` 산출물을 clean Docusaurus 3.10.x fixture에 설치 후 build
- demo production build 및 lint/test 통과

## 완료 기준

- 다른 사용자가 package 설치와 Docusaurus theme 등록만으로 사용 가능
- 소비자 Tailwind/Sass config 불필요
- 일반 docs와 generated OpenAPI docs가 동일 theme shell 사용
- token contract 위반 0
- desktop/tablet/mobile 및 light/dark 동작
- build, test, E2E, package smoke test, CI 통과
- remote 제공 후 commit/push/PR/CI까지 확인
