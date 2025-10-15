"use client";

import React, { useState, useEffect } from "react";
import { ratingStorage } from "@/lib/ratingStorage";
import type { Rating, RatingValue, ThumbsRating } from "@/types";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  X,
  Check,
} from "lucide-react";

interface RatingWidgetProps {
  historyEntryId: string;
  modelId: string;
  modelName: string;
  imagePreview: string | null;
  prompt: string | null;
  compact?: boolean; // For inline display in model results
}

export const RatingWidget: React.FC<RatingWidgetProps> = ({
  historyEntryId,
  modelId,
  modelName,
  imagePreview,
  prompt,
  compact = false,
}) => {
  const [rating, setRating] = useState<Rating | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);

  // Load existing rating - this is initialization from external storage, not cascading renders
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    const existing = ratingStorage.getRatingByHistoryId(historyEntryId);
    setRating(existing);
    setComment(existing?.comment || "");
  }, [historyEntryId]);

  const handleStarClick = (stars: RatingValue) => {
    const updatedRating = ratingStorage.saveRating({
      historyEntryId,
      modelId,
      modelName,
      stars,
      thumbs: rating?.thumbs || null,
      comment: comment || null,
      imagePreview,
      prompt,
    });
    setRating(updatedRating);
    showSavedFeedback();
  };

  const handleThumbsClick = (thumbs: ThumbsRating) => {
    const updatedRating = ratingStorage.saveRating({
      historyEntryId,
      modelId,
      modelName,
      stars: rating?.stars || null,
      thumbs: thumbs === rating?.thumbs ? null : thumbs,
      comment: comment || null,
      imagePreview,
      prompt,
    });
    setRating(updatedRating);
    showSavedFeedback();
  };

  const handleCommentSave = () => {
    const updatedRating = ratingStorage.saveRating({
      historyEntryId,
      modelId,
      modelName,
      stars: rating?.stars || null,
      thumbs: rating?.thumbs || null,
      comment: comment || null,
      imagePreview,
      prompt,
    });
    setRating(updatedRating);
    setShowComment(false);
    showSavedFeedback();
  };

  const showSavedFeedback = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Stars */}
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarClick(star as RatingValue)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              className="p-0.5 hover:scale-110 transition-transform"
              title={`Rate ${star} stars`}
            >
              <Star
                className={`h-4 w-4 ${
                  rating?.stars && star <= rating.stars
                    ? "fill-yellow-400 text-yellow-400"
                    : hoveredStar && star <= hoveredStar
                      ? "fill-yellow-300 text-yellow-300"
                      : "text-gray-300 dark:text-gray-600"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Thumbs */}
        <button
          onClick={() => handleThumbsClick("up")}
          className={`p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors ${
            rating?.thumbs === "up" ? "bg-green-50 dark:bg-green-900/20" : ""
          }`}
          title="Thumbs up"
        >
          <ThumbsUp
            className={`h-4 w-4 ${
              rating?.thumbs === "up"
                ? "text-green-500 fill-green-500"
                : "text-gray-400 dark:text-gray-500"
            }`}
          />
        </button>

        <button
          onClick={() => handleThumbsClick("down")}
          className={`p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
            rating?.thumbs === "down" ? "bg-red-50 dark:bg-red-900/20" : ""
          }`}
          title="Thumbs down"
        >
          <ThumbsDown
            className={`h-4 w-4 ${
              rating?.thumbs === "down"
                ? "text-red-500 fill-red-500"
                : "text-gray-400 dark:text-gray-500"
            }`}
          />
        </button>

        {saved && (
          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <Check className="h-3 w-3" />
            Saved
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Rate this output
        </span>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <Check className="h-3 w-3" />
            Saved
          </span>
        )}
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(star as RatingValue)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            className="p-1 hover:scale-110 transition-transform"
            title={`Rate ${star} stars`}
          >
            <Star
              className={`h-6 w-6 ${
                rating?.stars && star <= rating.stars
                  ? "fill-yellow-400 text-yellow-400"
                  : hoveredStar && star <= hoveredStar
                    ? "fill-yellow-300 text-yellow-300"
                    : "text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Thumbs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleThumbsClick("up")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            rating?.thumbs === "up"
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20"
          }`}
        >
          <ThumbsUp
            className={`h-5 w-5 ${
              rating?.thumbs === "up" ? "fill-current" : ""
            }`}
          />
          <span className="text-sm">Good</span>
        </button>

        <button
          onClick={() => handleThumbsClick("down")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            rating?.thumbs === "down"
              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20"
          }`}
        >
          <ThumbsDown
            className={`h-5 w-5 ${
              rating?.thumbs === "down" ? "fill-current" : ""
            }`}
          />
          <span className="text-sm">Poor</span>
        </button>
      </div>

      {/* Comment */}
      {!showComment && !rating?.comment && (
        <button
          onClick={() => setShowComment(true)}
          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          <MessageSquare className="h-4 w-4" />
          Add feedback
        </button>
      )}

      {(showComment || rating?.comment) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Feedback
            </label>
            {showComment && (
              <button
                onClick={() => {
                  setShowComment(false);
                  setComment(rating?.comment || "");
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this output..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
            rows={3}
            disabled={!showComment && !!rating?.comment}
          />
          {showComment && (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowComment(false);
                  setComment(rating?.comment || "");
                }}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCommentSave}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          )}
          {!showComment && rating?.comment && (
            <button
              onClick={() => setShowComment(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Edit feedback
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingWidget;
