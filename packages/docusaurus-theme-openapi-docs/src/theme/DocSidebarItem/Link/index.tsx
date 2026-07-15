import React, { type ReactNode } from "react";

import isInternalUrl from "@docusaurus/isInternalUrl";
import Link from "@docusaurus/Link";
import { isActiveSidebarItem } from "@docusaurus/plugin-content-docs/client";
import { ThemeClassNames } from "@docusaurus/theme-common";
import type { Props } from "@theme/DocSidebarItem/Link";
import clsx from "clsx";
import { ExternalLink } from "lucide-react";

import { MethodBadge } from "@theme/components/method-badge";
import { Badge } from "@theme/components/ui/badge";

import styles from "./styles.module.css";

const methods = ["get", "post", "put", "delete", "patch", "head", "event"];

function getMethod(className?: string): string | undefined {
  const classes = className?.split(/\s+/) ?? [];
  return classes.some((name) => name.startsWith("api-method"))
    ? methods.find((method) =>
        classes.some((name) => name === method || name.startsWith(`${method}-`))
      )
    : undefined;
}

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
  const method = getMethod(className);
  const isSchema = className
    ?.split(/\s+/)
    .some((name) => name.startsWith("schema"));

  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        "menu__list-item",
        className
      )}
      key={label}
    >
      <Link
        className={clsx(
          "menu__link",
          !isInternalLink && styles.menuExternalLink,
          {
            "menu__link--active": isActive,
          }
        )}
        autoAddBaseUrl={autoAddBaseUrl}
        aria-current={isActive ? "page" : undefined}
        to={href}
        {...(isInternalLink && {
          onClick: onItemClick ? () => onItemClick(item) : undefined,
        })}
        {...props}
      >
        {method && <MethodBadge method={method} />}
        {!method && isSchema && (
          <Badge
            variant="outline"
            className="min-w-10 border-muted-foreground/30 bg-muted px-1.5 py-0 text-[10px] leading-4 font-semibold text-muted-foreground uppercase"
          >
            Schema
          </Badge>
        )}
        <LinkLabel label={label} />
        {!isInternalLink && (
          <ExternalLink aria-hidden="true" className={styles.externalIcon} />
        )}
      </Link>
    </li>
  );
}
