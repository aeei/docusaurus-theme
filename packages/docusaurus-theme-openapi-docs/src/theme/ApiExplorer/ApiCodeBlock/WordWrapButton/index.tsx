/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import { translate } from "@docusaurus/Translate";
import clsx from "clsx";
import { WrapText } from "lucide-react";

export interface Props {
  readonly className?: string;
  readonly onClick: React.MouseEventHandler;
  readonly isEnabled: boolean;
}

export default function WordWrapButton({
  className,
  onClick,
  isEnabled,
}: Props): React.JSX.Element | null {
  const title = translate({
    id: "theme.CodeBlock.wordWrapToggle",
    message: "Toggle word wrap",
    description:
      "The title attribute for toggle word wrapping button of code block lines",
  });
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "clean-btn",
        className,
        isEnabled && "openapi-explorer__code-block-word-wrap-btn--enabled"
      )}
      aria-label={title}
      title={title}
    >
      <WrapText
        className="openapi-explorer__code-block-word-wrap-btn-icon"
        aria-hidden="true"
      />
    </button>
  );
}
