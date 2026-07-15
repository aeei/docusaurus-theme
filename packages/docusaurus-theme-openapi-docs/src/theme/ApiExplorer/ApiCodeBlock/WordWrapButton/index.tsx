/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { translate } from "@docusaurus/Translate";
import { WrapText } from "lucide-react";

import { Button } from "@theme/components/ui/button";
import { cn } from "@theme/lib/utils";

export interface Props {
  readonly className?: string;
  readonly onClick: React.MouseEventHandler;
  readonly isEnabled: boolean;
}

export default function WordWrapButton({
  className,
  onClick,
  isEnabled,
}: Props): React.JSX.Element | null {
  const title = translate({
    id: "theme.CodeBlock.wordWrapToggle",
    message: "Toggle word wrap",
    description:
      "The title attribute for toggle word wrapping button of code block lines",
  });
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      className={cn(className, isEnabled && "bg-accent text-accent-foreground")}
      aria-label={title}
      title={title}
    >
      <WrapText aria-hidden="true" />
    </Button>
  );
}
