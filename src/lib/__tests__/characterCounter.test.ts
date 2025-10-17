import { describe, expect, it } from "@jest/globals";

type CharacterCounterInfo = {
  count: number;
  isOverLimit: boolean;
  color: string;
};

const getCharacterCounterInfo = (text: string | null): CharacterCounterInfo => {
  const charCount = text?.length ?? 0;
  const charLimit = 1500;
  const isOverLimit = charCount > charLimit;

  return {
    count: charCount,
    isOverLimit,
    color: isOverLimit ? "red" : "green",
  };
};

describe("getCharacterCounterInfo", () => {
  it.each([
    { input: "", expected: { count: 0, isOverLimit: false, color: "green" } },
    {
      input: "A".repeat(1500),
      expected: { count: 1500, isOverLimit: false, color: "green" },
    },
    {
      input: "A".repeat(1501),
      expected: { count: 1501, isOverLimit: true, color: "red" },
    },
    {
      input:
        "This is a normal length prompt that should be well under the 1500 character limit and appear in green.",
      expected: { count: 102, isOverLimit: false, color: "green" },
    },
  ])("returns expected info for %#", ({ input, expected }) => {
    expect(getCharacterCounterInfo(input)).toEqual(expected);
  });

  it("handles null input", () => {
    expect(getCharacterCounterInfo(null)).toEqual({
      count: 0,
      isOverLimit: false,
      color: "green",
    });
  });
});
