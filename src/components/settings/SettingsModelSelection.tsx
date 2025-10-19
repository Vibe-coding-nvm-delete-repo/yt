"use client";

import React, { useRef, useState } from "react";
import {
  RefreshCw,
  CheckCircle,
  Search,
  ChevronDown,
  Pin,
  PinOff,
} from "lucide-react";
import { middleEllipsis } from "@/utils/truncation";
import { formatTimestamp, formatPrice } from "@/utils/formatting";
import type { ModelState } from "@/types";

export interface SettingsModelSelectionProps {
  modelState: ModelState;
  selectedVisionModels: string[];
  pinnedModels: string[];
  lastModelFetch?: number | undefined;
  isValidApiKey: boolean;
  onFetchModels: () => void;
  onModelSelect: (models: string[]) => void;
  onTogglePinned: (modelId: string) => void;
  onPinToast: (message: string) => void;
}

export const SettingsModelSelection: React.FC<SettingsModelSelectionProps> = ({
  modelState,
  selectedVisionModels,
  pinnedModels,
  lastModelFetch,
  isValidApiKey,
  onFetchModels,
  onModelSelect,
  onTogglePinned,
  onPinToast,
}) => {
  const [dropdownStates, setDropdownStates] = useState<
    Record<number, { isOpen: boolean; search: string }>
  >({
    0: { isOpen: false, search: "" },
    1: { isOpen: false, search: "" },
    2: { isOpen: false, search: "" },
  });
  const dropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      Object.keys(dropdownRefs.current).forEach((key) => {
        const index = Number(key);
        const ref = dropdownRefs.current[index];
        if (ref && !ref.contains(target) && dropdownStates[index]?.isOpen) {
          setDropdownStates((prev) => ({
            ...prev,
            [index]: { isOpen: false, search: prev[index]?.search || "" },
          }));
        }
      });
    };

    const doc = window.document;
    doc.addEventListener("mousedown", handleClickOutside);
    return () => doc.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownStates]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          Vision Models (Select up to 3)
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={onFetchModels}
            disabled={modelState.isLoading || !isValidApiKey}
            className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {modelState.isLoading ? (
              <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3 w-3" />
            )}
            Fetch
          </button>
          {lastModelFetch && (
            <div className="flex items-center text-green-400">
              <CheckCircle className="mr-1 h-4 w-4" />
              <span className="text-sm">
                Verified
                <span className="text-gray-400 ml-1">
                  (verified {formatTimestamp(lastModelFetch)})
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {modelState.error && (
        <div className="p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
          <p className="text-sm text-red-400">{modelState.error}</p>
        </div>
      )}

      {modelState.models.length > 0 && (
        <>
          <div className="text-sm text-gray-400">
            Selected: {selectedVisionModels.length} / 3
          </div>

          {/* Vision Model Selectors - Vertical Layout (3 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-visible">
            {[0, 1, 2].map((index) => {
              const selectedModelId = selectedVisionModels[index];
              const selectedModelData = selectedModelId
                ? modelState.models.find((m) => m.id === selectedModelId)
                : null;
              const isDropdownOpen = dropdownStates[index]?.isOpen || false;
              const searchValue = dropdownStates[index]?.search || "";

              // Filter models for this dropdown
              const query = searchValue.toLowerCase();
              const filteredModels = modelState.models.filter(
                (m) =>
                  m.name.toLowerCase().includes(query) ||
                  m.id.toLowerCase().includes(query),
              );

              // Separate pinned and unpinned models
              const pinnedSet = new Set(pinnedModels);
              const pinnedModelsFiltered = filteredModels.filter((m) =>
                pinnedSet.has(m.id),
              );
              const unpinnedModels = filteredModels.filter(
                (m) => !pinnedSet.has(m.id),
              );

              return (
                <div
                  key={index}
                  className="bg-[#151A21] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.35)] p-6 overflow-visible"
                >
                  <h4 className="font-semibold text-white mb-3">
                    Vision Model {index + 1}
                  </h4>

                  {/* Enhanced Dropdown with Search, Pricing, Pinning */}
                  <div
                    className="relative"
                    ref={(el) => {
                      if (el) dropdownRefs.current[index] = el;
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownStates((prev) => ({
                          ...prev,
                          [index]: {
                            isOpen: !isDropdownOpen,
                            search: searchValue,
                          },
                        }));
                      }}
                      className="w-full px-4 py-2 border-none rounded-lg focus:ring-2 focus:ring-blue-500/50 bg-white/5 hover:bg-white/10 text-left flex items-center justify-between transition-colors"
                      aria-label={`Select Vision Model ${index + 1}`}
                    >
                      <span
                        className="text-white text-sm"
                        title={
                          selectedModelData
                            ? selectedModelData.name
                            : "Select a model…"
                        }
                      >
                        {selectedModelData
                          ? middleEllipsis(selectedModelData.name, 25)
                          : "Select a model…"}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ${isDropdownOpen ? "transform rotate-180" : ""}`}
                      />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-[#1A212A] border border-white/10 rounded-lg shadow-[0_24px_56px_rgba(0,0,0,0.55)] max-h-80 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-white/6">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search models..."
                              value={searchValue}
                              onChange={(e) => {
                                setDropdownStates((prev) => ({
                                  ...prev,
                                  [index]: {
                                    isOpen: true,
                                    search: e.target.value,
                                  },
                                }));
                              }}
                              className="w-full pl-10 pr-4 py-2 border-none rounded-lg focus:ring-2 focus:ring-blue-500/50 bg-white/5 focus:bg-white/10 text-white placeholder:text-gray-500 text-sm transition-colors"
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                          </div>
                        </div>

                        <div className="overflow-y-auto flex-1">
                          {(() => {
                            const renderRow = (
                              model: (typeof modelState.models)[number],
                            ) => {
                              const isPinned = pinnedSet.has(model.id);
                              const isSelected = selectedModelId === model.id;
                              const isDisabled =
                                selectedVisionModels.includes(model.id) &&
                                !isSelected;

                              return (
                                <button
                                  key={model.id}
                                  type="button"
                                  onClick={() => {
                                    if (!isDisabled) {
                                      const newModels = [
                                        ...selectedVisionModels,
                                      ];
                                      newModels[index] = model.id;
                                      onModelSelect(newModels.filter(Boolean));
                                      setDropdownStates((prev) => ({
                                        ...prev,
                                        [index]: {
                                          isOpen: false,
                                          search: "",
                                        },
                                      }));
                                    }
                                  }}
                                  disabled={isDisabled}
                                  className={`w-full px-4 py-2 text-left hover:bg-white/5 transition-colors ${
                                    isSelected
                                      ? "bg-blue-900/30 text-blue-400"
                                      : isDisabled
                                        ? "text-gray-500 cursor-not-allowed"
                                        : "text-white"
                                  }`}
                                  title={model.name}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                      <div className="text-sm font-medium">
                                        {middleEllipsis(model.name, 30)}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {formatPrice(
                                          model.pricing.prompt +
                                            model.pricing.completion,
                                        )}
                                        /token
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      aria-label={
                                        isPinned ? "Unpin model" : "Pin model"
                                      }
                                      className="ml-3 text-gray-400 hover:text-gray-300 flex-shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onTogglePinned(model.id);
                                        onPinToast(
                                          isPinned
                                            ? "Model unpinned"
                                            : "Model pinned",
                                        );
                                      }}
                                    >
                                      {isPinned ? (
                                        <Pin className="h-4 w-4 text-blue-600" />
                                      ) : (
                                        <PinOff className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </button>
                              );
                            };

                            return (
                              <>
                                {pinnedModelsFiltered.length > 0 && (
                                  <>
                                    <div className="px-4 py-1 text-xs uppercase tracking-wide text-gray-400">
                                      Pinned
                                    </div>
                                    {pinnedModelsFiltered.map((m) =>
                                      renderRow(m),
                                    )}
                                    <div className="my-1 border-t border-white/6" />
                                  </>
                                )}
                                {unpinnedModels.map((m) => renderRow(m))}
                                {filteredModels.length === 0 && (
                                  <div className="px-4 py-3 text-sm text-gray-400 text-center">
                                    No models found
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
