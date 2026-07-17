import React, { type ReactNode } from "react";

import { useCodeBlockContext } from "@docusaurus/theme-common/internal";
import Buttons from "@theme/CodeBlock/Buttons";
import Container from "@theme/CodeBlock/Container";
import Content from "@theme/CodeBlock/Content";
import type { Props } from "@theme/CodeBlock/Layout";
import Title from "@theme/CodeBlock/Title";
import clsx from "clsx";

export default function CodeBlockLayout({ className }: Props): ReactNode {
  const { metadata } = useCodeBlockContext();
  const label = metadata.title ?? metadata.language ?? "text";

  return (
    <Container
      as="div"
      className={clsx(
        "theme-code-block shadow-none!",
        className,
        metadata.className
      )}
    >
      <div className="theme-code-block__header">
        <span className="theme-code-block__label">
          {metadata.title ? <Title>{metadata.title}</Title> : label}
        </span>
        <Buttons />
      </div>
      <div className="theme-code-block__content">
        <Content />
      </div>
    </Container>
  );
}
