import React, { type ReactNode, useEffect } from "react";

import {
  useLockBodyScroll,
  useNavbarMobileSidebar,
} from "@docusaurus/theme-common/internal";
import NavbarMobileSidebarHeader from "@theme/Navbar/MobileSidebar/Header";
import NavbarMobileSidebarLayout from "@theme/Navbar/MobileSidebar/Layout";
import NavbarMobileSidebarPrimaryMenu from "@theme/Navbar/MobileSidebar/PrimaryMenu";
import NavbarMobileSidebarSecondaryMenu from "@theme/Navbar/MobileSidebar/SecondaryMenu";

export default function NavbarMobileSidebar(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();
  useLockBodyScroll(mobileSidebar.shown);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !mobileSidebar.shown) return;
      mobileSidebar.toggle();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileSidebar]);

  if (!mobileSidebar.shouldRender) return null;

  return (
    <NavbarMobileSidebarLayout
      header={<NavbarMobileSidebarHeader />}
      primaryMenu={<NavbarMobileSidebarPrimaryMenu />}
      secondaryMenu={<NavbarMobileSidebarSecondaryMenu />}
    />
  );
}
