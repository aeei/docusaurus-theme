import React, { type ReactNode } from "react";

import { translate } from "@docusaurus/Translate";
import type { Props } from "@theme/Icon/ExternalLink";
import { ExternalLink } from "lucide-react";

export default function IconExternalLink({
  width = 14,
  height = 14,
}: Props): ReactNode {
  return (
    <ExternalLink
      width={width}
      height={height}
      aria-label={translate({
        id: "theme.IconExternalLink.ariaLabel",
        message: "(opens in new tab)",
        description: "The accessible label for an external link icon.",
      })}
      className="ml-1 inline align-[-0.125em]"
    />
  );
}
