import React, { type ReactNode } from "react";

import {
  CircleAlert,
  CircleCheck,
  CircleX,
  Info,
  Lightbulb,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@theme/components/ui/alert";

type Props = {
  type: string;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  id?: string;
};

const toneByType: Record<
  string,
  {
    tone: "info" | "success" | "warning" | "destructive";
    className: string;
    titleClassName: string;
    Icon: LucideIcon;
  }
> = {
  note: {
    tone: "info",
    className:
      "border-info/60 bg-info-background text-foreground [&>svg]:text-info",
    titleClassName: "text-info",
    Icon: Info,
  },
  tip: {
    tone: "success",
    className:
      "border-success/60 bg-success-background text-foreground [&>svg]:text-success",
    titleClassName: "text-success",
    Icon: Lightbulb,
  },
  info: {
    tone: "info",
    className:
      "border-info/60 bg-info-background text-foreground [&>svg]:text-info",
    titleClassName: "text-info",
    Icon: CircleAlert,
  },
  warning: {
    tone: "warning",
    className:
      "border-warning/60 bg-warning-background text-foreground [&>svg]:text-warning",
    titleClassName: "text-warning",
    Icon: TriangleAlert,
  },
  danger: {
    tone: "destructive",
    className:
      "border-destructive/60 bg-destructive/10 text-foreground [&>svg]:text-destructive",
    titleClassName: "text-destructive",
    Icon: CircleX,
  },
  success: {
    tone: "success",
    className:
      "border-success/60 bg-success-background text-foreground [&>svg]:text-success",
    titleClassName: "text-success",
    Icon: CircleCheck,
  },
};

toneByType.secondary = toneByType.note;
toneByType.important = toneByType.info;
toneByType.caution = toneByType.warning;
toneByType.error = toneByType.danger;
toneByType.failure = toneByType.danger;

export default function AdmonitionLayout({
  type,
  title,
  children,
  className,
  id,
}: Props): ReactNode {
  const {
    tone: semanticTone,
    className: tone,
    titleClassName,
    Icon,
  } = toneByType[type] ?? toneByType.info;
  const customClassName = className
    ?.split(" ")
    .filter((name) => name !== "alert" && !name.startsWith("alert--"))
    .join(" ");

  return (
    <Alert
      id={id}
      data-tone={semanticTone}
      className={`${tone}${customClassName ? ` ${customClassName}` : ""}`}
    >
      <Icon aria-hidden="true" />
      {title && <AlertTitle className={titleClassName}>{title}</AlertTitle>}
      {children && <AlertDescription>{children}</AlertDescription>}
    </Alert>
  );
}
