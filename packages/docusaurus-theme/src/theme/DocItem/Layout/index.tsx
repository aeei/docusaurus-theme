import React, { type ReactNode } from "react";

import clsx from "clsx";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import ContentVisibility from "@theme/ContentVisibility";
import DocBreadcrumbs from "@theme/DocBreadcrumbs";
import DocItemContent from "@theme/DocItem/Content";
import DocItemFooter from "@theme/DocItem/Footer";
import type { Props } from "@theme/DocItem/Layout";
import DocItemPaginator from "@theme/DocItem/Paginator";
import DocItemTOCDesktop from "@theme/DocItem/TOC/Desktop";
import DocItemTOCMobile from "@theme/DocItem/TOC/Mobile";
import DocVersionBadge from "@theme/DocVersionBadge";
import DocVersionBanner from "@theme/DocVersionBanner";

import CopyPageActions from "@theme/components/copy-page-actions";

function useDocTOC() {
  const { frontMatter, toc } = useDoc() as any;

  const hidden = frontMatter.hide_table_of_contents;
  const canRender = !hidden && toc.length > 0;

  return {
    hidden,
    mobile: canRender ? <DocItemTOCMobile /> : undefined,
    desktop: canRender ? <DocItemTOCDesktop /> : undefined,
  };
}

export default function DocItemLayout({ children }: Props): ReactNode {
  const docTOC = useDocTOC();
  const { metadata } = useDoc() as any;

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="mx-auto flex w-full max-w-160 min-w-0 flex-1 flex-col gap-6 px-4 py-6 text-foreground md:px-0 dark:text-foreground">
          <ContentVisibility metadata={metadata} />
          <div className={clsx("theme-doc-page__content")}>
            <DocVersionBanner />
            <div className="theme-doc-page__stack">
              <article className="theme-doc-page__article">
                <div className="theme-doc-page__breadcrumbs">
                  <DocBreadcrumbs />
                </div>
                <DocVersionBadge />
                {docTOC.mobile}
                <CopyPageActions />
                <DocItemContent>{children}</DocItemContent>
                <DocItemFooter />
              </article>
              <DocItemPaginator />
            </div>
          </div>
        </div>
      </div>
      {docTOC.desktop && (
        <div className="theme-doc-page__toc">{docTOC.desktop}</div>
      )}
    </>
  );
}
