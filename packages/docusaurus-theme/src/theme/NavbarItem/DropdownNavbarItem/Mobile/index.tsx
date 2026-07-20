import React, { useEffect, useState, type ReactNode } from "react";

import { translate } from "@docusaurus/Translate";
import { isRegexpStringMatch } from "@docusaurus/theme-common";
import {
  isSamePath,
  useLocalPathname,
} from "@docusaurus/theme-common/internal";
import NavbarItem, { type LinkLikeNavbarItemProps } from "@theme/NavbarItem";
import NavbarNavLink from "@theme/NavbarItem/NavbarNavLink";
import type { Props } from "@theme/NavbarItem/DropdownNavbarItem/Mobile";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@theme/components/ui/collapsible";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@theme/components/ui/sidebar";

function isItemActive(item: LinkLikeNavbarItemProps, pathname: string) {
  return (
    isSamePath(item.to, pathname) ||
    isRegexpStringMatch(item.activeBaseRegex, pathname) ||
    !!(item.activeBasePath && pathname.startsWith(item.activeBasePath))
  );
}

export default function DropdownNavbarItemMobile({
  items,
  className: _className,
  position: _position,
  onClick,
  ...props
}: Props): ReactNode {
  const pathname = useLocalPathname();
  const active =
    isSamePath(props.to, pathname) ||
    items.some((item) => isItemActive(item, pathname));
  const [open, setOpen] = useState(active);
  const hasLink = Boolean(props.to || props.href);
  const label = props.children ?? props.label;
  const accessibleLabel =
    typeof label === "string" || typeof label === "number" ? label : "menu";
  const toggleLabel = translate(
    {
      id: "theme.navbar.mobileDropdown.collapseButton.ariaLabel",
      message: "Toggle the {label} dropdown",
      description: "The label used to toggle a mobile navbar dropdown.",
    },
    { label: accessibleLabel }
  );

  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      {hasLink ? (
        <>
          <SidebarMenuButton
            render={<NavbarNavLink {...props} onClick={onClick} />}
            isActive={active}
          >
            {label}
          </SidebarMenuButton>
          <CollapsibleTrigger
            render={<SidebarMenuAction aria-label={toggleLabel} />}
          >
            <ChevronRight
              aria-hidden="true"
              className="transition-transform group-data-open/collapsible:rotate-90"
            />
          </CollapsibleTrigger>
        </>
      ) : (
        <CollapsibleTrigger render={<SidebarMenuButton isActive={active} />}>
          <span>{label}</span>
          <ChevronRight
            aria-hidden="true"
            className="ml-auto transition-transform group-data-open/collapsible:rotate-90"
          />
        </CollapsibleTrigger>
      )}
      <CollapsibleContent>
        <SidebarMenuSub>
          {items.map((childItemProps, index) => (
            <NavbarItem
              mobile
              isDropdownItem
              onClick={onClick}
              {...childItemProps}
              key={index}
            />
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
