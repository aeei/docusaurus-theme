module.exports = function layerInfima(source) {
  const withoutGlobalTableSkin = source.replace(
    /(^|\n)table[^{}]*\{[^{}]*\}[ \t]*/g,
    "$1"
  );
  const withoutOfficialComponentLeaks = withoutGlobalTableSkin.replace(
    /(^|\n)kbd\s*\{/g,
    "$1kbd:not([data-slot]) {"
  );

  return `@layer infima {\n${withoutOfficialComponentLeaks}\n}`;
};
