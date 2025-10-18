import {
  isEmpty,
  isNotEmpty,
  pick,
  omit,
  deepClone,
  isEqual,
  merge,
  getNestedProperty,
  hasProperty,
} from "../objectHelpers";

describe("Object Helpers", () => {
  describe("isEmpty", () => {
    it("should return true for null", () => {
      expect(isEmpty(null)).toBe(true);
    });

    it("should return true for undefined", () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it("should return true for empty object", () => {
      expect(isEmpty({})).toBe(true);
    });

    it("should return false for non-empty object", () => {
      expect(isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe("isNotEmpty", () => {
    it("should return false for null", () => {
      expect(isNotEmpty(null)).toBe(false);
    });

    it("should return false for empty object", () => {
      expect(isNotEmpty({})).toBe(false);
    });

    it("should return true for non-empty object", () => {
      expect(isNotEmpty({ a: 1 })).toBe(true);
    });
  });

  describe("pick", () => {
    it("should pick specified properties", () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ["a", "c"])).toEqual({ a: 1, c: 3 });
    });

    it("should handle empty keys array", () => {
      const obj = { a: 1, b: 2 };
      expect(pick(obj, [])).toEqual({});
    });

    it("should ignore non-existent keys", () => {
      const obj = { a: 1, b: 2 };
      // @ts-expect-error - testing runtime behavior
      expect(pick(obj, ["a", "x"])).toEqual({ a: 1 });
    });
  });

  describe("omit", () => {
    it("should omit specified properties", () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ["b"])).toEqual({ a: 1, c: 3 });
    });

    it("should handle empty keys array", () => {
      const obj = { a: 1, b: 2 };
      expect(omit(obj, [])).toEqual({ a: 1, b: 2 });
    });

    it("should handle non-existent keys", () => {
      const obj = { a: 1, b: 2 };
      // @ts-expect-error - testing runtime behavior
      expect(omit(obj, ["x"])).toEqual({ a: 1, b: 2 });
    });
  });

  describe("deepClone", () => {
    it("should deep clone an object", () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    it("should clone arrays", () => {
      const arr = [1, 2, [3, 4]];
      const cloned = deepClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
    });

    it("should handle primitive values", () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone("hello")).toBe("hello");
      expect(deepClone(true)).toBe(true);
    });

    it("should handle null", () => {
      expect(deepClone(null)).toBe(null);
    });
  });

  describe("isEqual", () => {
    it("should return true for identical objects", () => {
      const obj = { a: 1, b: 2 };
      expect(isEqual(obj, obj)).toBe(true);
    });

    it("should return true for equal objects", () => {
      expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    });

    it("should return false for different objects", () => {
      expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it("should handle nested objects", () => {
      expect(isEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
      expect(isEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
    });

    it("should handle null and undefined", () => {
      expect(isEqual(null, null)).toBe(true);
      expect(isEqual(undefined, undefined)).toBe(true);
      expect(isEqual(null, undefined)).toBe(false);
    });

    it("should handle primitives", () => {
      expect(isEqual(42, 42)).toBe(true);
      expect(isEqual("hello", "hello")).toBe(true);
      expect(isEqual(true, true)).toBe(true);
      expect(isEqual(42, 43)).toBe(false);
    });

    it("should handle arrays", () => {
      expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(isEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it("should return false for different key sets", () => {
      expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });
  });

  describe("merge", () => {
    it("should merge two objects", () => {
      expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
    });

    it("should override with second object", () => {
      expect(merge({ a: 1, b: 2 }, { b: 3 })).toEqual({ a: 1, b: 3 });
    });

    it("should handle empty objects", () => {
      expect(merge({}, { a: 1 })).toEqual({ a: 1 });
      expect(merge({ a: 1 }, {})).toEqual({ a: 1 });
    });
  });

  describe("getNestedProperty", () => {
    it("should get nested property", () => {
      const obj = { a: { b: { c: 42 } } };
      expect(getNestedProperty(obj, "a.b.c")).toBe(42);
    });

    it("should return undefined for missing property", () => {
      const obj = { a: { b: 1 } };
      expect(getNestedProperty(obj, "a.x.y")).toBeUndefined();
    });

    it("should return default value for missing property", () => {
      const obj = { a: { b: 1 } };
      expect(getNestedProperty(obj, "a.x.y", "default")).toBe("default");
    });

    it("should handle null/undefined objects", () => {
      expect(getNestedProperty(null, "a.b", "default")).toBe("default");
      expect(getNestedProperty(undefined, "a.b", "default")).toBe("default");
    });

    it("should handle top-level properties", () => {
      const obj = { a: 1 };
      expect(getNestedProperty(obj, "a")).toBe(1);
    });

    it("should handle undefined values in path", () => {
      const obj = { a: { b: undefined } };
      expect(getNestedProperty(obj, "a.b", "default")).toBe("default");
    });
  });

  describe("hasProperty", () => {
    it("should return true for existing property", () => {
      const obj = { a: 1, b: 2 };
      expect(hasProperty(obj, "a")).toBe(true);
    });

    it("should return false for non-existing property", () => {
      const obj = { a: 1 };
      expect(hasProperty(obj, "b")).toBe(false);
    });

    it("should not check prototype chain", () => {
      const obj = Object.create({ inherited: true });
      obj.own = true;
      expect(hasProperty(obj, "own")).toBe(true);
      expect(hasProperty(obj, "inherited")).toBe(false);
    });

    it("should work with symbol keys", () => {
      const sym = Symbol("test");
      const obj = { [sym]: 42 };
      expect(hasProperty(obj, sym)).toBe(true);
    });
  });
});
