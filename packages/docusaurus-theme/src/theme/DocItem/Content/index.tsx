import React, { type ReactNode } from "react";

import { useDoc } from "@docusaurus/plugin-content-docs/client";
import { ThemeClassNames } from "@docusaurus/theme-common";
import Heading from "@theme/Heading";
import MDXContent from "@theme/MDXContent";
import type { Props } from "@theme/DocItem/Content";

function useSyntheticTitle(): string | null {
  const { metadata, frontMatter, contentTitle } = useDoc() as any;
  const shouldRender =
    !frontMatter.hide_title && typeof contentTitle === "undefined";
  return shouldRender ? metadata.title : null;
}

export default function DocItemContent({ children }: Props): ReactNode {
  const syntheticTitle = useSyntheticTitle();

  return (
    <div className={ThemeClassNames.docs.docMarkdown}>
      {syntheticTitle ? (
        <header>
          <Heading as="h1">{syntheticTitle}</Heading>
        </header>
      ) : null}
      <MDXContent>{children}</MDXContent>
    </div>
  );
}
