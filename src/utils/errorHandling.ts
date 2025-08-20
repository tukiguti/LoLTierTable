import { ERROR_MESSAGES } from './constants';

/**
 * Custom error classes for different error types
 */

export class AppError extends Error {
  public readonly type: string;
  public readonly userMessage: string;
  public readonly originalError?: Error;

  constructor(
    type: string, 
    message: string, 
    userMessage: string, 
    originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.userMessage = userMessage;
    this.originalError = originalError;
  }
}

export class NetworkError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(
      'NETWORK_ERROR',
      message,
      ERROR_MESSAGES.NETWORK_ERROR,
      originalError
    );
    this.name = 'NetworkError';
  }
}

export class DataLoadError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(
      'DATA_LOAD_ERROR',
      message,
      ERROR_MESSAGES.DATA_LOAD_ERROR,
      originalError
    );
    this.name = 'DataLoadError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, userMessage: string = '入力データが無効です') {
    super('VALIDATION_ERROR', message, userMessage);
    this.name = 'ValidationError';
  }
}

export class StorageError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(
      'STORAGE_ERROR',
      message,
      ERROR_MESSAGES.STORAGE_ERROR,
      originalError
    );
    this.name = 'StorageError';
  }
}

/**
 * Error handling utilities
 */

export const handleError = (error: unknown): AppError => {
  // If it's already an AppError, return as-is
  if (error instanceof AppError) {
    return error;
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new NetworkError(error.message, error);
    }
    
    if (error.message.includes('JSON') || error.message.includes('parse')) {
      return new DataLoadError(error.message, error);
    }
    
    if (error.message.includes('localStorage') || error.message.includes('storage')) {
      return new StorageError(error.message, error);
    }
    
    // Generic error wrapper
    return new AppError('UNKNOWN_ERROR', error.message, 'エラーが発生しました', error);
  }

  // Handle string errors
  if (typeof error === 'string') {
    return new AppError('UNKNOWN_ERROR', error, error);
  }

  // Handle unknown error types
  return new AppError(
    'UNKNOWN_ERROR', 
    'Unknown error occurred', 
    '予期しないエラーが発生しました'
  );
};

/**
 * Safe async wrapper that handles errors
 */
export const safeAsync = async <T>(
  asyncFn: () => Promise<T>,
  fallbackValue?: T
): Promise<{ data: T | undefined; error: AppError | null }> => {
  try {
    const data = await asyncFn();
    return { data, error: null };
  } catch (error) {
    const appError = handleError(error);
    return { data: fallbackValue, error: appError };
  }
};

/**
 * Safe sync wrapper that handles errors
 */
export const safeSync = <T>(
  syncFn: () => T,
  fallbackValue?: T
): { data: T | undefined; error: AppError | null } => {
  try {
    const data = syncFn();
    return { data, error: null };
  } catch (error) {
    const appError = handleError(error);
    return { data: fallbackValue, error: appError };
  }
};

/**
 * Validation helpers
 */
export const validateChampionId = (championId: string): void => {
  if (!championId || typeof championId !== 'string') {
    throw new ValidationError(
      `Invalid champion ID: ${championId}`,
      ERROR_MESSAGES.CHAMPION_NOT_FOUND
    );
  }
};

export const validateCoordinates = (x: number, y: number, maxX: number, maxY: number): void => {
  if (typeof x !== 'number' || typeof y !== 'number' || 
      x < 0 || y < 0 || x > maxX || y > maxY) {
    throw new ValidationError(
      `Invalid coordinates: (${x}, ${y}) with max (${maxX}, ${maxY})`,
      ERROR_MESSAGES.INVALID_COORDINATES
    );
  }
};

export const validateGridSize = (size: number, minSize: number, maxSize: number): void => {
  if (typeof size !== 'number' || size < minSize || size > maxSize) {
    throw new ValidationError(
      `Invalid grid size: ${size} (min: ${minSize}, max: ${maxSize})`,
      ERROR_MESSAGES.GRID_SIZE_INVALID
    );
  }
};

/**
 * Logging helper that works in both development and production
 */
export const logError = (error: AppError, context?: string): void => {
  const errorInfo = {
    type: error.type,
    message: error.message,
    userMessage: error.userMessage,
    context,
    timestamp: new Date().toISOString(),
    originalError: error.originalError?.message,
    stack: error.stack,
  };

  // In development, log to console
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    console.group(`🚨 ${error.name}${context ? ` [${context}]` : ''}`);
    console.error('Error Details:', errorInfo);
    if (error.originalError) {
      console.error('Original Error:', error.originalError);
    }
    console.groupEnd();
  }

  // In production, you might want to send to an error tracking service
  // if (process.env.NODE_ENV === 'production') {
  //   // Send to error tracking service (e.g., Sentry, LogRocket, etc.)
  //   // errorTrackingService.captureError(errorInfo);
  // }
};

/**
 * React error boundary utility
 */
export const createErrorBoundaryError = (error: Error): AppError => {
  return new AppError(
    'REACT_ERROR_BOUNDARY',
    `React Error Boundary caught an error: ${error.message}`,
    'アプリケーションでエラーが発生しました。ページを再読み込みしてください。',
    error
  );
};