import React, { type ReactNode } from "react";

import Link from "@docusaurus/Link";
import type { Props } from "@theme/PaginatorNavLink";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@theme/components/ui/button";

export default function PaginatorNavLink(props: Props): ReactNode {
  const { permalink, title, subLabel, isNext } = props;

  return (
    <Button
      render={<Link to={permalink} />}
      nativeButton={false}
      variant="outline"
      size="default"
      className={isNext ? "theme-paginator-link--next" : undefined}
    >
      {!isNext && <ChevronLeft data-icon="inline-start" aria-hidden="true" />}
      {subLabel && <span className="sr-only">{subLabel}: </span>}
      <span>{title}</span>
      {isNext && <ChevronRight data-icon="inline-end" aria-hidden="true" />}
    </Button>
  );
}
