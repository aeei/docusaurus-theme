/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * Swizzled from @docusaurus/theme-classic under the MIT License.
 */

import React, { type ReactNode } from "react";

import Translate from "@docusaurus/Translate";
import { useThemeConfig } from "@docusaurus/theme-common";
import { useNavbarSecondaryMenu } from "@docusaurus/theme-common/internal";
import { ArrowLeft } from "lucide-react";

import { Button } from "@theme/components/ui/button";

export default function NavbarMobileSidebarSecondaryMenu(): ReactNode {
  const isPrimaryMenuEmpty = useThemeConfig().navbar.items.length === 0;
  const secondaryMenu = useNavbarSecondaryMenu();

  return (
    <>
      {!isPrimaryMenuEmpty && (
        <Button
          type="button"
          variant="ghost"
          className="navbar-sidebar__back"
          onClick={() => secondaryMenu.hide()}
        >
          <ArrowLeft aria-hidden="true" />
          <Translate
            id="theme.navbar.mobileSidebarSecondaryMenu.backButtonLabel"
            description="The label of the back button to return to the main mobile menu"
          >
            Back to main menu
          </Translate>
        </Button>
      )}
      {secondaryMenu.content}
    </>
  );
}
