import React, {
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";

import useBrokenLinks from "@docusaurus/useBrokenLinks";
import { Details as DetailsGeneric } from "@docusaurus/theme-common/Details";
import { ChevronDown } from "lucide-react";

import { Button } from "@theme/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@theme/components/ui/collapsible";

import { cn } from "@theme/utils/cn";

type Props = React.ComponentProps<typeof DetailsGeneric>;
type SummaryProps = ComponentProps<"span"> & { children?: ReactNode };

function getSummary(summary: Props["summary"]): {
  content: ReactNode;
  props: Omit<SummaryProps, "children">;
} {
  if (!isValidElement(summary)) {
    return { content: summary ?? "Details", props: {} };
  }

  const { children, ...props } = (summary as ReactElement<SummaryProps>).props;
  return { content: children, props };
}

export default function Details({
  summary,
  children,
  className,
  id,
  open,
  ...props
}: Props): ReactNode {
  useBrokenLinks().collectAnchor(id);
  const { content: summaryContent, props: summaryProps } = getSummary(summary);
  const { className: summaryClassName, ...summaryAttributes } = summaryProps;

  return (
    <Collapsible
      {...(props as ComponentProps<typeof Collapsible>)}
      id={id}
      defaultOpen={open}
      className={cn(
        "group/details overflow-hidden rounded-lg border border-border bg-card text-card-foreground",
        className
      )}
    >
      <CollapsibleTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-between text-left group-data-open/details:rounded-b-none"
          />
        }
      >
        <span
          {...summaryAttributes}
          className={cn("min-w-0 flex-1", summaryClassName)}
        >
          {summaryContent}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="transition-transform group-data-open/details:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent keepMounted className="theme-details-content">
        <div className="theme-content-flow border-t border-border p-4 text-sm">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
