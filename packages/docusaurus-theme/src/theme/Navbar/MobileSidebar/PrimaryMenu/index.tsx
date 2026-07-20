import React, { type ReactNode } from "react";

import { useThemeConfig } from "@docusaurus/theme-common";
import { useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import NavbarItem, { type Props as NavbarItemConfig } from "@theme/NavbarItem";

import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
} from "@theme/components/ui/sidebar";

export default function NavbarMobilePrimaryMenu(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useThemeConfig().navbar.items as NavbarItemConfig[];

  return (
    <SidebarContent className="scroll-fade">
      <SidebarGroup>
        <SidebarMenu>
          {items.map((item, index) => (
            <NavbarItem
              mobile
              {...item}
              onClick={() => mobileSidebar.toggle()}
              key={index}
            />
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}
