import React, { type ReactNode } from "react";

import { useDocsSidebar } from "@docusaurus/plugin-content-docs/client";
import { useLocation } from "@docusaurus/router";
import { useThemeConfig } from "@docusaurus/theme-common";
import DocSidebarDesktop from "@theme/DocSidebar/Desktop";
import DocSidebarMobile from "@theme/DocSidebar/Mobile";
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
  const { state, toggleSidebar } = useSidebar();
  const {
    docs: {
      sidebar: { hideable },
    },
  } = useThemeConfig();

  const desktopSidebar = (
    <DocSidebarDesktop
      sidebar={sidebar}
      path={pathname}
      onCollapse={toggleSidebar}
      isHidden={false}
    />
  );

  return (
    <ResetOnSidebarChange>
      <DocSidebarMobile
        sidebar={sidebar}
        path={pathname}
        onCollapse={toggleSidebar}
        isHidden={false}
      />
      <div
        className="theme-doc-sidebar-desktop hidden lg:block"
        data-collapsed={state === "collapsed"}
      >
        <Sidebar
          side="left"
          variant="sidebar"
          collapsible={hideable ? "icon" : "none"}
          className="theme-doc-sidebar-container"
        >
          {desktopSidebar}
        </Sidebar>
      </div>
    </ResetOnSidebarChange>
  );
}
