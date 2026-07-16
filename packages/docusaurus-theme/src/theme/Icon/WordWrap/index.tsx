import React, { type ReactNode } from "react";

import type { Props } from "@theme/Icon/WordWrap";
import { WrapText } from "lucide-react";

export default function IconWordWrap(props: Props): ReactNode {
  return <WrapText aria-hidden="true" {...props} />;
}
