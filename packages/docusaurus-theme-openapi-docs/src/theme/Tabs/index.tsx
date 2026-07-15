import React, { type ReactNode } from "react";

import { ThemeClassNames } from "@docusaurus/theme-common";
import useIsBrowser from "@docusaurus/useIsBrowser";
import clsx from "clsx";

import { OpenApiTabList } from "@theme/components/openapi-tab-list";
import {
  sanitizeTabsChildren,
  type TabsProps,
  TabsProvider,
  useTabs,
  useTabsContextValue,
} from "@theme/utils/tabsUtils";

import styles from "./styles.module.css";

type Props = TabsProps;

function TabList({ className }: { className?: string }) {
  const { selectedValue, selectValue, tabValues, block } = useTabs();

  return (
    <OpenApiTabList
      values={tabValues}
      value={selectedValue}
      onValueChange={selectValue}
      variant="line"
      className={className}
      block={block}
    />
  );
}

function TabsContainer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        ThemeClassNames.tabs.container,
        "tabs-container",
        styles.tabList
      )}
    >
      <TabList className={className} />
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function Tabs(props: Props): ReactNode {
  const isBrowser = useIsBrowser();
  const value = useTabsContextValue(props);

  return (
    <TabsProvider value={value} key={String(isBrowser)}>
      <TabsContainer className={props.className}>
        {sanitizeTabsChildren(props.children)}
      </TabsContainer>
    </TabsProvider>
  );
}
