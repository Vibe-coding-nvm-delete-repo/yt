import { describe, it, expect } from '@jest/globals';

const sanitizeTooltipId = (value: string): string => {
  return `${value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-') || 'tooltip'}-info`;
};

describe('tooltip utils', () => {
  it('sanitizes ids correctly', () => {
    expect(sanitizeTooltipId('settings-openrouter-api-key')).toBe('settings-openrouter-api-key-info');
    expect(sanitizeTooltipId('')).toBe('tooltip-info');
    expect(sanitizeTooltipId('Complex Title With Spaces & Special_chars!')).toBe('complex-title-with-spaces---special-chars-info');
  });
});
