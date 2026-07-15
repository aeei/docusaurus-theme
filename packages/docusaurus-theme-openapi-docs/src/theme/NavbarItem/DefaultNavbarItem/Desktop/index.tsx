import React, { type ReactNode } from "react";

import clsx from "clsx";
import NavbarNavLink from "@theme/NavbarItem/NavbarNavLink";

import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@theme/components/ui/navigation-menu";

type Props = {
  className?: string;
  isDropdownItem?: boolean;
  [key: string]: unknown;
};

export default function DefaultNavbarItemDesktop({
  className,
  isDropdownItem = false,
  ...props
}: Props): ReactNode {
  const link = (
    <NavbarNavLink
      {...props}
      className={clsx("theme-navbar-nav-link", className)}
    />
  );

  if (isDropdownItem) return <li>{link}</li>;

  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        render={link as React.ReactElement}
        className={clsx(navigationMenuTriggerStyle(), "theme-navbar-nav-link")}
      />
    </NavigationMenuItem>
  );
}
