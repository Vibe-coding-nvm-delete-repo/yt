import { settingsStorage } from '../storage';

describe('SettingsStorage - pinnedModels', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should have empty pinnedModels by default', () => {
    const settings = settingsStorage.getSettings();
    expect(Array.isArray(settings.pinnedModels)).toBe(true);
    expect(settings.pinnedModels).toEqual([]);
  });

  it('updatePinnedModels should dedupe and cap at 9 items, preserving first occurrence order', () => {
    const input = [
      'a', 'b', 'c', 'a', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'b',
    ];
    settingsStorage.updatePinnedModels(input);
    const { pinnedModels } = settingsStorage.getSettings();

    // First occurrences only
    const expectedOrder = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']; // capped at 9
    expect(pinnedModels).toEqual(expectedOrder);
  });

  it('pinModel should add to the front and cap at 9', () => {
    settingsStorage.updatePinnedModels(['b', 'c']); // existing
    settingsStorage.pinModel('a');
    let { pinnedModels } = settingsStorage.getSettings();
    expect(pinnedModels.slice(0, 3)).toEqual(['a', 'b', 'c']);

    // Fill up to 9
    settingsStorage.updatePinnedModels(['1','2','3','4','5','6','7','8','9']);
    settingsStorage.pinModel('x'); // push to front, cap at 9
    ({ pinnedModels } = settingsStorage.getSettings());
    expect(pinnedModels.length).toBe(9);
    expect(pinnedModels[0]).toBe('x');
  });

  it('unpinModel should remove the model if present', () => {
    settingsStorage.updatePinnedModels(['a', 'b', 'c']);
    settingsStorage.unpinModel('b');
    const { pinnedModels } = settingsStorage.getSettings();
    expect(pinnedModels).toEqual(['a', 'c']);
  });

  it('togglePinnedModel should pin when absent and unpin when present', () => {
    settingsStorage.updatePinnedModels(['a', 'b']);
    settingsStorage.togglePinnedModel('c');
    let { pinnedModels } = settingsStorage.getSettings();
    expect(pinnedModels.includes('c')).toBe(true);

    settingsStorage.togglePinnedModel('c');
    ({ pinnedModels } = settingsStorage.getSettings());
    expect(pinnedModels.includes('c')).toBe(false);
  });

  it('pinnedModels should persist via getSettings/localStorage', () => {
    const arr = ['m1', 'm2', 'm3'];
    settingsStorage.updatePinnedModels(arr);
    const fresh = settingsStorage.getSettings();
    expect(fresh.pinnedModels).toEqual(arr);
  });
});
