import React, { type ReactNode } from "react";

import Link from "@docusaurus/Link";
import type { Props } from "@theme/PaginatorNavLink";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginatorNavLink(props: Props): ReactNode {
  const { permalink, title, subLabel, isNext } = props;

  return (
    <Link
      className={clsx(
        "pagination-nav__link",
        isNext ? "pagination-nav__link--next" : "pagination-nav__link--prev"
      )}
      to={permalink}
    >
      {subLabel && <div className="pagination-nav__sublabel">{subLabel}</div>}
      <div
        className={clsx(
          "pagination-nav__label theme-paginator-label",
          isNext && "theme-paginator-label--next"
        )}
      >
        {!isNext && <ChevronLeft aria-hidden="true" />}
        <span>{title}</span>
        {isNext && <ChevronRight aria-hidden="true" />}
      </div>
    </Link>
  );
}
