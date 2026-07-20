import React, { type ReactNode } from "react";

import isInternalUrl from "@docusaurus/isInternalUrl";
import Link from "@docusaurus/Link";
import { isActiveSidebarItem } from "@docusaurus/plugin-content-docs/client";
import type { Props } from "@theme/DocSidebarItem/Link";
import { ExternalLink } from "lucide-react";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@theme/components/ui/sidebar";

function LinkLabel({ label }: { label: string }) {
  return <span title={label}>{label}</span>;
}

export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  ...props
}: Props): ReactNode {
  const { href, label, autoAddBaseUrl } = item;
  const isActive = isActiveSidebarItem(item, activePath);
  const isInternalLink = isInternalUrl(href);
  const link = (
    <Link
      autoAddBaseUrl={autoAddBaseUrl}
      aria-current={isActive ? "page" : undefined}
      to={href}
      {...(isInternalLink && {
        onClick: onItemClick ? () => onItemClick(item) : undefined,
      })}
      {...props}
    />
  );
  const content = (
    <>
      <LinkLabel label={label} />
      {!isInternalLink && <ExternalLink aria-hidden="true" />}
    </>
  );

  if (level > 1) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton render={link} isActive={isActive}>
          {content}
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton render={link} isActive={isActive} tooltip={label}>
        {content}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
