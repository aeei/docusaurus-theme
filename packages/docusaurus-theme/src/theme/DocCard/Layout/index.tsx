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
      className={`h-full gap-0 py-0 shadow-none transition-colors hover:border-foreground/20 hover:bg-muted/30 ${className ?? ""}`}
    >
      <Link
        href={href}
        className="block h-full p-4 text-card-foreground no-underline hover:no-underline"
      >
        <CardHeader className="gap-2 px-0">
          <CardTitle className="flex items-center gap-2 text-base leading-6">
            {icon && <Icon item={item} icon={icon} />}
            <Text item={item} title={title} />
          </CardTitle>
          {description ? (
            <CardDescription
              className="line-clamp-2 leading-5"
              title={description}
            >
              {description}
            </CardDescription>
          ) : null}
        </CardHeader>
      </Link>
    </Card>
  );
}
