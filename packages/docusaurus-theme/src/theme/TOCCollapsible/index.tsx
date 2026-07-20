import React, { type ReactNode, useState } from "react";

import TOCItems from "@theme/TOCItems";
import CollapseButton from "@theme/TOCCollapsible/CollapseButton";
import type { Props } from "@theme/TOCCollapsible";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@theme/components/ui/accordion";

const TOC_VALUE = "table-of-contents";

export default function TOCCollapsible({
  toc,
  className,
  minHeadingLevel,
  maxHeadingLevel,
}: Props): ReactNode {
  const [value, setValue] = useState<string[]>([]);

  return (
    <div className={className}>
      <Accordion value={value} onValueChange={setValue}>
        <AccordionItem value={TOC_VALUE}>
          <CollapseButton collapsed={!value.includes(TOC_VALUE)} />
          <AccordionContent>
            <TOCItems
              toc={toc}
              minHeadingLevel={minHeadingLevel}
              maxHeadingLevel={maxHeadingLevel}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
