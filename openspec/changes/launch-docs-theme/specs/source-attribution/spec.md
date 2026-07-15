## ADDED Requirements

### Requirement: Preserve upstream license notice

The repository and distributed package SHALL preserve the Palo Alto Networks MIT copyright and permission notice for copied or substantial upstream source.

#### Scenario: License audit

- **WHEN** repository and tarball license files are inspected
- **THEN** the original upstream MIT notice SHALL be present and unmodified

### Requirement: Complete third-party provenance

`THIRD_PARTY_NOTICES.md` SHALL record every shipped copied or vendored project with source URL, use scope, exact version/commit or registry snapshot date, copied file paths, license identifier, and package-local license-text path.

#### Scenario: Vendored Base Nova audit

- **WHEN** a reviewer traces a vendored shadcn Base Nova component
- **THEN** the notice SHALL identify the registry snapshot and copied file and SHALL link it to the included MIT license text

### Requirement: Include applicable license texts

The repository SHALL store applicable third-party license texts under `LICENSES/`, and the npm package SHALL include LICENSE, README, third-party notices, and every license text required by shipped content.

#### Scenario: Packed artifact audit

- **WHEN** CI runs `npm pack` and lists the tarball
- **THEN** all required legal/attribution files SHALL be present and readable from the installed package

### Requirement: Preserve copied source headers

Existing copyright or license headers in copied source files SHALL NOT be removed.

#### Scenario: Header comparison

- **WHEN** a migrated file originated from upstream with a copyright/license header
- **THEN** the migrated copy SHALL preserve that header unless the license owner provides an explicit replacement requirement

### Requirement: Accurate public attribution

The root README and starter footer SHALL identify this project as maintained by aeei and based on Docusaurus OpenAPI Docs by Palo Alto Networks without implying that this fork is an official Palo Alto project.

#### Scenario: Footer rendering

- **WHEN** the starter footer renders on desktop or mobile
- **THEN** it SHALL link to the project, MIT license, third-party notices, upstream project, and Docusaurus, and SHALL NOT list unrelated upstream social/community links or claim project-wide `© aeei`

### Requirement: Remove uncertain provenance

External design/token references without clear provenance or redistribution terms SHALL be replaced before public release.

#### Scenario: Typography provenance audit

- **WHEN** the Toss-labelled typography scale is reviewed and no explicit reusable source/license can be documented
- **THEN** it SHALL be replaced with a project-owned neutral typography scale and SHALL NOT be represented as Toss-owned or Toss-derived

### Requirement: Dependency license inventory

The release process SHALL audit actual package dependencies and vendored source so the notice inventory matches shipped content.

#### Scenario: Dependency set changes

- **WHEN** a runtime dependency or vendored component is added or removed
- **THEN** CI or release review SHALL require the notice/license inventory to be updated before publication
