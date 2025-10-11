'use client';

import { App } from '@/components/App';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // In production, you might want to send this to an error reporting service
        console.error('Page-level error:', error, errorInfo);
      }}
    >
      <App />
    </ErrorBoundary>
  );
}
