"use client";

import React from "react";
import type { PromptCreatorField } from "@/types/promptCreator";

export interface PromptCreatorFormProps {
  visibleFields: PromptCreatorField[];
  draggedFieldId: string | null;
  onFieldDragStart: (fieldId: string) => void;
  onFieldDrop: (fieldId: string) => void;
  onFieldDelete: (fieldId: string) => void;
  renderFieldControl: (field: PromptCreatorField) => React.ReactNode;
}

export const PromptCreatorForm: React.FC<PromptCreatorFormProps> = ({
  visibleFields,
  draggedFieldId,
  onFieldDragStart,
  onFieldDrop,
  onFieldDelete,
  renderFieldControl,
}) => (
  <section className="space-y-4 rounded-lg border border-white/5 bg-gray-900/30 p-4">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-100">
        All Fields
        {visibleFields.length > 0 && (
          <span className="ml-2 text-sm text-gray-400">
            ({visibleFields.length} fields)
          </span>
        )}
      </h2>
      <p className="text-xs text-gray-400">
        Drag to reorder • Edit fields inline or in Settings
      </p>
    </div>

    {visibleFields.length === 0 ? (
      <div className="text-center py-8">
        <p className="text-sm text-gray-400 mb-4">
          No fields configured yet. Add fields in Settings → Prompt Creator.
        </p>
      </div>
    ) : (
      <div className="space-y-3">
        {visibleFields.map((field) => (
          <div
            key={field.id}
            draggable
            onDragStart={() => onFieldDragStart(field.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onFieldDrop(field.id)}
            className={`space-y-2 rounded-lg border border-white/10 bg-gray-900/40 p-4 cursor-move transition-colors hover:border-blue-400/50 ${
              draggedFieldId === field.id ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">⋮⋮</span>
                {renderFieldControl(field)}
              </div>
              <button
                type="button"
                onClick={() => onFieldDelete(field.id)}
                className="rounded-md border border-white/10 px-2 py-1 text-xs text-gray-400 hover:border-red-400 hover:text-red-300"
                title="Hide field"
              >
                Hide
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);
