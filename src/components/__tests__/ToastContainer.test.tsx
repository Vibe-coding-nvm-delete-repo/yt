import React from "react";
import { render, screen } from "@testing-library/react";
import { ToastContainer } from "../ToastContainer";
import { ToastProvider, useToast } from "@/contexts/ToastContext";

// Mock the Toast component since we're testing container only
jest.mock("../Toast", () => ({
  __esModule: true,
  default: ({ toast, onDismiss }: any) => (
    <div data-testid={`toast-${toast.id}`}>
      {toast.message}
      <button onClick={() => onDismiss(toast.id)}>Dismiss</button>
    </div>
  ),
}));

describe("ToastContainer", () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ToastProvider>{children}</ToastProvider>
  );

  it("should render null when there are no toasts", () => {
    const { container } = render(
      <TestWrapper>
        <ToastContainer />
      </TestWrapper>,
    );

    expect(container.querySelector('[aria-label="Notifications"]')).toBeNull();
  });

  it("should render toasts when they exist", () => {
    const TestComponent = () => {
      const { addToast } = useToast();

      React.useEffect(() => {
        addToast("Test toast 1", "success", 0);
        addToast("Test toast 2", "error", 0);
      }, [addToast]);

      return <ToastContainer />;
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    expect(screen.getByText("Test toast 1")).toBeInTheDocument();
    expect(screen.getByText("Test toast 2")).toBeInTheDocument();
  });

  it("should render toast container with proper accessibility attributes", () => {
    const TestComponent = () => {
      const { addToast } = useToast();

      React.useEffect(() => {
        addToast("Accessible toast", "info", 0);
      }, [addToast]);

      return <ToastContainer />;
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    const container = screen.getByLabelText("Notifications");
    expect(container).toHaveAttribute("aria-live", "polite");
  });

  it("should render each toast with unique key", () => {
    const TestComponent = () => {
      const { addToast } = useToast();

      React.useEffect(() => {
        addToast("First", "success", 0);
        addToast("Second", "warning", 0);
      }, [addToast]);

      return <ToastContainer />;
    };

    const { container } = render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    const toastElements = container.querySelectorAll(
      '[class*="pointer-events-auto"]',
    );
    expect(toastElements).toHaveLength(2);
  });

  it("should pass removeToast callback to Toast components", () => {
    const TestComponent = () => {
      const { addToast } = useToast();

      React.useEffect(() => {
        addToast("Test", "success", 0);
      }, [addToast]);

      return <ToastContainer />;
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("Dismiss")).toBeInTheDocument();
  });
});
