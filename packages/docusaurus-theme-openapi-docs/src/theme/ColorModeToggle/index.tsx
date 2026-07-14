import React, { type ReactNode } from "react";

import { translate } from "@docusaurus/Translate";
import type { ColorMode } from "@docusaurus/theme-common";
import useIsBrowser from "@docusaurus/useIsBrowser";
import clsx from "clsx";
import { Monitor, Moon, Sun } from "lucide-react";

import type { Props } from "@theme/ColorModeToggle";

import styles from "./styles.module.css";

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
  className,
  buttonClassName,
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
    <div className={clsx(styles.root, className)}>
      <button
        type="button"
        className={clsx(styles.button, buttonClassName)}
        onClick={() =>
          onChange(getNextColorMode(value, respectPrefersColorScheme))
        }
        disabled={!isBrowser}
        title={label}
        aria-label={label}
      >
        {value === "dark" ? (
          <Moon aria-hidden="true" size={16} />
        ) : value === null ? (
          <Monitor aria-hidden="true" size={16} />
        ) : (
          <Sun aria-hidden="true" size={16} />
        )}
      </button>
    </div>
  );
}
