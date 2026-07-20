import fs from "node:fs";
import path from "node:path";

const outputPath = path.resolve("lib/theme/shadcn.scss");
const css = fs.readFileSync(outputPath, "utf8");
const colorMixFallback =
  /([^{}]+)\{([^{}]*)\}@supports \(color:color-mix\(in lab, red, red\)\)\{([^{}]+)\{([^{}]*)\}\}/g;
const colorNormalized = css.replace(
  colorMixFallback,
  (_match, fallbackSelector, fallback, modernSelector, modern) =>
    `${fallbackSelector}{${fallback}}${modernSelector}{${modern}}`
);

if (colorNormalized === css) {
  throw new Error(
    "Expected Tailwind color-mix fallback blocks were not found."
  );
}

const scrollFadeFallback =
  /var\(--scroll-fade-reveal,calc\(var\(--spacing\)\s*\*\s*24\)\)/g;
const scrollFadeMatches =
  colorNormalized.match(scrollFadeFallback)?.length ?? 0;
if (scrollFadeMatches === 0) {
  throw new Error(
    "Expected Tailwind scroll-fade fallback values were not found."
  );
}

const normalized = colorNormalized.replace(
  scrollFadeFallback,
  "var(--scroll-fade-reveal,6rem)"
);

fs.writeFileSync(outputPath, normalized);
