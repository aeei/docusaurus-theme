/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { translate } from "@docusaurus/Translate";
import { X } from "lucide-react";

import { Button } from "@theme/components/ui/button";

export interface Props {
  readonly className: string;
  readonly handler: () => void;
}

export default function ExitButton({
  className,
  handler,
}: Props): React.JSX.Element {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={translate({
        id: "theme.CodeBlock.exitButtonAriaLabel",
        message: "Exit expanded view",
        description: "The ARIA label for exit expanded view button",
      })}
      title={translate({
        id: "theme.CodeBlock.exit",
        message: "Exit",
        description: "The exit button label on code blocks",
      })}
      className={className}
      onClick={handler}
    >
      <X aria-hidden="true" />
    </Button>
  );
}
