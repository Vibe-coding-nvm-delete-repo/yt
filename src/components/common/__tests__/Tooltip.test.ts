import { describe, expect, it } from "@jest/globals";
import { sanitizeTooltipId } from "../Tooltip";

describe("sanitizeTooltipId", () => {
  it.each([
    {
      input: "settings-openrouter-api-key",
      expected: "settings-openrouter-api-key-info",
    },
    { input: "upload-image", expected: "upload-image-info" },
    {
      input: "Complex Title With Spaces & Special_chars!",
      expected: "complex-title-with-spaces---special_chars--info",
    },
    { input: "", expected: "tooltip-info" },
  ])("normalizes '%s'", ({ input, expected }) => {
    expect(sanitizeTooltipId(input)).toBe(expected);
  });
});
