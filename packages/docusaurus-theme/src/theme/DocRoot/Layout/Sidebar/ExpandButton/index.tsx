import React, { type ReactNode } from "react";

import { translate } from "@docusaurus/Translate";
import { PanelLeftOpen } from "lucide-react";

import { Button } from "@theme/components/ui/button";

type Props = {
  toggleSidebar: () => void;
};

export default function DocRootLayoutSidebarExpandButton({
  toggleSidebar,
}: Props): ReactNode {
  const label = translate({
    id: "theme.docs.sidebar.expandButtonTitle",
    message: "Expand sidebar",
    description: "The label for the desktop sidebar expand button.",
  });

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title={label}
        aria-label={label}
        onClick={toggleSidebar}
      >
        <PanelLeftOpen aria-hidden="true" />
      </Button>
    </div>
  );
}
