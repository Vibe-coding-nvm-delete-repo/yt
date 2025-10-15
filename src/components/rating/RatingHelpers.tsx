import React from "react";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import type { RatingValue, ThumbsRating } from "@/types";

export const renderStars = (
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

export const renderThumbsIcon = (
  thumbs: ThumbsRating,
  size: "sm" | "md" = "md",
) => {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  if (thumbs === "up") {
    return (
      <ThumbsUp className={`${sizeClass} text-green-500 fill-green-500`} />
    );
  }
  if (thumbs === "down") {
    return <ThumbsDown className={`${sizeClass} text-red-500 fill-red-500`} />;
  }
  return null;
};
