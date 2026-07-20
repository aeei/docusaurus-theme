import React, { type ReactNode } from "react";

import { translate } from "@docusaurus/Translate";
import { PanelLeftClose } from "lucide-react";

import { Button } from "@theme/components/ui/button";

type Props = {
  onClick: () => void;
};

export default function CollapseButton({ onClick }: Props): ReactNode {
  const label = translate({
    id: "theme.docs.sidebar.collapseButtonTitle",
    message: "Collapse sidebar",
    description: "The label for the desktop sidebar collapse button.",
  });

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      <PanelLeftClose aria-hidden="true" />
    </Button>
  );
}
