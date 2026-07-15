import React, { type ReactNode } from "react";

import type { Props } from "@theme/Icon/Copy";
import { Copy } from "lucide-react";

export default function IconCopy(props: Props): ReactNode {
  return <Copy aria-hidden="true" {...props} />;
}
