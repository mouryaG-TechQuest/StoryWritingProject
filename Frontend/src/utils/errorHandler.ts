/**
 * Error Handling Utilities
 * Provides consistent error handling across the application
 */

import type { ApiError } from '../types';

/**
 * Custom error class for API errors
 */
export class ApplicationError extends Error {
  public status?: number;
  public timestamp: string;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApplicationError';
    this.status = status;
    this.timestamp = new Date().toISOString();
    this.code = code;
  }
}

/**
 * Parse API error response
 */
export function parseApiError(error: unknown): ApiError {
  if (error instanceof ApplicationError) {
    return {
      message: error.message,
      status: error.status,
      timestamp: error.timestamp,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return {
      message: String((error as { message: unknown }).message),
      timestamp: new Date().toISOString(),
    };
  }

  return {
    message: 'An unknown error occurred',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  const apiError = parseApiError(error);

  // Map common error codes to user-friendly messages
  const errorMessages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'You are not authenticated. Please log in.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This action conflicts with existing data.',
    422: 'The provided data is invalid.',
    429: 'Too many requests. Please try again later.',
    500: 'A server error occurred. Please try again later.',
    502: 'Bad gateway. The server is temporarily unavailable.',
    503: 'Service unavailable. Please try again later.',
  };

  if (apiError.status && errorMessages[apiError.status]) {
    return errorMessages[apiError.status];
  }

  return apiError.message || 'An unexpected error occurred';
}

/**
 * Log error to console (development) or error tracking service (production)
 */
export function logError(error: unknown, context?: string): void {
  const apiError = parseApiError(error);

  if (import.meta.env.DEV) {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, apiError);
  } else {
    // In production, send to error tracking service (e.g., Sentry)
    // Sentry.captureException(error, { contexts: { custom: { context } } });
  }
}

/**
 * Handle error with toast notification
 */
export function handleErrorWithToast(error: unknown, context?: string): void {
  logError(error, context);
  const message = getUserFriendlyMessage(error);
  
  // TODO: Integrate with toast notification library
  alert(message);
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Validate network connectivity
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  if (error instanceof Error && error.message.includes('Network')) {
    return true;
  }

  return false;
}

/**
 * Format validation errors
 */
export function formatValidationErrors(errors: Record<string, string>): string {
  return Object.entries(errors)
    .map(([field, message]) => `${field}: ${message}`)
    .join('\n');
}

/**
 * Error boundary handler
 */
export function handleGlobalError(error: Error, errorInfo?: { componentStack: string }): void {
  logError(error, 'Global Error Boundary');

  if (errorInfo) {
    console.error('Component Stack:', errorInfo.componentStack);
  }

  // Show user-friendly error page
  // Router.navigate('/error');
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logError(error, 'JSON Parse Error');
    return fallback;
  }
}

/**
 * Assert function for type narrowing
 */
export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new ApplicationError(message, 500, 'ASSERTION_ERROR');
  }
}
