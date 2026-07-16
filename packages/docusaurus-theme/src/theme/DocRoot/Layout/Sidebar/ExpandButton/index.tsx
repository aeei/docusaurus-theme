import React, { type ReactNode } from "react";

import { translate } from "@docusaurus/Translate";
import { PanelLeftOpen } from "lucide-react";

import { SidebarThemeMenu } from "@theme/components/sidebar-theme-menu";
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
    <div className="theme-doc-sidebar-collapsed-footer">
      <SidebarThemeMenu compact />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title={label}
        aria-label={label}
        className="theme-doc-sidebar-expand"
        onClick={toggleSidebar}
      >
        <PanelLeftOpen aria-hidden="true" />
      </Button>
    </div>
  );
}
