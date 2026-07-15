import * as React from "react";

import { Badge } from "@theme/components/ui/badge";

export function ValueBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="rounded-[var(--radius-sm)] px-1.5 py-0 font-mono text-[0.75em] font-normal leading-5"
    >
      {children}
    </Badge>
  );
}
