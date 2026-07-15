import React, { type ReactNode } from "react";

import { translate } from "@docusaurus/Translate";
import { ThemeClassNames } from "@docusaurus/theme-common";
import { useBackToTopButton } from "@docusaurus/theme-common/internal";
import { ArrowUp } from "lucide-react";

import { Button } from "@theme/components/ui/button";
import { cn } from "@theme/lib/utils";

export default function BackToTopButton(): ReactNode {
  const { shown, scrollToTop } = useBackToTopButton({ threshold: 300 });

  return (
    <Button
      aria-label={translate({
        id: "theme.BackToTopButton.buttonAriaLabel",
        message: "Scroll back to top",
        description: "The ARIA label for the back to top button",
      })}
      className={cn(
        ThemeClassNames.common.backToTopButton,
        "fixed right-5 bottom-5 z-40 size-9 rounded-full shadow-sm transition-[opacity,transform,visibility] duration-200",
        shown ? "visible scale-100 opacity-100" : "invisible scale-90 opacity-0"
      )}
      type="button"
      variant="secondary"
      size="icon"
      onClick={scrollToTop}
    >
      <ArrowUp aria-hidden="true" className="size-4" />
    </Button>
  );
}
