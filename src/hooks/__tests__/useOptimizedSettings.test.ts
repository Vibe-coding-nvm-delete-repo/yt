import { renderHook, act } from '@testing-library/react';
import {
  useOptimizedSettings,
  useSettingsKey,
  useApiKey,
  useModelSelection,
  usePinnedModels,
  useCustomPrompt,
} from '../useOptimizedSettings';
import { optimizedSettingsStorage } from '@/lib/storage-optimized';
import type { VisionModel } from '@/types';

// Mock the storage
jest.mock('@/lib/storage-optimized', () => ({
  optimizedSettingsStorage: {
    getSettings: jest.fn(),
    subscribe: jest.fn(),
    subscribeToKey: jest.fn(),
    batchUpdate: jest.fn(),
    updateApiKey: jest.fn(),
    validateApiKey: jest.fn(),
    updateSelectedModel: jest.fn(),
    updateCustomPrompt: jest.fn(),
    updateModels: jest.fn(),
    pinModel: jest.fn(),
    unpinModel: jest.fn(),
  },
}));

const mockStorage = optimizedSettingsStorage as jest.Mocked<typeof optimizedSettingsStorage>;

const mockSettings = {
  openRouterApiKey: 'test-key',
  selectedModel: 'gpt-4',
  selectedVisionModels: ['gpt-4-vision'],
  customPrompt: 'test prompt',
  isValidApiKey: true,
  lastApiKeyValidation: Date.now(),
  lastModelFetch: Date.now(),
  availableModels: [
    { id: 'gpt-4', name: 'GPT-4', pricing: { prompt: 0.03, completion: 0.06 } },
    { id: 'claude-3', name: 'Claude 3', pricing: { prompt: 0.015, completion: 0.075 } },
  ] as VisionModel[],
  preferredModels: ['gpt-4'],
  pinnedModels: ['gpt-4', 'claude-3'],
};

describe('useOptimizedSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getSettings.mockReturnValue(mockSettings);
    mockStorage.subscribe.mockReturnValue(jest.fn());
  });

  it('should initialize with settings from storage', () => {
    const { result } = renderHook(() => useOptimizedSettings());
    
    expect(mockStorage.getSettings).toHaveBeenCalled();
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.settings.openRouterApiKey).toBe('test-key');
  });

  it('should subscribe to all settings changes when no keys specified', () => {
    renderHook(() => useOptimizedSettings());
    
    expect(mockStorage.subscribe).toHaveBeenCalledWith(
      expect.any(Function),
      { keys: undefined, immediate: false }
    );
  });

  it('should subscribe to specific keys when provided', () => {
    const subscribeKeys = ['openRouterApiKey', 'selectedModel'];
    renderHook(() => useOptimizedSettings(subscribeKeys));
    
    expect(mockStorage.subscribe).toHaveBeenCalledWith(
      expect.any(Function),
      { keys: subscribeKeys, immediate: false }
    );
  });

  it('should provide memoized update functions', () => {
    const { result } = renderHook(() => useOptimizedSettings());
    
    act(() => {
      result.current.updateApiKey('new-key');
    });
    
    expect(mockStorage.updateApiKey).toHaveBeenCalledWith('new-key');
  });

  it('should provide batch update functionality', () => {
    const { result } = renderHook(() => useOptimizedSettings());
    const updates = { openRouterApiKey: 'new-key', selectedModel: 'new-model' };
    
    act(() => {
      result.current.updateSettings(updates);
    });
    
    expect(mockStorage.batchUpdate).toHaveBeenCalledWith(updates);
  });
});

describe('useSettingsKey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getSettings.mockReturnValue(mockSettings);
    mockStorage.subscribeToKey.mockReturnValue(jest.fn());
  });

  it('should return value for specific key', () => {
    const { result } = renderHook(() => useSettingsKey('openRouterApiKey'));
    
    expect(result.current[0]).toBe('test-key');
    expect(mockStorage.subscribeToKey).toHaveBeenCalledWith(
      'openRouterApiKey',
      expect.any(Function),
      false
    );
  });

  it('should update specific key value', () => {
    const { result } = renderHook(() => useSettingsKey('openRouterApiKey'));
    
    act(() => {
      result.current[1]('updated-key');
    });
    
    expect(mockStorage.batchUpdate).toHaveBeenCalledWith({
      openRouterApiKey: 'updated-key',
    });
  });
});

describe('useApiKey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getSettings.mockReturnValue(mockSettings);
    mockStorage.subscribeToKey.mockReturnValue(jest.fn());
  });

  it('should return API key value and setter', () => {
    const { result } = renderHook(() => useApiKey());
    
    expect(result.current[0]).toBe('test-key');
    expect(typeof result.current[1]).toBe('function');
  });
});

describe('useModelSelection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getSettings.mockReturnValue(mockSettings);
    mockStorage.subscribe.mockReturnValue(jest.fn());
  });

  it('should return model selection data', () => {
    const { result } = renderHook(() => useModelSelection());
    
    expect(result.current.selectedModel).toBe('gpt-4');
    expect(result.current.availableModels).toHaveLength(2);
    expect(typeof result.current.setSelectedModel).toBe('function');
  });

  it('should update selected model', () => {
    const { result } = renderHook(() => useModelSelection());
    
    act(() => {
      result.current.setSelectedModel('claude-3');
    });
    
    expect(mockStorage.updateSelectedModel).toHaveBeenCalledWith('claude-3');
  });
});

describe('usePinnedModels', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getSettings.mockReturnValue(mockSettings);
    mockStorage.subscribe.mockReturnValue(jest.fn());
  });

  it('should return pinned models data', () => {
    const { result } = renderHook(() => usePinnedModels());
    
    expect(result.current.pinnedModelIds).toEqual(['gpt-4', 'claude-3']);
    expect(result.current.pinnedModels).toHaveLength(2);
    expect(result.current.pinnedModels[0].name).toBe('GPT-4');
  });

  it('should pin a model', () => {
    const { result } = renderHook(() => usePinnedModels());
    
    act(() => {
      result.current.pinModel('new-model');
    });
    
    expect(mockStorage.pinModel).toHaveBeenCalledWith('new-model');
  });

  it('should unpin a model', () => {
    const { result } = renderHook(() => usePinnedModels());
    
    act(() => {
      result.current.unpinModel('gpt-4');
    });
    
    expect(mockStorage.unpinModel).toHaveBeenCalledWith('gpt-4');
  });
});

describe('useCustomPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getSettings.mockReturnValue(mockSettings);
    mockStorage.subscribeToKey.mockReturnValue(jest.fn());
  });

  it('should return custom prompt and updater', () => {
    const { result } = renderHook(() => useCustomPrompt());
    
    expect(result.current.customPrompt).toBe('test prompt');
    expect(typeof result.current.updateCustomPrompt).toBe('function');
  });

  it('should update custom prompt', () => {
    const { result } = renderHook(() => useCustomPrompt());
    
    act(() => {
      result.current.updateCustomPrompt('new prompt');
    });
    
    expect(mockStorage.batchUpdate).toHaveBeenCalledWith({
      customPrompt: 'new prompt',
    });
  });
});
