import React, { type ReactNode } from "react";

import NavbarNavLink from "@theme/NavbarItem/NavbarNavLink";
import type { Props } from "@theme/NavbarItem/DefaultNavbarItem/Mobile";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@theme/components/ui/sidebar";

export default function DefaultNavbarItemMobile({
  className: _className,
  isDropdownItem,
  ...props
}: Props): ReactNode {
  const link = <NavbarNavLink {...props} />;

  if (isDropdownItem) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton render={link} />
      </SidebarMenuSubItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton render={link} />
    </SidebarMenuItem>
  );
}
