import React from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@theme/components/ui/card";

export function FeatureCallout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={3}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
