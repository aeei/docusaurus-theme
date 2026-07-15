import React, { type ReactNode } from "react";

import BrowserOnly from "@docusaurus/BrowserOnly";
import CopyButton from "@theme/CodeBlock/Buttons/CopyButton";
import WordWrapButton from "@theme/CodeBlock/Buttons/WordWrapButton";
import type { Props } from "@theme/CodeBlock/Buttons";
import clsx from "clsx";

export default function CodeBlockButtons({ className }: Props): ReactNode {
  return (
    <BrowserOnly>
      {() => (
        <div className={clsx("theme-code-block__actions", className)}>
          <WordWrapButton />
          <CopyButton />
        </div>
      )}
    </BrowserOnly>
  );
}
