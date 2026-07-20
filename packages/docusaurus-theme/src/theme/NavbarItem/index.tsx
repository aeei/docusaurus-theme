import React from "react";

import ComponentTypes from "@theme/NavbarItem/ComponentTypes";
import { Button } from "@theme/components/ui/button";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@theme/components/ui/sidebar";
import { GithubIcon, RssIcon } from "lucide-react";

type NavbarItemType = keyof typeof ComponentTypes;
export type Props = {
  type?: NavbarItemType;
  className?: string;
  href?: string;
  target?: string;
  mobile?: boolean;
  "aria-label"?: string;
  [key: string]: unknown;
};

const iconByClassName = {
  "theme-navbar-github-link": GithubIcon,
  "theme-navbar-rss-link": RssIcon,
} as const;

function normalizeComponentType(
  type: NavbarItemType | undefined,
  props: object
) {
  if (!type || type === "default") {
    return "items" in props ? "dropdown" : "default";
  }
  return type;
}

export default function NavbarItem(props: Props): React.JSX.Element {
  const Icon = Object.entries(iconByClassName).find(([className]) =>
    props.className?.split(" ").includes(className)
  )?.[1];

  if (Icon && props.href) {
    const link = (
      <a
        href={props.href}
        target={props.target}
        rel={props.target === "_blank" ? "noreferrer" : undefined}
        aria-label={props["aria-label"]}
      />
    );

    if (props.mobile) {
      return (
        <SidebarMenuItem>
          <SidebarMenuButton render={link}>
            <Icon aria-hidden="true" />
            <span>{props["aria-label"]}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    return (
      <Button render={link} nativeButton={false} variant="ghost" size="icon">
        <Icon aria-hidden="true" />
      </Button>
    );
  }

  const { type, ...itemProps } = props;
  const componentType = normalizeComponentType(type, itemProps);
  const NavbarItemComponent = ComponentTypes[componentType];

  if (!NavbarItemComponent) {
    throw new Error(`No NavbarItem component found for type "${type}".`);
  }

  const Component = NavbarItemComponent as React.ComponentType<
    Record<string, unknown>
  >;
  return <Component {...itemProps} />;
}
