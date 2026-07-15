import React, { type ReactNode, useRef } from "react";

import { useThemeConfig } from "@docusaurus/theme-common";
import { ErrorCauseBoundary, ThemeClassNames } from "@docusaurus/theme-common";
import {
  splitNavbarItems,
  useNavbarMobileSidebar,
} from "@docusaurus/theme-common/internal";
import SearchBar from "@theme/SearchBar";
import NavbarLogo from "@theme/Navbar/Logo";
import NavbarMobileSidebarToggle from "@theme/Navbar/MobileSidebar/Toggle";
import NavbarItem from "@theme/NavbarItem";
import type { Props as NavbarItemConfig } from "@theme/NavbarItem";
import { Search } from "lucide-react";

import { Button } from "@theme/components/ui/button";
import { Kbd, KbdGroup } from "@theme/components/ui/kbd";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@theme/components/ui/navigation-menu";

function useNavbarItems() {
  return useThemeConfig().navbar.items as NavbarItemConfig[];
}

function NavbarItems({ items }: { items: NavbarItemConfig[] }): ReactNode {
  return (
    <>
      {items.map((item, index) => (
        <ErrorCauseBoundary
          key={index}
          onError={(error) =>
            new Error(
              `A theme navbar item failed to render.\n${JSON.stringify(item, null, 2)}`,
              { cause: error }
            )
          }
        >
          <NavbarItem {...item} />
        </ErrorCauseBoundary>
      ))}
    </>
  );
}

function NavbarNavigation({
  items,
  align = "start",
}: {
  items: NavbarItemConfig[];
  align?: "start" | "end";
}): ReactNode {
  if (items.length === 0) return null;

  return (
    <NavigationMenu align={align} className="theme-navbar-desktop-navigation">
      <NavigationMenuList className="m-0 p-0">
        <NavbarItems items={items} />
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function CommandSearch(): ReactNode {
  const hostRef = useRef<HTMLDivElement>(null);
  const algolia = (useThemeConfig() as { algolia?: unknown }).algolia;

  if (!algolia) return null;

  return (
    <div ref={hostRef} className="theme-command-search">
      <div className="theme-command-search__provider" aria-hidden="true">
        <SearchBar />
      </div>
      <Button
        variant="outline"
        size="sm"
        className="theme-command-search__trigger"
        onClick={() =>
          hostRef.current
            ?.querySelector<HTMLButtonElement>(".DocSearch-Button")
            ?.click()
        }
      >
        <Search aria-hidden="true" />
        <span>Search</span>
        <KbdGroup className="theme-command-search__keys">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
    </div>
  );
}

export default function NavbarContent(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useNavbarItems().filter((item) => item.type !== "search");
  const [leftItems, rightItems] = splitNavbarItems(items);

  return (
    <div className="navbar__inner">
      <div
        className={`${ThemeClassNames.layout.navbar.containerLeft} navbar__items`}
      >
        {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
        <NavbarLogo />
        <NavbarNavigation items={leftItems} />
      </div>
      <div
        className={`${ThemeClassNames.layout.navbar.containerRight} navbar__items navbar__items--right`}
      >
        <NavbarNavigation items={rightItems} align="end" />
        <CommandSearch />
      </div>
    </div>
  );
}
