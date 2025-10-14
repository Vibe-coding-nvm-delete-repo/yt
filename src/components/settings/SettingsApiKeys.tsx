'use client';

import React from 'react';
import { Key, RefreshCw, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { Tooltip } from '@/components/common/Tooltip';
import type { ExtendedValidationState } from '@/types/validation';

export type SettingsApiKeysProps = {
  apiKey: string;
  showApiKey: boolean;
  validation: ExtendedValidationState;
  onApiKeyChange: (value: string) => void;
  onToggleShow: () => void;
  onValidate: () => void;
  tooltipText?: string;
  validatedAtLabel?: string;
};

const DEFAULT_TOOLTIP =
  'Paste your OpenRouter API key (starts with sk-or-v1-). Toggle visibility as needed, then click Validate to confirm before fetching models.';

export const SettingsApiKeys: React.FC<SettingsApiKeysProps> = ({
  apiKey,
  showApiKey,
  validation,
  onApiKeyChange,
  onToggleShow,
  onValidate,
  tooltipText = DEFAULT_TOOLTIP,
  validatedAtLabel,
}) => (
  <div className="space-y-4">
    <div className="flex items-center text-gray-900 dark:text-white">
      <Key className="mr-2 h-5 w-5" />
      <h3 className="text-lg font-semibold">OpenRouter API Key</h3>
      <Tooltip
        id="settings-openrouter-api-key"
        label="More information about the OpenRouter API key"
        message={tooltipText}
      />
      {validation.isValid && (
        <CheckCircle className="ml-2 h-4 w-4 text-green-600" aria-hidden="true" />
      )}
    </div>

    <div className="space-y-3">
      <div className="relative">
        <input
          type={showApiKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(event) => onApiKeyChange(event.target.value)}
          placeholder="sk-or-v1-..."
          className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
        >
          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onValidate}
          disabled={validation.isValidating || !apiKey.trim()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {validation.isValidating ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Validate API Key
        </button>

        {validation.isValid && (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircle className="mr-1 h-4 w-4" />
            <span className="text-sm">
              API key is valid
              {validatedAtLabel && (
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  (validated {validatedAtLabel})
                </span>
              )}
            </span>
          </div>
        )}

        {validation.error && (
          <div className="flex items-center text-red-600 dark:text-red-400">
            <XCircle className="mr-1 h-4 w-4" />
            <span className="text-sm">{validation.error}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);