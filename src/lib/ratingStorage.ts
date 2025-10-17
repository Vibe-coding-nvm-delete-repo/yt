import type { Rating, RatingFilter, RatingStats } from "@/types";

const RATING_KEY = "image-to-prompt-ratings";

export interface PersistedRatingState {
  ratings: Rating[];
  schemaVersion: 1;
}

const DEFAULT_RATING_STATE: PersistedRatingState = Object.freeze({
  ratings: [] as Rating[],
  schemaVersion: 1 as const,
});

export class RatingStorage {
  private static instance: RatingStorage;
  private state: PersistedRatingState;

  private constructor() {
    this.state = this.load();
  }

  static getInstance(): RatingStorage {
    if (!RatingStorage.instance) {
      RatingStorage.instance = new RatingStorage();
    }
    return RatingStorage.instance;
  }

  private load(): PersistedRatingState {
    if (typeof window === "undefined") {
      return { ...DEFAULT_RATING_STATE, ratings: [] };
    }
    try {
      const raw = localStorage.getItem(RATING_KEY);
      if (!raw) return { ...DEFAULT_RATING_STATE, ratings: [] };
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_RATING_STATE,
        ...parsed,
        ratings: Array.isArray(parsed?.ratings) ? parsed.ratings : [],
      } as PersistedRatingState;
    } catch (e) {
      console.warn("Failed to load rating state", e);
      return { ...DEFAULT_RATING_STATE, ratings: [] };
    }
  }

  private save(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(RATING_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("Failed to save rating state", e);
    }
  }

  /**
   * Get all ratings
   */
  getAllRatings(): Rating[] {
    return [...this.state.ratings];
  }

  /**
   * Get a rating by ID
   */
  getRatingById(id: string): Rating | null {
    return this.state.ratings.find((r) => r.id === id) || null;
  }

  /**
   * Get rating for a specific history entry
   */
  getRatingByHistoryId(historyEntryId: string): Rating | null {
    return (
      this.state.ratings.find((r) => r.historyEntryId === historyEntryId) ||
      null
    );
  }

  /**
   * Add or update a rating
   */
  saveRating(rating: Omit<Rating, "id" | "createdAt" | "updatedAt">): Rating {
    const existingRating = this.state.ratings.find(
      (r) => r.historyEntryId === rating.historyEntryId,
    );

    let savedRating: Rating;

    if (existingRating) {
      // Update existing rating
      savedRating = {
        ...existingRating,
        ...rating,
        updatedAt: Date.now(),
      };
      this.state.ratings = this.state.ratings.map((r) =>
        r.id === existingRating.id ? savedRating : r,
      );
    } else {
      // Create new rating
      savedRating = {
        ...rating,
        id: `rating-${rating.historyEntryId}-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.state.ratings = [savedRating, ...this.state.ratings];
    }

    this.save();
    return savedRating;
  }

  /**
   * Delete a rating by ID
   */
  deleteRating(id: string): boolean {
    const initialLength = this.state.ratings.length;
    this.state.ratings = this.state.ratings.filter((r) => r.id !== id);
    const deleted = this.state.ratings.length < initialLength;
    if (deleted) {
      this.save();
    }
    return deleted;
  }

  /**
   * Get filtered ratings
   */
  getFilteredRatings(filter: RatingFilter = {}): Rating[] {
    let filtered = [...this.state.ratings];

    if (filter.modelId) {
      filtered = filtered.filter((r) => r.modelId === filter.modelId);
    }

    if (filter.minStars) {
      filtered = filtered.filter(
        (r) => r.stars !== null && r.stars >= filter.minStars!,
      );
    }

    if (filter.maxStars) {
      filtered = filtered.filter(
        (r) => r.stars !== null && r.stars <= filter.maxStars!,
      );
    }

    if (filter.thumbs) {
      filtered = filtered.filter((r) => r.thumbs === filter.thumbs);
    }

    if (filter.fromDate) {
      filtered = filtered.filter((r) => r.createdAt >= filter.fromDate!);
    }

    if (filter.toDate) {
      filtered = filtered.filter((r) => r.createdAt <= filter.toDate!);
    }

    return filtered;
  }

  /**
   * Get rating statistics
   */
  getStats(filter: RatingFilter = {}): RatingStats {
    const ratings = this.getFilteredRatings(filter);

    const stats: RatingStats = {
      totalRatings: ratings.length,
      averageStars: 0,
      thumbsUp: 0,
      thumbsDown: 0,
      byModel: {},
    };

    if (ratings.length === 0) return stats;

    let totalStars = 0;
    let starsCount = 0;

    ratings.forEach((rating) => {
      // Count thumbs
      if (rating.thumbs === "up") stats.thumbsUp++;
      if (rating.thumbs === "down") stats.thumbsDown++;

      // Sum stars
      if (rating.stars !== null) {
        totalStars += rating.stars;
        starsCount++;
      }

      // By model stats
      if (!stats.byModel[rating.modelId]) {
        stats.byModel[rating.modelId] = {
          modelName: rating.modelName,
          count: 0,
          averageStars: 0,
          thumbsUp: 0,
          thumbsDown: 0,
        };
      }

      const modelStats = stats.byModel[rating.modelId]!;
      modelStats.count++;
      if (rating.thumbs === "up") modelStats.thumbsUp++;
      if (rating.thumbs === "down") modelStats.thumbsDown++;
    });

    // Calculate average stars overall
    if (starsCount > 0) {
      stats.averageStars = totalStars / starsCount;
    }

    // Calculate average stars per model
    Object.keys(stats.byModel).forEach((modelId) => {
      const modelRatings = ratings.filter(
        (r) => r.modelId === modelId && r.stars !== null,
      );
      if (modelRatings.length > 0) {
        const modelStarsSum = modelRatings.reduce(
          (sum, r) => sum + (r.stars || 0),
          0,
        );
        stats.byModel[modelId]!.averageStars =
          modelStarsSum / modelRatings.length;
      }
    });

    return stats;
  }

  /**
   * Clear all ratings
   */
  clearAllRatings(): void {
    this.state = { ...DEFAULT_RATING_STATE, ratings: [] };
    this.save();
  }
}

export const ratingStorage = RatingStorage.getInstance();
