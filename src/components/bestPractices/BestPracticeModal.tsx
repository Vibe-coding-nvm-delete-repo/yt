"use client";

import React from "react";
import { X, Upload } from "lucide-react";
import type { BestPracticeCategory, BestPracticeType } from "@/types";

interface BestPracticeFormData {
  name: string;
  description: string;
  leonardoAiLanguage: string;
  images: string[];
  importance: number;
  type: BestPracticeType;
  typeExplanation: string;
  category: BestPracticeCategory;
}

interface BestPracticeModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: BestPracticeFormData;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (updates: Partial<BestPracticeFormData>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}

export const BestPracticeModal: React.FC<BestPracticeModalProps> = ({
  isOpen,
  isEditing,
  formData,
  onClose,
  onSave,
  onFormChange,
  onImageUpload,
  onRemoveImage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? "Edit" : "Create"} Best Practice
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                onFormChange({
                  category: e.target.value as BestPracticeCategory,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="words-phrases">Words/Phrases</option>
              <option value="photography">Photography</option>
              <option value="youtube-engagement">Youtube Engagement</option>
              <option value="youtube-thumbnail">Youtube Thumbnail</option>
              <option value="our-unique-channel">Our Unique Channel</option>
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormChange({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter best practice name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => onFormChange({ description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Provide a detailed description of this best practice, including when and how to apply it"
            />
          </div>

          {/* Leonardo.AI Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Leonardo.AI Language
            </label>
            <textarea
              value={formData.leonardoAiLanguage}
              onChange={(e) =>
                onFormChange({ leonardoAiLanguage: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Enter detailed Leonardo.AI language instructions or prompt structure"
            />
          </div>

          {/* Importance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Importance (1-10)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.importance}
                onChange={(e) =>
                  onFormChange({ importance: parseInt(e.target.value) })
                }
                className="flex-1"
              />
              <div
                className={`px-4 py-2 rounded-lg font-bold text-lg min-w-[60px] text-center ${
                  formData.importance >= 8
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : formData.importance >= 5
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                }`}
              >
                {formData.importance}
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.importance >= 8
                ? "High importance - critical best practice"
                : formData.importance >= 5
                  ? "Medium importance - recommended practice"
                  : "Low importance - optional suggestion"}
            </p>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                onFormChange({ type: e.target.value as BestPracticeType })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="mandatory">Mandatory</option>
              <option value="optional">Optional</option>
              <option value="conditional">Conditional</option>
            </select>
          </div>

          {/* Type Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type Explanation
            </label>
            <textarea
              value={formData.typeExplanation}
              onChange={(e) =>
                onFormChange({ typeExplanation: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Explain why this is mandatory (must always follow), optional (good to have), or conditional (depends on context)"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Images
            </label>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
              Add reference images to visually demonstrate this best practice
              and make it easier to understand and apply.
            </p>
            <div className="flex gap-2 flex-wrap mb-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img}
                    alt={`Upload ${idx + 1}`}
                    className="h-20 w-20 object-cover rounded border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    onClick={() => onRemoveImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
              <Upload className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Upload Images
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isEditing ? "Save Changes" : "Create"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
