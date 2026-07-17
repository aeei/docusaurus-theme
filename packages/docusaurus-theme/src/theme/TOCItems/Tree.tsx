import React, { type ReactNode } from "react";

import Link from "@docusaurus/Link";
import type { Props } from "@theme/TOCItems/Tree";
import clsx from "clsx";

import { Badge } from "@theme/components/ui/badge";

const codePattern = /(<code(?:\s[^>]*)?>[\s\S]*?<\/code>)/gi;
const codeContentPattern = /^<code(?:\s[^>]*)?>([\s\S]*?)<\/code>$/i;

function HeadingLabel({ html }: { html: string }): React.JSX.Element {
  return (
    <>
      {html.split(codePattern).map((part, index) => {
        const code = part.match(codeContentPattern);
        if (code) {
          return (
            <Badge
              key={index}
              render={<code dangerouslySetInnerHTML={{ __html: code[1] }} />}
              variant="codeCompact"
              className="mx-0.5"
            />
          );
        }

        return part ? (
          <span key={index} dangerouslySetInnerHTML={{ __html: part }} />
        ) : null;
      })}
    </>
  );
}

function TOCItemTree({
  toc,
  className,
  linkClassName,
  isChild,
}: Props): ReactNode {
  if (!toc.length) return null;

  return (
    <ul className={isChild ? undefined : className}>
      {toc.map((heading) => (
        <li key={heading.id}>
          <Link
            to={`#${heading.id}`}
            className={clsx(
              linkClassName,
              "hover:bg-accent! hover:text-accent-foreground! dark:hover:bg-accent!"
            )}
          >
            <HeadingLabel html={heading.value} />
          </Link>
          <TOCItemTree
            isChild
            toc={heading.children}
            className={className}
            linkClassName={linkClassName}
          />
        </li>
      ))}
    </ul>
  );
}

export default React.memo(TOCItemTree);
