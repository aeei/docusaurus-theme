import type { TOCItem } from "@docusaurus/mdx-loader";

declare module "@docusaurus/plugin-content-docs/client" {
  export function useDoc(): {
    toc: readonly TOCItem[];
    frontMatter: {
      toc_min_heading_level: number;
      toc_max_heading_level: number;
    };
  };
}
