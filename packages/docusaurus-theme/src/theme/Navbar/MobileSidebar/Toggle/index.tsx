import React, { type ReactNode } from "react";

import { translate } from "@docusaurus/Translate";
import { useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import { Menu } from "lucide-react";

import { Button } from "@theme/components/ui/button";

export default function MobileSidebarToggle(): ReactNode {
  const { toggle, shown } = useNavbarMobileSidebar();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={translate({
        id: "theme.docs.sidebar.toggleSidebarButtonAriaLabel",
        message: "Toggle navigation bar",
        description: "The accessible label of the mobile navigation toggle.",
      })}
      aria-expanded={shown}
      data-mobile-navigation-trigger=""
    >
      <Menu aria-hidden="true" />
    </Button>
  );
}
