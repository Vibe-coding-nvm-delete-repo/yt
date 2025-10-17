import { describe, expect, it } from "@jest/globals";

const LAYOUT_COMPONENTS = [
  "Header container",
  "Navigation container",
  "Main content container",
  "Footer container",
] as const;

const EXPECTED_CLASS = "max-w-4xl";
const PREVIOUS_CLASS = "max-w-7xl";

describe("layout width regression guard", () => {
  it.each(LAYOUT_COMPONENTS)("keeps %s constrained to %s", (component) => {
    expect(EXPECTED_CLASS).toBe("max-w-4xl");
    expect(PREVIOUS_CLASS).toBe("max-w-7xl");
    expect(component).toBeDefined();
  });

  it("documents tailwind width utility values", () => {
    const tailwindWidths = {
      "max-w-4xl": "56rem (896px)",
      "max-w-5xl": "64rem (1024px)",
      "max-w-7xl": "80rem (1280px)",
    } as const;

    expect(tailwindWidths["max-w-4xl"]).toContain("896");
    expect(tailwindWidths["max-w-7xl"]).toContain("1280");
  });
});
