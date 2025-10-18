import { BestPracticesStorage } from "../bestPracticesStorage";
import type { BestPractice, BestPracticeCategory } from "@/types";

// Helper function to create valid test BestPractice objects
const createTestPractice = (
  overrides: Partial<BestPractice> = {},
): BestPractice => ({
  id: `bp-${Date.now()}`,
  name: "Test Practice",
  description: "Test description",
  leonardoAiLanguage: "test language",
  images: [],
  importance: 5,
  type: "optional",
  typeExplanation: "test explanation",
  category: "words-phrases",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

describe("BestPracticesStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // Reset singleton instance
    (BestPracticesStorage as any).instance = undefined;
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = BestPracticesStorage.getInstance();
      const instance2 = BestPracticesStorage.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("loadPractices", () => {
    it("should return empty array when no data in localStorage", () => {
      const storage = BestPracticesStorage.getInstance();
      const practices = storage.getPractices();

      expect(practices).toEqual([]);
    });

    it("should load practices from localStorage", () => {
      const mockPractices: BestPractice[] = [
        createTestPractice({
          id: "bp-1",
          name: "Test Practice",
        }),
      ];

      localStorage.setItem("yt-best-practices", JSON.stringify(mockPractices));

      const storage = BestPracticesStorage.getInstance();
      const practices = storage.getPractices();

      expect(practices).toHaveLength(1);
      expect(practices[0]?.name).toBe("Test Practice");
    });

    it("should handle invalid JSON in localStorage", () => {
      localStorage.setItem("yt-best-practices", "invalid-json{");

      const storage = BestPracticesStorage.getInstance();
      const practices = storage.getPractices();

      expect(practices).toEqual([]);
    });

    it("should handle non-array data in localStorage", () => {
      localStorage.setItem(
        "yt-best-practices",
        JSON.stringify({ not: "array" }),
      );

      const storage = BestPracticesStorage.getInstance();
      const practices = storage.getPractices();

      expect(practices).toEqual([]);
    });
  });

  describe("createPractice", () => {
    it("should create a new practice", () => {
      const storage = BestPracticesStorage.getInstance();

      const practice = storage.createPractice({
        name: "New Practice",
        description: "New description",
        leonardoAiLanguage: "new language",
        images: [],
        importance: 7,
        type: "mandatory",
        typeExplanation: "explanation",
        category: "photography",
      });

      expect(practice.id).toBeDefined();
      expect(practice.name).toBe("New Practice");
      expect(practice.createdAt).toBeDefined();
      expect(practice.updatedAt).toBeDefined();
    });

    it("should save practice to localStorage", () => {
      const storage = BestPracticesStorage.getInstance();

      storage.createPractice({
        name: "Saved Practice",
        description: "Description",
        leonardoAiLanguage: "saved language",
        images: [],
        importance: 5,
        type: "optional",
        typeExplanation: "explanation",
        category: "youtube-engagement",
      });

      const stored = localStorage.getItem("yt-best-practices");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0]?.name).toBe("Saved Practice");
    });
  });

  describe("getPractices", () => {
    it("should return copy of practices array", () => {
      const storage = BestPracticesStorage.getInstance();

      storage.createPractice({
        name: "Practice 1",
        description: "Description",
        leonardoAiLanguage: "language",
        images: [],
        importance: 5,
        type: "optional",
        typeExplanation: "explanation",
        category: "words-phrases",
      });

      const practices1 = storage.getPractices();
      const practices2 = storage.getPractices();

      expect(practices1).not.toBe(practices2); // Different array references
      expect(practices1).toEqual(practices2); // Same content
    });
  });

  describe("getPracticesByCategory", () => {
    it("should filter practices by category", () => {
      const storage = BestPracticesStorage.getInstance();

      storage.createPractice({
        name: "Prompt Practice",
        description: "Description",
        leonardoAiLanguage: "language",
        images: [],
        importance: 5,
        type: "optional",
        typeExplanation: "explanation",
        category: "words-phrases",
      });

      storage.createPractice({
        name: "Model Practice",
        description: "Description",
        leonardoAiLanguage: "language",
        images: [],
        importance: 5,
        type: "optional",
        typeExplanation: "explanation",
        category: "photography",
      });

      const promptPractices = storage.getPracticesByCategory("words-phrases");
      expect(promptPractices).toHaveLength(1);
      expect(promptPractices[0]?.name).toBe("Prompt Practice");

      const modelPractices = storage.getPracticesByCategory("photography");
      expect(modelPractices).toHaveLength(1);
      expect(modelPractices[0]?.name).toBe("Model Practice");
    });

    it("should return empty array for category with no practices", () => {
      const storage = BestPracticesStorage.getInstance();

      const practices = storage.getPracticesByCategory("youtube-engagement");
      expect(practices).toEqual([]);
    });
  });

  describe("getPracticeById", () => {
    it("should return practice by ID", () => {
      const storage = BestPracticesStorage.getInstance();

      const created = storage.createPractice({
        name: "Test Practice",
        description: "Description",
        leonardoAiLanguage: "language",
        images: [],
        importance: 5,
        type: "optional",
        typeExplanation: "explanation",
        category: "words-phrases",
      });

      const found = storage.getPracticeById(created.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe("Test Practice");
    });

    it("should return null for non-existent ID", () => {
      const storage = BestPracticesStorage.getInstance();

      const found = storage.getPracticeById("non-existent-id");
      expect(found).toBeNull();
    });
  });

  describe("updatePractice", () => {
    it("should update existing practice", () => {
      const storage = BestPracticesStorage.getInstance();

      const created = storage.createPractice({
        name: "Original Title",
        description: "Original description",
        leonardoAiLanguage: "language",
        images: [],
        importance: 5,
        type: "optional",
        typeExplanation: "explanation",
        category: "words-phrases",
      });

      // Wait a bit to ensure updatedAt is different
      jest.advanceTimersByTime(10);

      const updated = storage.updatePractice(created.id, {
        name: "Updated Title",
        description: "Updated description",
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe("Updated Title");
      expect(updated?.description).toBe("Updated description");
      expect(updated?.id).toBe(created.id); // ID unchanged
      expect(updated?.createdAt).toBe(created.createdAt); // createdAt unchanged
      expect(updated?.updatedAt).toBeGreaterThanOrEqual(created.updatedAt);
    });

    it("should return null for non-existent practice", () => {
      const storage = BestPracticesStorage.getInstance();

      const updated = storage.updatePractice("non-existent", {
        name: "New Title",
      });
      expect(updated).toBeNull();
    });

    it("should preserve immutable fields", () => {
      const storage = BestPracticesStorage.getInstance();

      const created = storage.createPractice({
        name: "Test",
        description: "Description",
        leonardoAiLanguage: "language",
        images: [],
        importance: 5,
        type: "optional",
        typeExplanation: "explanation",
        category: "words-phrases",
      });

      const originalId = created.id;
      const originalCreatedAt = created.createdAt;

      // Try to update immutable fields (they should be ignored)
      const updated = storage.updatePractice(created.id, {
        name: "Updated",
        id: "should-be-ignored",
        createdAt: 99999,
      } as any);

      expect(updated?.id).toBe(originalId);
      expect(updated?.createdAt).toBe(originalCreatedAt);
      expect(updated?.name).toBe("Updated");
    });
  });

  describe("deletePractice", () => {
    it("should delete existing practice", () => {
      const storage = BestPracticesStorage.getInstance();

      const created = storage.createPractice({
        name: "To Delete",
        description: "Description",
        leonardoAiLanguage: "language",
        images: [],
        importance: 5,
        type: "optional",
        typeExplanation: "explanation",
        category: "words-phrases",
      });

      const deleted = storage.deletePractice(created.id);
      expect(deleted).toBe(true);

      const found = storage.getPracticeById(created.id);
      expect(found).toBeNull();
    });

    it("should return false for non-existent practice", () => {
      const storage = BestPracticesStorage.getInstance();

      const deleted = storage.deletePractice("non-existent");
      expect(deleted).toBe(false);
    });

    it("should save to localStorage after deletion", () => {
      const storage = BestPracticesStorage.getInstance();

      const created = storage.createPractice({
        name: "To Delete",
        description: "Description",
        leonardoAiLanguage: "language",
        images: [],
        importance: 5,
        type: "optional",
        typeExplanation: "explanation",
        category: "words-phrases",
      });

      storage.deletePractice(created.id);

      const stored = localStorage.getItem("yt-best-practices");
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(0);
    });
  });

  describe("clearAllPractices", () => {
    it("should clear all practices", () => {
      const storage = BestPracticesStorage.getInstance();

      storage.createPractice({
        name: "Practice 1",
        description: "Description",
        leonardoAiLanguage: "language",
        images: [],
        importance: 5,
        type: "optional",
        typeExplanation: "explanation",
        category: "words-phrases",
      });

      storage.createPractice({
        name: "Practice 2",
        description: "Description",
        leonardoAiLanguage: "language",
        images: [],
        importance: 5,
        type: "optional",
        typeExplanation: "explanation",
        category: "photography",
      });

      expect(storage.getPractices()).toHaveLength(2);

      storage.clearAllPractices();

      expect(storage.getPractices()).toHaveLength(0);
    });

    it("should save empty array to localStorage", () => {
      const storage = BestPracticesStorage.getInstance();

      storage.createPractice({
        name: "Practice",
        description: "Description",
        leonardoAiLanguage: "language",
        images: [],
        importance: 5,
        type: "optional",
        typeExplanation: "explanation",
        category: "words-phrases",
      });

      storage.clearAllPractices();

      const stored = localStorage.getItem("yt-best-practices");
      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual([]);
    });
  });

  describe("subscribe", () => {
    it("should call callback immediately on subscribe", () => {
      const storage = BestPracticesStorage.getInstance();
      const callback = jest.fn();

      storage.subscribe(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith([]);
    });

    it("should notify subscribers on create", () => {
      const storage = BestPracticesStorage.getInstance();
      const callback = jest.fn();

      storage.subscribe(callback);
      callback.mockClear();

      storage.createPractice({
        name: "New Practice",
        description: "Description",
        leonardoAiLanguage: "language",
        images: [],
        importance: 5,
        type: "optional",
        typeExplanation: "explanation",
        category: "words-phrases",
      });

      expect(callback).toHaveBeenCalledTimes(1);
      const practices = callback.mock.calls[0]?.[0];
      expect(practices).toHaveLength(1);
    });

    it("should notify subscribers on update", () => {
      const storage = BestPracticesStorage.getInstance();
      const callback = jest.fn();

      const created = storage.createPractice({
        name: "Practice",
        description: "Description",
        leonardoAiLanguage: "language",
        images: [],
        importance: 5,
        type: "optional",
        typeExplanation: "explanation",
        category: "words-phrases",
      });

      storage.subscribe(callback);
      callback.mockClear();

      storage.updatePractice(created.id, { name: "Updated" });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should notify subscribers on delete", () => {
      const storage = BestPracticesStorage.getInstance();
      const callback = jest.fn();

      const created = storage.createPractice({
        name: "Practice",
        description: "Description",
        leonardoAiLanguage: "language",
        images: [],
        importance: 5,
        type: "optional",
        typeExplanation: "explanation",
        category: "words-phrases",
      });

      storage.subscribe(callback);
      callback.mockClear();

      storage.deletePractice(created.id);

      expect(callback).toHaveBeenCalledTimes(1);
      const practices = callback.mock.calls[0]?.[0];
      expect(practices).toHaveLength(0);
    });

    it("should handle errors in callbacks gracefully", () => {
      const storage = BestPracticesStorage.getInstance();
      const goodCallback = jest.fn();

      let callCount = 0;
      const badCallback = jest.fn(() => {
        callCount++;
        // Only throw on subsequent calls (not the immediate call on subscribe)
        if (callCount > 1) {
          throw new Error("Callback error");
        }
      });

      storage.subscribe(goodCallback);
      storage.subscribe(badCallback);

      goodCallback.mockClear();
      badCallback.mockClear();

      // Should not throw even with bad callback
      expect(() => {
        storage.createPractice({
          name: "Test",
          description: "Description",
          leonardoAiLanguage: "language",
          images: [],
          importance: 5,
          type: "optional",
          typeExplanation: "explanation",
          category: "words-phrases",
        });
      }).not.toThrow();

      expect(goodCallback).toHaveBeenCalled();
      expect(badCallback).toHaveBeenCalled();
    });

    it("should return unsubscribe function", () => {
      const storage = BestPracticesStorage.getInstance();
      const callback = jest.fn();

      const unsubscribe = storage.subscribe(callback);
      callback.mockClear();

      // Unsubscribe
      unsubscribe();

      // Create practice - callback should not be called
      storage.createPractice({
        name: "Test",
        description: "Description",
        leonardoAiLanguage: "language",
        images: [],
        importance: 5,
        type: "optional",
        typeExplanation: "explanation",
        category: "words-phrases",
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle localStorage write errors gracefully", () => {
      const storage = BestPracticesStorage.getInstance();

      // Mock localStorage to throw
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error("Quota exceeded");
      });

      // Should not throw
      expect(() => {
        storage.createPractice({
          name: "Test",
          description: "Description",
          leonardoAiLanguage: "language",
          images: [],
          importance: 5,
          type: "optional",
          typeExplanation: "explanation",
          category: "words-phrases",
        });
      }).not.toThrow();

      // Restore
      Storage.prototype.setItem = originalSetItem;
    });
  });
});
