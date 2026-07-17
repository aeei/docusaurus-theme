import React, { type ReactNode } from "react";

import Translate from "@docusaurus/Translate";
import type { Props } from "@theme/TOCCollapsible/CollapseButton";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

import { Button } from "@theme/components/ui/button";

export default function TOCCollapsibleCollapseButton({
  collapsed,
  className,
  ...props
}: Props): ReactNode {
  return (
    <Button
      type="button"
      variant="ghost"
      className={clsx(
        "theme-mobile-toc-trigger w-full justify-between! hover:bg-accent! dark:hover:bg-accent!",
        className
      )}
      aria-expanded={!collapsed}
      {...props}
    >
      <Translate
        id="theme.TOCCollapsible.toggleButtonLabel"
        description="The label used by the button on the collapsible TOC component"
      >
        On this page
      </Translate>
      <ChevronDown
        aria-hidden="true"
        className={clsx("transition-transform", !collapsed && "rotate-180")}
      />
    </Button>
  );
}
