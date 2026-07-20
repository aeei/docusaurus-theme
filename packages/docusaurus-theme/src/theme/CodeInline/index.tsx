import React, { type ReactNode } from "react";

import type { Props } from "@theme/CodeInline";
import { cn } from "@theme/utils/cn";

export default function CodeInline({ className, ...props }: Props): ReactNode {
  return <code className={cn("theme-code-inline", className)} {...props} />;
}
