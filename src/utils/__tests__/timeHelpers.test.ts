import {
  now,
  nowInSeconds,
  isExpired,
  isFresh,
  getAge,
  addMilliseconds,
  addSeconds,
  addMinutes,
  msToSeconds,
  secondsToMs,
  sleep,
} from "../timeHelpers";

describe("Time Helpers", () => {
  describe("now", () => {
    it("should return current timestamp", () => {
      const before = Date.now();
      const result = now();
      const after = Date.now();
      expect(result).toBeGreaterThanOrEqual(before);
      expect(result).toBeLessThanOrEqual(after);
    });
  });

  describe("nowInSeconds", () => {
    it("should return current timestamp in seconds", () => {
      const result = nowInSeconds();
      const expected = Math.floor(Date.now() / 1000);
      expect(result).toBeCloseTo(expected, 0);
    });
  });

  describe("isExpired", () => {
    it("should return true for expired timestamp", () => {
      const oldTimestamp = Date.now() - 10000; // 10 seconds ago
      expect(isExpired(oldTimestamp, 5000)).toBe(true); // TTL 5 seconds
    });

    it("should return false for fresh timestamp", () => {
      const recentTimestamp = Date.now() - 1000; // 1 second ago
      expect(isExpired(recentTimestamp, 5000)).toBe(false); // TTL 5 seconds
    });

    it("should handle edge case at exactly TTL", () => {
      const timestamp = Date.now() - 5000; // Exactly 5 seconds ago
      const result = isExpired(timestamp, 5000);
      expect(typeof result).toBe("boolean");
    });
  });

  describe("isFresh", () => {
    it("should return true for fresh timestamp", () => {
      const recentTimestamp = Date.now() - 1000; // 1 second ago
      expect(isFresh(recentTimestamp, 5000)).toBe(true); // TTL 5 seconds
    });

    it("should return false for expired timestamp", () => {
      const oldTimestamp = Date.now() - 10000; // 10 seconds ago
      expect(isFresh(oldTimestamp, 5000)).toBe(false); // TTL 5 seconds
    });
  });

  describe("getAge", () => {
    it("should return time difference", () => {
      const timestamp = Date.now() - 5000; // 5 seconds ago
      const age = getAge(timestamp);
      expect(age).toBeGreaterThanOrEqual(5000);
      expect(age).toBeLessThan(6000);
    });

    it("should return 0 for current timestamp", () => {
      const timestamp = Date.now();
      const age = getAge(timestamp);
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(100);
    });
  });

  describe("addMilliseconds", () => {
    it("should add milliseconds to timestamp", () => {
      const timestamp = 1000;
      expect(addMilliseconds(timestamp, 500)).toBe(1500);
    });

    it("should handle negative values", () => {
      const timestamp = 1000;
      expect(addMilliseconds(timestamp, -500)).toBe(500);
    });

    it("should handle zero", () => {
      const timestamp = 1000;
      expect(addMilliseconds(timestamp, 0)).toBe(1000);
    });
  });

  describe("addSeconds", () => {
    it("should add seconds to timestamp", () => {
      const timestamp = 1000;
      expect(addSeconds(timestamp, 5)).toBe(6000);
    });

    it("should handle negative values", () => {
      const timestamp = 10000;
      expect(addSeconds(timestamp, -5)).toBe(5000);
    });

    it("should handle zero", () => {
      const timestamp = 1000;
      expect(addSeconds(timestamp, 0)).toBe(1000);
    });
  });

  describe("addMinutes", () => {
    it("should add minutes to timestamp", () => {
      const timestamp = 1000;
      expect(addMinutes(timestamp, 1)).toBe(61000);
    });

    it("should handle multiple minutes", () => {
      const timestamp = 1000;
      expect(addMinutes(timestamp, 5)).toBe(301000);
    });

    it("should handle zero", () => {
      const timestamp = 1000;
      expect(addMinutes(timestamp, 0)).toBe(1000);
    });
  });

  describe("msToSeconds", () => {
    it("should convert milliseconds to seconds", () => {
      expect(msToSeconds(1000)).toBe(1);
      expect(msToSeconds(5000)).toBe(5);
    });

    it("should floor the result", () => {
      expect(msToSeconds(1500)).toBe(1);
      expect(msToSeconds(1999)).toBe(1);
    });

    it("should handle zero", () => {
      expect(msToSeconds(0)).toBe(0);
    });
  });

  describe("secondsToMs", () => {
    it("should convert seconds to milliseconds", () => {
      expect(secondsToMs(1)).toBe(1000);
      expect(secondsToMs(5)).toBe(5000);
    });

    it("should handle decimals", () => {
      expect(secondsToMs(1.5)).toBe(1500);
    });

    it("should handle zero", () => {
      expect(secondsToMs(0)).toBe(0);
    });
  });

  describe("sleep", () => {
    it("should resolve after specified time", async () => {
      const start = Date.now();
      await sleep(100);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(90); // Allow some variance
      expect(duration).toBeLessThan(200);
    });

    it("should work with very short durations", async () => {
      await expect(sleep(1)).resolves.toBeUndefined();
    });

    it("should handle zero delay", async () => {
      const start = Date.now();
      await sleep(0);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(50);
    });
  });
});
