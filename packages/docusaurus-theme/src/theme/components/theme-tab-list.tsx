import * as React from "react";

import type { TabValue } from "@theme/utils/tabsUtils";

import { Tabs, TabsList, TabsTrigger } from "@theme/components/ui/tabs";
import { cn } from "@theme/utils/cn";
import { useScrollPositionBlocker } from "@theme/utils/scrollUtils";

export function ThemeTabList({
  values,
  value,
  onValueChange,
  className,
  triggerClassName,
  variant = "line",
  block = false,
}: {
  values: readonly TabValue[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  triggerClassName?: string | ((value: string) => string | undefined);
  variant?: "default" | "line";
  block?: boolean;
}) {
  const triggerRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const { blockElementScrollPositionUntilNextRender } =
    useScrollPositionBlocker();

  const handleValueChange = (nextValue: string) => {
    const trigger = triggerRefs.current.get(nextValue);
    if (trigger) blockElementScrollPositionUntilNextRender(trigger);
    onValueChange(nextValue);
  };

  return (
    <Tabs value={value} onValueChange={handleValueChange} className="min-w-0">
      <div
        data-slot="tabs-scroller"
        className={cn(
          "max-w-full overflow-x-auto [scrollbar-width:none]",
          variant === "line" && "border-b border-border",
          block && "w-full"
        )}
      >
        <TabsList
          variant={variant}
          className={cn(
            "max-w-none min-w-max justify-start",
            variant === "line" && "rounded-none",
            block && "w-full min-w-full",
            className
          )}
        >
          {values.map(({ value: tabValue, label, attributes }) => {
            const { className: attributeClassName, ...tabAttributes } =
              attributes ?? {};
            return (
              <TabsTrigger
                key={tabValue}
                {...(tabAttributes as React.ComponentPropsWithoutRef<"button">)}
                ref={(node) => {
                  if (node) triggerRefs.current.set(tabValue, node);
                  else triggerRefs.current.delete(tabValue);
                }}
                value={tabValue}
                className={cn(
                  block && "flex-1",
                  typeof triggerClassName === "function"
                    ? triggerClassName(tabValue)
                    : triggerClassName,
                  attributeClassName as string
                )}
              >
                {label ?? tabValue}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
    </Tabs>
  );
}
