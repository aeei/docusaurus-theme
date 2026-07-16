import React, { type ReactNode } from "react";

import { translate } from "@docusaurus/Translate";
import { useCodeBlockContext } from "@docusaurus/theme-common/internal";
import type { Props } from "@theme/CodeBlock/Buttons/WordWrapButton";
import { WrapText } from "lucide-react";

import { Button } from "@theme/components/ui/button";
import { cn } from "@theme/utils/cn";

export default function WordWrapButton({ className }: Props): ReactNode {
  const { wordWrap } = useCodeBlockContext();
  const canShowButton = wordWrap.isEnabled || wordWrap.isCodeScrollable;

  if (!canShowButton) return null;

  const label = translate({
    id: "theme.CodeBlock.wordWrapToggle",
    message: "Toggle word wrap",
    description: "The accessible label for the code block word-wrap toggle.",
  });

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(
        wordWrap.isEnabled && "bg-accent text-accent-foreground",
        className
      )}
      aria-pressed={wordWrap.isEnabled}
      aria-label={label}
      title={label}
      onClick={() => wordWrap.toggle()}
    >
      <WrapText aria-hidden="true" />
    </Button>
  );
}
