import React, { type ReactNode } from "react";

import Link from "@docusaurus/Link";
import type { Props } from "@theme/DocCard/Layout";
import Description from "@theme/DocCard/Description";
import Heading from "@theme/DocCard/Heading";

import { Card } from "@theme/components/ui/card";

export default function DocCardLayout({
  item,
  className,
  href,
  icon,
  title,
  description,
}: Props): ReactNode {
  return (
    <Card className={`h-full gap-0 py-0 shadow-none ${className ?? ""}`}>
      <Link
        href={href}
        className="block h-full p-4 text-card-foreground no-underline hover:no-underline"
      >
        <Heading item={item} icon={icon} title={title} />
        {description && <Description item={item} description={description} />}
      </Link>
    </Card>
  );
}
