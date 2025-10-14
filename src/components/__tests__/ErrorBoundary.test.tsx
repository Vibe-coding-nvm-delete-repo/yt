import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, AppErrorBoundary } from '../ErrorBoundary';
import { AppError, ErrorType } from '../../types/errors';

// Test component that throws errors
const ThrowError: React.FC<{ shouldThrow?: boolean; error?: Error }> = ({ 
  shouldThrow = false, 
  error = new Error('Test error') 
}) => {
  if (shouldThrow) {
    throw error;
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should catch and display errors', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should show retry button for retryable errors', () => {
    const retryableError = new AppError(
      ErrorType.NETWORK,
      'Network error',
      'Connection failed',
      { retryable: true }
    );
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} error={retryableError} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });

  it('should call onError callback', () => {
    const onError = jest.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('should reset error state', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should handle app-level errors differently', () => {
    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow={true} />
      </AppErrorBoundary>
    );
    
    expect(screen.getByText('Application Error')).toBeInTheDocument();
  });

  it('should use custom fallback', () => {
    const customFallback = (error: AppError, retry: () => void, reset: () => void) => (
      <div data-testid="custom-fallback">Custom error: {error.message}</div>
    );
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom error: Test error')).toBeInTheDocument();
  });

  it('should limit retry attempts', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const retryButton = screen.getByText(/try again/i);
    
    // Click retry 3 times (max)
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);
    
    // Should show max attempts reached
    expect(screen.getByText(/3\/3/)).toBeInTheDocument();
  });
});