/* ============================================================================
 * Portions Copyright (c) Meta Platforms, Inc. and affiliates.
 * Portions Copyright (c) Palo Alto Networks
 *
 * Swizzled from @docusaurus/theme-classic/src/theme/TabItem/index.tsx (MIT).
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { type ReactNode } from "react";

import { TabsContent } from "@theme/components/ui/tabs";
import { type TabItemProps, useTabs } from "@theme/utils/tabsUtils";

type Props = TabItemProps;

export default function TabItem({
  children,
  className: _className,
  value,
}: Props): ReactNode {
  const { lazy } = useTabs();

  return (
    <TabsContent value={value} keepMounted={!lazy}>
      {children}
    </TabsContent>
  );
}
