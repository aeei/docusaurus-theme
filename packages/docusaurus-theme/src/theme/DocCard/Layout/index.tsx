import React, { type ReactNode } from "react";

import Link from "@docusaurus/Link";
import type { Props } from "@theme/DocCard/Layout";
import Text from "@theme/DocCard/Heading/Text";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@theme/components/ui/card";

export default function DocCardLayout({
  item,
  className: _className,
  href,
  icon: _icon,
  title,
  description,
}: Props): ReactNode {
  return (
    <Link href={href} className="contents">
      <Card>
        <CardHeader>
          <CardTitle>
            <Text item={item} title={title} />
          </CardTitle>
          {description ? (
            <CardDescription title={description}>{description}</CardDescription>
          ) : null}
        </CardHeader>
      </Card>
    </Link>
  );
}
