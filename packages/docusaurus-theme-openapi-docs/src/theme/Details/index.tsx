import React, {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

import { Details as DetailsGeneric } from "@docusaurus/theme-common/Details";
import { ChevronRight } from "lucide-react";

type Props = React.ComponentProps<typeof DetailsGeneric>;

function withChevron(summary: Props["summary"]): Props["summary"] {
  if (!isValidElement(summary)) return summary;

  const element = summary as ReactElement<{
    children?: ReactNode;
    className?: string;
  }>;
  return cloneElement(
    element,
    {
      className: ["theme-details-summary", element.props.className]
        .filter(Boolean)
        .join(" "),
    },
    <ChevronRight aria-hidden="true" className="theme-details-chevron" />,
    element.props.children
  );
}

export default function Details({
  summary,
  className,
  ...props
}: Props): ReactNode {
  return (
    <DetailsGeneric
      {...props}
      className={["theme-details", className].filter(Boolean).join(" ")}
      summary={withChevron(summary)}
    />
  );
}
