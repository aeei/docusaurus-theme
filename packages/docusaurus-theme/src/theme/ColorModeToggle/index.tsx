import React, { type ReactNode } from "react";

import { translate } from "@docusaurus/Translate";
import type { ColorMode } from "@docusaurus/theme-common";
import useIsBrowser from "@docusaurus/useIsBrowser";
import { Monitor, Moon, Sun } from "lucide-react";

import type { Props } from "@theme/ColorModeToggle";
import { Button } from "@theme/components/ui/button";

function getNextColorMode(
  colorMode: ColorMode | null,
  respectPrefersColorScheme: boolean
): ColorMode | null {
  if (!respectPrefersColorScheme) {
    return colorMode === "dark" ? "light" : "dark";
  }

  if (colorMode === null) return "light";
  if (colorMode === "light") return "dark";
  return null;
}

function getColorModeLabel(colorMode: ColorMode | null): string {
  const mode = colorMode ?? "system";
  return translate({
    id: `theme.colorToggle.mode.${mode}`,
    message: mode,
    description: "Current color mode label",
  });
}

export default function ColorModeToggle({
  className: _className,
  buttonClassName: _buttonClassName,
  respectPrefersColorScheme,
  value,
  onChange,
}: Props): ReactNode {
  const isBrowser = useIsBrowser();
  const label = translate(
    {
      id: "theme.colorToggle.ariaLabel",
      message: "Switch color mode. Current mode: {mode}",
      description: "Color mode button label",
    },
    { mode: getColorModeLabel(value) }
  );

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() =>
        onChange(getNextColorMode(value, respectPrefersColorScheme))
      }
      disabled={!isBrowser}
      title={label}
      aria-label={label}
    >
      {value === "dark" ? (
        <Moon aria-hidden="true" />
      ) : value === null ? (
        <Monitor aria-hidden="true" />
      ) : (
        <Sun aria-hidden="true" />
      )}
    </Button>
  );
}
