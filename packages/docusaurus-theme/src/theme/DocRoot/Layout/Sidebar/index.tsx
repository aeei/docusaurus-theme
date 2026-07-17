import React, { type ReactNode } from "react";

import { useDocsSidebar } from "@docusaurus/plugin-content-docs/client";
import { useLocation } from "@docusaurus/router";
import { useThemeConfig, useWindowSize } from "@docusaurus/theme-common";
import DocSidebar from "@theme/DocSidebar";
import type { Props } from "@theme/DocRoot/Layout/Sidebar";
import { Sidebar, useSidebar } from "@theme/components/ui/sidebar";

function ResetOnSidebarChange({ children }: { children: ReactNode }) {
  const sidebar = useDocsSidebar();
  return (
    <React.Fragment key={sidebar?.name ?? "noSidebar"}>
      {children}
    </React.Fragment>
  );
}

export default function DocRootLayoutSidebar({ sidebar }: Props): ReactNode {
  const { pathname } = useLocation();
  const { toggleSidebar } = useSidebar();
  const windowSize = useWindowSize();
  const {
    docs: {
      sidebar: { hideable },
    },
  } = useThemeConfig();
  const docSidebar = (
    <DocSidebar
      sidebar={sidebar}
      path={pathname}
      onCollapse={toggleSidebar}
      isHidden={false}
    />
  );

  return (
    <ResetOnSidebarChange>
      {windowSize === "mobile" && docSidebar}
      {windowSize !== "mobile" && (
        <Sidebar
          side="left"
          variant="sidebar"
          collapsible={hideable ? "icon" : "none"}
          className="theme-doc-sidebar-container"
        >
          {docSidebar}
        </Sidebar>
      )}
    </ResetOnSidebarChange>
  );
}
