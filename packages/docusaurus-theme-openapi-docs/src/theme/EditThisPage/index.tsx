import React, { type ReactNode } from "react";

import Link from "@docusaurus/Link";
import Translate from "@docusaurus/Translate";
import type { Props } from "@theme/EditThisPage";
import { Pencil } from "lucide-react";

import { Button } from "@theme/components/ui/button";

export default function EditThisPage({ editUrl }: Props): ReactNode {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className="no-underline hover:no-underline"
    >
      <Link to={editUrl}>
        <Pencil aria-hidden="true" />
        <Translate
          id="theme.common.editThisPage"
          description="The link label to edit the current page"
        >
          Edit this page
        </Translate>
      </Link>
    </Button>
  );
}
