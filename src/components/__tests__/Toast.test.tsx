import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Toast } from '../Toast';
import type { Toast as ToastType } from '@/contexts/ToastContext';

describe('Toast Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const mockOnDismiss = jest.fn();

  const createMockToast = (overrides?: Partial<ToastType>): ToastType => ({
    id: 'test-toast-1',
    type: 'info',
    message: 'Test message',
    duration: 4000,
    ...overrides,
  });

  it('should render toast with message', () => {
    const toast = createMockToast();
    render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render success toast with correct styling', () => {
    const toast = createMockToast({ type: 'success' });
    const { container } = render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

    // eslint-disable-next-line custom/no-dom-manipulation
    const toastElement = container.querySelector('[role="alert"]');
    expect(toastElement).toHaveClass('bg-green-900/90');
  });

  it('should render error toast with correct styling', () => {
    const toast = createMockToast({ type: 'error' });
    const { container } = render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

    // eslint-disable-next-line custom/no-dom-manipulation
    const toastElement = container.querySelector('[role="alert"]');
    expect(toastElement).toHaveClass('bg-red-900/90');
  });

  it('should render warning toast with correct styling', () => {
    const toast = createMockToast({ type: 'warning' });
    const { container } = render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

    // eslint-disable-next-line custom/no-dom-manipulation
    const toastElement = container.querySelector('[role="alert"]');
    expect(toastElement).toHaveClass('bg-amber-900/90');
  });

  it('should render info toast with correct styling', () => {
    const toast = createMockToast({ type: 'info' });
    const { container } = render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

    // eslint-disable-next-line custom/no-dom-manipulation
    const toastElement = container.querySelector('[role="alert"]');
    expect(toastElement).toHaveClass('bg-blue-900/90');
  });

  it('should have proper ARIA attributes', () => {
    const toast = createMockToast();
    render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

    const toastElement = screen.getByRole('alert');
    expect(toastElement).toHaveAttribute('aria-live', 'polite');
    expect(toastElement).toHaveAttribute('aria-atomic', 'true');
  });

  it('should call onDismiss when close button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const toast = createMockToast();
    render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

    const dismissButton = screen.getByLabelText('Dismiss notification');
    await user.click(dismissButton);

    // Wait for exit animation
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnDismiss).toHaveBeenCalledWith('test-toast-1');
  });

  it('should start exit animation before auto-dismiss', () => {
    const toast = createMockToast({ duration: 4000 });
    const { container } = render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

    // eslint-disable-next-line custom/no-dom-manipulation
    const toastElement = container.querySelector('[role="alert"]');
    expect(toastElement).not.toHaveClass('opacity-0');

    // Advance to just before exit animation (duration - 300ms)
    act(() => {
      jest.advanceTimersByTime(3700);
    });

    expect(toastElement).toHaveClass('opacity-0');
  });

  it('should not auto-dismiss when duration is 0', () => {
    const toast = createMockToast({ duration: 0 });
    render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(mockOnDismiss).not.toHaveBeenCalled();
  });

  it('should have dismiss button that is keyboard accessible', () => {
    const toast = createMockToast();
    render(<Toast toast={toast} onDismiss={mockOnDismiss} />);

    const dismissButton = screen.getByLabelText('Dismiss notification');
    expect(dismissButton).toBeInTheDocument();
    expect(dismissButton.tagName).toBe('BUTTON');
  });

  it('should display correct icon for each toast type', () => {
    const types: Array<ToastType['type']> = ['success', 'error', 'warning', 'info'];
    
    types.forEach((type) => {
      const toast = createMockToast({ type });
      const { container } = render(<Toast toast={toast} onDismiss={mockOnDismiss} />);
      
      // Check that an icon is rendered (lucide-react icons have the 'lucide' class or specific attributes)
      // eslint-disable-next-line custom/no-dom-manipulation
      const icon = container.querySelector('svg[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });
});
