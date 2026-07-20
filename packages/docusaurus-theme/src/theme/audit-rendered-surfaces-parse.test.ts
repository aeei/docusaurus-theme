const {
  parseArgs,
} = require("../../../../scripts/audit-rendered-surfaces.cjs");

describe("audit-rendered-surfaces parseArgs", () => {
  it("accepts singular aliases", () => {
    expect(
      parseArgs([
        "--route",
        "guides/markdown-gfm",
        "--width",
        "390,768",
        "--theme",
        "dark,light",
      ])
    ).toEqual({
      route: "guides/markdown-gfm",
      widths: [390, 768],
      themes: ["dark", "light"],
    });
  });

  it("accepts plural aliases", () => {
    expect(
      parseArgs([
        "--route",
        "guides/markdown-gfm",
        "--widths",
        "700,1440",
        "--themes",
        "light",
      ])
    ).toEqual({
      route: "guides/markdown-gfm",
      widths: [700, 1440],
      themes: ["light"],
    });
  });
});
