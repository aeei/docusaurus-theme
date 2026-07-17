import React, { type ReactNode } from "react";

import isInternalUrl from "@docusaurus/isInternalUrl";
import Link from "@docusaurus/Link";
import { isActiveSidebarItem } from "@docusaurus/plugin-content-docs/client";
import { ThemeClassNames } from "@docusaurus/theme-common";
import type { Props } from "@theme/DocSidebarItem/Link";
import clsx from "clsx";
import { ExternalLink } from "lucide-react";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@theme/components/ui/sidebar";

import styles from "./styles.module.css";

function LinkLabel({ label }: { label: string }) {
  return (
    <span title={label} className={styles.linkLabel}>
      {label}
    </span>
  );
}

export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  ...props
}: Props): ReactNode {
  const { href, label, className, autoAddBaseUrl } = item;
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
      {!isInternalLink && (
        <ExternalLink aria-hidden="true" className={styles.externalIcon} />
      )}
    </>
  );
  const itemClassName = clsx(
    ThemeClassNames.docs.docSidebarItemLink,
    ThemeClassNames.docs.docSidebarItemLinkLevel(level),
    className
  );

  if (level > 1) {
    return (
      <SidebarMenuSubItem className={itemClassName}>
        <SidebarMenuSubButton
          render={link}
          isActive={isActive}
          className={!isInternalLink ? styles.menuExternalLink : undefined}
        >
          {content}
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  return (
    <SidebarMenuItem className={itemClassName}>
      <SidebarMenuButton
        render={link}
        isActive={isActive}
        tooltip={label}
        className={!isInternalLink ? styles.menuExternalLink : undefined}
      >
        {content}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
