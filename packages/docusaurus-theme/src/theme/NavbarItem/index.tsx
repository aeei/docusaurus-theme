import React from "react";

import ComponentTypes from "@theme/NavbarItem/ComponentTypes";
import { Github, Rss } from "lucide-react";

type NavbarItemType = keyof typeof ComponentTypes;
export type Props = {
  type?: NavbarItemType;
  className?: string;
  href?: string;
  target?: string;
  "aria-label"?: string;
  [key: string]: unknown;
};

const iconByClassName = {
  "theme-navbar-github-link": Github,
  "theme-navbar-rss-link": Rss,
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
    return (
      <a
        className="navbar__item navbar__link theme-navbar-icon-link"
        href={props.href}
        target={props.target}
        rel={props.target === "_blank" ? "noreferrer" : undefined}
        aria-label={props["aria-label"]}
      >
        <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
      </a>
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
