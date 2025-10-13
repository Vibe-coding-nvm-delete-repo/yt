import { normalizeToApiError } from '@/lib/errorUtils';
import { ApiError } from '@/types';

describe('normalizeToApiError', () => {
  test('converts plain Error to ApiError', () => {
    const plainError = new Error('Test error');
    const apiErr = normalizeToApiError(plainError);
    
    expect(apiErr).toBeInstanceOf(ApiError);
    expect(apiErr.message).toBe('Test error');
    expect(apiErr.code).toBeUndefined();
    expect(apiErr.details).toBeUndefined();
  });

  test('returns ApiError as-is if already ApiError', () => {
    const originalApiErr = new ApiError('Original message', '404', { details: 'extra info' });
    const apiErr = normalizeToApiError(originalApiErr);
    
    expect(apiErr).toBe(originalApiErr);
    expect(apiErr.message).toBe('Original message');
    expect(apiErr.code).toBe('404');
    expect(apiErr.details).toEqual({ details: 'extra info' });
  });

  test('handles Response object (network error)', () => {
    const response = new Response('Bad request', { status: 400 });
    const apiErr = normalizeToApiError(response);
    
    expect(apiErr).toBeInstanceOf(ApiError);
    expect(apiErr.message).toBe('HTTP 400: Bad Request');
    expect(apiErr.code).toBe('400');
  });

  test('handles unknown error types', () => {
    const unknownErr = { message: 'Unknown', code: 500 };
    const apiErr = normalizeToApiError(unknownErr);
    
    expect(apiErr).toBeInstanceOf(ApiError);
    expect(apiErr.message).toContain('Unknown');
  });

  test('maintains details for structured errors', () => {
    const structuredErr = {
      message: 'Validation failed',
      details: { field: 'modelId' },
    };
    const apiErr = normalizeToApiError(structuredErr);
    
    expect(apiErr.details).toEqual({ field: 'modelId' });
  });
});
