import React, { type ComponentProps, type ReactNode } from "react";

import * as DocsClient from "@docusaurus/plugin-content-docs/client";
import DocCard from "@theme/DocCard";
import type { Props } from "@theme/DocCardList";

type DocCardItem = ComponentProps<typeof DocCard>["item"];

const { filterDocCardListItems, useCurrentSidebarSiblings } =
  DocsClient as typeof DocsClient & {
    filterDocCardListItems(items: DocCardItem[]): DocCardItem[];
    useCurrentSidebarSiblings(): DocCardItem[];
  };

function CurrentCategoryCards(props: Props): ReactNode {
  const items = useCurrentSidebarSiblings();
  return <DocCardList {...props} items={items} />;
}

function DocCardListItem({
  item,
}: {
  item: ComponentProps<typeof DocCard>["item"];
}): ReactNode {
  return (
    <article className="min-w-0">
      <DocCard item={item} />
    </article>
  );
}

export default function DocCardList({ items, className }: Props): ReactNode {
  if (!items) {
    return <CurrentCategoryCards className={className} />;
  }

  return (
    <section className={`grid gap-3 sm:grid-cols-2 ${className ?? ""}`}>
      {filterDocCardListItems(items).map((item, index) => (
        <DocCardListItem key={index} item={item} />
      ))}
    </section>
  );
}
