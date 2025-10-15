import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToastProvider, useToast } from '../ToastContext';

// Test component that uses the toast context
const TestComponent = () => {
  const { toasts, addToast, removeToast, clearToasts } = useToast();

  return (
    <div>
      <button onClick={() => addToast('Test message', 'success', 5000)}>
        Add Success Toast
      </button>
      <button onClick={() => addToast('Error message', 'error', 0)}>
        Add Error Toast (No Auto-dismiss)
      </button>
      <button onClick={() => addToast('Warning message', 'warning')}>
        Add Warning Toast
      </button>
      <button onClick={() => addToast('Info message', 'info')}>
        Add Info Toast
      </button>
      {toasts.length > 0 && (
        <button onClick={() => removeToast(toasts[0]!.id)}>
          Remove First Toast
        </button>
      )}
      <button onClick={clearToasts}>Clear All Toasts</button>
      <div data-testid="toast-count">{toasts.length}</div>
      {toasts.map((toast) => (
        <div key={toast.id} data-testid={`toast-${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
};

describe('ToastContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should throw error when useToast is used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');

    consoleError.mockRestore();
  });

  it('should add toast with success type', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const addButton = screen.getByText('Add Success Toast');
    act(() => {
      addButton.click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    expect(screen.getByTestId('toast-success')).toHaveTextContent('Test message');
  });

  it('should add multiple toasts', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Success Toast').click();
      screen.getByText('Add Error Toast (No Auto-dismiss)').click();
      screen.getByText('Add Warning Toast').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('3');
  });

  it('should auto-dismiss toast after duration', async () => {
    render(
      <ToastProvider defaultDuration={1000}>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Success Toast').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
    });
  });

  it('should not auto-dismiss toast when duration is 0', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Error Toast (No Auto-dismiss)').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Toast should still be present
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
  });

  it('should manually remove specific toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Success Toast').click();
      screen.getByText('Add Error Toast (No Auto-dismiss)').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('2');

    act(() => {
      screen.getByText('Remove First Toast').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
  });

  it('should clear all toasts', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Success Toast').click();
      screen.getByText('Add Error Toast (No Auto-dismiss)').click();
      screen.getByText('Add Warning Toast').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('3');

    act(() => {
      screen.getByText('Clear All Toasts').click();
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });

  it('should use default type when not specified', () => {
    const TestDefaultType = () => {
      const { toasts, addToast } = useToast();
      return (
        <div>
          <button onClick={() => addToast('Default message')}>Add Toast</button>
          {toasts.map((toast) => (
            <div key={toast.id} data-testid={`toast-${toast.type}`}>
              {toast.message}
            </div>
          ))}
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestDefaultType />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Toast').click();
    });

    expect(screen.getByTestId('toast-info')).toHaveTextContent('Default message');
  });

  it('should generate unique IDs for each toast', () => {
    const TestUniqueIds = () => {
      const { toasts, addToast } = useToast();
      return (
        <div>
          <button onClick={() => addToast('Message')}>Add Toast</button>
          <div data-testid="toast-ids">
            {toasts.map((t) => t.id).join(',')}
          </div>
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestUniqueIds />
      </ToastProvider>
    );

    act(() => {
      screen.getByText('Add Toast').click();
      screen.getByText('Add Toast').click();
    });

    const ids = screen.getByTestId('toast-ids').textContent?.split(',') || [];
    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });
});
