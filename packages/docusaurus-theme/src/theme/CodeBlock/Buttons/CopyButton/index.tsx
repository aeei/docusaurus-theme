import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { translate } from "@docusaurus/Translate";
import { useCodeBlockContext } from "@docusaurus/theme-common/internal";
import type { Props } from "@theme/CodeBlock/Buttons/CopyButton";
import { Check, Copy } from "lucide-react";

import Button from "@theme/CodeBlock/Buttons/Button";

async function copyToClipboard(text: string) {
  if (navigator.clipboard) return navigator.clipboard.writeText(text);
  const { default: copy } = await import("copy-text-to-clipboard");
  return copy(text);
}

export default function CopyButton({
  className: _className,
}: Props): ReactNode {
  const {
    metadata: { code },
  } = useCodeBlockContext();
  const [isCopied, setIsCopied] = useState(false);
  const timeout = useRef<number | undefined>(undefined);

  const copyCode = useCallback(async () => {
    await copyToClipboard(code);
    setIsCopied(true);
    timeout.current = window.setTimeout(() => setIsCopied(false), 1000);
  }, [code]);

  useEffect(() => () => window.clearTimeout(timeout.current), []);

  const label = isCopied
    ? translate({ id: "theme.CodeBlock.copied", message: "Copied" })
    : translate({
        id: "theme.CodeBlock.copyButtonAriaLabel",
        message: "Copy code to clipboard",
      });
  const shortLabel = isCopied
    ? translate({ id: "theme.CodeBlock.copied", message: "Copied" })
    : translate({ id: "theme.CodeBlock.copy", message: "Copy" });

  return (
    <Button
      data-slot="copy-button"
      data-copied={isCopied}
      aria-label={label}
      title={label}
      onClick={copyCode}
    >
      <span className="sr-only">{shortLabel}</span>
      {isCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
    </Button>
  );
}
