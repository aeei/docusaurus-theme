import React, { useMemo } from "react";

import { translate } from "@docusaurus/Translate";
import { ListTree } from "lucide-react";

import { Button } from "@theme/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@theme/components/ui/dropdown-menu";

import { useSchemaExpansion } from "./context";

export {
  SchemaExpansionProvider,
  SchemaDepthProvider,
  useSchemaExpansion,
  useSchemaDepth,
  normalizeLevel,
  SCHEMA_EXPANSION_STORAGE_KEY,
} from "./context";

const ALL_VALUE = Number.POSITIVE_INFINITY;

export default function SchemaExpansionControl(): React.JSX.Element | null {
  const { config, level, setLevel } = useSchemaExpansion();
  const options = useMemo(
    () => [
      ...Array.from({ length: config.max + 1 }, (_, index) => index),
      ALL_VALUE,
    ],
    [config.max]
  );

  if (!config.enabled) return null;

  const buttonLabel = translate({
    id: "theme.openapi.schema.expansion.button",
    message: "Schema expansion depth",
    description: "Accessible label for the schema expansion menu.",
  });
  const allLabel = translate({
    id: "theme.openapi.schema.expansion.all",
    message: "All",
    description: "Label for the expand-all option.",
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={buttonLabel}
          title={buttonLabel}
          onClick={(event) => event.stopPropagation()}
        >
          <ListTree aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(event) => event.stopPropagation()}
      >
        <DropdownMenuRadioGroup
          value={level === ALL_VALUE ? "all" : String(level)}
          onValueChange={(value) =>
            setLevel(value === "all" ? ALL_VALUE : Number(value))
          }
        >
          {options.map((value) => {
            const isAll = value === ALL_VALUE;
            return (
              <DropdownMenuRadioItem
                key={isAll ? "all" : value}
                value={isAll ? "all" : String(value)}
              >
                {isAll ? allLabel : value}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
