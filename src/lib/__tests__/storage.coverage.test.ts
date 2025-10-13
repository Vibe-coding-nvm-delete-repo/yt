/**
 * Additional storage.ts tests to improve coverage
 * Focuses on uncovered branches and methods
 */

import { settingsStorage } from '../storage';
import type { AppSettings } from '@/types';

describe('Storage Coverage Tests', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('updatePinnedModels', () => {
    it('should update pinned models array', () => {
      const pinnedModels = ['model-1', 'model-2', 'model-3'];
      
      settingsStorage.updatePinnedModels(pinnedModels);
      
      const settings = settingsStorage.getSettings();
      expect(settings.pinnedModels).toEqual(pinnedModels);
    });

    it('should handle empty pinned models array', () => {
      settingsStorage.updatePinnedModels([]);
      
      const settings = settingsStorage.getSettings();
      expect(settings.pinnedModels).toEqual([]);
    });

    it('should persist pinned models to localStorage', () => {
      const pinnedModels = ['gpt-4-vision'];
      
      settingsStorage.updatePinnedModels(pinnedModels);
      
      const stored = localStorage.getItem('yt-settings');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.pinnedModels).toEqual(pinnedModels);
    });
  });

  describe('togglePinnedModel', () => {
    it('should add model to pinned when not present', () => {
      const modelId = 'new-model';
      
      settingsStorage.togglePinnedModel(modelId);
      
      const settings = settingsStorage.getSettings();
      expect(settings.pinnedModels).toContain(modelId);
    });

    it('should remove model from pinned when already present', () => {
      const modelId = 'existing-model';
      
      // Add it first
      settingsStorage.togglePinnedModel(modelId);
      let settings = settingsStorage.getSettings();
      expect(settings.pinnedModels).toContain(modelId);
      
      // Toggle again to remove
      settingsStorage.togglePinnedModel(modelId);
      settings = settingsStorage.getSettings();
      expect(settings.pinnedModels).not.toContain(modelId);
    });

    it('should handle multiple toggles correctly', () => {
      const modelId = 'toggle-test-model';
      
      // Add
      settingsStorage.togglePinnedModel(modelId);
      expect(settingsStorage.getSettings().pinnedModels).toContain(modelId);
      
      // Remove
      settingsStorage.togglePinnedModel(modelId);
      expect(settingsStorage.getSettings().pinnedModels).not.toContain(modelId);
      
      // Add again
      settingsStorage.togglePinnedModel(modelId);
      expect(settingsStorage.getSettings().pinnedModels).toContain(modelId);
    });

    it('should maintain other pinned models when toggling', () => {
      settingsStorage.updatePinnedModels(['model-1', 'model-2']);
      
      settingsStorage.togglePinnedModel('model-3');
      
      const settings = settingsStorage.getSettings();
      expect(settings.pinnedModels).toContain('model-1');
      expect(settings.pinnedModels).toContain('model-2');
      expect(settings.pinnedModels).toContain('model-3');
    });
  });

  describe('updateModels', () => {
    it('should update available models', () => {
      const models = [
        { id: 'model-1', name: 'Test Model 1' },
        { id: 'model-2', name: 'Test Model 2' },
      ] as any[];
      
      settingsStorage.updateModels(models);
      
      const settings = settingsStorage.getSettings();
      expect(settings.availableModels).toEqual(models);
    });

    it('should handle empty models array', () => {
      settingsStorage.updateModels([]);
      
      const settings = settingsStorage.getSettings();
      expect(settings.availableModels).toEqual([]);
    });

    it('should persist models to localStorage', () => {
      const models = [
        { id: 'test-model', name: 'Test' },
      ] as any[];
      
      settingsStorage.updateModels(models);
      
      const stored = localStorage.getItem('yt-settings');
      const parsed = JSON.parse(stored!);
      expect(parsed.availableModels).toEqual(models);
    });
  });

  describe('updateCustomPrompt', () => {
    it('should update custom prompt', () => {
      const prompt = 'Custom test prompt';
      
      settingsStorage.updateCustomPrompt(prompt);
      
      const settings = settingsStorage.getSettings();
      expect(settings.customPrompt).toBe(prompt);
    });

    it('should handle empty prompt', () => {
      settingsStorage.updateCustomPrompt('');
      
      const settings = settingsStorage.getSettings();
      expect(settings.customPrompt).toBe('');
    });

    it('should handle multi-line prompts', () => {
      const prompt = `Line 1
Line 2
Line 3`;
      
      settingsStorage.updateCustomPrompt(prompt);
      
      const settings = settingsStorage.getSettings();
      expect(settings.customPrompt).toBe(prompt);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('yt-settings', 'invalid json{{{');
      
      // Should return default settings instead of throwing
      const settings = settingsStorage.getSettings();
      expect(settings).toBeDefined();
      expect(settings.openRouterApiKey).toBe('');
    });

    it('should handle null localStorage data', () => {
      localStorage.removeItem('yt-settings');
      
      const settings = settingsStorage.getSettings();
      expect(settings).toBeDefined();
      expect(settings.availableModels).toEqual([]);
    });

    it('should handle partial settings in localStorage', () => {
      const partialSettings = {
        openRouterApiKey: 'sk-test',
        // Missing other fields
      };
      
      localStorage.setItem('yt-settings', JSON.stringify(partialSettings));
      
      const settings = settingsStorage.getSettings();
      expect(settings.openRouterApiKey).toBe('sk-test');
      expect(settings.availableModels).toBeDefined();
    });
  });

  describe('Subscription and state management', () => {
    it('should notify subscribers on settings update', () => {
      const callback = jest.fn();
      
      settingsStorage.subscribe(callback);
      settingsStorage.updatePinnedModels(['model-1']);
      
      expect(callback).toHaveBeenCalled();
    });

    it('should not notify unsubscribed callbacks', () => {
      const callback = jest.fn();
      
      const unsubscribe = settingsStorage.subscribe(callback);
      unsubscribe();
      
      settingsStorage.updatePinnedModels(['model-1']);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple subscribers', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      settingsStorage.subscribe(callback1);
      settingsStorage.subscribe(callback2);
      
      settingsStorage.updatePinnedModels(['model-1']);
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('Complex state updates', () => {
    it('should handle rapid sequential updates', () => {
      for (let i = 0; i < 10; i++) {
        settingsStorage.updatePinnedModels([`model-${i}`]);
      }
      
      const settings = settingsStorage.getSettings();
      expect(settings.pinnedModels).toEqual(['model-9']);
    });

    it('should maintain consistency across multiple operations', () => {
      const callback = jest.fn();
      settingsStorage.subscribe(callback);
      
      settingsStorage.updatePinnedModels(['model-1']);
      settingsStorage.togglePinnedModel('model-2');
      settingsStorage.updateCustomPrompt('Test prompt');
      
      expect(callback).toHaveBeenCalledTimes(3);
      
      const settings = settingsStorage.getSettings();
      expect(settings.pinnedModels).toContain('model-1');
      expect(settings.pinnedModels).toContain('model-2');
      expect(settings.customPrompt).toBe('Test prompt');
    });
  });

  describe('Data persistence', () => {
    it('should persist all settings fields', () => {
      localStorage.clear();
      
      // Update multiple settings
      settingsStorage.updateCustomPrompt('Test prompt');
      settingsStorage.updatePinnedModels(['model-1', 'model-2']);
      
      // Verify persistence
      const stored = localStorage.getItem('yt-settings');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.customPrompt).toBe('Test prompt');
      expect(parsed.pinnedModels).toEqual(['model-1', 'model-2']);
    });
  });
});
