import React, { type ReactNode } from "react";

import { usePrismTheme } from "@docusaurus/theme-common";
import {
  getPrismCssVariables,
  useCodeBlockContext,
} from "@docusaurus/theme-common/internal";
import Buttons from "@theme/CodeBlock/Buttons";
import Content from "@theme/CodeBlock/Content";
import type { Props } from "@theme/CodeBlock/Layout";
import Title from "@theme/CodeBlock/Title";
import { CodeLanguageIcon } from "@theme/components/code-language-icon";

export default function CodeBlockLayout({
  className: _className,
}: Props): ReactNode {
  const { metadata } = useCodeBlockContext();
  const prismTheme = usePrismTheme();

  return (
    <figure
      data-rehype-pretty-code-figure=""
      className="theme-code-block"
      style={getPrismCssVariables(prismTheme)}
    >
      {metadata.title ? (
        <figcaption
          data-rehype-pretty-code-title=""
          data-language={metadata.language}
          className="theme-code-block__title"
        >
          <CodeLanguageIcon language={metadata.language} />
          <Title>{metadata.title}</Title>
        </figcaption>
      ) : null}
      <Buttons />
      <Content />
    </figure>
  );
}
