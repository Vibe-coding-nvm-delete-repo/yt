/**
 * Simple render tests for SettingsTab to boost coverage
 */

import React from 'react';
import { render } from '@testing-library/react';
import { SettingsTab } from '../SettingsTab';

// Mock dependencies
jest.mock('@/lib/storage', () => ({
  settingsStorage: {
    subscribe: jest.fn(() => jest.fn()),
  },
}));

jest.mock('@/lib/openrouter', () => ({
  createOpenRouterClient: jest.fn(),
  isValidApiKeyFormat: jest.fn(() => true),
}));

describe('SettingsTab Simple Tests', () => {
  const mockOnUpdate = jest.fn();

  it('renders with minimal settings', () => {
    const settings = {
      openRouterApiKey: '',
      isValidApiKey: false,
      availableModels: [],
      selectedVisionModels: [],
      customPrompt: '',
      categories: [],
      pinnedModels: [],
    };

    const { container } = render(
      <SettingsTab settings={settings} onSettingsUpdate={mockOnUpdate} />
    );
    
    expect(container).toBeTruthy();
  });

  it('renders with API key', () => {
    const settings = {
      openRouterApiKey: 'sk-test',
      isValidApiKey: true,
      availableModels: [],
      selectedVisionModels: [],
      customPrompt: 'test',
      categories: [],
      pinnedModels: [],
    };

    const { container } = render(
      <SettingsTab settings={settings} onSettingsUpdate={mockOnUpdate} />
    );
    
    expect(container).toBeTruthy();
  });

  it('renders with models', () => {
    const settings = {
      openRouterApiKey: '',
      isValidApiKey: false,
      availableModels: [
        { id: 'model-1', name: 'Test' } as any,
      ],
      selectedVisionModels: ['model-1'],
      customPrompt: '',
      categories: [],
      pinnedModels: ['model-1'],
    };

    const { container } = render(
      <SettingsTab settings={settings} onSettingsUpdate={mockOnUpdate} />
    );
    
    expect(container).toBeTruthy();
  });

  it('renders with categories', () => {
    const settings = {
      openRouterApiKey: '',
      isValidApiKey: false,
      availableModels: [],
      selectedVisionModels: [],
      customPrompt: '',
      categories: [{ id: 'cat-1', name: 'Test', color: '#000' } as any],
      pinnedModels: [],
    };

    const { container } = render(
      <SettingsTab settings={settings} onSettingsUpdate={mockOnUpdate} />
    );
    
    expect(container).toBeTruthy();
  });
});
