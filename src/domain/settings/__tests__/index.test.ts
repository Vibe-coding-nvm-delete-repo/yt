/**
 * Contract tests for settings domain façade
 * Validates that the façade properly delegates to storage without behavior changes
 */

import { getSettings, updateApiKey, updateCustomPrompt, updateSelectedModel, updateModels, validateApiKeySync, subscribe, validateApiKey, selectors } from '../index';
import { settingsStorage } from '@/lib/storage';

describe('Settings Domain Façade', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    settingsStorage.clearSettings();
  });

  describe('getSettings', () => {
    it('should return current settings', () => {
      const settings = getSettings();
      expect(settings).toHaveProperty('openRouterApiKey');
      expect(settings).toHaveProperty('selectedModel');
      expect(settings).toHaveProperty('customPrompt');
      expect(settings).toHaveProperty('isValidApiKey');
      expect(settings).toHaveProperty('availableModels');
    });
  });

  describe('updateApiKey', () => {
    it('should update API key', () => {
      updateApiKey('test-key');
      const settings = getSettings();
      expect(settings.openRouterApiKey).toBe('test-key');
    });

    it('should reset validation when key changes', () => {
      validateApiKeySync(true);
      updateApiKey('new-key');
      const settings = getSettings();
      expect(settings.isValidApiKey).toBe(false);
    });
  });

  describe('updateCustomPrompt', () => {
    it('should update custom prompt', () => {
      updateCustomPrompt('new prompt');
      const settings = getSettings();
      expect(settings.customPrompt).toBe('new prompt');
    });
  });

  describe('updateSelectedModel', () => {
    it('should update selected model', () => {
      updateSelectedModel('model-123');
      const settings = getSettings();
      expect(settings.selectedModel).toBe('model-123');
    });
  });

  describe('updateModels', () => {
    it('should update available models and set timestamp', () => {
      const models = [
        { id: 'model-1', name: 'Model 1', pricing: { prompt: 0.001, completion: 0.002 } },
      ];
      updateModels(models);
      const settings = getSettings();
      expect(settings.availableModels).toEqual(models);
      expect(settings.lastModelFetch).toBeGreaterThan(0);
    });
  });

  describe('validateApiKeySync', () => {
    it('should set validation state and timestamp when valid', () => {
      validateApiKeySync(true);
      const settings = getSettings();
      expect(settings.isValidApiKey).toBe(true);
      expect(settings.lastApiKeyValidation).toBeGreaterThan(0);
    });

    it('should set validation state when invalid', () => {
      validateApiKeySync(false);
      const settings = getSettings();
      expect(settings.isValidApiKey).toBe(false);
    });
  });

  describe('subscribe', () => {
    it('should notify listeners on changes', (done) => {
      const unsubscribe = subscribe(() => {
        const settings = getSettings();
        expect(settings.openRouterApiKey).toBe('subscribed-key');
        unsubscribe();
        done();
      });
      
      updateApiKey('subscribed-key');
    });
  });

  describe('validateApiKey (pure function)', () => {
    it('should return ok for valid format', () => {
      const result = validateApiKey('sk-or-v1-1234567890abcdef');
      expect(result.ok).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should return error for empty key', () => {
      const result = validateApiKey('');
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('API key is required');
    });

    it('should return error for invalid format', () => {
      const result = validateApiKey('invalid-key');
      expect(result.ok).toBe(false);
      expect(result.reason).toContain('Invalid API key format');
    });
  });

  describe('selectors', () => {
    it('should check if API key exists', () => {
      expect(selectors.hasApiKey(getSettings())).toBe(false);
      updateApiKey('test-key');
      expect(selectors.hasApiKey(getSettings())).toBe(true);
    });

    it('should check if API key is valid', () => {
      expect(selectors.hasValidApiKey(getSettings())).toBe(false);
      validateApiKeySync(true);
      expect(selectors.hasValidApiKey(getSettings())).toBe(true);
    });

    it('should check if custom prompt exists', () => {
      expect(selectors.hasCustomPrompt(getSettings())).toBe(true); // Has default
      updateCustomPrompt('');
      expect(selectors.hasCustomPrompt(getSettings())).toBe(false);
      updateCustomPrompt('new prompt');
      expect(selectors.hasCustomPrompt(getSettings())).toBe(true);
    });

    it('should check if model is selected', () => {
      expect(selectors.hasSelectedModel(getSettings())).toBe(false);
      updateSelectedModel('model-123');
      expect(selectors.hasSelectedModel(getSettings())).toBe(true);
    });

    it('should check if models are available', () => {
      expect(selectors.hasAvailableModels(getSettings())).toBe(false);
      updateModels([{ id: 'm1', name: 'Model 1', pricing: { prompt: 0.001, completion: 0.002 } }]);
      expect(selectors.hasAvailableModels(getSettings())).toBe(true);
    });
  });
});
