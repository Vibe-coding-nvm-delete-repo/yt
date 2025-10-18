import { parseOptionList, joinOptionList } from "../parsing";

describe("parseOptionList", () => {
  it("should parse newline-separated options", () => {
    const text = "option1\noption2\noption3";
    expect(parseOptionList(text)).toEqual(["option1", "option2", "option3"]);
  });

  it("should parse comma-separated options", () => {
    const text = "option1, option2, option3";
    expect(parseOptionList(text)).toEqual(["option1", "option2", "option3"]);
  });

  it("should handle mixed separators", () => {
    const text = "option1\noption2, option3";
    expect(parseOptionList(text)).toEqual(["option1", "option2", "option3"]);
  });

  it("should trim whitespace", () => {
    const text = "  option1  \n  option2  ";
    expect(parseOptionList(text)).toEqual(["option1", "option2"]);
  });

  it("should filter empty items", () => {
    const text = "option1\n\noption2\n  \noption3";
    expect(parseOptionList(text)).toEqual(["option1", "option2", "option3"]);
  });

  it("should handle empty string", () => {
    expect(parseOptionList("")).toEqual([]);
  });

  it("should handle Windows line endings", () => {
    const text = "option1\r\noption2\r\noption3";
    expect(parseOptionList(text)).toEqual(["option1", "option2", "option3"]);
  });

  it("should handle only whitespace", () => {
    const text = "   \n   \n   ";
    expect(parseOptionList(text)).toEqual([]);
  });
});

describe("joinOptionList", () => {
  it("should join options with newlines", () => {
    const options = ["option1", "option2", "option3"];
    expect(joinOptionList(options)).toBe("option1\noption2\noption3");
  });

  it("should handle empty array", () => {
    expect(joinOptionList([])).toBe("");
  });

  it("should handle single option", () => {
    expect(joinOptionList(["option1"])).toBe("option1");
  });

  it("should preserve option content", () => {
    const options = ["option with spaces", "option-with-dashes"];
    expect(joinOptionList(options)).toBe(
      "option with spaces\noption-with-dashes",
    );
  });
});
