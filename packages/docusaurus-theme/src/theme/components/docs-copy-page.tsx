import * as React from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  ExternalLinkIcon,
  LinkIcon,
} from "lucide-react";

import { Button } from "./ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "./ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type Status = "idle" | "copied" | "error";

export function DocsCopyPage({
  copyPage,
  markdownUrl,
  copyMarkdownLink,
}: {
  copyPage: () => Promise<void>;
  markdownUrl: string;
  copyMarkdownLink: () => Promise<void>;
}) {
  const [status, setStatus] = React.useState<Status>("idle");

  const runCopy = React.useCallback(async () => {
    try {
      await copyPage();
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    window.setTimeout(() => setStatus("idle"), 1600);
  }, [copyPage]);

  return (
    <ButtonGroup orientation="horizontal" className="rounded-lg bg-secondary">
      <Button
        variant="secondary"
        size="sm"
        className="h-8 shadow-none md:h-7 md:text-[0.8rem]"
        onClick={runCopy}
      >
        {status === "copied" ? <CheckIcon /> : <CopyIcon />}
        {status === "copied"
          ? "Copied"
          : status === "error"
            ? "Copy failed"
            : "Copy Page"}
      </Button>
      <ButtonGroupSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="secondary"
              size="icon"
              className="shadow-none md:size-7"
              aria-label="Copy page options"
            />
          }
        >
          <ChevronDownIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="animate-none! w-auto min-w-40 rounded-lg shadow-none"
        >
          <DropdownMenuItem
            onClick={() => window.open(markdownUrl, "_blank", "noopener")}
          >
            <ExternalLinkIcon />
            View as Markdown
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyMarkdownLink}>
            <LinkIcon />
            Copy Markdown link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="sr-only" aria-live="polite">
        {status === "copied"
          ? "Page copied as Markdown."
          : status === "error"
            ? "Page could not be copied."
            : ""}
      </span>
    </ButtonGroup>
  );
}
