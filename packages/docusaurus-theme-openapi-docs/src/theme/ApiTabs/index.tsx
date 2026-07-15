import React, { cloneElement, type ReactElement } from "react";

import useIsBrowser from "@docusaurus/useIsBrowser";
import Heading from "@theme/Heading";

import { OpenApiTabList } from "@theme/components/openapi-tab-list";
import {
  sanitizeTabsChildren,
  type TabItemProps,
  type TabProps,
  TabsProvider,
  useTabsContextValue,
} from "@theme/utils/tabsUtils";

export interface TabListProps extends TabProps {
  label: string;
  id: string;
}

function ResponseTabList({
  label,
  id,
  selectedValue,
  selectValue,
  tabValues,
  className,
  block,
}: TabListProps & ReturnType<typeof useTabsContextValue>) {
  return (
    <div className="openapi-tabs__response-header-section">
      <Heading
        as="h2"
        id={id}
        className="openapi-tabs__heading openapi-tabs__response-header"
      >
        {label}
      </Heading>
      <OpenApiTabList
        values={tabValues}
        value={selectedValue}
        onValueChange={selectValue}
        variant="default"
        className={className}
        block={block}
        triggerClassName={(value) =>
          Number(value) >= 400
            ? "text-destructive"
            : Number(value) >= 200 && Number(value) < 300
              ? "text-success"
              : "text-info"
        }
      />
    </div>
  );
}

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

function TabsComponent(props: TabListProps): React.JSX.Element {
  const tabs = useTabsContextValue(props);
  return (
    <TabsProvider value={tabs}>
      <div className="openapi-tabs__container">
        <ResponseTabList {...props} {...tabs} />
        <TabContent {...props} {...tabs} />
      </div>
    </TabsProvider>
  );
}

export default function ApiTabs(props: TabListProps): React.JSX.Element {
  const isBrowser = useIsBrowser();
  return (
    <TabsComponent key={String(isBrowser)} {...props}>
      {sanitizeTabsChildren(props.children)}
    </TabsComponent>
  );
}
