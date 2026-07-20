import React, { type ReactNode } from "react";

import useIsBrowser from "@docusaurus/useIsBrowser";

import {
  Tabs as TabsPrimitive,
  TabsList,
  TabsTrigger,
} from "@theme/components/ui/tabs";
import {
  sanitizeTabsChildren,
  type TabsProps,
  TabsProvider,
  useTabs,
  useTabsContextValue,
} from "@theme/utils/tabsUtils";

type Props = TabsProps;

function TabsContainer({ children }: { children: ReactNode }) {
  const { selectedValue, selectValue, tabValues } = useTabs();

  return (
    <TabsPrimitive value={selectedValue} onValueChange={selectValue}>
      <TabsList>
        {tabValues.map(({ value, label, attributes }) => {
          const {
            className: _className,
            style: _style,
            ...tabAttributes
          } = attributes ?? {};
          return (
            <TabsTrigger
              key={value}
              {...(tabAttributes as React.ComponentPropsWithoutRef<"button">)}
              value={value}
            >
              {label ?? value}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {children}
    </TabsPrimitive>
  );
}

export default function Tabs(props: Props): ReactNode {
  const isBrowser = useIsBrowser();
  const value = useTabsContextValue(props);

  return (
    <TabsProvider value={value} key={String(isBrowser)}>
      <TabsContainer>{sanitizeTabsChildren(props.children)}</TabsContainer>
    </TabsProvider>
  );
}
