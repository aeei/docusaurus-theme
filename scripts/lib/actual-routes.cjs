const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "../..");
const docsRoot = path.join(projectRoot, "examples/docs-starter/docs");
const buildRoot = path.join(projectRoot, "examples/docs-starter/build");

function walk(root, predicate) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) return walk(absolute, predicate);
    return predicate(absolute) ? [absolute] : [];
  });
}

function normalizeRoute(value) {
  const route = value.replace(/^\/+|\/+$/g, "");
  return route === "index" ? "" : route;
}

function buildRouteFromFile(file) {
  const relative = path.relative(buildRoot, file).replaceAll(path.sep, "/");
  return normalizeRoute(relative.replace(/(?:\/index)?\.html$/, ""));
}

function sourceRouteFromFile(file) {
  const relative = path.relative(docsRoot, file).replaceAll(path.sep, "/");
  const source = fs.readFileSync(file, "utf8");
  const frontMatter = source.match(/^---\n([\s\S]*?)\n---/m)?.[1] ?? "";
  const slug = frontMatter.match(/^slug:\s*(.+)$/m)?.[1]?.trim();
  if (slug) return normalizeRoute(slug);
  return normalizeRoute(relative.replace(/\.(?:md|mdx)$/, ""));
}

function discoverActualRoutes() {
  if (!fs.existsSync(buildRoot)) {
    throw new Error("Missing examples/docs-starter/build; run the starter production build first");
  }

  const buildRoutes = walk(
    buildRoot,
    (file) => file.endsWith(".html") && path.basename(file) !== "404.html"
  )
    .map(buildRouteFromFile)
    .sort();
  const sourceRows = walk(docsRoot, (file) => /\.(?:md|mdx)$/.test(file)).map(
    (file) => ({
      file: path.relative(projectRoot, file).replaceAll(path.sep, "/"),
      route: sourceRouteFromFile(file),
    })
  );

  const duplicateBuildRoutes = buildRoutes.filter(
    (route, index) => buildRoutes.indexOf(route) !== index
  );
  if (duplicateBuildRoutes.length) {
    throw new Error(`Duplicate built routes: ${[...new Set(duplicateBuildRoutes)].join(", ")}`);
  }

  const built = new Set(buildRoutes);
  const missingSources = sourceRows.filter(({ route }) => !built.has(route));
  if (missingSources.length) {
    throw new Error(`Source docs missing built routes: ${JSON.stringify(missingSources)}`);
  }

  const supplementalRoutes = buildRoutes.filter(
    (route) => route === "base-nova-parity"
  );
  return {
    routes: buildRoutes,
    primaryRoutes: buildRoutes.filter((route) => !supplementalRoutes.includes(route)),
    sourceRows,
    supplementalRoutes,
  };
}

module.exports = { discoverActualRoutes, normalizeRoute, projectRoot };
