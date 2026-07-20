import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { buildSearchIndex, writeSearchIndex } from "./build-index";
import { resolveSearchProvider } from "../index";

const page = (title: string) =>
  `<!doctype html><html><head><title>${title}</title></head><body><main><article><div class="theme-doc-markdown"><h1>${title}</h1><p>Overview copy.</p><h2 id="setup">Setup</h2><p>Install café support.</p><pre>secret code</pre><h3 id="next">Next</h3><ul><li>Continue</li></ul></div></article></main></body></html>`;

describe("search provider", () => {
  it.each([
    [undefined, false],
    [false, false],
    ["local", "local"],
    ["algolia", "algolia"],
  ])("resolves %p", (search, expected) =>
    expect(resolveSearchProvider({ search } as never)).toBe(expected)
  );

  it("rejects unsupported providers", () => {
    expect(() => resolveSearchProvider({ search: "remote" } as never)).toThrow(
      '"search" must be false, "local", or "algolia"'
    );
  });
});

describe("local search index", () => {
  let outDir: string;
  beforeEach(async () => {
    outDir = await fs.mkdtemp(path.join(os.tmpdir(), "theme-search-"));
    await fs.mkdir(path.join(outDir, "guides"), { recursive: true });
    await fs.writeFile(path.join(outDir, "index.html"), page("Home"));
    await fs.writeFile(
      path.join(outDir, "guides", "search.html"),
      page("Search")
    );
    await fs.writeFile(
      path.join(outDir, "base-nova-parity.html"),
      page("Fixture")
    );
  });
  afterEach(() => fs.rm(outDir, { recursive: true, force: true }));

  it("extracts deterministic page and anchored section records", async () => {
    const args = {
      outDir,
      baseUrl: "/docs/",
      routesPaths: ["/docs/guides/search", "/docs/base-nova-parity", "/docs/"],
    };
    const first = await buildSearchIndex(args);
    const second = await buildSearchIndex({
      ...args,
      routesPaths: [...args.routesPaths].reverse(),
    });

    expect(second).toEqual(first);
    expect(first.records.map(({ url }) => url)).toEqual([
      "/docs/",
      "/docs/#next",
      "/docs/#setup",
      "/docs/guides/search",
      "/docs/guides/search#next",
      "/docs/guides/search#setup",
    ]);
    expect(first.records.find(({ url }) => url.endsWith("#setup"))?.text).toBe(
      "Install café support."
    );
    expect(JSON.stringify(first)).not.toContain("secret code");
  });

  it("honors route noIndex metadata and overwrites stale output", async () => {
    const args = {
      outDir,
      baseUrl: "/docs/",
      routesPaths: ["/docs/", "/docs/guides/search"],
      noIndexRoutes: new Set(["/docs/guides/search"]),
    };
    await fs.writeFile(path.join(outDir, "search-index.json"), "stale");
    await writeSearchIndex(args);
    const written = JSON.parse(
      await fs.readFile(path.join(outDir, "search-index.json"), "utf8")
    );
    expect(written.records).toHaveLength(3);
    expect(JSON.stringify(written)).not.toContain("guides/search");
  });
});
