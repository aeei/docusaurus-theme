import React, { cloneElement, type ReactElement } from "react";

import useIsBrowser from "@docusaurus/useIsBrowser";
import { setAccept } from "@theme/ApiExplorer/Accept/slice";
import { setContentType } from "@theme/ApiExplorer/ContentType/slice";
import { useTypedDispatch, useTypedSelector } from "@theme/ApiItem/hooks";
import type { RootState } from "@theme/ApiItem/store";

import { OpenApiTabList } from "@theme/components/openapi-tab-list";
import {
  sanitizeTabsChildren,
  type TabItemProps,
  type TabProps,
  TabsProvider,
  useTabsContextValue,
} from "@theme/utils/tabsUtils";

export interface Props {
  schemaType: string;
}

function MimeTabList({
  schemaType,
  selectedValue,
  selectValue,
  tabValues,
  className,
  block,
}: Props & TabProps & ReturnType<typeof useTabsContextValue>) {
  const dispatch = useTypedDispatch();
  const isRequest = schemaType?.toLowerCase() === "request";
  const contentType = useTypedSelector(
    (state: RootState) => state.contentType.value
  );
  const accept = useTypedSelector((state: RootState) => state.accept.value);
  const value =
    tabValues.length > 1 ? (isRequest ? contentType : accept) : selectedValue;

  if (tabValues.length < 2) return null;

  const onValueChange = (nextValue: string) => {
    dispatch(isRequest ? setContentType(nextValue) : setAccept(nextValue));
    selectValue(nextValue);
  };

  return (
    <OpenApiTabList
      values={tabValues}
      value={value}
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
}: Props & TabProps & ReturnType<typeof useTabsContextValue>) {
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

function TabsComponent(props: Props & TabProps): React.JSX.Element {
  const tabs = useTabsContextValue(props);
  return (
    <TabsProvider value={tabs}>
      <div className="tabs-container">
        <MimeTabList {...props} {...tabs} />
        <TabContent {...props} {...tabs} />
      </div>
    </TabsProvider>
  );
}

export default function MimeTabs(props: Props & TabProps) {
  const isBrowser = useIsBrowser();
  return (
    <TabsComponent key={String(isBrowser)} {...props}>
      {sanitizeTabsChildren(props.children)}
    </TabsComponent>
  );
}
