import React, { type ReactNode } from "react";

import Translate from "@docusaurus/Translate";
import type { Props } from "@theme/TOCCollapsible/CollapseButton";

import { AccordionTrigger } from "@theme/components/ui/accordion";

export default function TOCCollapsibleCollapseButton({
  collapsed: _collapsed,
  ...props
}: Props): ReactNode {
  return (
    <AccordionTrigger {...props}>
      <Translate
        id="theme.TOCCollapsible.toggleButtonLabel"
        description="The label used by the button on the collapsible TOC component"
      >
        On this page
      </Translate>
    </AccordionTrigger>
  );
}
