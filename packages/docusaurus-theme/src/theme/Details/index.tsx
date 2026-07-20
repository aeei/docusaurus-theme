import React, {
  isValidElement,
  useId,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";

import useBrokenLinks from "@docusaurus/useBrokenLinks";
import type { DetailsProps } from "@docusaurus/theme-common/lib/components/Details";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@theme/components/ui/accordion";

type Props = DetailsProps;
type SummaryProps = ComponentProps<typeof AccordionTrigger> & {
  children?: ReactNode;
};

function getSummary(summary: Props["summary"]): {
  content: ReactNode;
  props: Omit<SummaryProps, "children">;
} {
  if (!isValidElement(summary)) {
    return { content: summary ?? "Details", props: {} };
  }

  const {
    children,
    className: _className,
    style: _style,
    ...props
  } = (summary as ReactElement<SummaryProps>).props;
  return { content: children, props };
}

export default function Details({
  summary,
  children,
  className: _className,
  id,
  open,
  ...props
}: Props): ReactNode {
  useBrokenLinks().collectAnchor(id);
  const generatedId = useId();
  const value = id ?? generatedId;
  const { content: summaryContent, props: summaryProps } = getSummary(summary);

  return (
    <Accordion
      {...(props as ComponentProps<typeof Accordion>)}
      id={id}
      defaultValue={open ? [value] : []}
    >
      <AccordionItem value={value}>
        <AccordionTrigger {...summaryProps}>{summaryContent}</AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
