"use client";

import React from "react";
import type { LeonardoSubject } from "@/types/leonardo";
import { SUBJECT_OPTIONS } from "@/lib/leonardo/constants";

interface SubjectSelectorProps {
  value: LeonardoSubject;
  onChange: (value: LeonardoSubject) => void;
  className?: string;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-semibold text-white">
        Main Subject
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as LeonardoSubject)}
        className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        {SUBJECT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#1A212A]">
            {option.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-400">
        {SUBJECT_OPTIONS.find((opt) => opt.value === value)?.description}
      </p>
    </div>
  );
};
