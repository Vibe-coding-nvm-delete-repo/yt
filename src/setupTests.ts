// Jest setup file
import "@testing-library/jest-dom";

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage with in-memory storage so stateful modules work in tests
const storageBacking = new Map<string, string>();

const localStorageMock = {
  getItem: jest.fn((key: string) => {
    return storageBacking.has(key) ? storageBacking.get(key)! : null;
  }),
  setItem: jest.fn((key: string, value: string) => {
    storageBacking.set(key, value);
  }),
  removeItem: jest.fn((key: string) => {
    storageBacking.delete(key);
  }),
  clear: jest.fn(() => {
    storageBacking.clear();
  }),
  key: jest.fn(
    (index: number) => Array.from(storageBacking.keys())[index] ?? null,
  ),
  get length() {
    return storageBacking.size;
  },
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

beforeEach(() => {
  storageBacking.clear();
});

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    reload: jest.fn(),
  },
  writable: true,
});

// Mock environment variables
// NODE_ENV is automatically set to 'test' by Jest
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_APP_NAME = "Test App";
