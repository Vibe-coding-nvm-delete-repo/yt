import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  testEnvironment: "jsdom",
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  // Ignore legacy/manual test scripts that are not Jest-compatible.
  // These should be migrated to proper Jest tests in follow-up work.
  testPathIgnorePatterns: [
    "<rootDir>/src/components/layout/__tests__/layoutWidth.test.ts",
    "<rootDir>/src/lib/__tests__/tooltip.test.ts",
    "<rootDir>/src/lib/__tests__/characterCounter.test.ts",
    "<rootDir>/src/components/__tests__/SettingsTab.test.tsx",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
