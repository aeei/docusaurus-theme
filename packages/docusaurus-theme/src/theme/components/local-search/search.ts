import type { SearchRecord } from "../../../search/types";

export type SearchResult = SearchRecord & { score: number; snippet: string };

const normalize = (value: string) =>
  value.normalize("NFKC").toLocaleLowerCase();
const tokens = (value: string) =>
  normalize(value).match(/[\p{L}\p{N}]+/gu) ?? [];

function snippet(record: SearchRecord, queryTokens: string[]) {
  const text = record.text.trim();
  if (!text) return record.section ?? record.title;
  const normalized = normalize(text);
  const position = Math.max(0, normalized.indexOf(queryTokens[0] ?? ""));
  const start = Math.max(0, position - 45);
  const value = text.slice(start, start + 150).trim();
  return `${start ? "…" : ""}${value}${start + 150 < text.length ? "…" : ""}`;
}

export function searchRecords(
  records: SearchRecord[],
  query: string,
  limit = 8
): SearchResult[] {
  const queryTokens = tokens(query);
  if (!queryTokens.length) return [];

  return records
    .map((record) => {
      const title = normalize(record.title);
      const section = normalize(record.section ?? "");
      const text = normalize(record.text);
      const haystack = `${title} ${section} ${text}`;
      if (!queryTokens.every((token) => haystack.includes(token))) return null;

      let score = 0;
      for (const token of queryTokens) {
        if (title === token) score += 100;
        else if (title.startsWith(token)) score += 70;
        else if (title.includes(token)) score += 50;
        if (section === token) score += 80;
        else if (section.startsWith(token)) score += 55;
        else if (section.includes(token)) score += 35;
        if (text.includes(token)) score += 10;
      }
      return { ...record, score, snippet: snippet(record, queryTokens) };
    })
    .filter((record): record is SearchResult => record !== null)
    .sort(
      (left, right) =>
        right.score - left.score || left.id.localeCompare(right.id, "en")
    )
    .slice(0, limit);
}
