import React, { cloneElement, type ReactElement } from "react";

import useIsBrowser from "@docusaurus/useIsBrowser";

import { OpenApiTabList } from "@theme/components/openapi-tab-list";
import {
  sanitizeTabsChildren,
  type TabItemProps,
  type TabProps,
  TabsProvider,
  useTabsContextValue,
} from "@theme/utils/tabsUtils";

function TabContent({
  lazy,
  children,
  selectedValue,
}: TabProps & ReturnType<typeof useTabsContextValue>) {
  const childTabs = (Array.isArray(children) ? children : [children]).filter(
    Boolean
  ) as ReactElement<TabItemProps>[];

  if (!lazy) return <div className="margin-top--md">{childTabs}</div>;

  const selectedTab = childTabs.find(
    (tab) => tab.props.value === selectedValue
  );
  return selectedTab
    ? cloneElement(selectedTab, { className: "margin-top--md" })
    : null;
}

function TabsComponent(props: TabProps): React.JSX.Element {
  const tabs = useTabsContextValue(props);

  return (
    <TabsProvider value={tabs}>
      <div className="tabs-container">
        <OpenApiTabList
          values={tabs.tabValues}
          value={tabs.selectedValue}
          onValueChange={tabs.selectValue}
          className={props.className}
          block={props.block}
        />
        <TabContent {...props} {...tabs} />
      </div>
    </TabsProvider>
  );
}

export default function OperationTabs(props: TabProps) {
  const isBrowser = useIsBrowser();
  return (
    <TabsComponent key={String(isBrowser)} {...props}>
      {sanitizeTabsChildren(props.children)}
    </TabsComponent>
  );
}
