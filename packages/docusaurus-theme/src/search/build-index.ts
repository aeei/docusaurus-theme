import fs from "node:fs/promises";
import path from "node:path";

import { HTMLElement, parse } from "node-html-parser";

import type { SearchIndex, SearchRecord } from "./types";

const EXCLUDED_SELECTORS = [
  "script",
  "style",
  "nav",
  "footer",
  "pre",
  ".theme-code-block",
  ".sr-only",
  "[hidden]",
  '[aria-hidden="true"]',
  "[data-search-exclude]",
];
const HEADING_SELECTOR = "h1,h2,h3,h4,h5,h6";
const SECTION_HEADING_SELECTOR = "h2[id],h3[id],h4[id],h5[id],h6[id]";
const HEADING_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);

const clean = (value: string) =>
  value.normalize("NFKC").replace(/\s+/g, " ").trim();

function routeFile(outDir: string, baseUrl: string, route: string) {
  const base =
    baseUrl === "/" ? "" : baseUrl.replace(/^\//, "").replace(/\/$/, "");
  let relative = route.replace(/^\//, "").replace(/\/$/, "");
  if (base && (relative === base || relative.startsWith(`${base}/`))) {
    relative = relative.slice(base.length).replace(/^\//, "");
  }
  return relative
    ? path.join(outDir, `${relative}.html`)
    : path.join(outDir, "index.html");
}

function removeExcludedContent(article: HTMLElement) {
  for (const selector of EXCLUDED_SELECTORS) {
    for (const element of article.querySelectorAll(selector)) element.remove();
  }
}

function sectionText(heading: HTMLElement) {
  const parent = heading.parentNode;
  if (!parent) return "";
  const start = parent.childNodes.indexOf(heading);
  const parts: string[] = [];
  for (const node of parent.childNodes.slice(start + 1)) {
    if (node instanceof HTMLElement && HEADING_TAGS.has(node.tagName)) break;
    parts.push(node.textContent);
  }
  return clean(parts.join(" "));
}

export async function buildSearchIndex({
  outDir,
  baseUrl,
  routesPaths,
  noIndexRoutes = new Set<string>(),
}: {
  outDir: string;
  baseUrl: string;
  routesPaths: string[];
  noIndexRoutes?: ReadonlySet<string>;
}): Promise<SearchIndex> {
  const records: SearchRecord[] = [];

  for (const route of [...routesPaths].sort()) {
    if (
      route.endsWith("/404") ||
      route.includes("/base-nova-parity") ||
      noIndexRoutes.has(route)
    )
      continue;

    let html: string;
    try {
      html = await fs.readFile(routeFile(outDir, baseUrl, route), "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }

    const root = parse(html);
    const sourceArticle = root.querySelector(".theme-doc-markdown");
    if (!sourceArticle) continue;
    const article = sourceArticle.clone() as HTMLElement;
    removeExcludedContent(article);

    const title = clean(
      article.querySelector("h1")?.textContent ??
        root.querySelector("title")?.textContent ??
        ""
    );
    if (!title) continue;

    const body = article.clone() as HTMLElement;
    for (const heading of body.querySelectorAll(HEADING_SELECTOR))
      heading.remove();
    records.push({
      id: route,
      url: route,
      title,
      text: clean(body.textContent),
    });

    for (const heading of article.querySelectorAll(SECTION_HEADING_SELECTOR)) {
      const section = clean(heading.textContent);
      const id = heading.getAttribute("id");
      if (!id || !section) continue;
      const url = `${route}#${id}`;
      records.push({
        id: url,
        url,
        title,
        section,
        text: sectionText(heading),
      });
    }
  }

  records.sort((left, right) => left.id.localeCompare(right.id, "en"));
  return { version: 1, records };
}

export async function writeSearchIndex(
  args: Parameters<typeof buildSearchIndex>[0]
) {
  const index = await buildSearchIndex(args);
  await fs.writeFile(
    path.join(args.outDir, "search-index.json"),
    `${JSON.stringify(index)}\n`,
    "utf8"
  );
  return index;
}
