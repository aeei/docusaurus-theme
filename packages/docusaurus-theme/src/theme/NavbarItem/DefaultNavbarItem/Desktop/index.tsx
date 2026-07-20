import React, { type ReactNode } from "react";

import NavbarNavLink from "@theme/NavbarItem/NavbarNavLink";

import { Button } from "@theme/components/ui/button";

type Props = {
  className?: string;
  isDropdownItem?: boolean;
  [key: string]: unknown;
};

export default function DefaultNavbarItemDesktop({
  className: _className,
  isDropdownItem = false,
  ...props
}: Props): ReactNode {
  const link = <NavbarNavLink {...props} />;

  if (isDropdownItem) return <li>{link}</li>;

  return (
    <Button render={link} nativeButton={false} variant="ghost">
      {props.label as ReactNode}
    </Button>
  );
}
