import React, { type ReactNode, useEffect } from "react";

import { useNavbarMobileSidebar } from "@docusaurus/theme-common/internal";
import NavbarMobileSidebarHeader from "@theme/Navbar/MobileSidebar/Header";
import NavbarMobileSidebarLayout from "@theme/Navbar/MobileSidebar/Layout";
import NavbarMobileSidebarPrimaryMenu from "@theme/Navbar/MobileSidebar/PrimaryMenu";
import NavbarMobileSidebarSecondaryMenu from "@theme/Navbar/MobileSidebar/SecondaryMenu";

export default function NavbarMobileSidebar(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === "b" &&
        (event.metaKey || event.ctrlKey) &&
        window.matchMedia("(max-width: 996px)").matches
      ) {
        event.preventDefault();
        mobileSidebar.toggle();
      }
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
