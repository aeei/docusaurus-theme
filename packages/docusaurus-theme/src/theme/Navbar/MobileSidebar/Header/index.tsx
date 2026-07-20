import React, { type ReactNode } from "react";

import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@theme/components/ui/sheet";

export default function NavbarMobileSidebarHeader(): ReactNode {
  return (
    <SheetHeader>
      <SheetTitle>Navigation</SheetTitle>
      <SheetDescription>Browse documentation pages.</SheetDescription>
    </SheetHeader>
  );
}
