import * as React from "react";
import { useHistory } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { ArrowRightIcon, CornerDownLeftIcon, SearchIcon } from "lucide-react";

import type { SearchIndex } from "../../../search/types";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Kbd, KbdGroup } from "../ui/kbd";
import { Spinner } from "../ui/spinner";
import { searchRecords } from "./search";

export default function LocalSearch() {
  const history = useHistory();
  const indexUrl = useBaseUrl("/search-index.json");
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [index, setIndex] = React.useState<SearchIndex>();
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    if (!open || index || error) return;
    let active = true;
    fetch(indexUrl)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<SearchIndex>;
      })
      .then((value) => active && setIndex(value))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [error, index, indexUrl, open]);

  const hasQuery = query.trim().length > 0;
  const results = React.useMemo(() => {
    if (hasQuery) return searchRecords(index?.records ?? [], query);
    return (index?.records ?? [])
      .filter((record) => !record.section)
      .slice(0, 8)
      .map((record) => ({
        ...record,
        score: 0,
        snippet: record.text.slice(0, 150),
      }));
  }, [hasQuery, index, query]);
  const loading = open && !index && !error;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="relative size-8 justify-center rounded-lg border-none bg-muted p-0 text-foreground shadow-none transition-colors hover:bg-muted/50 lg:w-40 lg:justify-start lg:pl-3 xl:w-64 dark:bg-card"
            aria-label="Search documentation"
          />
        }
      >
        <SearchIcon className="size-4 lg:hidden" />
        <span className="hidden text-muted-foreground xl:inline-flex">
          Search documentation...
        </span>
        <span className="hidden text-muted-foreground lg:inline-flex xl:hidden">
          Search...
        </span>
        <KbdGroup className="ml-auto mr-2 hidden lg:inline-flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </DialogTrigger>
      <DialogContent
        className="theme-search-dialog top-[15%]! max-w-[min(32rem,calc(100%-2rem))]! translate-y-0! rounded-xl border-none bg-clip-padding p-2 pb-11 shadow-2xl ring-4 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search documentation...</DialogTitle>
          <DialogDescription>Search the documentation.</DialogDescription>
        </DialogHeader>
        <Command
          shouldFilter={false}
          className="rounded-none bg-transparent **:data-[slot=command-input]:h-9! **:data-[slot=command-input]:py-0 **:data-[slot=command-input-wrapper]:mb-0 **:data-[slot=command-input-wrapper]:h-9!"
        >
          <div className="relative">
            <CommandInput
              autoFocus
              placeholder="Search documentation..."
              value={query}
              onValueChange={setQuery}
            />
            {loading && (
              <div className="pointer-events-none absolute top-1/2 right-3 z-10 flex -translate-y-1/2 items-center justify-center">
                <Spinner className="size-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <CommandList className="no-scrollbar max-h-[min(20rem,calc(100svh-11rem))]! scroll-pt-2 scroll-pb-1.5">
            <CommandEmpty className="py-12 text-center text-sm text-muted-foreground">
              {error
                ? "Search index unavailable."
                : loading
                  ? "Loading..."
                  : query
                    ? "No results found."
                    : "Type to search documentation."}
            </CommandEmpty>
            {results.length > 0 && (
              <CommandGroup
                heading={hasQuery ? "Documentation" : "Pages"}
                className="p-0! **:[[cmdk-group-heading]]:p-3! **:[[cmdk-group-heading]]:pb-1!"
              >
                {results.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.id}
                    onSelect={() => {
                      setOpen(false);
                      setQuery("");
                      history.push(result.url);
                    }}
                  >
                    {!hasQuery && <ArrowRightIcon />}
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {result.section ?? result.title}
                      </div>
                      {hasQuery && (
                        <div className="truncate text-xs text-muted-foreground">
                          {result.section ? `${result.title} · ` : ""}
                          {result.snippet}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        <div className="absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 rounded-b-xl border-t border-t-neutral-100 bg-neutral-50 px-4 text-xs font-medium text-muted-foreground dark:border-t-neutral-700 dark:bg-neutral-800">
          <span className="flex size-5 items-center justify-center rounded-sm border bg-background">
            <CornerDownLeftIcon className="size-3" />
          </span>
          Go to page
        </div>
      </DialogContent>
    </Dialog>
  );
}
