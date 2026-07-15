import React, { type ReactNode } from "react";

import type { Props } from "@theme/Icon/Edit";
import { Pencil } from "lucide-react";

export default function IconEdit({
  width = 20,
  height = 20,
  ...props
}: Props): ReactNode {
  return <Pencil width={width} height={height} aria-hidden="true" {...props} />;
}
