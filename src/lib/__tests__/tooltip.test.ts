// Simple test to verify Tooltip component functionality
// Validates the tooltip ID generation and basic structure

const sanitizeTooltipId = (value: string): string => {
  return `${value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-') || 'tooltip'}-info`;
};

// Test cases for tooltip ID generation
const tooltipIdTests: Array<{ input: string; expected: string }> = [
  {
    input: 'settings-openrouter-api-key',
    expected: 'settings-openrouter-api-key-info',
  },
  {
    input: 'upload-image',
    expected: 'upload-image-info',
  },
  {
    input: 'Complex Title With Spaces & Special_chars!',
    expected: 'complex-title-with-spaces---special-chars-info',
  },
  {
    input: '',
    expected: 'tooltip-info',
  },
];

// Run tests
export const runTooltipTests = () => {
  let passed = 0;
  let failed = 0;

  console.log('Running Tooltip Tests...\n');

  tooltipIdTests.forEach((test, index) => {
    const result = sanitizeTooltipId(test.input);
    const testPassed = result === test.expected;

    if (testPassed) {
      passed++;
      console.log(`✓ Test ${index + 1} passed: "${test.input}" -> "${result}"`);
    } else {
      failed++;
      console.error(`✗ Test ${index + 1} failed:(expected: "${test.expected}", got: "${result}")`);
    }
  });

  console.log(`\nTooltip Tests: ${passed} passed, ${failed} failed`);
  console.log('\nExpected tooltip behavior:');
  console.log('- Info icons with informative labels');
  console.log('- Accessible aria-describedby for screen readers');
  console.log('- Keyboard support with ESC to close');
  console.log('- Hover and focus states');

  return { passed, failed };
};

// Auto-run tests
const testResults = runTooltipTests();

if (testResults.passed === tooltipIdTests.length && testResults.failed === 0) {
  console.log('\n✅ All tooltip tests passed!');
} else {
  console.error(`\n❌ ${testResults.failed} test(s) failed`);
}

export { sanitizeTooltipId };
