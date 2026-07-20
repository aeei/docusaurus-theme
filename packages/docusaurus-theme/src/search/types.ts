export type SearchProvider = false | "local" | "algolia";

export type DocusaurusThemeOptions = {
  search?: SearchProvider;
  copyPage?: boolean;
};

export type SearchRecord = {
  id: string;
  url: string;
  title: string;
  section?: string;
  text: string;
};

export type SearchIndex = {
  version: 1;
  records: SearchRecord[];
};
