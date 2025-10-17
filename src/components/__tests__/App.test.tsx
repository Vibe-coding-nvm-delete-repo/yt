import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { App } from "@/components/App";
import { ToastProvider } from "@/contexts/ToastContext";

// Mock lazy-loaded components for testing
jest.mock("../ImageToPromptTabs", () => ({
  __esModule: true,
  default: () => <div>Image to Prompt Content</div>,
}));

jest.mock("../BestPracticesTab", () => ({
  __esModule: true,
  default: () => <div>Best Practices Content</div>,
}));

jest.mock("../UsageTab", () => ({
  __esModule: true,
  default: () => <div>Usage Content</div>,
}));

jest.mock("../PromptCreatorTab", () => ({
  __esModule: true,
  default: () => <div>Prompt Creator Content</div>,
}));

jest.mock("../SettingsTab", () => ({
  __esModule: true,
  default: () => <div>Settings Content</div>,
}));

/**
 * App smoke tests after main restoration
 * - Keep minimal assertions that match restored UI
 */
describe("App component (restored)", () => {
  test("renders main landmark and tabs", () => {
    render(
      <ToastProvider>
        <App />
      </ToastProvider>,
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  test("shows Image to Prompt content by default", () => {
    render(
      <ToastProvider>
        <App />
      </ToastProvider>,
    );
    const nodes = screen.getAllByText(/Image to Prompt/i);
    expect(nodes.length).toBeGreaterThan(0);
  });
});
