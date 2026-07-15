import React, { type ReactNode } from "react";

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
  className,
  position,
}: Props): ReactNode {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={["theme-navbar-nav-link", className]
            .filter(Boolean)
            .join(" ")}
          aria-label={typeof label === "string" ? label : undefined}
        >
          {children ?? label}
          <ChevronDown aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={position === "right" ? "end" : "start"}
        className="z-[1002] min-w-56"
      >
        {items.map((item, index) => {
          const href = item.to ?? item.href ?? "#";
          const external = item.target === "_blank";

          return (
            <DropdownMenuItem key={index} asChild>
              <a
                href={href}
                target={item.target}
                rel={external ? "noreferrer" : undefined}
              >
                {item.label}
              </a>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DropdownNavbarItem({
  mobile: _mobile = false,
  ...props
}: Props): ReactNode {
  return <DesktopDropdownNavbarItem {...props} />;
}
