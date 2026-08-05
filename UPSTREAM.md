# Upstream synchronization

This repository is a maintained fork of [`PaloAltoNetworks/docusaurus-openapi-docs`](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs).

## Canonical branches

- `main` is the only development and release source for this fork.
- Upstream history is fetched from `PaloAltoNetworks/docusaurus-openapi-docs` as the `upstream` remote.
- Shared `main` is never rebased onto upstream. Each accepted upstream tag is merged through a dedicated `sync/upstream-vX.Y.Z` pull request.

## Ownership

- Upstream owns the original OpenAPI plugin, schema renderer, demo, and their package versions.
- AEEI owns `packages/docusaurus-theme/`, `examples/docs-starter/`, Base Nova audits, visual tests, legal notices, and the `@aeei/docusaurus-theme` release boundary.
- Root manifests, `yarn.lock`, shared workflows, and top-level documentation require explicit reconciliation.

## Sync procedure

1. Fetch upstream branches and tags.
2. Create `sync/upstream-vX.Y.Z` from current `origin/main`.
3. Merge the signed upstream release tag with `--no-ff`.
4. Resolve source conflicts according to ownership. Regenerate `yarn.lock` from the combined manifests instead of choosing either side.
5. Run upstream tests plus the complete AEEI theme, docs-starter, package, and browser validation.
6. Compare the packed `@aeei/docusaurus-theme` artifact with the current release. If its bytes change, bump the package version and update every vendored consumer artifact; never reuse a version for a different archive.
7. Merge only after independent review and green CI.

## Baseline

- Last integrated upstream release: `v5.1.2`
- Upstream baseline commit: `9f33f16352eaa0cad62bf54668de702ce2ce1a8a`
- Current AEEI theme release: `0.1.9`
