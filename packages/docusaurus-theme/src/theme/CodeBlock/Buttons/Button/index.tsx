import React, { type ReactNode } from "react";

import type { Props } from "@theme/CodeBlock/Buttons/Button";

import { Button } from "@theme/components/ui/button";
import { cn } from "@theme/utils/cn";

const officialCodeActionClassName =
  "theme-code-block__action absolute top-3 right-2 z-10 size-7 min-h-0 min-w-0 gap-2 rounded-md border-0 border-border bg-code hover:bg-accent hover:text-accent-foreground hover:opacity-100 focus-visible:opacity-100 active:translate-y-0 dark:hover:bg-accent/50";

export default function CodeBlockButton({
  className,
  style,
  ...props
}: Props): ReactNode {
  return (
    <Button
      type="button"
      data-variant="ghost"
      data-size="icon"
      variant="ghost"
      size="icon"
      className={cn(officialCodeActionClassName, className)}
      style={{ fontFamily: "var(--ifm-font-family-monospace)", ...style }}
      {...props}
    />
  );
}
