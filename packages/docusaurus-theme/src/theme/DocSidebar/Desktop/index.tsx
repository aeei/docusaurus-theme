import React, { useEffect, useState } from "react";

import { useThemeConfig } from "@docusaurus/theme-common";
import Logo from "@theme/Logo";
import Content from "@theme/DocSidebar/Desktop/Content";
import type { Props } from "@theme/DocSidebar/Desktop";

import { SidebarThemeMenu } from "@theme/components/sidebar-theme-menu";
import { Kbd } from "@theme/components/ui/kbd";
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

import styles from "./styles.module.css";

function DocSidebarDesktop({ path, sidebar }: Props) {
  const {
    navbar: { hideOnScroll },
    docs: {
      sidebar: { hideable },
    },
  } = useThemeConfig();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [shortcutModifier, setShortcutModifier] = useState<"CMD" | "CTRL">(
    "CTRL"
  );

  useEffect(() => {
    setShortcutModifier(
      /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "CMD" : "CTRL"
    );
  }, []);

  return (
    <>
      {hideOnScroll && (
        <SidebarHeader className="group-data-[collapsible=icon]:hidden">
          <Logo tabIndex={-1} className={styles.sidebarLogo} />
        </SidebarHeader>
      )}
      <SidebarContent className="scroll-fade-y overflow-x-hidden">
        <div className="theme-doc-sidebar-navigation min-w-(--sidebar-width)">
          <Content path={path} sidebar={sidebar} />
        </div>
      </SidebarContent>
      <SidebarFooter className={styles.footer}>
        <div
          className={`${styles.footerControls} group-data-[collapsible=icon]:flex-col`}
        >
          <SidebarThemeMenu
            compact={collapsed}
            className={collapsed ? undefined : styles.themeTrigger}
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
                <span className="inline-flex items-center gap-0.5">
                  <Kbd>{shortcutModifier}</Kbd>
                  <span aria-hidden="true">+</span>
                  <Kbd>B</Kbd>
                </span>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </SidebarFooter>
    </>
  );
}

export default React.memo(DocSidebarDesktop);
