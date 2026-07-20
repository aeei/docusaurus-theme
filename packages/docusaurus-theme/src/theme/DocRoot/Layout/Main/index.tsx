import React, { type ReactNode } from "react";

import type { Props } from "@theme/DocRoot/Layout/Main";

export default function DocRootLayoutMain({ children }: Props): ReactNode {
  return (
    <div className="h-full w-full">
      <div
        data-slot="docs"
        className="flex scroll-mt-24 items-stretch pb-8 text-[1.05rem] sm:text-[15px] xl:w-full"
      >
        {children}
      </div>
    </div>
  );
}
