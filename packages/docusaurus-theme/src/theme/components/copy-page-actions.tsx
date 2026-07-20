import * as React from "react";
import { useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { usePluginData } from "@docusaurus/useGlobalData";

import { DocsCopyPage } from "./docs-copy-page";

export default function CopyPageActions() {
  const location = useLocation();
  const baseUrl = useBaseUrl("/");
  const data = usePluginData("@aeei/docusaurus-theme") as
    | { copyPage?: { enabled?: boolean } }
    | undefined;
  const enabled = data?.copyPage?.enabled ?? false;

  const markdownUrl = React.useMemo(() => {
    const basePath = baseUrl.replace(/\/$/, "");
    const pagePath = location.pathname.replace(/\/$/, "");
    return pagePath === basePath ? `${baseUrl}index.md` : `${pagePath}.md`;
  }, [baseUrl, location.pathname]);

  const copyPage = React.useCallback(async () => {
    const response = await fetch(markdownUrl);
    if (!response.ok) throw new Error(String(response.status));
    await navigator.clipboard.writeText(await response.text());
  }, [markdownUrl]);

  const copyMarkdownLink = React.useCallback(
    () =>
      navigator.clipboard.writeText(
        new URL(markdownUrl, window.location.origin).href
      ),
    [markdownUrl]
  );

  if (!enabled) return null;

  return (
    <div className="theme-copy-page-actions">
      <DocsCopyPage
        copyPage={copyPage}
        markdownUrl={markdownUrl}
        copyMarkdownLink={copyMarkdownLink}
      />
    </div>
  );
}
