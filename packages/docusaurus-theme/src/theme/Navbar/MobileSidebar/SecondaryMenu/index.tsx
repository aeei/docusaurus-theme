/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * Swizzled from @docusaurus/theme-classic under the MIT License.
 */

import React, { type ReactNode } from "react";

import { translate } from "@docusaurus/Translate";
import { useThemeConfig } from "@docusaurus/theme-common";
import { useNavbarSecondaryMenu } from "@docusaurus/theme-common/internal";
import { ArrowLeft } from "lucide-react";

import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@theme/components/ui/sidebar";

export default function NavbarMobileSidebarSecondaryMenu(): ReactNode {
  const isPrimaryMenuEmpty = useThemeConfig().navbar.items.length === 0;
  const secondaryMenu = useNavbarSecondaryMenu();
  const backButtonLabel = translate({
    id: "theme.navbar.mobileSidebarSecondaryMenu.backButtonLabel",
    message: "Back to main menu",
    description:
      "The label of the back button to return to the main mobile menu",
  }).replace(/^←\s*/u, "");

  return (
    <SidebarContent className="scroll-fade">
      <SidebarGroup>
        {!isPrimaryMenuEmpty && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                type="button"
                onClick={() => secondaryMenu.hide()}
              >
                <ArrowLeft aria-hidden="true" />
                {backButtonLabel}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        {secondaryMenu.content}
      </SidebarGroup>
    </SidebarContent>
  );
}
