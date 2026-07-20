import React, { type CSSProperties, type ReactNode } from "react";

import {
  useNavbarMobileSidebar,
  useNavbarSecondaryMenu,
} from "@docusaurus/theme-common/internal";

import { Sheet, SheetContent } from "@theme/components/ui/sheet";
import { SidebarProvider } from "@theme/components/ui/sidebar";

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
          document
            .querySelector<HTMLButtonElement>(
              "[data-mobile-navigation-trigger]"
            )
            ?.focus();
        }
      }}
    >
      <SheetContent
        side="left"
        aria-label="Navigation menu"
        className="theme-mobile-sidebar-content w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground"
        style={
          {
            "--sidebar-width": "18rem",
            width: "var(--sidebar-width)",
          } as CSSProperties
        }
      >
        <SidebarProvider className="flex-col">
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
        </SidebarProvider>
      </SheetContent>
    </Sheet>
  );
}
