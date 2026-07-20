import React, { type ReactNode } from "react";

import type { Props } from "@theme/DocCard/Heading/Icon";
import { ExternalLink, FileText, FolderClosed } from "lucide-react";

export default function DocCardHeadingIcon({ icon }: Props): ReactNode {
  const Icon =
    icon === "🗃" ? FolderClosed : icon === "🔗" ? ExternalLink : FileText;

  return <Icon aria-hidden="true" className="size-4" />;
}
