/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { translate } from "@docusaurus/Translate";
import clsx from "clsx";
import { X } from "lucide-react";

export interface Props {
  readonly className: string;
  readonly handler: () => void;
}

export default function ExitButton({
  className,
  handler,
}: Props): React.JSX.Element {
  return (
    <button
      type="button"
      aria-label={translate({
        id: "theme.CodeBlock.exitButtonAriaLabel",
        message: "Exit expanded view",
        description: "The ARIA label for exit expanded view button",
      })}
      title={translate({
        id: "theme.CodeBlock.copy",
        message: "Copy",
        description: "The exit button label on code blocks",
      })}
      className={clsx(
        "clean-btn",
        "openapi-explorer__code-block-exit-btn",
        className
      )}
      onClick={handler}
    >
      <span
        className="openapi-explorer__code-block-exit-btn-icons"
        aria-hidden="true"
      >
        <X className="openapi-explorer__code-block-exit-btn-icon" />
      </span>
    </button>
  );
}
