import React, { type ReactNode } from "react";

import type { Props } from "@theme/CodeBlock/Buttons/Button";

import { Button } from "@theme/components/ui/button";

export default function CodeBlockButton({
  className,
  ...props
}: Props): ReactNode {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={className}
      {...props}
    />
  );
}
