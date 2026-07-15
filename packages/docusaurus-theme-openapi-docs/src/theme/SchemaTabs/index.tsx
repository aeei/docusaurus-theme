import React, { cloneElement, type ReactElement } from "react";

import useIsBrowser from "@docusaurus/useIsBrowser";
import flatten from "lodash/flatten";

import { OpenApiTabList } from "@theme/components/openapi-tab-list";
import {
  sanitizeTabsChildren,
  type TabItemProps,
  type TabProps,
  TabsProvider,
  useTabsContextValue,
} from "@theme/utils/tabsUtils";

export interface SchemaTabsProps extends TabProps {
  onChange?: (index: number) => void;
}

function SchemaTabList({
  selectedValue,
  selectValue,
  tabValues,
  onChange,
  className,
  block,
}: SchemaTabsProps & ReturnType<typeof useTabsContextValue>) {
  const onValueChange = (nextValue: string) => {
    selectValue(nextValue);
    onChange?.(tabValues.findIndex((tab) => tab.value === nextValue));
  };

  return (
    <OpenApiTabList
      values={tabValues}
      value={selectedValue}
      onValueChange={onValueChange}
      variant="line"
      className={className}
      block={block}
    />
  );
}

function TabContent({
  lazy,
  children,
  selectedValue,
}: SchemaTabsProps & ReturnType<typeof useTabsContextValue>) {
  const childTabs = flatten(
    (Array.isArray(children) ? children : [children]).filter(Boolean)
  ) as ReactElement<TabItemProps>[];

  if (!lazy) return <div className="margin-top--md">{childTabs}</div>;

  const selectedTab = childTabs.find(
    (tab) => tab.props.value === selectedValue
  );
  return selectedTab
    ? cloneElement(selectedTab, { className: "margin-top--md" })
    : null;
}

function TabsComponent(props: SchemaTabsProps): React.JSX.Element {
  const tabs = useTabsContextValue(props);
  return (
    <TabsProvider value={tabs}>
      <div className="tabs-container">
        <SchemaTabList {...props} {...tabs} />
        <TabContent {...props} {...tabs} />
      </div>
    </TabsProvider>
  );
}

export default function SchemaTabs(props: SchemaTabsProps) {
  const isBrowser = useIsBrowser();
  return (
    <TabsComponent key={String(isBrowser)} {...props}>
      {sanitizeTabsChildren(props.children)}
    </TabsComponent>
  );
}
