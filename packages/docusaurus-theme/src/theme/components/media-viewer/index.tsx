import React, {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useId,
  useState,
} from "react";

import { translate } from "@docusaurus/Translate";
import { Maximize2 } from "lucide-react";

import CodeBlockButton from "@theme/CodeBlock/Buttons/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@theme/components/ui/dialog";

export type MediaViewerProps = {
  as: "span" | "div";
  kind: "image" | "diagram";
  title: string;
  preview: ReactNode;
  expanded: ReactNode;
};

export default function MediaViewer({
  as,
  kind,
  title,
  preview,
  expanded,
}: MediaViewerProps): ReactNode {
  const [open, setOpen] = useState(false);
  const actionId = useId();
  const Root = as;
  const viewLabel = translate({
    id: "theme.mediaViewer.viewLarger",
    message: "View larger",
  });
  const description = translate({
    id: "theme.mediaViewer.description",
    message: "Expanded media preview. Press Escape to close.",
  });

  const changeOpen = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        requestAnimationFrame(() => document.getElementById(actionId)?.focus());
      }
    },
    [actionId]
  );

  const openFromMedia = useCallback((event: MouseEvent<HTMLElement>) => {
    const target = event.target as Element;
    if (target.closest("a,button")) return;
    setOpen(true);
  }, []);

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <Root
        className="theme-media-viewer"
        data-media-kind={kind}
        onClick={openFromMedia}
      >
        {preview}
        <CodeBlockButton
          id={actionId}
          className="theme-media-viewer__action"
          aria-label={viewLabel}
          onClick={() => setOpen(true)}
        >
          <Maximize2 aria-hidden="true" />
        </CodeBlockButton>
      </Root>
      <DialogContent className="max-h-[calc(100dvh-2rem)] sm:max-w-[min(var(--theme-shell-max-width),calc(100vw-2rem))]">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="theme-media-viewer__viewport" data-media-kind={kind}>
          {expanded}
        </div>
      </DialogContent>
    </Dialog>
  );
}
