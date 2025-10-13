import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { App } from "@/components/App";
import { ErrorBoundary } from "@/components/ErrorBoundary";

describe("App component", () => {
  test("renders main layout and tabs", () => {
    render(<App />);

    // Check if main layout is rendered
    expect(screen.getByRole("main")).toBeInTheDocument();

    // Check if tab navigation is present
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  test("renders ImageToPromptTab by default", () => {
    render(<App />);

    // Check if ImageToPromptTab content is visible
    expect(screen.getByText(/Image to Prompt/i)).toBeInTheDocument();
  });

  test("renders with ErrorBoundary fallback", () => {
    const MockErrorComponent = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary>
        <MockErrorComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });
});
