/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useCallback, useState, useRef, useEffect } from "react";

import { translate } from "@docusaurus/Translate";
import clsx from "clsx";
import { Check, Copy } from "lucide-react";

import { Button } from "@theme/components/ui/button";

interface CopyButtonProps {
  code: string;
  className?: string;
}

async function copyToClipboard(text: string) {
  // The clipboard API is only defined in secure contexts (HTTPS / localhost).
  // See https://developer.mozilla.org/en-US/docs/Web/API/Clipboard
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  // Fall back to copy-text-to-clipboard for non-secure contexts (e.g. HTTP
  // on a local network). The fallback is lazily loaded to avoid bundle
  // overhead for the common HTTPS case.
  const { default: copy } = await import("copy-text-to-clipboard");
  return copy(text);
}

export default function CopyButton({
  code,
  className,
}: CopyButtonProps): React.JSX.Element {
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeout = useRef<number | undefined>(undefined);
  const handleCopyCode = useCallback(async () => {
    await copyToClipboard(code);
    setIsCopied(true);
    copyTimeout.current = window.setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  }, [code]);

  useEffect(() => () => window.clearTimeout(copyTimeout.current), []);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={
        isCopied
          ? translate({
              id: "theme.CodeBlock.copied",
              message: "Copied",
              description: "The copied button label on code blocks",
            })
          : translate({
              id: "theme.CodeBlock.copyButtonAriaLabel",
              message: "Copy code to clipboard",
              description: "The ARIA label for copy code blocks button",
            })
      }
      title={translate({
        id: "theme.CodeBlock.copy",
        message: "Copy",
        description: "The copy button label on code blocks",
      })}
      className={clsx(
        className,
        "openapi-explorer__code-block-copy-btn",
        isCopied && "openapi-explorer__code-block-copy-btn--copied"
      )}
      onClick={handleCopyCode}
    >
      <span
        className="openapi-explorer__code-block-copy-btn-icons"
        aria-hidden="true"
      >
        <Copy className="openapi-explorer__code-block-copy-btn-icon" />
        <Check className="openapi-explorer__code-block-copy-btn-icon--success" />
      </span>
    </Button>
  );
}
