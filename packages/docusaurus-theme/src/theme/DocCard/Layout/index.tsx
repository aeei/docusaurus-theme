import React, { type ReactNode } from "react";

import Link from "@docusaurus/Link";
import type { Props } from "@theme/DocCard/Layout";
import Icon from "@theme/DocCard/Heading/Icon";
import Text from "@theme/DocCard/Heading/Text";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@theme/components/ui/card";

export default function DocCardLayout({
  item,
  className,
  href,
  icon,
  title,
  description,
}: Props): ReactNode {
  return (
    <Card
      className={`h-full transition-colors hover:bg-muted/30 ${className ?? ""}`}
    >
      <Link
        href={href}
        className="block h-full text-card-foreground no-underline hover:no-underline"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon && <Icon item={item} icon={icon} />}
            <Text item={item} title={title} />
          </CardTitle>
          {description ? (
            <CardDescription className="line-clamp-2" title={description}>
              {description}
            </CardDescription>
          ) : null}
        </CardHeader>
      </Link>
    </Card>
  );
}
