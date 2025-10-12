import { describe, it, expect } from '@jest/globals';

const getCharacterCounterInfo = (text: string | null) => {
  const charCount = text?.length || 0;
  const charLimit = 1500;
  const isOverLimit = charCount > charLimit;
  
  return {
    count: charCount,
    isOverLimit,
    color: isOverLimit ? 'red' : 'green'
  };
};

describe('character counter', () => {
  it('counts and detects over limit correctly', () => {
    expect(getCharacterCounterInfo('').count).toBe(0);
    expect(getCharacterCounterInfo(null).count).toBe(0);
    expect(getCharacterCounterInfo('A'.repeat(1500)).isOverLimit).toBe(false);
    expect(getCharacterCounterInfo('A'.repeat(1501)).isOverLimit).toBe(true);
  });
});
