import React, { type ReactNode, useCallback, useState } from "react";

import { useDocsSidebar } from "@docusaurus/plugin-content-docs/client";
import { useThemeConfig } from "@docusaurus/theme-common";
import BackToTopButton from "@theme/BackToTopButton";
import DocRootLayoutMain from "@theme/DocRoot/Layout/Main";
import DocRootLayoutSidebar from "@theme/DocRoot/Layout/Sidebar";
import type { Props } from "@theme/DocRoot/Layout";
import { SidebarProvider } from "@theme/components/ui/sidebar";
import { TooltipProvider } from "@theme/components/ui/tooltip";

export default function DocRootLayout({ children }: Props): ReactNode {
  const sidebar = useDocsSidebar();
  const {
    docs: {
      sidebar: { hideable },
    },
  } = useThemeConfig();
  const [hiddenSidebarContainer, setHiddenSidebarContainer] = useState(false);
  const setSidebarOpen = useCallback(
    (open: boolean) => {
      if (hideable) setHiddenSidebarContainer(!open);
    },
    [hideable]
  );

  return (
    <div className="theme-doc-root-layout">
      <BackToTopButton />
      <TooltipProvider>
        <SidebarProvider
          open={!hiddenSidebarContainer}
          onOpenChange={setSidebarOpen}
          className="theme-doc-shell"
          style={
            {
              "--sidebar-width": "var(--doc-sidebar-width)",
              "--sidebar-width-icon": "var(--doc-sidebar-hidden-width)",
            } as React.CSSProperties
          }
        >
          {sidebar && (
            <DocRootLayoutSidebar
              sidebar={sidebar.items}
              hiddenSidebarContainer={hiddenSidebarContainer}
              setHiddenSidebarContainer={setHiddenSidebarContainer}
            />
          )}
          <DocRootLayoutMain hiddenSidebarContainer={hiddenSidebarContainer}>
            {children}
          </DocRootLayoutMain>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
}
