import React, { type ReactNode } from "react";

import Link from "@docusaurus/Link";
import type { Props } from "@theme/Tag";

import { Badge } from "@theme/components/ui/badge";

export default function Tag({
  permalink,
  label,
  count,
  description,
}: Props): ReactNode {
  return (
    <Badge
      render={<Link rel="tag" href={permalink} title={description} />}
      variant="outline"
      className="gap-1 no-underline hover:bg-accent hover:text-accent-foreground hover:no-underline"
    >
      <span>{label}</span>
      {count ? <span className="text-muted-foreground">{count}</span> : null}
    </Badge>
  );
}
