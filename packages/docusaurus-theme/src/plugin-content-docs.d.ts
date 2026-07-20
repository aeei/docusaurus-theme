import type { TOCItem } from "@docusaurus/mdx-loader";

declare module "@docusaurus/plugin-content-docs/client" {
  type NavbarDoc = {
    id: string;
    path: string;
    sidebar?: string;
    unlisted?: boolean;
  };

  export function useActiveDocContext(pluginId?: string): {
    activeDoc?: NavbarDoc;
  };
  export function useLayoutDoc(
    docId: string,
    pluginId?: string
  ): NavbarDoc | null;
  export function useDoc(): {
    toc: readonly TOCItem[];
    frontMatter: {
      toc_min_heading_level: number;
      toc_max_heading_level: number;
    };
  };
}
