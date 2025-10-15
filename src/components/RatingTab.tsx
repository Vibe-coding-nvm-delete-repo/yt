"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ratingStorage } from "@/lib/ratingStorage";
import type {
  Rating,
  RatingFilter,
  RatingStats,
  RatingValue,
  ThumbsRating,
} from "@/types";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  MessageSquare,
  Filter,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { middleEllipsis } from "@/utils/truncation";

export const RatingTab: React.FC = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [filter, setFilter] = useState<RatingFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  // const [selectedRating, setSelectedRating] = useState<Rating | null>(null);

  const loadRatings = useCallback(() => {
    const allRatings = ratingStorage.getFilteredRatings(filter);
    setRatings(allRatings);
    const newStats = ratingStorage.getStats(filter);
    setStats(newStats);
  }, [filter]);

  useEffect(() => {
    loadRatings();
  }, [loadRatings]);

  const handleDeleteRating = (id: string) => {
    if (confirm("Are you sure you want to delete this rating?")) {
      ratingStorage.deleteRating(id);
      loadRatings();
    }
  };

  const renderStars = (
    rating: RatingValue | null,
    size: "sm" | "md" = "md",
  ) => {
    const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              rating && star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderThumbsIcon = (thumbs: ThumbsRating, size: "sm" | "md" = "md") => {
    const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    if (thumbs === "up") {
      return (
        <ThumbsUp className={`${sizeClass} text-green-500 fill-green-500`} />
      );
    }
    if (thumbs === "down") {
      return (
        <ThumbsDown className={`${sizeClass} text-red-500 fill-red-500`} />
      );
    }
    return null;
  };

  const uniqueModels = useMemo(() => {
    const allRatings = ratingStorage.getAllRatings();
    const modelMap = new Map<string, string>();
    allRatings.forEach((r) => {
      if (!modelMap.has(r.modelId)) {
        modelMap.set(r.modelId, r.modelName);
      }
    });
    return Array.from(modelMap.entries()).map(([id, name]) => ({ id, name }));
  }, [ratings]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Model Ratings
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Statistics Summary */}
      {stats && stats.totalRatings > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Total Ratings</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalRatings}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <Star className="h-4 w-4" />
              <span className="text-sm">Average Rating</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.averageStars > 0 ? stats.averageStars.toFixed(1) : "N/A"}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-green-500 mb-2">
              <ThumbsUp className="h-4 w-4" />
              <span className="text-sm">Thumbs Up</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.thumbsUp}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <ThumbsDown className="h-4 w-4" />
              <span className="text-sm">Thumbs Down</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.thumbsDown}
            </p>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Model Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model
              </label>
              <select
                value={filter.modelId || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    setFilter({ ...filter, modelId: value });
                  } else {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { modelId, ...rest } = filter;
                    setFilter(rest);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Models</option>
                {uniqueModels.map((model) => (
                  <option key={model.id} value={model.id} title={model.name}>
                    {middleEllipsis(model.name, 40)}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Stars */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Stars
              </label>
              <select
                value={filter.minStars || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    setFilter({ ...filter, minStars: parseInt(value) as RatingValue });
                  } else {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { minStars, ...rest } = filter;
                    setFilter(rest);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5</option>
              </select>
            </div>

            {/* Thumbs Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thumbs
              </label>
              <select
                value={filter.thumbs || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    setFilter({ ...filter, thumbs: value as ThumbsRating });
                  } else {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { thumbs, ...rest } = filter;
                    setFilter(rest);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All</option>
                <option value="up">Thumbs Up</option>
                <option value="down">Thumbs Down</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter({})}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Model Statistics */}
      {stats && Object.keys(stats.byModel).length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Statistics by Model
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byModel)
              .sort((a, b) => b[1].averageStars - a[1].averageStars)
              .map(([modelId, modelStats]) => (
                <div
                  key={modelId}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white" title={modelStats.modelName}>
                      {middleEllipsis(modelStats.modelName, 40)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {modelStats.count} rating
                      {modelStats.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {renderStars(
                        modelStats.averageStars > 0
                          ? (Math.round(modelStats.averageStars) as RatingValue)
                          : null,
                        "sm",
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {modelStats.averageStars.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {modelStats.thumbsUp}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {modelStats.thumbsDown}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Ratings List */}
      <div className="space-y-4">
        {ratings.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No ratings yet. Rate model outputs in the Generate Prompt or
              History tabs.
            </p>
          </div>
        ) : (
          ratings.map((rating) => (
            <div
              key={rating.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex gap-4">
                {/* Image Preview */}
                {rating.imagePreview && (
                  <div className="flex-shrink-0">
                    <Image
                      src={rating.imagePreview}
                      alt="Rated image"
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                      unoptimized
                    />
                  </div>
                )}

                {/* Rating Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white" title={rating.modelName}>
                        {middleEllipsis(rating.modelName, 40)}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(rating.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteRating(rating.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete rating"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>

                  {/* Stars and Thumbs */}
                  <div className="flex items-center gap-4">
                    {rating.stars && renderStars(rating.stars)}
                    {rating.thumbs && renderThumbsIcon(rating.thumbs)}
                  </div>

                  {/* Prompt */}
                  {rating.prompt && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {rating.prompt}
                      </p>
                    </div>
                  )}

                  {/* Comment */}
                  {rating.comment && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {rating.comment}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Clear All Ratings */}
      {ratings.length > 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to delete ALL ratings? This cannot be undone.",
                )
              ) {
                ratingStorage.clearAllRatings();
                loadRatings();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear All Ratings
          </button>
        </div>
      )}
    </div>
  );
};

export default RatingTab;
