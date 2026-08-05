# Fork ownership template

Fill this before resolving upstream conflicts.

| Surface                      | Owner               | Resolution rule                                                             | Required validation                  |
| ---------------------------- | ------------------- | --------------------------------------------------------------------------- | ------------------------------------ |
| Original upstream packages   | Upstream            | Take reviewed upstream tag unless downstream contract intentionally differs | Upstream tests/build                 |
| Fork-owned packages/features | Downstream          | Preserve downstream behavior and package identity                           | Downstream contracts/browser/package |
| Root manifests               | Shared              | Reconcile all workspaces and engines explicitly                             | Frozen install/full build            |
| Lockfiles                    | Generated           | Regenerate from combined manifests; never blind ours/theirs                 | Frozen reinstall/no diff             |
| Workflows                    | Shared              | Preserve fork repo guards and adopt compatible upstream security fixes      | actionlint/policy tests              |
| Notices/provenance           | Shared              | Distinguish runtime version from copied-source snapshot                     | Legal/package contracts              |
| Release versions/tags        | Downstream          | Never reuse version for changed bytes                                       | Pack hash/registry/tag checks        |
| Vendored consumer archive    | Downstream consumer | Update exact archive, hash, integrity, and every consumer lockfile together | Clean consumer installs/builds       |

Record intentional exceptions in the repository's `UPSTREAM.md` or equivalent SSOT.
