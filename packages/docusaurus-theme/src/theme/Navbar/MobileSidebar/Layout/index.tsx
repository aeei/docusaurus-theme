import React, { type ReactNode } from "react";

import {
  useNavbarMobileSidebar,
  useNavbarSecondaryMenu,
} from "@docusaurus/theme-common/internal";

import { Sheet, SheetContent } from "@theme/components/ui/sheet";

type Props = {
  header: ReactNode;
  primaryMenu: ReactNode;
  secondaryMenu: ReactNode;
};

export default function NavbarMobileSidebarLayout({
  header,
  primaryMenu,
  secondaryMenu,
}: Props): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();
  const { shown: secondaryMenuShown } = useNavbarSecondaryMenu();

  return (
    <Sheet
      open={mobileSidebar.shown}
      onOpenChange={(open) => {
        if (!open && mobileSidebar.shown) mobileSidebar.toggle();
      }}
      onOpenChangeComplete={(open) => {
        if (!open) {
          document.querySelector<HTMLButtonElement>(".navbar__toggle")?.focus();
        }
      }}
    >
      <SheetContent
        side="left"
        showCloseButton={false}
        className="theme-mobile-sheet"
        aria-label="Navigation menu"
      >
        {header}
        <div className="theme-mobile-sheet__menus">
          <div
            className="theme-mobile-sheet__panel theme-mobile-sheet__panel--primary"
            hidden={secondaryMenuShown}
          >
            {primaryMenu}
          </div>
          <div
            className="theme-mobile-sheet__panel theme-mobile-sheet__panel--secondary"
            hidden={!secondaryMenuShown}
          >
            {secondaryMenu}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
