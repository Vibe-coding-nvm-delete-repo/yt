import { RatingStorage, ratingStorage } from "../ratingStorage";
import type { Rating, RatingFilter } from "@/types";

describe("RatingStorage", () => {
  let storage: RatingStorage;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Get fresh instance
    storage = RatingStorage.getInstance();
  });

  afterEach(() => {
    storage.clearAllRatings();
  });

  describe("saveRating", () => {
    it("creates a new rating", () => {
      const rating = storage.saveRating({
        historyEntryId: "history-1",
        modelId: "model-1",
        modelName: "Test Model",
        stars: 5,
        thumbs: "up",
        comment: "Great!",
        imagePreview: null,
        prompt: "Test prompt",
      });

      expect(rating.id).toBeDefined();
      expect(rating.stars).toBe(5);
      expect(rating.thumbs).toBe("up");
      expect(rating.comment).toBe("Great!");
      expect(rating.createdAt).toBeDefined();
      expect(rating.updatedAt).toBeDefined();
    });

    it("updates an existing rating", () => {
      const rating1 = storage.saveRating({
        historyEntryId: "history-1",
        modelId: "model-1",
        modelName: "Test Model",
        stars: 3,
        thumbs: null,
        comment: null,
        imagePreview: null,
        prompt: "Test prompt",
      });

      const rating2 = storage.saveRating({
        historyEntryId: "history-1",
        modelId: "model-1",
        modelName: "Test Model",
        stars: 5,
        thumbs: "up",
        comment: "Updated!",
        imagePreview: null,
        prompt: "Test prompt",
      });

      expect(rating2.id).toBe(rating1.id);
      expect(rating2.stars).toBe(5);
      expect(rating2.thumbs).toBe("up");
      expect(rating2.comment).toBe("Updated!");
      expect(rating2.updatedAt).toBeGreaterThanOrEqual(rating1.updatedAt);

      const allRatings = storage.getAllRatings();
      expect(allRatings).toHaveLength(1);
    });
  });

  describe("getRatingById", () => {
    it("returns rating by ID", () => {
      const saved = storage.saveRating({
        historyEntryId: "history-1",
        modelId: "model-1",
        modelName: "Test Model",
        stars: 4,
        thumbs: null,
        comment: null,
        imagePreview: null,
        prompt: "Test prompt",
      });

      const found = storage.getRatingById(saved.id);
      expect(found).toEqual(saved);
    });

    it("returns null for non-existent ID", () => {
      const found = storage.getRatingById("non-existent");
      expect(found).toBeNull();
    });
  });

  describe("getRatingByHistoryId", () => {
    it("returns rating by history entry ID", () => {
      const saved = storage.saveRating({
        historyEntryId: "history-1",
        modelId: "model-1",
        modelName: "Test Model",
        stars: 4,
        thumbs: null,
        comment: null,
        imagePreview: null,
        prompt: "Test prompt",
      });

      const found = storage.getRatingByHistoryId("history-1");
      expect(found).toEqual(saved);
    });

    it("returns null for non-existent history ID", () => {
      const found = storage.getRatingByHistoryId("non-existent");
      expect(found).toBeNull();
    });
  });

  describe("deleteRating", () => {
    it("deletes a rating by ID", () => {
      const rating = storage.saveRating({
        historyEntryId: "history-1",
        modelId: "model-1",
        modelName: "Test Model",
        stars: 4,
        thumbs: null,
        comment: null,
        imagePreview: null,
        prompt: "Test prompt",
      });

      const deleted = storage.deleteRating(rating.id);
      expect(deleted).toBe(true);

      const found = storage.getRatingById(rating.id);
      expect(found).toBeNull();
    });

    it("returns false for non-existent ID", () => {
      const deleted = storage.deleteRating("non-existent");
      expect(deleted).toBe(false);
    });
  });

  describe("getFilteredRatings", () => {
    beforeEach(() => {
      storage.saveRating({
        historyEntryId: "history-1",
        modelId: "model-1",
        modelName: "Model 1",
        stars: 5,
        thumbs: "up",
        comment: null,
        imagePreview: null,
        prompt: "Prompt 1",
      });

      storage.saveRating({
        historyEntryId: "history-2",
        modelId: "model-2",
        modelName: "Model 2",
        stars: 3,
        thumbs: "down",
        comment: null,
        imagePreview: null,
        prompt: "Prompt 2",
      });

      storage.saveRating({
        historyEntryId: "history-3",
        modelId: "model-1",
        modelName: "Model 1",
        stars: 4,
        thumbs: "up",
        comment: null,
        imagePreview: null,
        prompt: "Prompt 3",
      });
    });

    it("filters by model ID", () => {
      const filtered = storage.getFilteredRatings({ modelId: "model-1" });
      expect(filtered).toHaveLength(2);
      expect(filtered.every((r) => r.modelId === "model-1")).toBe(true);
    });

    it("filters by minimum stars", () => {
      const filtered = storage.getFilteredRatings({ minStars: 4 });
      expect(filtered).toHaveLength(2);
      expect(filtered.every((r) => r.stars && r.stars >= 4)).toBe(true);
    });

    it("filters by maximum stars", () => {
      const filtered = storage.getFilteredRatings({ maxStars: 3 });
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.stars).toBe(3);
    });

    it("filters by thumbs", () => {
      const filtered = storage.getFilteredRatings({ thumbs: "up" });
      expect(filtered).toHaveLength(2);
      expect(filtered.every((r) => r.thumbs === "up")).toBe(true);
    });

    it("combines multiple filters", () => {
      const filtered = storage.getFilteredRatings({
        modelId: "model-1",
        minStars: 4,
      });
      expect(filtered).toHaveLength(2);
    });
  });

  describe("getStats", () => {
    beforeEach(() => {
      storage.saveRating({
        historyEntryId: "history-1",
        modelId: "model-1",
        modelName: "Model 1",
        stars: 5,
        thumbs: "up",
        comment: null,
        imagePreview: null,
        prompt: "Prompt 1",
      });

      storage.saveRating({
        historyEntryId: "history-2",
        modelId: "model-2",
        modelName: "Model 2",
        stars: 3,
        thumbs: "down",
        comment: null,
        imagePreview: null,
        prompt: "Prompt 2",
      });

      storage.saveRating({
        historyEntryId: "history-3",
        modelId: "model-1",
        modelName: "Model 1",
        stars: 4,
        thumbs: "up",
        comment: null,
        imagePreview: null,
        prompt: "Prompt 3",
      });
    });

    it("calculates overall statistics", () => {
      const stats = storage.getStats();

      expect(stats.totalRatings).toBe(3);
      expect(stats.averageStars).toBe(4.0);
      expect(stats.thumbsUp).toBe(2);
      expect(stats.thumbsDown).toBe(1);
    });

    it("calculates per-model statistics", () => {
      const stats = storage.getStats();

      expect(stats.byModel["model-1"]).toBeDefined();
      expect(stats.byModel["model-1"]?.count).toBe(2);
      expect(stats.byModel["model-1"]?.averageStars).toBe(4.5);
      expect(stats.byModel["model-1"]?.thumbsUp).toBe(2);

      expect(stats.byModel["model-2"]).toBeDefined();
      expect(stats.byModel["model-2"]?.count).toBe(1);
      expect(stats.byModel["model-2"]?.averageStars).toBe(3.0);
      expect(stats.byModel["model-2"]?.thumbsDown).toBe(1);
    });

    it("handles empty ratings", () => {
      storage.clearAllRatings();
      const stats = storage.getStats();

      expect(stats.totalRatings).toBe(0);
      expect(stats.averageStars).toBe(0);
      expect(stats.thumbsUp).toBe(0);
      expect(stats.thumbsDown).toBe(0);
      expect(Object.keys(stats.byModel)).toHaveLength(0);
    });
  });

  describe("clearAllRatings", () => {
    it("removes all ratings", () => {
      storage.saveRating({
        historyEntryId: "history-1",
        modelId: "model-1",
        modelName: "Test Model",
        stars: 5,
        thumbs: "up",
        comment: null,
        imagePreview: null,
        prompt: "Test prompt",
      });

      expect(storage.getAllRatings()).toHaveLength(1);

      storage.clearAllRatings();

      expect(storage.getAllRatings()).toHaveLength(0);
    });
  });

  describe("persistence", () => {
    it("persists ratings to localStorage", () => {
      storage.saveRating({
        historyEntryId: "history-1",
        modelId: "model-1",
        modelName: "Test Model",
        stars: 5,
        thumbs: "up",
        comment: "Test",
        imagePreview: null,
        prompt: "Test prompt",
      });

      const stored = localStorage.getItem("image-to-prompt-ratings");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.ratings).toHaveLength(1);
      expect(parsed.ratings[0].stars).toBe(5);
    });

    it("loads ratings from localStorage", () => {
      const mockRating: Rating = {
        id: "rating-1",
        historyEntryId: "history-1",
        modelId: "model-1",
        modelName: "Test Model",
        stars: 5,
        thumbs: "up",
        comment: "Test",
        imagePreview: null,
        prompt: "Test prompt",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      localStorage.setItem(
        "image-to-prompt-ratings",
        JSON.stringify({ ratings: [mockRating], schemaVersion: 1 }),
      );

      delete (RatingStorage as unknown as { instance?: RatingStorage })
        .instance;
      const newStorage = RatingStorage.getInstance();
      const ratings = newStorage.getAllRatings();

      expect(ratings).toHaveLength(1);
      expect(ratings[0]?.id).toBe("rating-1");
    });
  });
});
