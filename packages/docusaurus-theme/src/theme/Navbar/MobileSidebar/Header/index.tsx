import React, { type ReactNode } from "react";

import { translate } from "@docusaurus/Translate";
import { useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import NavbarColorModeToggle from "@theme/Navbar/ColorModeToggle";
import NavbarLogo from "@theme/Navbar/Logo";
import { X } from "lucide-react";

import { Button } from "@theme/components/ui/button";

export default function NavbarMobileSidebarHeader(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();

  return (
    <div className="theme-mobile-sheet__header">
      <NavbarLogo />
      <div className="theme-mobile-sheet__actions">
        <NavbarColorModeToggle />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={translate({
            id: "theme.docs.sidebar.closeSidebarButtonAriaLabel",
            message: "Close navigation bar",
            description:
              "The accessible label of the mobile navigation close button.",
          })}
          onClick={() => mobileSidebar.toggle()}
        >
          <X aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
