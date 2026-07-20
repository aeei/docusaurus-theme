import React, {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from "react";

import Link from "@docusaurus/Link";
import type {
  PropSidebarItemCategory,
  PropSidebarItemLink,
} from "@docusaurus/plugin-content-docs";
import {
  findFirstSidebarItemLink,
  isActiveSidebarItem,
  useDocSidebarItemsExpandedState,
  useVisibleSidebarItems,
} from "@docusaurus/plugin-content-docs/client";
import { translate } from "@docusaurus/Translate";
import {
  useCollapsible,
  usePrevious,
  useThemeConfig,
} from "@docusaurus/theme-common";
import { isSamePath } from "@docusaurus/theme-common/internal";
import useIsBrowser from "@docusaurus/useIsBrowser";
import DocSidebarItemLink from "@theme/DocSidebarItem/Link";
import DocSidebarItems from "@theme/DocSidebarItems";
import type { Props } from "@theme/DocSidebarItem/Category";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@theme/components/ui/collapsible";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@theme/components/ui/sidebar";

function useAutoExpandActiveCategory({
  isActive,
  collapsed,
  updateCollapsed,
  activePath,
}: {
  isActive: boolean;
  collapsed: boolean;
  updateCollapsed: (value: boolean) => void;
  activePath: string;
}) {
  const wasActive = usePrevious(isActive);
  const previousActivePath = usePrevious(activePath);

  useEffect(() => {
    const justBecameActive = isActive && !wasActive;
    const activePathChanged =
      isActive && wasActive && activePath !== previousActivePath;
    if ((justBecameActive || activePathChanged) && collapsed) {
      updateCollapsed(false);
    }
  }, [
    activePath,
    collapsed,
    isActive,
    previousActivePath,
    updateCollapsed,
    wasActive,
  ]);
}

function useCategoryHrefWithSSRFallback(item: Props["item"]) {
  const isBrowser = useIsBrowser();

  return useMemo(() => {
    if (item.href && !item.linkUnlisted) return item.href;
    if (isBrowser || !item.collapsible) return undefined;
    return findFirstSidebarItemLink(item);
  }, [isBrowser, item]);
}

function MenuItem({
  level,
  children,
}: {
  level: number;
  children?: ReactNode;
}) {
  const Component = level > 1 ? SidebarMenuSubItem : SidebarMenuItem;
  return <Component>{children}</Component>;
}

function MenuButton({
  level,
  render,
  isActive,
  children,
}: {
  level: number;
  render?: ReactElement;
  isActive: boolean;
  children?: ReactNode;
}) {
  if (level > 1) {
    return (
      <SidebarMenuSubButton render={render} isActive={isActive}>
        {children}
      </SidebarMenuSubButton>
    );
  }

  return (
    <SidebarMenuButton render={render} isActive={isActive}>
      {children}
    </SidebarMenuButton>
  );
}

function CategoryChildren({
  items,
  level,
  activePath,
  onItemClick,
}: Pick<Props, "activePath" | "onItemClick"> & {
  items: Props["item"]["items"];
  level: number;
}) {
  return (
    <SidebarMenuSub>
      <DocSidebarItems
        items={items}
        activePath={activePath}
        level={level + 1}
        onItemClick={onItemClick}
      />
    </SidebarMenuSub>
  );
}

function isCategoryWithHref(
  category: PropSidebarItemCategory
): category is PropSidebarItemCategory & { href: string } {
  return typeof category.href === "string";
}

function EmptyCategory({ item, ...props }: Props): ReactNode {
  if (!isCategoryWithHref(item)) return null;

  const {
    type: _type,
    collapsed: _collapsed,
    collapsible: _collapsible,
    items: _items,
    linkUnlisted: _linkUnlisted,
    ...forwardableProps
  } = item;
  const linkItem: PropSidebarItemLink = {
    type: "link",
    ...forwardableProps,
  };
  return <DocSidebarItemLink item={linkItem} {...props} />;
}

function Category({
  item,
  onItemClick,
  activePath,
  level,
  index,
}: Props): ReactNode {
  const { items, label, collapsible, href } = item;
  const {
    docs: {
      sidebar: { autoCollapseCategories },
    },
  } = useThemeConfig();
  const isActive = isActiveSidebarItem(item, activePath);
  const isCurrentPage = isSamePath(href, activePath);
  const hrefWithSSRFallback = useCategoryHrefWithSSRFallback(item);
  const { collapsed, setCollapsed } = useCollapsible({
    initialState: () => {
      if (!collapsible) return false;
      return isActive ? false : item.collapsed;
    },
  });
  const { expandedItem, setExpandedItem } = useDocSidebarItemsExpandedState();
  const updateCollapsed = useCallback(
    (toCollapsed: boolean = !collapsed) => {
      setExpandedItem(toCollapsed ? null : index);
      setCollapsed(toCollapsed);
    },
    [collapsed, index, setCollapsed, setExpandedItem]
  );

  useAutoExpandActiveCategory({
    isActive,
    collapsed,
    updateCollapsed,
    activePath,
  });
  useEffect(() => {
    if (
      collapsible &&
      expandedItem != null &&
      expandedItem !== index &&
      autoCollapseCategories
    ) {
      setCollapsed(true);
    }
  }, [autoCollapseCategories, collapsible, expandedItem, index, setCollapsed]);

  const handleItemClick: ComponentProps<"a">["onClick"] = (event) => {
    onItemClick?.(item);
    if (!collapsible) return;

    if (!href) {
      event.preventDefault();
      updateCollapsed();
    } else if (isCurrentPage) {
      event.preventDefault();
      updateCollapsed();
    } else {
      updateCollapsed(false);
    }
  };
  const toggleLabel = translate(
    collapsed
      ? {
          id: "theme.DocSidebarItem.expandCategoryAriaLabel",
          message: "Expand sidebar category '{label}'",
          description: "The ARIA label to expand the sidebar category",
        }
      : {
          id: "theme.DocSidebarItem.collapseCategoryAriaLabel",
          message: "Collapse sidebar category '{label}'",
          description: "The ARIA label to collapse the sidebar category",
        },
    { label }
  );
  const link = hrefWithSSRFallback ? (
    <Link
      to={hrefWithSSRFallback}
      onClick={handleItemClick}
      aria-current={isCurrentPage ? "page" : undefined}
    />
  ) : undefined;

  if (!collapsible) {
    return (
      <MenuItem level={level}>
        <MenuButton level={level} render={link} isActive={isActive}>
          <span>{label}</span>
        </MenuButton>
        <CategoryChildren
          items={items}
          level={level}
          activePath={activePath}
          onItemClick={onItemClick}
        />
      </MenuItem>
    );
  }

  return (
    <Collapsible
      open={!collapsed}
      onOpenChange={(open) => updateCollapsed(!open)}
      className="group/collapsible"
      render={level > 1 ? <SidebarMenuSubItem /> : <SidebarMenuItem />}
    >
      {link ? (
        <>
          <MenuButton level={level} render={link} isActive={isActive}>
            <span>{label}</span>
          </MenuButton>
          <CollapsibleTrigger
            render={<SidebarMenuAction aria-label={toggleLabel} />}
          >
            <ChevronRight
              aria-hidden="true"
              className="transition-transform group-data-open/collapsible:rotate-90"
            />
          </CollapsibleTrigger>
        </>
      ) : level > 1 ? (
        <CollapsibleTrigger
          render={<SidebarMenuSubButton isActive={isActive} />}
        >
          <span>{label}</span>
          <ChevronRight
            aria-hidden="true"
            className="ml-auto transition-transform group-data-open/collapsible:rotate-90"
          />
        </CollapsibleTrigger>
      ) : (
        <CollapsibleTrigger render={<SidebarMenuButton isActive={isActive} />}>
          <span>{label}</span>
          <ChevronRight
            aria-hidden="true"
            className="ml-auto transition-transform group-data-open/collapsible:rotate-90"
          />
        </CollapsibleTrigger>
      )}
      <CollapsibleContent>
        <CategoryChildren
          items={items}
          level={level}
          activePath={activePath}
          onItemClick={onItemClick}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function DocSidebarItemCategory(props: Props): ReactNode {
  const visibleChildren = useVisibleSidebarItems(
    props.item.items,
    props.activePath
  );
  if (visibleChildren.length === 0) return <EmptyCategory {...props} />;
  return (
    <Category {...props} item={{ ...props.item, items: visibleChildren }} />
  );
}
