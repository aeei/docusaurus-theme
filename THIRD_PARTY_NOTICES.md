# Third-party notices

This repository is a modified fork of [PaloAltoNetworks/docusaurus-openapi-docs](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs). It is not an official Palo Alto Networks project.

| Project                 | Source                                                              | Version / snapshot                                 | Use                                                      | License text                        |
| ----------------------- | ------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------- | ----------------------------------- |
| Docusaurus OpenAPI Docs | https://github.com/PaloAltoNetworks/docusaurus-openapi-docs         | `9f33f16352eaa0cad62bf54668de702ce2ce1a8a`         | Fork baseline and selected docs theme seams              | `LICENSES/PaloAltoNetworks-MIT.txt` |
| Docusaurus              | https://github.com/facebook/docusaurus                              | Runtime `3.10.2`; selected theme snapshot `3.10.1` | Framework, classic theme interfaces, Mermaid integration | `LICENSES/Docusaurus-MIT.txt`       |
| shadcn/ui               | https://github.com/shadcn-ui/ui                                     | `shadcn@4.12.0`, Base Nova registry                | Vendored UI component source and Tailwind variants       | `LICENSES/shadcn-ui-MIT.txt`        |
| Base UI                 | https://github.com/mui/base-ui                                      | `@base-ui/react@1.6.0`                             | Interactive primitive runtime                            | `LICENSES/Base-UI-MIT.txt`          |
| Lucide                  | https://github.com/lucide-icons/lucide                              | `lucide-react@0.468.0`                             | UI icons                                                 | `LICENSES/Lucide-ISC.txt`           |
| Mermaid                 | https://github.com/mermaid-js/mermaid                               | Docusaurus-compatible Mermaid 11.x                 | Starter diagrams                                         | `LICENSES/Mermaid-MIT.txt`          |
| Copy Page Button        | https://github.com/portdeveloper/docusaurus-plugin-copy-page-button | `0.8.4`                                            | Optional starter Markdown-route generation               | Package metadata: MIT               |
| Geist                   | https://github.com/vercel/geist-font                                | Snapshot 2026-07-18                                | Bundled Sans and Mono variable fonts                     | `LICENSES/Geist-OFL.txt`            |
| Pretendard              | https://github.com/orioncactus/pretendard                           | `v1.3.9`                                           | Unmodified bundled Korean variable webfont               | `LICENSES/Pretendard-OFL-1.1.txt`   |
| tw-animate-css          | https://github.com/Wombosvideo/tw-animate-css                       | Snapshot 2026-07-18                                | Base Nova animation utilities                            | `LICENSES/tw-animate-css-MIT.txt`   |

## Design references

The docs prose contract in `packages/docusaurus-theme/src/theme/base.scss` is adapted from the live `ui.shadcn.com` `.typeset` CSS snapshot captured on 2026-07-18 in `/tmp/typeset-rules.txt`, then narrowed for Docusaurus article content and code-block ownership.

The package-level copied-file inventory is maintained in `packages/docusaurus-theme/VENDORED_SOURCES.md`. Existing copyright/license headers are preserved in copied files.

Nextra was used only as a visual reference. No Nextra source code or runtime dependency is included.
