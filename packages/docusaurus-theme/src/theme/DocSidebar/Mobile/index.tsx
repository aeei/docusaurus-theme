/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * Swizzled from @docusaurus/theme-classic under the MIT License.
 */

import React from "react";

import {
  NavbarSecondaryMenuFiller,
  ThemeClassNames,
  type NavbarSecondaryMenuComponent,
} from "@docusaurus/theme-common";
import { useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import DocSidebarItems from "@theme/DocSidebarItems";
import type { Props } from "@theme/DocSidebar/Mobile";
import {
  SidebarContent,
  SidebarMenu,
  SidebarProvider,
} from "@theme/components/ui/sidebar";
import clsx from "clsx";

const DocSidebarMobileSecondaryMenu: NavbarSecondaryMenuComponent<Props> = ({
  sidebar,
  path,
}) => {
  const mobileSidebar = useNavbarMobileSidebar();

  return (
    <SidebarProvider className="min-h-0! flex-1" defaultOpen>
      <SidebarContent className="theme-mobile-doc-sidebar">
        <SidebarMenu
          className={clsx(ThemeClassNames.docs.docSidebarMenu, "menu__list")}
        >
          <DocSidebarItems
            items={sidebar}
            activePath={path}
            onItemClick={(item) => {
              if (
                item.type === "link" ||
                (item.type === "category" && item.href)
              ) {
                mobileSidebar.toggle();
              }
            }}
            level={1}
          />
        </SidebarMenu>
      </SidebarContent>
    </SidebarProvider>
  );
};

function DocSidebarMobile(props: Props) {
  return (
    <NavbarSecondaryMenuFiller
      component={DocSidebarMobileSecondaryMenu}
      props={props}
    />
  );
}

export default React.memo(DocSidebarMobile);
