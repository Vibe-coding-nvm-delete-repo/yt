"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { BookOpen, Plus, ChevronDown, Info } from "lucide-react";
import type {
  BestPractice,
  BestPracticeCategory,
  BestPracticeType,
} from "@/types";
import { bestPracticesStorage } from "@/lib/bestPracticesStorage";
import { BestPracticeModal } from "./bestPractices/BestPracticeModal";
import { BestPracticeCard } from "./bestPractices/BestPracticeCard";

type BestPracticeSubTab =
  | "all"
  | "words-phrases"
  | "photography"
  | "youtube-engagement"
  | "youtube-thumbnail"
  | "our-unique-channel";

const SUB_TAB_LABELS: Record<BestPracticeSubTab, string> = {
  all: "All",
  "words-phrases": "Words/Phrases",
  photography: "Photography",
  "youtube-engagement": "Youtube Engagement",
  "youtube-thumbnail": "Youtube Thumbnail",
  "our-unique-channel": "Our Unique Channel",
};

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

const EMPTY_FORM_DATA: BestPracticeFormData = {
  name: "",
  description: "",
  leonardoAiLanguage: "",
  images: [],
  importance: 5,
  type: "optional",
  typeExplanation: "",
  category: "words-phrases",
};

export const BestPracticesTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<BestPracticeSubTab>("all");
  const [practices, setPractices] = useState<BestPractice[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPractice, setEditingPractice] = useState<BestPractice | null>(
    null,
  );
  const [formData, setFormData] =
    useState<BestPracticeFormData>(EMPTY_FORM_DATA);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [typeFilters, setTypeFilters] = useState<Set<BestPracticeType>>(
    new Set(["mandatory", "optional", "conditional"]),
  );
  const [showMetricsTooltip, setShowMetricsTooltip] = useState(false);

  // Load practices from storage
  useEffect(() => {
    const unsubscribe = bestPracticesStorage.subscribe((updatedPractices) => {
      setPractices(updatedPractices);
    });

    return unsubscribe;
  }, []);

  // Calculate counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<BestPracticeSubTab, number> = {
      all: practices.length,
      "words-phrases": 0,
      photography: 0,
      "youtube-engagement": 0,
      "youtube-thumbnail": 0,
      "our-unique-channel": 0,
    };

    practices.forEach((practice) => {
      if (practice.category in counts) {
        counts[practice.category]++;
      }
    });

    return counts;
  }, [practices]);

  // Calculate metrics breakdown
  const metricsBreakdown = useMemo(() => {
    return {
      "Words/Phrases": categoryCounts["words-phrases"],
      Photography: categoryCounts["photography"],
      "Youtube Engagement": categoryCounts["youtube-engagement"],
      "Youtube Thumbnail": categoryCounts["youtube-thumbnail"],
      "Our Unique Channel": categoryCounts["our-unique-channel"],
    };
  }, [categoryCounts]);

  // Filter practices based on active subtab and type filters
  const filteredPractices = useMemo(() => {
    let filtered = practices;

    // Filter by category
    if (activeSubTab !== "all") {
      filtered = filtered.filter((p) => p.category === activeSubTab);
    }

    // Filter by type (only on "all" tab)
    if (activeSubTab === "all") {
      filtered = filtered.filter((p) => typeFilters.has(p.type));
    }

    return filtered;
  }, [practices, activeSubTab, typeFilters]);

  const handleCreateClick = useCallback((category?: BestPracticeCategory) => {
    setFormData({
      ...EMPTY_FORM_DATA,
      category: category || "words-phrases",
    });
    setEditingPractice(null);
    setIsCreateModalOpen(true);
    setIsDropdownOpen(false);
  }, []);

  const handleEditClick = useCallback((practice: BestPractice) => {
    setFormData({
      name: practice.name,
      description: practice.description,
      leonardoAiLanguage: practice.leonardoAiLanguage,
      images: practice.images,
      importance: practice.importance,
      type: practice.type,
      typeExplanation: practice.typeExplanation,
      category: practice.category,
    });
    setEditingPractice(practice);
    setIsCreateModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this best practice?")) {
      bestPracticesStorage.deletePractice(id);
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!formData.name.trim()) {
      alert("Please enter a name");
      return;
    }

    if (editingPractice) {
      bestPracticesStorage.updatePractice(editingPractice.id, formData);
    } else {
      bestPracticesStorage.createPractice(formData);
    }

    setIsCreateModalOpen(false);
    setFormData(EMPTY_FORM_DATA);
    setEditingPractice(null);
  }, [editingPractice, formData]);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const readers: Promise<string>[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        const reader = new FileReader();
        const promise = new Promise<string>((resolve, reject) => {
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            } else {
              reject(new Error("Failed to read file"));
            }
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
        });

        readers.push(promise);
        reader.readAsDataURL(file);
      }

      Promise.all(readers)
        .then((images) => {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...images],
          }));
        })
        .catch((error) => {
          console.error("Failed to upload images:", error);
          alert("Failed to upload one or more images");
        });

      e.target.value = "";
    },
    [],
  );

  const handleRemoveImage = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const toggleTypeFilter = useCallback((type: BestPracticeType) => {
    setTypeFilters((prev) => {
      const newFilters = new Set(prev);
      if (newFilters.has(type)) {
        newFilters.delete(type);
      } else {
        newFilters.add(type);
      }
      return newFilters;
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <BookOpen className="mr-2 h-6 w-6" />
            Best Practices
          </h1>

          {/* Metrics Display */}
          <div
            className="relative"
            onMouseEnter={() => setShowMetricsTooltip(true)}
            onMouseLeave={() => setShowMetricsTooltip(false)}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 cursor-help">
              <span className="text-2xl font-bold">{practices.length}</span>
              <Info className="h-4 w-4" />
            </div>

            {showMetricsTooltip && (
              <div className="absolute left-0 top-full mt-2 z-10 bg-gray-900 dark:bg-gray-700 text-white rounded-lg shadow-lg p-3 min-w-[200px]">
                <div className="space-y-1">
                  {Object.entries(metricsBreakdown).map(([category, count]) => (
                    <div key={category} className="flex justify-between gap-4">
                      <span className="text-gray-300">{category}:</span>
                      <span className="font-semibold text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create
            <ChevronDown className="ml-2 h-4 w-4" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
              <button
                onClick={() => handleCreateClick("words-phrases")}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white rounded-t-lg"
              >
                Words/Phrases
              </button>
              <button
                onClick={() => handleCreateClick("photography")}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
              >
                Photography
              </button>
              <button
                onClick={() => handleCreateClick("youtube-engagement")}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
              >
                Youtube Engagement
              </button>
              <button
                onClick={() => handleCreateClick("youtube-thumbnail")}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
              >
                Youtube Thumbnail
              </button>
              <button
                onClick={() => handleCreateClick("our-unique-channel")}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white rounded-b-lg"
              >
                Our Unique Channel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4" aria-label="Best Practices sections">
          {(
            [
              "all",
              "words-phrases",
              "photography",
              "youtube-engagement",
              "youtube-thumbnail",
              "our-unique-channel",
            ] as BestPracticeSubTab[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                activeSubTab === tab
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {SUB_TAB_LABELS[tab]} ({categoryCounts[tab]})
            </button>
          ))}
        </nav>
      </div>

      {/* Type Filters (only on "all" tab) */}
      {activeSubTab === "all" && (
        <div className="bg-[#151A21] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-300">
              Filter by Type:
            </span>
            <div className="flex gap-4">
              {(
                ["mandatory", "optional", "conditional"] as BestPracticeType[]
              ).map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={typeFilters.has(type)}
                    onChange={() => toggleTypeFilter(type)}
                    className="h-4 w-4 rounded border-white/10 text-blue-600 focus:ring-blue-500/50 bg-white/5"
                  />
                  <span className="text-sm text-gray-300 capitalize">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Practices List */}
      <div className="space-y-4">
        {filteredPractices.length === 0 ? (
          <div className="text-center py-12 bg-[#151A21] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-400">
              No best practices yet. Click &quot;Create&quot; to add one.
            </p>
          </div>
        ) : (
          filteredPractices.map((practice) => (
            <BestPracticeCard
              key={practice.id}
              practice={practice}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <BestPracticeModal
        isOpen={isCreateModalOpen}
        isEditing={!!editingPractice}
        formData={formData}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData(EMPTY_FORM_DATA);
          setEditingPractice(null);
        }}
        onSave={handleSave}
        onFormChange={(updates) => setFormData({ ...formData, ...updates })}
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage}
      />
    </div>
  );
};
