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
    >
      <SheetContent
        side="left"
        showCloseButton={false}
        className="theme-mobile-sheet"
        aria-label="Navigation menu"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.querySelector<HTMLButtonElement>(".navbar__toggle")?.focus();
        }}
      >
        {header}
        <div className="theme-mobile-sheet__menus">
          <div hidden={secondaryMenuShown}>{primaryMenu}</div>
          <div hidden={!secondaryMenuShown}>{secondaryMenu}</div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
