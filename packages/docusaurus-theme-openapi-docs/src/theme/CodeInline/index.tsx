import React, { type ReactNode } from "react";

import type { Props } from "@theme/CodeInline";

import { Badge } from "@theme/components/ui/badge";

export default function CodeInline(props: Props): ReactNode {
  return (
    <Badge
      asChild
      variant="outline"
      className="rounded-[var(--radius-sm)] !px-1.5 !py-0 font-mono !text-[0.75em] font-normal !leading-5"
    >
      <code {...props} />
    </Badge>
  );
}
