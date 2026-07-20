/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * Swizzled from @docusaurus/theme-classic under the MIT License.
 */

import React from "react";

import {
  NavbarSecondaryMenuFiller,
  type NavbarSecondaryMenuComponent,
} from "@docusaurus/theme-common";
import { useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import { translate } from "@docusaurus/Translate";
import DocSidebarItems from "@theme/DocSidebarItems";
import type { Props } from "@theme/DocSidebar/Mobile";
import { SidebarMenu } from "@theme/components/ui/sidebar";

const DocSidebarMobileSecondaryMenu: NavbarSecondaryMenuComponent<Props> = ({
  sidebar,
  path,
}) => {
  const mobileSidebar = useNavbarMobileSidebar();

  return (
    <nav
      aria-label={translate({
        id: "theme.docs.sidebar.navAriaLabel",
        message: "Docs sidebar",
        description: "The ARIA label of the docs sidebar navigation",
      })}
    >
      <SidebarMenu>
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
    </nav>
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
