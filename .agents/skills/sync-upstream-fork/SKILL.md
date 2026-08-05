---
name: sync-upstream-fork
description: Synchronize a maintained GitHub fork with an upstream branch or release tag while preserving downstream customizations, package identities, release boundaries, and vendored consumer artifacts. Use for "upstream sync", "fork 최신화", "fork rebase/merge", integrating an upstream release, canonicalizing fork branches, or planning recurring upstream maintenance.
version: 1
created: 2026-08-05
updated: 2026-08-05
---

# Sync Upstream Fork

## Goal

Integrate reviewed upstream history without rewriting shared downstream history or silently dropping fork-owned behavior.

## This repository

- Downstream: `aeei/docusaurus-theme`
- Upstream: `PaloAltoNetworks/docusaurus-openapi-docs`
- Canonical branch: `main`
- Baseline SSOT: `UPSTREAM.md`
- Upstream-owned: OpenAPI plugin, schema renderer, demo, and their package versions
- AEEI-owned: `packages/docusaurus-theme/`, `examples/docs-starter/`, Base Nova audits/visual tests, legal notices, and `@aeei/docusaurus-theme` release
- Shared reconciliation: root manifests, `yarn.lock`, workflows, and top-level docs
- Consumer artifact: Deck repository-owned `docs/manual/vendor/docusaurus-theme.tgz`

Re-query the upstream latest GitHub release and default-branch head on every run. Never assume the baseline recorded in `UPSTREAM.md` is still current.

## Non-negotiable rules

- Read repository instructions and `UPSTREAM.md` before mutation.
- Use an isolated clean worktree. Never stash, reset, clean, force-push, or move unrelated user changes.
- Never rebase a shared canonical branch onto upstream. Merge an exact upstream tag/commit through a sync PR.
- Do not call an unsigned tag signed. Record its actual object type and verification result.
- Never resolve lockfiles with a blind `ours` or `theirs`. Regenerate them from the combined manifests.
- Preserve package identity and downstream release boundaries. Never reuse a package version for different archive bytes.
- Keep upstream sync, downstream feature work, package publication, and consumer artifact updates in separate reviewable stages.

## Workflow

### 1. Establish repository truth

1. Find repo root, current branch, dirty state, remotes, and GitHub fork metadata.
2. Resolve the canonical downstream branch from repository policy—not from stale GitHub defaults.
3. Identify the upstream repository, branch, exact release tag/commit, and current integrated baseline.
4. If duplicate downstream branches have unrelated histories:
   - compare semantic contents and commit ancestry;
   - archive stale heads with annotated tags;
   - switch default/protection/workflow targets to the canonical branch;
   - delete stale branches only after explicit authorization and recovery-tag verification.

Recommended evidence:

```bash
git status --short
git remote -v
gh api repos/OWNER/REPO --jq '{fork,parent:.parent.full_name,default_branch}'
git rev-list --left-right --count DOWNSTREAM...UPSTREAM
git merge-base DOWNSTREAM UPSTREAM
```

### 2. Analyze divergence before choosing a strategy

Run [`scripts/analyze-fork.sh`](scripts/analyze-fork.sh) with downstream and upstream refs.

Review:

- ahead/behind counts;
- common-base identity;
- changed-file overlap;
- `git merge-tree` predicted conflicts;
- functional/security upstream commits versus dependency-only commits;
- branch, workflow, version, and package-name drift.

Decision:

- **Tag merge**: default for maintained forks with shared history.
- **Selective cherry-pick**: only when fork policy intentionally tracks a documented subset.
- **Rebase**: only for an unpublished private patch queue and explicit user approval.

### 3. Record ownership

Create or verify a path ownership map. Use [`references/ownership-template.md`](references/ownership-template.md).

Typical classes:

- upstream-owned source;
- downstream-owned source;
- shared reconciliation surfaces;
- generated files and lockfiles;
- release metadata and consumer artifacts.

Do not resolve a conflict until its owner and preserved behavior are known.

### 4. Merge on an integration branch

```bash
git switch -c sync/upstream-vX.Y.Z origin/CANONICAL
git merge --no-ff upstream-tag-or-commit
```

For each conflict:

1. inspect base/ours/theirs;
2. apply the ownership policy;
3. regenerate lock/generated output from combined source inputs;
4. add a regression contract when the conflict exposes an undocumented invariant.

Preserve the upstream merge commit. If GitHub disallows merge commits, change repository merge policy before merging the sync PR; do not flatten upstream history accidentally.

### 5. Enforce artifact immutability

Before and after sync:

1. build the downstream package from a clean dependency state;
2. create the real package archive, not only `--dry-run` output;
3. compare archive file lists, semantic content, and cryptographic hashes;
4. if bytes change, bump the downstream package version—even when only toolchain formatting changed;
5. rebuild and record the final hash;
6. update every repository-owned consumer archive, integrity, lockfile, and contract in a separate consumer PR.

Never publish or vendor two different archives under one version.

### 6. Validate both inheritance directions

Run all relevant checks:

- frozen dependency install;
- upstream unit/integration regression tests;
- downstream contracts and independent review;
- all package builds;
- starter/example production build;
- browser/accessibility/visual matrix;
- package contents, notices, provenance, and hash;
- LSP/type diagnostics;
- workflow lint and `git diff --check`.

Use [`references/release-gates.md`](references/release-gates.md) for release and consumer gates.

### 7. Deliver in ordered PRs

1. Canonical branch/settings PR and repository-setting changes.
2. Upstream sync PR with merge history preserved.
3. Fork-specific release workflow/policy PR.
4. Consumer vendored-artifact PR when archive bytes changed.
5. Documentation/skill update after the process is proven.

PR body must state:

- upstream tag and commit;
- previous baseline;
- ahead/behind and predicted conflicts;
- conflict resolutions;
- downstream package version/hash decision;
- validation evidence;
- residual external configuration.

### 8. Release safely

- Upstream release automation must not publish fork-owned or upstream packages accidentally.
- Prefer manual environment-gated npm trusted publishing for a fork-owned package.
- Build/package in an unprivileged job; hand off one verified tarball to the privileged publish job.
- Pin Node/npm and action SHAs.
- Verify tar manifest name/version, artifact SHA-512, registry `dist.integrity`, and exact source SHA.
- Reserve or verify the immutable source tag before npm publish. Support a documented exact-SHA retry/recovery path.
- Protect release tags from update, deletion, and non-fast-forward mutation.
- Treat npm/GitHub environment bindings as external release gates; never claim publish-ready until verified.

## Stop conditions

Stop and ask the user when:

- canonical branch or upstream source is ambiguous;
- upstream tag provenance is unexpected;
- conflict ownership is unclear;
- sync changes a public API or package identity without a migration decision;
- archive bytes change but no version bump/consumer update is approved;
- required credentials, trusted-publisher binding, environment approval, or tag policy is missing;
- any required validation fails.

## Final report

Report:

- canonical/downstream/upstream refs and commits;
- merge strategy and conflict list;
- preserved downstream surfaces;
- package version and archive hash before/after;
- PRs/settings changed;
- validation results;
- remaining external or operational risks.
