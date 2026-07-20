/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * Swizzled from @docusaurus/theme-classic under the MIT License.
 */

import React, { type ReactNode } from "react";

import { translate } from "@docusaurus/Translate";
import DocSidebarItems from "@theme/DocSidebarItems";
import type { Props } from "@theme/DocSidebar/Desktop/Content";
import { SidebarGroup, SidebarMenu } from "@theme/components/ui/sidebar";

export default function DocSidebarDesktopContent({
  path,
  sidebar,
  className: _className,
}: Props): ReactNode {
  return (
    <SidebarGroup>
      <nav
        aria-label={translate({
          id: "theme.docs.sidebar.navAriaLabel",
          message: "Docs sidebar",
          description: "The ARIA label of the docs sidebar navigation",
        })}
      >
        <SidebarMenu>
          <DocSidebarItems items={sidebar} activePath={path} level={1} />
        </SidebarMenu>
      </nav>
    </SidebarGroup>
  );
}
