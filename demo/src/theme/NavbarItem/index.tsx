import React from "react";

import OriginalNavbarItem from "@theme-original/NavbarItem";

type OriginalProps = React.ComponentProps<typeof OriginalNavbarItem>;

export default function NavbarItem(props: OriginalProps): JSX.Element {
  return <OriginalNavbarItem {...props} />;
}
