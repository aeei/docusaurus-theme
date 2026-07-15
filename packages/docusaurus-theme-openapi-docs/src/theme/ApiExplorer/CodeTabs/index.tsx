/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { cloneElement, ReactElement, useEffect, useRef } from "react";

import useIsBrowser from "@docusaurus/useIsBrowser";
import clsx from "clsx";
import { Code2, Terminal } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@theme/components/ui/tabs";
import { useScrollPositionBlocker } from "@theme/utils/scrollUtils";
import {
  sanitizeTabsChildren,
  type TabItemProps,
  type TabProps,
  TabsProvider,
  useTabsContextValue,
} from "@theme/utils/tabsUtils";
import { Language } from "../CodeSnippets/code-snippets-types";

export interface Props {
  action: {
    [key: string]: React.Dispatch<any>;
  };
  currentLanguage?: Language;
  languageSet: Language[];
  includeVariant?: boolean;
}

export interface CodeTabsProps extends Props, TabProps {
  includeSample?: boolean;
}

function TabList({
  action,
  currentLanguage,
  languageSet,
  includeVariant,
  includeSample,
  className,
  block,
  selectedValue,
  selectValue,
  tabValues,
}: CodeTabsProps & ReturnType<typeof useTabsContextValue>) {
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const tabsScrollContainerRef = useRef<HTMLDivElement>(null);
  const { blockElementScrollPositionUntilNextRender } =
    useScrollPositionBlocker();

  useEffect(() => {
    const activeTab = tabRefs.current.get(selectedValue);
    const container = tabsScrollContainerRef.current;
    if (!activeTab || !container) return;

    const containerRect = container.getBoundingClientRect();
    const activeTabRect = activeTab.getBoundingClientRect();
    const glowOffset = 3;
    const scrollOffset =
      activeTabRect.left -
      containerRect.left +
      container.scrollLeft -
      glowOffset;

    if (Math.abs(scrollOffset - container.scrollLeft) > 4) {
      container.scrollLeft = scrollOffset;
    }
  }, [selectedValue]);

  const handleValueChange = (newTabValue: string) => {
    const newTab = tabRefs.current.get(newTabValue);
    if (newTab) blockElementScrollPositionUntilNextRender(newTab);

    if (newTabValue !== selectedValue) selectValue(newTabValue);

    if (!action) return;

    let newLanguage: Language;
    if (currentLanguage && includeVariant) {
      newLanguage = languageSet.filter(
        (lang: Language) => lang.language === currentLanguage.language
      )[0];
      newLanguage.variant = newTabValue;
      action.setSelectedVariant(newTabValue.toLowerCase());
    } else if (currentLanguage && includeSample) {
      newLanguage = languageSet.filter(
        (lang: Language) => lang.language === currentLanguage.language
      )[0];
      newLanguage.sample = newTabValue;
      action.setSelectedSample(newTabValue);
    } else {
      newLanguage = languageSet.filter(
        (lang: Language) => lang.language === newTabValue
      )[0];
      action.setSelectedVariant(newLanguage.variants[0].toLowerCase());
      action.setSelectedSample(newLanguage.sample);
    }
    action.setLanguage(newLanguage);
  };

  return (
    <Tabs
      value={selectedValue}
      onValueChange={handleValueChange}
      className={clsx(
        "tabs-container openapi-tabs__code-container gap-0",
        className
      )}
    >
      <div
        ref={tabsScrollContainerRef}
        data-slot="tabs-scroller"
        className="max-w-full overflow-x-auto border-b border-border [scrollbar-width:none]"
      >
        <TabsList
          variant="line"
          className={clsx(
            "openapi-tabs__code-list-container h-auto! min-w-max justify-start",
            block && "tabs--block w-full min-w-full"
          )}
        >
          {tabValues.map(({ value, label, attributes }) => {
            const itemClassName = attributes?.className as string | undefined;
            const Icon = itemClassName?.includes("--shell") ? Terminal : Code2;

            return (
              <TabsTrigger
                key={value}
                {...attributes}
                ref={(tabControl) => {
                  if (tabControl) tabRefs.current.set(value, tabControl);
                  else tabRefs.current.delete(value);
                }}
                value={value}
                className={clsx(
                  "openapi-tabs__code-item",
                  itemClassName,
                  selectedValue === value && "active"
                )}
              >
                {itemClassName && (
                  <Icon
                    aria-hidden="true"
                    className="openapi-tabs__code-icon"
                  />
                )}
                <span>{label ?? value}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
    </Tabs>
  );
}

function TabContent({
  lazy,
  children,
  selectedValue,
}: CodeTabsProps &
  ReturnType<typeof useTabsContextValue>): React.JSX.Element | null {
  const childTabs = (Array.isArray(children) ? children : [children]).filter(
    Boolean
  ) as ReactElement<TabItemProps>[];
  if (lazy) {
    const selectedTabItem = childTabs.find(
      (tabItem) => tabItem.props.value === selectedValue
    );
    if (!selectedTabItem) return null;
    return cloneElement(selectedTabItem, { className: "margin-top--md" });
  }
  return (
    <div className="margin-top--md openapi-tabs__code-content">{childTabs}</div>
  );
}

function TabsComponent(props: CodeTabsProps & Props): React.JSX.Element {
  const tabs = useTabsContextValue(props);

  return (
    <TabsProvider value={tabs}>
      <TabList {...props} {...tabs} />
      <TabContent {...props} {...tabs} />
    </TabsProvider>
  );
}

export default function CodeTabs(
  props: CodeTabsProps & Props
): React.JSX.Element {
  const isBrowser = useIsBrowser();
  return (
    <TabsComponent key={String(isBrowser)} {...props}>
      {sanitizeTabsChildren(props.children)}
    </TabsComponent>
  );
}
