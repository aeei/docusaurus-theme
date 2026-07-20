import React, { type ReactNode } from "react";

import Link from "@docusaurus/Link";
import type { Props } from "@theme/TOCItems/Tree";

const codePattern = /(<code(?:\s[^>]*)?>[\s\S]*?<\/code>)/gi;
const codeContentPattern = /^<code(?:\s[^>]*)?>([\s\S]*?)<\/code>$/i;

function HeadingLabel({ html }: { html: string }): React.JSX.Element {
  return (
    <>
      {html.split(codePattern).map((part, index) => {
        const code = part.match(codeContentPattern);
        if (code) {
          return (
            <code key={index} dangerouslySetInnerHTML={{ __html: code[1] }} />
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
    <ul className={isChild ? "table-of-contents__sublist" : className}>
      {toc.map((heading) => (
        <li key={heading.id} className="table-of-contents__item">
          <Link
            to={`#${heading.id}`}
            className={linkClassName ?? undefined}
            data-depth={heading.level}
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
