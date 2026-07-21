import React, { type ReactNode, useRef } from "react";

import {
  useActiveDocContext,
  useLayoutDoc,
} from "@docusaurus/plugin-content-docs/client";
import { useThemeConfig, useWindowSize } from "@docusaurus/theme-common";
import { usePluginData } from "@docusaurus/useGlobalData";
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
import NavbarNavLink from "@theme/NavbarItem/NavbarNavLink";
import { Search } from "lucide-react";

import LocalSearch from "@theme/components/local-search";
import { Button } from "@theme/components/ui/button";
import { Kbd, KbdGroup } from "@theme/components/ui/kbd";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@theme/components/ui/navigation-menu";

type NavigationItemConfig = NavbarItemConfig & {
  type?: string;
  label?: ReactNode;
  items?: NavigationItemConfig[];
  docId?: string;
  docsPluginId?: string;
};

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

function supportsNavigationMenu(item: NavigationItemConfig): boolean {
  const type = item.type ?? (item.items ? "dropdown" : "default");
  return type === "default" || type === "dropdown" || type === "doc";
}

function NavbarNavigationMenuDocItem({
  item,
}: {
  item: NavigationItemConfig;
}): ReactNode {
  const { docId, docsPluginId, label, ...navLinkProps } = item;
  delete navLinkProps.type;
  delete navLinkProps.items;

  const { activeDoc } = useActiveDocContext(docsPluginId);
  const doc = useLayoutDoc(docId!, docsPluginId);
  const pageActive = activeDoc?.path === doc?.path;

  if (doc === null || (doc.unlisted && !pageActive)) return null;

  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        className={navigationMenuTriggerStyle()}
        render={
          <NavbarNavLink
            {...navLinkProps}
            exact
            to={doc.path}
            label={label ?? doc.id}
            isActive={() =>
              pageActive ||
              (!!activeDoc?.sidebar && activeDoc.sidebar === doc.sidebar)
            }
          />
        }
      />
    </NavigationMenuItem>
  );
}

function NavbarNavigationMenuItem({
  item,
}: {
  item: NavigationItemConfig;
}): ReactNode {
  if (!supportsNavigationMenu(item)) {
    return (
      <NavigationMenuItem>
        <NavbarItem {...item} />
      </NavigationMenuItem>
    );
  }

  if (item.type === "doc") return <NavbarNavigationMenuDocItem item={item} />;

  if (!item.items) {
    return (
      <NavigationMenuItem>
        <NavigationMenuLink
          className={navigationMenuTriggerStyle()}
          render={<NavbarNavLink {...item} />}
        />
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul>
          {item.items.map((child, index) => (
            <li key={index}>
              <NavigationMenuLink
                render={<NavbarNavLink {...child} isDropdownLink />}
              />
            </li>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
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

  const navigationItems = items as NavigationItemConfig[];
  if (align === "start") {
    return (
      <NavigationMenu
        align={align}
        className="theme-navbar-desktop-navigation"
        data-align={align}
      >
        <NavigationMenuList>
          {navigationItems.map((item, index) => (
            <ErrorCauseBoundary
              key={index}
              onError={(error) =>
                new Error(
                  `A theme navbar item failed to render.\n${JSON.stringify(item, null, 2)}`,
                  { cause: error }
                )
              }
            >
              <NavbarNavigationMenuItem item={item} />
            </ErrorCauseBoundary>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    );
  }

  return (
    <div
      className="theme-navbar-desktop-navigation flex items-center gap-0"
      data-align={align}
    >
      <NavbarItems items={items} />
    </div>
  );
}

function CommandSearch({
  provider,
}: {
  provider: false | "local" | "algolia";
}): ReactNode {
  const hostRef = useRef<HTMLDivElement>(null);
  const windowSize = useWindowSize();
  const algolia = (useThemeConfig() as { algolia?: unknown }).algolia;

  if (provider === "local") return <LocalSearch />;
  if (provider !== "algolia" || !algolia) return null;

  return (
    <div ref={hostRef} className="theme-command-search">
      <div className="theme-command-search__provider" aria-hidden="true">
        <SearchBar />
      </div>
      <Button
        variant="outline"
        size={windowSize === "mobile" ? "icon" : "default"}
        aria-label={
          windowSize === "mobile" ? "Search documentation" : undefined
        }
        onClick={() =>
          hostRef.current
            ?.querySelector<HTMLButtonElement>(".DocSearch-Button")
            ?.click()
        }
      >
        <Search aria-hidden="true" />
        {windowSize !== "mobile" ? (
          <>
            <span>Search</span>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </>
        ) : null}
      </Button>
    </div>
  );
}

export default function NavbarContent(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useNavbarItems().filter((item) => item.type !== "search");
  const [leftItems, rightItems] = splitNavbarItems(items);
  const themeData = usePluginData("@aeei/docusaurus-theme") as
    | { search?: { provider?: false | "local" | "algolia" } }
    | undefined;
  const searchProvider = themeData?.search?.provider ?? false;

  return (
    <div className="navbar__inner">
      <div
        className={`${ThemeClassNames.layout.navbar.containerLeft} navbar__items`}
      >
        {!mobileSidebar.disabled && (
          <div className="theme-navbar-mobile-trigger">
            <NavbarMobileSidebarToggle />
          </div>
        )}
        <NavbarLogo />
        <NavbarNavigation items={leftItems} />
      </div>
      <div
        className={`${ThemeClassNames.layout.navbar.containerRight} navbar__items navbar__items--right`}
      >
        <NavbarNavigation items={rightItems} align="end" />
        <CommandSearch provider={searchProvider} />
      </div>
    </div>
  );
}
