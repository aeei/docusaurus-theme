import React, { type ReactNode } from "react";

import { useDoc } from "@docusaurus/plugin-content-docs/client";
import Translate from "@docusaurus/Translate";
import TOCItems from "@theme/TOCItems";

const LINK_CLASS_NAME = "table-of-contents__link toc-highlight";
const LINK_ACTIVE_CLASS_NAME = "table-of-contents__link--active";

export default function DocItemTOCDesktop(): ReactNode {
  const { toc, frontMatter } = useDoc();

  return (
    <div className="theme-doc-toc-desktop flex min-h-0 flex-1 flex-col gap-4">
      <div className="h-(--top-spacing) shrink-0" aria-hidden="true" />
      <div className="theme-doc-toc-desktop__body flex min-h-0 flex-1 flex-col px-8">
        <div className="theme-doc-toc-desktop__scroll flex min-h-0 flex-1 scroll-fade scrollbar-none flex-col overflow-y-auto">
          <div className="theme-doc-toc-desktop__list flex flex-col gap-2 p-4 pt-0 text-sm">
            <p className="theme-doc-toc-desktop__header h-6 bg-background text-xs font-medium text-muted-foreground">
              <Translate
                id="theme.TOCCollapsible.toggleButtonLabel"
                description="The label used by the button on the collapsible TOC component"
              >
                On this page
              </Translate>
            </p>
            <TOCItems
              toc={toc}
              minHeadingLevel={frontMatter.toc_min_heading_level}
              maxHeadingLevel={frontMatter.toc_max_heading_level}
              className="table-of-contents"
              linkClassName={LINK_CLASS_NAME}
              linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
