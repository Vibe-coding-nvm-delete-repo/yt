// Simple test for character counter logic (no external dependencies)

interface CharacterCounterTest {
  input: string;
  expected: {
    count: number;
    isOverLimit: boolean;
    color: string;
  };
}

// Character counter logic extracted for testing
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

// Test cases for character counter functionality
const testCases: CharacterCounterTest[] = [
  {
    input: '',
    expected: { count: 0, isOverLimit: false, color: 'green' }
  },
  {
    input: 'A'.repeat(1500),
    expected: { count: 1500, isOverLimit: false, color: 'green' }
  },
  {
    input: 'A'.repeat(1501),
    expected: { count: 1501, isOverLimit: true, color: 'red' }
  },
  {
    input: 'This is a normal length prompt that should be well under the 1500 character limit and appear in green.',
    expected: { count: 109, isOverLimit: false, color: 'green' }
  }
];

// Run tests
export const runCharacterCounterTests = () => {
  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    const result = getCharacterCounterInfo(testCase.input);
    
    const isMatch = 
      result.count === testCase.expected.count &&
      result.isOverLimit === testCase.expected.isOverLimit &&
      result.color === testCase.expected.color;

    if (isMatch) {
      passed++;
      console.log(`✓ Test ${index + 1} passed`);
    } else {
      failed++;
      console.error(`✗ Test ${index + 1} failed:`, {
        input: testCase.input.length > 50 ? `${testCase.input.substring(0, 50)}...` : testCase.input,
        expected: testCase.expected,
        actual: result
      });
    }
  });

  console.log(`\nCharacter Counter Tests: ${passed} passed, ${failed} failed`);
  return { passed, failed };
};

// Test null input
const nullTest = getCharacterCounterInfo(null);
if (nullTest.count === 0 && !nullTest.isOverLimit && nullTest.color === 'green') {
  console.log('✓ Null input test passed');
} else {
  console.error('✗ Null input test failed:', nullTest);
}

// Export for use in component
export { getCharacterCounterInfo };
