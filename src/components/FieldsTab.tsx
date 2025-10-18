"use client";

import React, { useMemo, useState, useEffect } from "react";
import { promptCreatorConfigStorage } from "@/lib/promptCreatorStorage";
import type { PromptCreatorField } from "@/types/promptCreator";
import {
  ChevronRight,
  List,
  Hash,
  Type,
  CheckSquare,
  Sliders,
  Settings,
} from "lucide-react";

/**
 * FieldsTab - Read-only view of configured prompt creator fields
 * Displays fields in a clean, scannable card format
 */
export const FieldsTab: React.FC = () => {
  const [fields, setFields] = useState<PromptCreatorField[]>(() => {
    // Initialize state with fields from storage
    const config = promptCreatorConfigStorage.load();
    return config.fields;
  });

  const [lockedInPrompt, setLockedInPrompt] = useState<string>(() => {
    const config = promptCreatorConfigStorage.load();
    return config.lockedInPrompt;
  });

  useEffect(() => {
    // Listen for storage changes
    const handleStorageChange = () => {
      const updatedConfig = promptCreatorConfigStorage.load();
      setFields(updatedConfig.fields);
      setLockedInPrompt(updatedConfig.lockedInPrompt);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Sort fields by tier and order
  const orderedFields = useMemo(
    () =>
      [...fields]
        .filter((field) => !field.hidden)
        .sort((a, b) => {
          const tierOrder = { mandatory: 0, optional: 1, free: 2 } as const;
          if (a.tier !== b.tier) {
            return tierOrder[a.tier] - tierOrder[b.tier];
          }
          return a.order - b.order;
        }),
    [fields],
  );

  // Group fields by tier
  const groupedFields = useMemo(() => {
    const mandatory = orderedFields.filter((f) => f.tier === "mandatory");
    const optional = orderedFields.filter((f) => f.tier === "optional");
    const free = orderedFields.filter((f) => f.tier === "free");
    return { mandatory, optional, free };
  }, [orderedFields]);

  // Get icon for field type
  const getTypeIcon = (type: PromptCreatorField["type"]) => {
    switch (type) {
      case "dropdown":
        return <List className="h-4 w-4" />;
      case "multiselect":
        return <CheckSquare className="h-4 w-4" />;
      case "slider":
        return <Sliders className="h-4 w-4" />;
      case "number":
        return <Hash className="h-4 w-4" />;
      case "text":
        return <Type className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  // Get color for tier badge
  const getTierColor = (tier: PromptCreatorField["tier"]) => {
    switch (tier) {
      case "mandatory":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "optional":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "free":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  // Render a single field card
  const renderFieldCard = (field: PromptCreatorField) => (
    <div
      key={field.id}
      className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 transition-all hover:border-white/20 hover:from-white/8 hover:to-white/[0.04] hover:shadow-lg"
    >
      {/* Header with label and tier */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white truncate mb-1.5">
            {field.label}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getTierColor(field.tier)}`}
            >
              {field.tier}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700/40 text-gray-300 border border-gray-600/30">
              {getTypeIcon(field.type)}
              <span className="capitalize">{field.type}</span>
            </span>
            <span className="text-xs text-gray-500">#{field.order}</span>
          </div>
        </div>
      </div>

      {/* Helper text */}
      {field.helperText && (
        <p className="text-sm text-gray-400 mb-3 leading-relaxed">
          {field.helperText}
        </p>
      )}

      {/* Type-specific details */}
      <div className="space-y-2">
        {/* Dropdown/Multiselect options */}
        {(field.type === "dropdown" || field.type === "multiselect") &&
          field.options &&
          field.options.length > 0 && (
            <div className="rounded-md bg-black/20 p-3 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <List className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Options
                  {field.type === "multiselect" && field.maxSelections && (
                    <span className="ml-1 text-gray-500">
                      (max {field.maxSelections})
                    </span>
                  )}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {field.options.map((option, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2 py-1 rounded text-xs bg-white/5 text-gray-300 border border-white/10"
                  >
                    {option}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Slider/Number range */}
        {(field.type === "slider" || field.type === "number") && (
          <div className="rounded-md bg-black/20 p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Hash className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Range
              </span>
            </div>
            <p className="text-sm text-gray-300">
              <span className="font-mono font-semibold">{field.min}</span>
              <span className="mx-2 text-gray-500">→</span>
              <span className="font-mono font-semibold">{field.max}</span>
              <span className="ml-2 text-gray-500">
                (step: {field.step ?? 1})
              </span>
            </p>
          </div>
        )}

        {/* Text max length */}
        {field.type === "text" && field.maxLength && (
          <div className="rounded-md bg-black/20 p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Type className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Max Length
              </span>
            </div>
            <p className="text-sm text-gray-300">
              <span className="font-mono font-semibold">{field.maxLength}</span>
              <span className="ml-1 text-gray-500">characters</span>
            </p>
          </div>
        )}

        {/* Default value if present */}
        {field.defaultValue && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">Default:</span>{" "}
            <span className="text-gray-400">
              {Array.isArray(field.defaultValue)
                ? field.defaultValue.join(", ")
                : String(field.defaultValue)}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // Empty state
  if (orderedFields.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Fields</h1>
        <div className="rounded-xl bg-[#151A21] p-12 shadow-[0_8px_24px_rgba(0,0,0,0.35)] text-center">
          <Settings className="h-16 w-16 mx-auto mb-4 text-gray-600" />
          <h2 className="text-xl font-semibold text-white mb-2">
            No Fields Created Yet
          </h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Get started by creating your first prompt creator field in the
            Settings tab. Fields help you structure and organize your prompt
            generation workflow.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 text-sm">
            <span>Go to Settings</span>
            <ChevronRight className="h-4 w-4" />
            <span>Prompt Creator</span>
          </div>
        </div>
      </div>
    );
  }

  // Render section for a tier group
  const renderSection = (
    title: string,
    fields: PromptCreatorField[],
    description: string,
  ) => {
    if (fields.length === 0) return null;

    return (
      <section className="space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <span className="text-sm text-gray-500">({fields.length})</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <p className="text-sm text-gray-400 mb-4">{description}</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fields.map(renderFieldCard)}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Fields</h1>
        <span className="text-sm text-gray-500">
          {orderedFields.length} field{orderedFields.length !== 1 ? "s" : ""}{" "}
          configured
        </span>
      </div>

      <p className="text-gray-400 text-sm">
        These fields define the structure of your prompt creator. Manage them in{" "}
        <span className="text-blue-400">Settings → Prompt Creator</span>.
      </p>

      {/* Locked-in Prompt Display */}
      <div className="rounded-xl bg-[#151A21] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Locked-in Prompt</h2>
          <span className="text-xs text-gray-500 italic">
            Always prepended to generated prompts
          </span>
        </div>
        {lockedInPrompt ? (
          <div className="rounded-lg border border-white/5 bg-black/20 p-4">
            <p className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words">
              {lockedInPrompt}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <p className="text-sm text-yellow-200">
              No locked-in prompt configured. Set one in{" "}
              <span className="text-yellow-100 font-medium">
                Settings → Prompt Creator
              </span>{" "}
              to ensure consistency across all generated prompts.
            </p>
          </div>
        )}
      </div>

      {/* Generate Context */}
      <div className="rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] border-2 border-blue-500/30">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">
            Prompt Generation
          </h2>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-200 text-xs font-medium">
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Go to Prompt Creator to generate</span>
          </div>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          The{" "}
          <span className="text-blue-300 font-semibold">Generate button</span>{" "}
          in the Prompt Creator tab combines the locked-in prompt above with
          your field selections to create complete, rated prompts. All fields
          configured here will be available for selection during generation.
        </p>
      </div>

      <div className="space-y-8">
        {renderSection(
          "Mandatory Fields",
          groupedFields.mandatory,
          "Required fields that must be filled before generating prompts",
        )}
        {renderSection(
          "Optional Fields",
          groupedFields.optional,
          "Guided fields that can be skipped but provide helpful structure",
        )}
        {renderSection(
          "Free Fields",
          groupedFields.free,
          "Flexible fields with no restrictions for creative exploration",
        )}
      </div>

      {orderedFields.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No visible fields. All fields may be hidden.</p>
        </div>
      )}
    </div>
  );
};

export default FieldsTab;
