## ADDED Requirements

### Requirement: Public scoped theme package

The system SHALL provide an installable package named `@aeei/docusaurus-theme` that composes with the Docusaurus classic preset and exposes docs UI through Docusaurus theme aliases.

#### Scenario: Consumer registers the theme

- **WHEN** a clean Docusaurus site installs the packed package and registers `@aeei/docusaurus-theme`
- **THEN** the site production build SHALL succeed without importing workspace source paths

### Requirement: Public npm release

The package SHALL be published publicly as `@aeei/docusaurus-theme@0.1.0` after all package, license, and clean-install gates pass.

#### Scenario: Registry publication

- **WHEN** an authenticated npm owner of the `@aeei` scope publishes the validated tarball with public access
- **THEN** npm registry metadata SHALL identify version `0.1.0`, this repository, the MIT license, and the expected package files

#### Scenario: Clean registry install

- **WHEN** a clean Docusaurus fixture installs `@aeei/docusaurus-theme@0.1.0` from npm
- **THEN** its production build SHALL succeed without workspace links or unpublished dependencies

### Requirement: Docs-only runtime boundary

The package SHALL contain no OpenAPI renderer, API explorer, generated OpenAPI MDX contract, or OpenAPI-only runtime dependency.

#### Scenario: Package boundary audit

- **WHEN** CI scans production source, package exports, and runtime dependencies
- **THEN** OpenAPI plugin, Redux, Postman, schema, request, response, and form runtime references SHALL be absent

### Requirement: Base UI primitive consistency

Every interactive primitive shipped by the package SHALL use Base UI, with official shadcn Base Nova registry source preferred, and SHALL NOT use Radix.

#### Scenario: Primitive contract audit

- **WHEN** CI checks Button, Badge, Sheet, DropdownMenu, Tabs, NavigationMenu, Tooltip, Separator, Sidebar, and Breadcrumb roles
- **THEN** each role SHALL match its declared `@base-ui/react/*` source and no `radix-ui` or `@radix-ui/*` import or dependency SHALL exist

### Requirement: Lucide-only icons

The package SHALL use Lucide for visible UI icons and SHALL NOT ship legacy SVG masks, data URI icons, text glyph icons, or emoji icons.

#### Scenario: Icon source audit

- **WHEN** CI scans theme production source and styles
- **THEN** visible icon implementations SHALL resolve to Lucide and forbidden legacy icon patterns SHALL be absent

### Requirement: Semantic theme token interface

The package SHALL consume semantic CSS tokens for color, radius, typography, and sidebar surfaces without owning consumer-specific values.

#### Scenario: Consumer changes theme values

- **WHEN** a consumer replaces values in its semantic token stylesheet
- **THEN** the docs shell SHALL adopt those values without package source edits or a second component-local token system

### Requirement: Precompiled theme styling

The package SHALL include compiled runtime CSS and SHALL NOT require consumers to configure Tailwind or scan package source.

#### Scenario: Clean consumer build

- **WHEN** the packed package is installed into a Docusaurus site with no Tailwind dependency or configuration
- **THEN** all theme styles SHALL load and the production build SHALL succeed

### Requirement: Responsive and accessible docs shell

The package SHALL provide keyboard-accessible desktop and mobile navigation, visible focus states, color-mode support, and focus restoration after dismissing overlays.

#### Scenario: Mobile navigation keyboard flow

- **WHEN** a keyboard user opens and closes the mobile navigation with Escape
- **THEN** the overlay SHALL close and focus SHALL return to its trigger

#### Scenario: Desktop sidebar collapse

- **WHEN** a user collapses and expands the desktop sidebar
- **THEN** content layout, accessible labels, persisted state, and reduced-motion behavior SHALL remain valid
