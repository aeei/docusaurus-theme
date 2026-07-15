import React from "react";

import { useThemeConfig } from "@docusaurus/theme-common";
import Logo from "@theme/Logo";
import CollapseButton from "@theme/DocSidebar/Desktop/CollapseButton";
import Content from "@theme/DocSidebar/Desktop/Content";
import type { Props } from "@theme/DocSidebar/Desktop";
import clsx from "clsx";

import { SidebarThemeMenu } from "@theme/components/sidebar-theme-menu";

import styles from "./styles.module.css";

function DocSidebarDesktop({ path, sidebar, onCollapse, isHidden }: Props) {
  const {
    navbar: { hideOnScroll },
    docs: {
      sidebar: { hideable },
    },
  } = useThemeConfig();

  return (
    <div
      className={clsx(
        styles.sidebar,
        hideOnScroll && styles.sidebarWithHideableNavbar,
        isHidden && styles.sidebarHidden
      )}
    >
      {hideOnScroll && <Logo tabIndex={-1} className={styles.sidebarLogo} />}
      <Content path={path} sidebar={sidebar} />
      <div className={styles.footer}>
        <div className={styles.footerControls}>
          <SidebarThemeMenu className={styles.themeTrigger} />
          {hideable && <CollapseButton onClick={onCollapse} />}
        </div>
      </div>
    </div>
  );
}

export default React.memo(DocSidebarDesktop);
