import React, { type ReactNode } from "react";

import { ThemeClassNames } from "@docusaurus/theme-common";
import type { Props } from "@theme/DocCard/Heading/Icon";
import { ExternalLink, FileText, FolderClosed } from "lucide-react";

export default function DocCardHeadingIcon({ icon }: Props): ReactNode {
  const Icon =
    icon === "🗃" ? FolderClosed : icon === "🔗" ? ExternalLink : FileText;

  return (
    <span className={`${ThemeClassNames.docs.docCard.icon} mr-2 inline-flex`}>
      <Icon aria-hidden="true" className="size-4" />
    </span>
  );
}
