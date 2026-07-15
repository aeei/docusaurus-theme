import * as React from "react";

import { Badge } from "@theme/components/ui/badge";
import { cn } from "@theme/lib/utils";

const toneByMethod: Record<string, string> = {
  get: "border-chart-3/30 bg-chart-3/15 text-chart-3",
  post: "border-chart-2/30 bg-chart-2/15 text-chart-2",
  put: "border-chart-1/30 bg-chart-1/15 text-chart-1",
  delete: "border-destructive/30 bg-destructive/15 text-destructive",
  patch: "border-chart-4/30 bg-chart-4/15 text-chart-4",
  head: "border-muted-foreground/30 bg-muted text-muted-foreground",
  event: "border-muted-foreground/30 bg-muted text-muted-foreground",
};

type MethodBadgeProps = React.ComponentProps<typeof Badge> & {
  method: string;
};

export function MethodBadge({
  method,
  className,
  children,
  ...props
}: MethodBadgeProps) {
  const normalizedMethod = method.toLowerCase();

  return (
    <Badge
      variant="outline"
      data-method={normalizedMethod}
      className={cn(
        "min-w-10 px-1.5 py-0 text-[10px] leading-4 font-semibold uppercase",
        toneByMethod[normalizedMethod] ?? toneByMethod.event,
        className
      )}
      {...props}
    >
      {children ??
        (normalizedMethod === "event" ? "Webhook" : normalizedMethod)}
    </Badge>
  );
}
