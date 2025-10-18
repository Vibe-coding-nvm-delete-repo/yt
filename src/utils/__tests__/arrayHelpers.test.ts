import {
  isEmpty,
  isNotEmpty,
  first,
  last,
  unique,
  uniqueBy,
  chunk,
  partition,
  at,
} from "../arrayHelpers";

describe("Array Helpers", () => {
  describe("isEmpty", () => {
    it("should return true for null", () => {
      expect(isEmpty(null)).toBe(true);
    });

    it("should return true for undefined", () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it("should return true for empty array", () => {
      expect(isEmpty([])).toBe(true);
    });

    it("should return false for non-empty array", () => {
      expect(isEmpty([1, 2, 3])).toBe(false);
    });
  });

  describe("isNotEmpty", () => {
    it("should return false for null", () => {
      expect(isNotEmpty(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isNotEmpty(undefined)).toBe(false);
    });

    it("should return false for empty array", () => {
      expect(isNotEmpty([])).toBe(false);
    });

    it("should return true for non-empty array", () => {
      expect(isNotEmpty([1, 2, 3])).toBe(true);
    });
  });

  describe("first", () => {
    it("should return undefined for null", () => {
      expect(first(null)).toBeUndefined();
    });

    it("should return undefined for undefined", () => {
      expect(first(undefined)).toBeUndefined();
    });

    it("should return undefined for empty array", () => {
      expect(first([])).toBeUndefined();
    });

    it("should return first element", () => {
      expect(first([1, 2, 3])).toBe(1);
    });

    it("should handle single element array", () => {
      expect(first([42])).toBe(42);
    });
  });

  describe("last", () => {
    it("should return undefined for null", () => {
      expect(last(null)).toBeUndefined();
    });

    it("should return undefined for undefined", () => {
      expect(last(undefined)).toBeUndefined();
    });

    it("should return undefined for empty array", () => {
      expect(last([])).toBeUndefined();
    });

    it("should return last element", () => {
      expect(last([1, 2, 3])).toBe(3);
    });

    it("should handle single element array", () => {
      expect(last([42])).toBe(42);
    });
  });

  describe("unique", () => {
    it("should remove duplicates from primitive array", () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });

    it("should handle string arrays", () => {
      expect(unique(["a", "b", "a", "c", "b"])).toEqual(["a", "b", "c"]);
    });

    it("should handle empty array", () => {
      expect(unique([])).toEqual([]);
    });

    it("should handle array with no duplicates", () => {
      expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe("uniqueBy", () => {
    it("should remove duplicates by key", () => {
      const items = [
        { id: 1, name: "A" },
        { id: 2, name: "B" },
        { id: 1, name: "C" },
      ];
      expect(uniqueBy(items, (item) => item.id)).toEqual([
        { id: 1, name: "A" },
        { id: 2, name: "B" },
      ]);
    });

    it("should handle empty array", () => {
      expect(uniqueBy([], (item: any) => item.id)).toEqual([]);
    });

    it("should handle complex key selectors", () => {
      const items = [
        { a: 1, b: 2 },
        { a: 1, b: 3 },
        { a: 2, b: 2 },
      ];
      expect(uniqueBy(items, (item) => `${item.a}-${item.b}`)).toEqual(items);
    });
  });

  describe("chunk", () => {
    it("should chunk array into smaller arrays", () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it("should handle exact divisions", () => {
      expect(chunk([1, 2, 3, 4], 2)).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });

    it("should handle chunk size larger than array", () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
    });

    it("should handle empty array", () => {
      expect(chunk([], 2)).toEqual([]);
    });

    it("should throw error for invalid chunk size", () => {
      expect(() => chunk([1, 2, 3], 0)).toThrow();
      expect(() => chunk([1, 2, 3], -1)).toThrow();
    });
  });

  describe("partition", () => {
    it("should partition array by predicate", () => {
      const [evens, odds] = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0);
      expect(evens).toEqual([2, 4]);
      expect(odds).toEqual([1, 3, 5]);
    });

    it("should handle all truthy", () => {
      const [truthy, falsy] = partition([2, 4, 6], (n) => n % 2 === 0);
      expect(truthy).toEqual([2, 4, 6]);
      expect(falsy).toEqual([]);
    });

    it("should handle all falsy", () => {
      const [truthy, falsy] = partition([1, 3, 5], (n) => n % 2 === 0);
      expect(truthy).toEqual([]);
      expect(falsy).toEqual([1, 3, 5]);
    });

    it("should handle empty array", () => {
      const [truthy, falsy] = partition([], (n: number) => n % 2 === 0);
      expect(truthy).toEqual([]);
      expect(falsy).toEqual([]);
    });
  });

  describe("at", () => {
    it("should return element at index", () => {
      expect(at([1, 2, 3], 0)).toBe(1);
      expect(at([1, 2, 3], 1)).toBe(2);
      expect(at([1, 2, 3], 2)).toBe(3);
    });

    it("should return undefined for out of bounds", () => {
      expect(at([1, 2, 3], 5)).toBeUndefined();
      expect(at([1, 2, 3], -1)).toBeUndefined();
    });

    it("should return undefined for null array", () => {
      expect(at(null, 0)).toBeUndefined();
    });

    it("should return undefined for undefined array", () => {
      expect(at(undefined, 0)).toBeUndefined();
    });

    it("should return undefined for empty array", () => {
      expect(at([], 0)).toBeUndefined();
    });
  });
});
