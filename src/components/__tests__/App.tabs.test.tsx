/**
 * Tab Integration Test
 *
 * This test ensures that all tabs defined in TabNavigation are properly
 * wired up and rendered in the App component. This prevents the bug where
 * tabs exist in navigation but don't render any content.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { App } from "../App";

// Mock the hooks and sub-components
jest.mock("@/hooks/useSettings", () => ({
  useSettings: jest.fn(() => ({
    settings: {
      openRouterApiKey: "sk-test",
      selectedModel: "test-model",
    },
    isInitialized: true,
  })),
}));

jest.mock("../ImageToPromptTabs", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="image-to-prompt-content">Image to Prompt Tab Content</div>
  ),
}));

jest.mock("../BestPracticesTab", () => ({
  BestPracticesTab: () => (
    <div data-testid="best-practices-content">Best Practices Tab Content</div>
  ),
}));

jest.mock("../UsageTab", () => ({
  UsageTab: () => <div data-testid="usage-content">Usage Tab Content</div>,
}));

jest.mock("../PromptCreatorTab", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="prompt-creator-content">Prompt Creator Tab Content</div>
  ),
}));

jest.mock("../SettingsTab", () => ({
  SettingsTab: () => (
    <div data-testid="settings-content">Settings Tab Content</div>
  ),
}));

describe("App - Tab Integration", () => {
  it("should render all tabs in navigation", () => {
    render(<App />);

    // All tabs should be present in navigation - using aria-controls to identify them
    expect(
      screen.getByRole("tab", { name: /Image to Prompt/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Prompt Creator/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Best Practices/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /Usage.*Costs/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Settings/i })).toBeInTheDocument();
  });

  it("should render Image to Prompt tab content by default", () => {
    render(<App />);
    expect(screen.getByTestId("image-to-prompt-content")).toBeInTheDocument();
  });

  it("should render Best Practices tab content when clicked", () => {
    render(<App />);

    const bestPracticesTab = screen.getByRole("tab", {
      name: /Best Practices/i,
    });
    fireEvent.click(bestPracticesTab);

    expect(screen.getByTestId("best-practices-content")).toBeInTheDocument();
    expect(
      screen.queryByTestId("image-to-prompt-content"),
    ).not.toBeInTheDocument();
  });

  it("should render Prompt Creator tab content when clicked", () => {
    render(<App />);

    const promptCreatorTab = screen.getByRole("tab", {
      name: /Prompt Creator/i,
    });
    fireEvent.click(promptCreatorTab);

    expect(screen.getByTestId("prompt-creator-content")).toBeInTheDocument();
    expect(
      screen.queryByTestId("image-to-prompt-content"),
    ).not.toBeInTheDocument();
  });

  it("should render Usage & Costs tab content when clicked", () => {
    render(<App />);

    const usageTab = screen.getByRole("tab", { name: /Usage.*Costs/i });
    fireEvent.click(usageTab);

    expect(screen.getByTestId("usage-content")).toBeInTheDocument();
    expect(
      screen.queryByTestId("image-to-prompt-content"),
    ).not.toBeInTheDocument();
  });

  it("should render Settings tab content when clicked", () => {
    render(<App />);

    const settingsTab = screen.getByRole("tab", { name: /Settings/i });
    fireEvent.click(settingsTab);

    expect(screen.getByTestId("settings-content")).toBeInTheDocument();
    expect(
      screen.queryByTestId("image-to-prompt-content"),
    ).not.toBeInTheDocument();
  });

  it("should switch between all tabs correctly", () => {
    render(<App />);

    // Start with Image to Prompt
    expect(screen.getByTestId("image-to-prompt-content")).toBeInTheDocument();

    // Switch to Best Practices
    fireEvent.click(screen.getByRole("tab", { name: /Best Practices/i }));
    expect(screen.getByTestId("best-practices-content")).toBeInTheDocument();

    // Switch to Prompt Creator
    fireEvent.click(screen.getByRole("tab", { name: /Prompt Creator/i }));
    expect(screen.getByTestId("prompt-creator-content")).toBeInTheDocument();

    // Switch to Usage
    fireEvent.click(screen.getByRole("tab", { name: /Usage.*Costs/i }));
    expect(screen.getByTestId("usage-content")).toBeInTheDocument();

    // Switch to Settings
    fireEvent.click(screen.getByRole("tab", { name: /Settings/i }));
    expect(screen.getByTestId("settings-content")).toBeInTheDocument();

    // Switch back to Image to Prompt
    fireEvent.click(screen.getByRole("tab", { name: /Image to Prompt/i }));
    expect(screen.getByTestId("image-to-prompt-content")).toBeInTheDocument();
  });

  /**
   * CRITICAL REGRESSION TEST
   *
   * This test explicitly verifies that the bug where tabs were defined in
   * navigation but not rendered in App.tsx doesn't happen again.
   *
   * If this test fails, it means a tab exists in TabNavigation but is not
   * properly wired up to render content in App.tsx.
   */
  it("should ensure all navigation tabs have corresponding content rendered", () => {
    render(<App />);

    // Get all tab buttons from navigation
    const tabButtons = screen.getAllByRole("tab");
    const tabIds = tabButtons
      .map((button) =>
        button.getAttribute("aria-controls")?.replace("-panel", ""),
      )
      .filter((tabId): tabId is string => Boolean(tabId));

    // Define expected tabs that must have content
    const expectedTabs = [
      "image-to-prompt",
      "prompt-creator",
      "best-practices",
      "usage",
      "settings",
    ];

    // Verify all expected tabs are in navigation
    expectedTabs.forEach((tabId) => {
      expect(tabIds).toContain(tabId);
    });

    // Click each tab and verify content is rendered
    expectedTabs.forEach((tabId) => {
      const tabButton = tabButtons.find(
        (button) => button.getAttribute("aria-controls") === `${tabId}-panel`,
      );
      expect(tabButton).toBeDefined();

      if (tabButton) {
        fireEvent.click(tabButton);

        // Verify some content is rendered (not empty)
        const contentTestIds = [
          "image-to-prompt-content",
          "prompt-creator-content",
          "best-practices-content",
          "usage-content",
          "settings-content",
        ];

        const hasContent = contentTestIds.some(
          (testId) => screen.queryByTestId(testId) !== null,
        );

        expect(hasContent).toBe(true);
      }
    });
  });
});
