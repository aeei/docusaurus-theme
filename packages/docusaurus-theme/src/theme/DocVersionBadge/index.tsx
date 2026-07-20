import React, { type ReactNode } from "react";

import Translate from "@docusaurus/Translate";
import * as DocsClient from "@docusaurus/plugin-content-docs/client";

import { Badge } from "@theme/components/ui/badge";

type Props = {
  className?: string;
};

export default function DocVersionBadge({
  className: _className,
}: Props): ReactNode {
  const versionMetadata = (DocsClient as any).useDocsVersion();

  if (!versionMetadata?.badge) return null;

  return (
    <Badge variant="secondary">
      <Translate
        id="theme.docs.versionBadge.label"
        values={{ versionLabel: versionMetadata.label }}
      >
        {"Version: {versionLabel}"}
      </Translate>
    </Badge>
  );
}
