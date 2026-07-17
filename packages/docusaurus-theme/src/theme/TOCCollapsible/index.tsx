import React, { type ReactNode, useState } from "react";

import TOCItems from "@theme/TOCItems";
import CollapseButton from "@theme/TOCCollapsible/CollapseButton";
import type { Props } from "@theme/TOCCollapsible";
import clsx from "clsx";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@theme/components/ui/collapsible";

export default function TOCCollapsible({
  toc,
  className,
  minHeadingLevel,
  maxHeadingLevel,
}: Props): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={clsx("theme-doc-toc-mobile", className)}
    >
      <CollapsibleTrigger
        render={<CollapseButton collapsed={!open} onClick={() => undefined} />}
      />
      <CollapsibleContent className="theme-mobile-toc-content">
        <TOCItems
          toc={toc}
          minHeadingLevel={minHeadingLevel}
          maxHeadingLevel={maxHeadingLevel}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
