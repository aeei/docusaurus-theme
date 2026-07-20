import React, { type ReactNode } from "react";

import BrowserOnly from "@docusaurus/BrowserOnly";
import CopyButton from "@theme/CodeBlock/Buttons/CopyButton";
import type { Props } from "@theme/CodeBlock/Buttons";

export default function CodeBlockButtons({
  className: _className,
}: Props): ReactNode {
  return (
    <BrowserOnly>
      {() => (
        <div className="theme-code-block__actions">
          <CopyButton />
        </div>
      )}
    </BrowserOnly>
  );
}
