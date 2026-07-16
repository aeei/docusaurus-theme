# Vendored source inventory

Snapshot date: 2026-07-16

| Source                                   | Revision                                   | Local paths                                          | Decision                                                            |
| ---------------------------------------- | ------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------- |
| PaloAltoNetworks/docusaurus-openapi-docs | `9f33f16352eaa0cad62bf54668de702ce2ce1a8a` | `src/index.ts`, selected `src/theme/**` docs seams   | Keep with original headers; OpenAPI-only source removed             |
| shadcn/ui Base Nova registry             | registry snapshot 2026-07-16               | `src/theme/components/ui/**`, `src/theme/shadcn.css` | Keep only components used by the docs theme; Base UI runtime only   |
| Docusaurus theme-classic 3.10.1          | `@docusaurus/theme-classic@3.10.1`         | selected docs theme override interfaces              | Keep Docusaurus alias contracts; classic remains the fallback layer |

Detailed license texts and redistribution notices are maintained in the repository and package `THIRD_PARTY_NOTICES.md` and `LICENSES/` paths.
