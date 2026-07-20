import React, {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useState,
} from "react";

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
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="container-wrapper flex flex-1 flex-col px-2">
            <SidebarProvider
              className="min-h-min flex-1 items-start px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--column-top-spacing:calc(var(--spacing)*6)] 3xl:fixed:container 3xl:fixed:px-3"
              open={!hiddenSidebarContainer}
              onOpenChange={setSidebarOpen}
              style={
                {
                  "--sidebar-width": "18rem",
                  "--sidebar-width-icon": "5rem",
                } as CSSProperties
              }
            >
              {sidebar && (
                <DocRootLayoutSidebar
                  sidebar={sidebar.items}
                  hiddenSidebarContainer={hiddenSidebarContainer}
                  setHiddenSidebarContainer={setHiddenSidebarContainer}
                />
              )}
              <DocRootLayoutMain
                hiddenSidebarContainer={hiddenSidebarContainer}
              >
                {children}
              </DocRootLayoutMain>
            </SidebarProvider>
          </div>
        </main>
      </TooltipProvider>
    </div>
  );
}
