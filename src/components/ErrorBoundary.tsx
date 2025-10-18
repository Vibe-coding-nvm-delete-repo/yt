"use client";

import type { ReactNode, ErrorInfo } from "react";
import React, { Component } from "react";
import type { AppError } from "../types/errors";
import { ErrorSeverity, createErrorFromException } from "../types/errors";
import { generateId } from "@/utils/formatting";

interface Props {
  children: ReactNode;
  fallback?: (
    error: AppError,
    retry: () => void,
    reset: () => void,
  ) => ReactNode;
  onError?: (error: AppError, errorInfo: ErrorInfo) => void;
  level?: "app" | "page" | "component";
}

interface State {
  hasError: boolean;
  error: AppError | null;
  errorId: string | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const appError = createErrorFromException(error, {
      component: "ErrorBoundary",
      operation: "render",
    });

    return {
      hasError: true,
      error: appError,
      errorId: `error_${Date.now()}_${generateId()}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Normalize optional fields to undefined for exactOptionalPropertyTypes
    const componentName =
      errorInfo.componentStack?.split("\n")[1]?.trim() ?? undefined;
    const stackTrace = errorInfo.componentStack ?? undefined;

    const appError = createErrorFromException(error, {
      component: componentName,
      operation: "render",
      stackTrace,
    });

    console.error(
      "ErrorBoundary caught an error:",
      appError.toJSON(),
      errorInfo,
    );

    if (this.props.onError) {
      this.props.onError(appError, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private retry = () => {
    const { retryCount } = this.state;

    if (retryCount >= this.maxRetries) {
      console.warn("Max retry attempts reached");
      return;
    }

    this.setState((prevState) => ({
      retryCount: prevState.retryCount + 1,
    }));

    this.retryTimeoutId = setTimeout(
      () => {
        this.setState({
          hasError: false,
          error: null,
          errorId: null,
        });
      },
      this.retryDelay * (retryCount + 1),
    );
  };

  private reset = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
    });
  };

  private getErrorIcon = (severity: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return "🚨";
      case ErrorSeverity.HIGH:
        return "⚠️";
      case ErrorSeverity.MEDIUM:
        return "⚡";
      case ErrorSeverity.LOW:
        return "ℹ️";
      default:
        return "❌";
    }
  };

  private renderDefaultFallback = (error: AppError): ReactNode => {
    const { level = "component" } = this.props;
    const { retryCount } = this.state;
    const canRetry = retryCount < this.maxRetries && error.retryable;

    return (
      <div
        style={{
          padding: level === "app" ? "2rem" : "1rem",
          margin: "1rem",
          borderRadius: "8px",
          border: "1px solid #ef4444",
          backgroundColor: "#fee2e2",
          color: "#dc2626",
          fontFamily: "system-ui, sans-serif",
        }}
        role="alert"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>
            {this.getErrorIcon(error.severity)}
          </span>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600" }}>
            {level === "app" ? "Application Error" : "Something went wrong"}
          </h3>
        </div>

        <p style={{ margin: "0 0 1rem 0", lineHeight: "1.5" }}>
          {error.userMessage}
        </p>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {canRetry && (
            <button
              onClick={this.retry}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Try Again {retryCount > 0 && `(${retryCount}/${this.maxRetries})`}
            </button>
          )}

          <button
            onClick={this.reset}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </div>
    );
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry, this.reset);
      }
      return this.renderDefaultFallback(this.state.error);
    }
    return this.props.children;
  }
}

export const AppErrorBoundary: React.FC<{
  children: ReactNode;
  onError?: Props["onError"];
}> = ({ children, onError }) => {
  const boundaryProps: Omit<Props, "children"> = { level: "app" };
  if (onError) {
    boundaryProps.onError = onError;
  }
  return <ErrorBoundary {...boundaryProps}>{children}</ErrorBoundary>;
};

export default ErrorBoundary;
