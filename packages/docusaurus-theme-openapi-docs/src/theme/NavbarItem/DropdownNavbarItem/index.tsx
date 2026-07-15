import React, { type ReactNode } from "react";

import DropdownNavbarItemMobile from "@theme/NavbarItem/DropdownNavbarItem/Mobile";

import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@theme/components/ui/navigation-menu";

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
  className,
}: Props): ReactNode {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        className={["theme-navbar-nav-link", className]
          .filter(Boolean)
          .join(" ")}
        aria-label={typeof label === "string" ? label : undefined}
      >
        {children ?? label}
      </NavigationMenuTrigger>
      <NavigationMenuContent className="min-w-48 p-1">
        {items.map((item, index) => {
          const href = item.to ?? item.href ?? "#";
          const external = item.target === "_blank";

          return (
            <NavigationMenuLink
              key={index}
              className="px-2 py-1.5"
              render={
                <a
                  href={href}
                  target={item.target}
                  rel={external ? "noreferrer" : undefined}
                />
              }
            >
              {item.label}
            </NavigationMenuLink>
          );
        })}
      </NavigationMenuContent>
    </NavigationMenuItem>
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
