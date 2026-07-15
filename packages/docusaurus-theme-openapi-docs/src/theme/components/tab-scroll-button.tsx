import * as React from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@theme/components/ui/button";

export function TabScrollButton({
  direction,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children"> & {
  direction: "left" | "right";
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="openapi-tabs__arrow"
      aria-label={`Scroll tabs ${direction}`}
      {...props}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}
