import React, { type ReactNode } from "react";

import DropdownNavbarItemMobile from "@theme/NavbarItem/DropdownNavbarItem/Mobile";
import { ChevronDown } from "lucide-react";

import { Button } from "@theme/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@theme/components/ui/dropdown-menu";

type DropdownItem = {
  label?: ReactNode;
  to?: string;
  href?: string;
  target?: string;
  [key: string]: unknown;
};

type Props = {
  mobile?: boolean;
  items: DropdownItem[];
  label?: ReactNode;
  children?: ReactNode;
  className?: string;
  position?: "left" | "right";
  [key: string]: unknown;
};

function DesktopDropdownNavbarItem({
  items,
  label,
  children,
  className: _className,
}: Props): ReactNode {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" />}>
        {children ?? label}
        <ChevronDown aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((item, index) => {
          const href = item.to ?? item.href ?? "#";
          const external = item.target === "_blank";

          return (
            <DropdownMenuItem
              key={index}
              render={
                <a
                  href={href}
                  target={item.target}
                  rel={external ? "noreferrer" : undefined}
                />
              }
            >
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DropdownNavbarItem({
  mobile = false,
  ...props
}: Props): ReactNode {
  if (mobile) {
    return (
      <DropdownNavbarItemMobile
        {...(props as React.ComponentProps<typeof DropdownNavbarItemMobile>)}
      />
    );
  }

  return <DesktopDropdownNavbarItem {...props} />;
}
