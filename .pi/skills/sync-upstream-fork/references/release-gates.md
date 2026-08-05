# Release and consumer gates

## Package gate

- [ ] Exact package name and version verified inside the tar manifest.
- [ ] Real tarball generated from clean build output.
- [ ] SHA-256/SHA-512 recorded.
- [ ] Previous archive compared semantically and byte-for-byte.
- [ ] Version bumped when bytes changed.
- [ ] Licenses, notices, copied-source provenance, and package file list verified.
- [ ] No unrelated workspace package can be published by the workflow.

## Trusted publishing gate

- [ ] Workflow is manual-only and canonical-main-only.
- [ ] Exact workflow filename/repository/environment bound in npm trusted publisher settings.
- [ ] Build job has read-only contents and no persisted Git credentials or OIDC permission.
- [ ] Privileged job has no checkout/build/untrusted code execution.
- [ ] Protected environment reviewer and branch policy verified through GitHub API/UI.
- [ ] Exact version and operation confirmation required.
- [ ] Source SHA is a canonical-main ancestor and matches checked-out HEAD.
- [ ] Source tag is reserved/verified before npm publish.
- [ ] Tag update/deletion/non-fast-forward protections active.
- [ ] Registry `dist.integrity` equals the uploaded tarball.
- [ ] Exact-SHA retry/recovery path documented and tested.

## Consumer gate

- [ ] Repository-owned archive replaced with the reviewed package tarball.
- [ ] Consumer contract expected hash/version updated.
- [ ] Every consumer lockfile records identical local path, version, and integrity.
- [ ] Frozen installs pass with the CI package-manager major/version.
- [ ] Typechecks, production builds, runtime packaging, and browser audit pass.
- [ ] Behavior delta/spec updated when externally observable behavior changes.
- [ ] Consumer PR merged only after upstream package PR and validation are complete.
