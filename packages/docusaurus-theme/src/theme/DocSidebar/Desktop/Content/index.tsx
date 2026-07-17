/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * Swizzled from @docusaurus/theme-classic under the MIT License.
 */

import React, { type ReactNode, useState } from "react";

import { translate } from "@docusaurus/Translate";
import { ThemeClassNames } from "@docusaurus/theme-common";
import {
  useAnnouncementBar,
  useScrollPosition,
} from "@docusaurus/theme-common/internal";
import DocSidebarItems from "@theme/DocSidebarItems";
import type { Props } from "@theme/DocSidebar/Desktop/Content";
import { SidebarMenu } from "@theme/components/ui/sidebar";
import clsx from "clsx";

import styles from "./styles.module.css";

function useShowAnnouncementBar() {
  const { isActive } = useAnnouncementBar();
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(isActive);
  useScrollPosition(
    ({ scrollY }) => {
      if (isActive) setShowAnnouncementBar(scrollY === 0);
    },
    [isActive]
  );
  return isActive && showAnnouncementBar;
}

export default function DocSidebarDesktopContent({
  path,
  sidebar,
  className,
}: Props): ReactNode {
  const showAnnouncementBar = useShowAnnouncementBar();

  return (
    <nav
      aria-label={translate({
        id: "theme.docs.sidebar.navAriaLabel",
        message: "Docs sidebar",
        description: "The ARIA label of the docs sidebar navigation",
      })}
      className={clsx(
        "menu thin-scrollbar",
        styles.menu,
        showAnnouncementBar && styles.menuWithAnnouncementBar,
        className
      )}
    >
      <SidebarMenu className={ThemeClassNames.docs.docSidebarMenu}>
        <DocSidebarItems items={sidebar} activePath={path} level={1} />
      </SidebarMenu>
    </nav>
  );
}
