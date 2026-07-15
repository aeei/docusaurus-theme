## ADDED Requirements

### Requirement: GitHub Pages project deployment

The system SHALL deploy the starter to `https://aeei.github.io/docusaurus-theme/` with `/docusaurus-theme/` as its base path.

#### Scenario: Direct route refresh

- **WHEN** a user opens or hard-refreshes a documented route beneath the Pages base path
- **THEN** the page and all local assets SHALL load successfully without root-path assumptions

### Requirement: Validated Pages workflow

Pull requests SHALL build and test without deploying, and pushes to `shadcn-theme` SHALL deploy only after the same validation passes.

#### Scenario: Successful product-branch deployment

- **WHEN** validation succeeds on a `shadcn-theme` push
- **THEN** the workflow SHALL upload `examples/docs-starter/build` and deploy it using full-SHA-pinned official Pages actions with minimum required permissions

#### Scenario: Failed validation

- **WHEN** package or starter validation fails
- **THEN** no new Pages deployment SHALL occur

### Requirement: Project-owned repository identity

The GitHub About panel and root README SHALL describe `aeei/docusaurus-theme`, while GitHub's fork relationship and a clear upstream attribution remain intact.

#### Scenario: Public repository landing page

- **WHEN** a visitor opens the repository
- **THEN** the title, description, topics, install instructions, demo link, screenshots, and feature copy SHALL describe this project rather than the upstream demo

### Requirement: Real responsive README preview

The README SHALL display deterministic final starter captures for light and dark desktop themes using project-owned WebP assets.

#### Scenario: GitHub color preference

- **WHEN** GitHub renders the README for a light- or dark-preferring visitor
- **THEN** the `<picture>` element SHALL select the matching `1440×900` theme screenshot with meaningful alt text

### Requirement: Repository homepage points to Pages

The repository homepage SHALL be empty before the first valid deployment and SHALL point to the project Pages URL after deployment.

#### Scenario: First successful deployment

- **WHEN** the Pages site is verified publicly
- **THEN** the repository homepage SHALL be set to `https://aeei.github.io/docusaurus-theme/`

### Requirement: Optional project-owned DocSearch

Search SHALL be absent when Algolia configuration is incomplete and SHALL use only this project's DocSearch application/index when all public search variables exist.

#### Scenario: First release without Algolia

- **WHEN** any of `ALGOLIA_APP_ID`, `ALGOLIA_SEARCH_API_KEY`, or `ALGOLIA_INDEX_NAME` is unset
- **THEN** `themeConfig.algolia` and the search control SHALL be absent

#### Scenario: Approved DocSearch configuration

- **WHEN** all three values from the approved project-owned DocSearch application are present
- **THEN** search SHALL query the project index, support keyboard open/close/navigation, restore focus, and retain `Powered by Algolia`

### Requirement: Browser quality matrix

The public starter SHALL pass a desktop `1440×900` and mobile `390×844` matrix in light and dark modes for home, Markdown, and Mermaid routes.

#### Scenario: Matrix validation

- **WHEN** browser validation runs
- **THEN** load errors, console errors, document-level horizontal overflow, broken essential controls, and broken attribution links SHALL each equal zero, with failure traces retained as artifacts
