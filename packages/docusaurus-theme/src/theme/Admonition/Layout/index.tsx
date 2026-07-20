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

const iconByType: Record<string, LucideIcon> = {
  note: Info,
  tip: Lightbulb,
  info: CircleAlert,
  warning: TriangleAlert,
  danger: CircleX,
  success: CircleCheck,
};

iconByType.secondary = iconByType.note;
iconByType.important = iconByType.info;
iconByType.caution = iconByType.warning;
iconByType.error = iconByType.danger;
iconByType.failure = iconByType.danger;

const destructiveTypes = new Set(["danger", "error", "failure"]);

export default function AdmonitionLayout({
  type,
  title,
  children,
  className: _className,
  id,
}: Props): ReactNode {
  const Icon = iconByType[type] ?? CircleAlert;

  return (
    <Alert
      id={id}
      variant={destructiveTypes.has(type) ? "destructive" : "default"}
    >
      <Icon aria-hidden="true" />
      {title && <AlertTitle>{title}</AlertTitle>}
      {children && <AlertDescription>{children}</AlertDescription>}
    </Alert>
  );
}
