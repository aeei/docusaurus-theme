import React, { type ReactNode } from "react";

import type { Props } from "@theme/Icon/Success";
import { Check } from "lucide-react";

export default function IconSuccess(props: Props): ReactNode {
  return <Check aria-hidden="true" {...props} />;
}
