import React, { type ReactNode } from "react";

import { translate } from "@docusaurus/Translate";
import { useBackToTopButton } from "@docusaurus/theme-common/internal";
import { ArrowUp } from "lucide-react";

import { Button } from "@theme/components/ui/button";

export default function BackToTopButton(): ReactNode {
  const { shown, scrollToTop } = useBackToTopButton({ threshold: 300 });

  if (!shown) return null;

  return (
    <Button
      aria-label={translate({
        id: "theme.BackToTopButton.buttonAriaLabel",
        message: "Scroll back to top",
        description: "The ARIA label for the back to top button",
      })}
      className="fixed right-5 bottom-5 z-40"
      type="button"
      variant="secondary"
      size="icon"
      onClick={scrollToTop}
    >
      <ArrowUp aria-hidden="true" />
    </Button>
  );
}
