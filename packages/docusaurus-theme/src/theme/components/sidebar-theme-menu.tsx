import * as React from "react";

import { useColorMode, useThemeConfig } from "@docusaurus/theme-common";
import { Check, Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@theme/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@theme/components/ui/dropdown-menu";

const modes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function SidebarThemeMenu({
  compact = false,
  side = "top",
  align = "start",
}: {
  compact?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}): React.JSX.Element | null {
  const { disableSwitch, respectPrefersColorScheme } =
    useThemeConfig().colorMode;
  const { colorModeChoice, setColorMode } = useColorMode();

  if (disableSwitch) return null;

  const value = colorModeChoice ?? "system";
  const choices = respectPrefersColorScheme ? modes : modes.slice(0, 2);
  const current =
    choices.find((choice) => choice.value === value) ?? choices[0];
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size={compact ? "icon" : "default"}
            title={`Color theme: ${current.label}`}
            aria-label={`Color theme: ${current.label}`}
          />
        }
      >
        <Icon aria-hidden="true" />
        {!compact && <span>{current.label}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align}>
        {choices.map(({ value: choice, label, icon: ChoiceIcon }) => (
          <DropdownMenuItem
            key={choice}
            onClick={() =>
              setColorMode(
                choice === "light" ? "light" : choice === "dark" ? "dark" : null
              )
            }
          >
            <ChoiceIcon aria-hidden="true" />
            {label}
            {choice === value && (
              <DropdownMenuShortcut>
                <Check aria-hidden="true" />
              </DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
