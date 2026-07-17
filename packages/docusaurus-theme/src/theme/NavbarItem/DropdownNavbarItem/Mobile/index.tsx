/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * Swizzled from @docusaurus/theme-classic under the MIT License.
 */

import React, { useEffect, type ComponentProps, type ReactNode } from "react";

import { translate } from "@docusaurus/Translate";
import {
  Collapsible,
  isRegexpStringMatch,
  useCollapsible,
} from "@docusaurus/theme-common";
import {
  isSamePath,
  useLocalPathname,
} from "@docusaurus/theme-common/internal";
import NavbarItem, { type LinkLikeNavbarItemProps } from "@theme/NavbarItem";
import NavbarNavLink from "@theme/NavbarItem/NavbarNavLink";
import type { Props } from "@theme/NavbarItem/DropdownNavbarItem/Mobile";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";

import { Button } from "@theme/components/ui/button";

function isItemActive(item: LinkLikeNavbarItemProps, pathname: string) {
  return (
    isSamePath(item.to, pathname) ||
    isRegexpStringMatch(item.activeBaseRegex, pathname) ||
    !!(item.activeBasePath && pathname.startsWith(item.activeBasePath))
  );
}

function CollapseButton({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick: ComponentProps<"button">["onClick"];
}) {
  return (
    <Button
      aria-label={
        collapsed
          ? translate({
              id: "theme.navbar.mobileDropdown.collapseButton.expandAriaLabel",
              message: "Expand the dropdown",
              description: "The label used to expand a mobile navbar dropdown.",
            })
          : translate({
              id: "theme.navbar.mobileDropdown.collapseButton.collapseAriaLabel",
              message: "Collapse the dropdown",
              description:
                "The label used to collapse a mobile navbar dropdown.",
            })
      }
      aria-expanded={!collapsed}
      type="button"
      variant="ghost"
      size="icon"
      className="theme-mobile-dropdown-caret"
      onClick={onClick}
    >
      <ChevronRight
        aria-hidden="true"
        className={clsx("transition-transform", !collapsed && "rotate-90")}
      />
    </Button>
  );
}

export default function DropdownNavbarItemMobile({
  items,
  className,
  position: _position,
  onClick,
  ...props
}: Props): ReactNode {
  const pathname = useLocalPathname();
  const active =
    isSamePath(props.to, pathname) ||
    items.some((item) => isItemActive(item, pathname));
  const { collapsed, toggleCollapsed, setCollapsed } = useCollapsible({
    initialState: () => !active,
  });

  useEffect(() => {
    if (active) setCollapsed(false);
  }, [active, setCollapsed]);

  const href = props.to ? undefined : "#";

  return (
    <li
      className={clsx("menu__list-item", {
        "menu__list-item--collapsed": collapsed,
      })}
    >
      <div className="menu__list-item-collapsible">
        <NavbarNavLink
          role="button"
          className={clsx("menu__link menu__link--sublist", className)}
          href={href}
          {...props}
          onClick={(event) => {
            if (href === "#") event.preventDefault();
            toggleCollapsed();
          }}
        >
          {props.children ?? props.label}
        </NavbarNavLink>
        <CollapseButton
          collapsed={collapsed}
          onClick={(event) => {
            event.preventDefault();
            toggleCollapsed();
          }}
        />
      </div>
      <Collapsible lazy as="ul" className="menu__list" collapsed={collapsed}>
        {items.map((childItemProps, index) => (
          <NavbarItem
            mobile
            isDropdownItem
            onClick={onClick}
            activeClassName="menu__link--active"
            {...childItemProps}
            key={index}
          />
        ))}
      </Collapsible>
    </li>
  );
}
