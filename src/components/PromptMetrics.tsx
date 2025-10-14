"use client";

import React from "react";
import type { DetailedGenerationCost } from "@/types";
import { Calculator, DollarSign, FileText, Zap } from "lucide-react";

interface PromptMetricsProps {
  modelName: string;
  promptText: string;
  cost: DetailedGenerationCost;
  className?: string;
}

export const PromptMetrics: React.FC<PromptMetricsProps> = ({
  modelName,
  promptText,
  cost,
  className = "",
}) => {
  const characterCount = promptText.length;
  const estimatedTokens = Math.ceil(characterCount / 3.75); // More accurate token estimation

  const formatCost = (costValue: number): string => {
    return `$${costValue.toFixed(6)}`;
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-center mb-3">
        <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Generation Metrics
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Model Information */}
        <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex-shrink-0">
            <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              Model
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={modelName}>
              {modelName}
            </p>
          </div>
        </div>

        {/* Text Statistics */}
        <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex-shrink-0">
            <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Text Stats
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatNumber(characterCount)} chars • {formatNumber(estimatedTokens)} tokens
            </p>
          </div>
        </div>

        {/* Input Cost */}
        <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex-shrink-0">
            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Input Cost
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-mono">
              {formatCost(cost.inputCost)}
            </p>
          </div>
        </div>

        {/* Output Cost */}
        <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex-shrink-0">
            <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Output Cost
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400 font-mono">
              {formatCost(cost.outputCost)}
            </p>
          </div>
        </div>
      </div>

      {/* Total Cost Section */}
      <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-gray-900 dark:text-white">
              Total Generation Cost
            </span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600 dark:text-green-400 font-mono">
              {formatCost(cost.totalCost)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Input + Output
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptMetrics;
