import React, { type ReactNode } from "react";

import type { Props } from "@theme/CodeInline";

import { Badge } from "@theme/components/ui/badge";

export default function CodeInline(props: Props): ReactNode {
  return <Badge render={<code {...props} />} variant="code" />;
}
