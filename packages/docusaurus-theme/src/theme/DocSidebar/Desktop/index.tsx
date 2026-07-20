import React, { useEffect, useState } from "react";

import { useThemeConfig } from "@docusaurus/theme-common";
import Logo from "@theme/Logo";
import Content from "@theme/DocSidebar/Desktop/Content";
import type { Props } from "@theme/DocSidebar/Desktop";

import { SidebarThemeMenu } from "@theme/components/sidebar-theme-menu";
import { Kbd, KbdGroup } from "@theme/components/ui/kbd";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@theme/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@theme/components/ui/tooltip";

function DocSidebarDesktop({ path, sidebar }: Props) {
  const {
    navbar: { hideOnScroll },
    docs: {
      sidebar: { hideable },
    },
  } = useThemeConfig();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [shortcutModifier, setShortcutModifier] = useState<"⌘" | "Ctrl">(
    "Ctrl"
  );

  useEffect(() => {
    setShortcutModifier(
      /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "⌘" : "Ctrl"
    );
  }, []);

  return (
    <>
      {hideOnScroll && !collapsed && (
        <SidebarHeader className="theme-doc-sidebar-header">
          <Logo tabIndex={-1} />
        </SidebarHeader>
      )}
      <SidebarContent className="theme-doc-sidebar-content scroll-fade">
        {!collapsed && <Content path={path} sidebar={sidebar} />}
      </SidebarContent>
      <SidebarFooter className="theme-doc-sidebar-footer">
        <div className="theme-doc-sidebar-footer-actions">
          <SidebarThemeMenu
            compact={collapsed}
            side={collapsed ? "right" : "top"}
            align="start"
          />
          {hideable && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <SidebarTrigger
                    aria-keyshortcuts="Control+B Meta+B"
                    aria-label={
                      collapsed ? "Expand sidebar" : "Collapse sidebar"
                    }
                  />
                }
              />
              <TooltipContent side={collapsed ? "right" : "top"}>
                {collapsed ? "Expand" : "Collapse"}
                <KbdGroup>
                  <Kbd>{shortcutModifier}</Kbd>
                  <Kbd>B</Kbd>
                </KbdGroup>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </SidebarFooter>
    </>
  );
}

export default React.memo(DocSidebarDesktop);
