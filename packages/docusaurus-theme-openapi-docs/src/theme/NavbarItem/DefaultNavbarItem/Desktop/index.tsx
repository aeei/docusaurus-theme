import React, { type ReactNode } from "react";

import clsx from "clsx";
import NavbarNavLink from "@theme/NavbarItem/NavbarNavLink";

import { Button } from "@theme/components/ui/button";

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
  const link = <NavbarNavLink {...props} />;

  if (isDropdownItem) return <li>{link}</li>;

  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={clsx("theme-navbar-nav-link", className)}
    >
      {link}
    </Button>
  );
}
