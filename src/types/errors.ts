/**
 * Standardized error types for the L10n Editor application
 */

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  API = 'API',
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  FILE_PROCESSING = 'FILE_PROCESSING',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorDetails {
  code?: string;
  field?: string;
  context?: Record<string, any>;
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly details?: ErrorDetails;
  public readonly timestamp: Date;

  public constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    details?: ErrorDetails,
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.details = details;
    this.timestamp = new Date();

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export class ValidationError extends AppError {
  public constructor(
    message: string,
    field?: string,
    context?: Record<string, any>,
  ) {
    super(message, ErrorType.VALIDATION, {field, context});
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class ApiError extends AppError {
  protected readonly status?: number;
  protected readonly statusText?: string;

  public constructor(
    message: string,
    status?: number,
    statusText?: string,
    details?: ErrorDetails,
  ) {
    super(message, ErrorType.API, details);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  public toJSON() {
    return {
      ...super.toJSON(),
      status: this.status,
      statusText: this.statusText,
    };
  }
}

export class NetworkError extends AppError {
  public constructor(
    message: string = 'Network connection failed',
    details?: ErrorDetails,
  ) {
    super(message, ErrorType.NETWORK, details);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class AuthenticationError extends AppError {
  public constructor(
    message: string = 'Authentication required',
    details?: ErrorDetails,
  ) {
    super(message, ErrorType.AUTHENTICATION, details);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class FileProcessingError extends AppError {
  protected readonly fileName?: string;

  public constructor(
    message: string,
    fileName?: string,
    details?: ErrorDetails,
  ) {
    super(message, ErrorType.FILE_PROCESSING, details);
    this.name = 'FileProcessingError';
    this.fileName = fileName;
    Object.setPrototypeOf(this, FileProcessingError.prototype);
  }

  public toJSON() {
    return {
      ...super.toJSON(),
      fileName: this.fileName,
    };
  }
}

/**
 * Error handler utility functions
 */
export class ErrorHandler {
  /**
   * Convert unknown error to AppError
   */
  public static normalize(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(error.message, ErrorType.UNKNOWN, {
        context: {originalError: error.name},
      });
    }

    if (typeof error === 'string') {
      return new AppError(error, ErrorType.UNKNOWN);
    }

    return new AppError('An unknown error occurred', ErrorType.UNKNOWN, {
      context: {originalError: error},
    });
  }

  /**
   * Get user-friendly error message
   */
  public static getUserMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return `Validation error: ${error.message}`;
      case ErrorType.API:
        return `Service error: ${error.message}`;
      case ErrorType.NETWORK:
        return 'Network connection failed. Please check your internet connection.';
      case ErrorType.AUTHENTICATION:
        return 'Authentication required. Please check your API keys.';
      case ErrorType.AUTHORIZATION:
        return 'Access denied. Please check your permissions.';
      case ErrorType.FILE_PROCESSING:
        return `File processing error: ${error.message}`;
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Log error for debugging
   */
  public static log(error: AppError): void {
    const errorData = {
      ...error.toJSON(),
      stack: error.stack,
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('AppError:', errorData);
    }

    // In production, send to error tracking service (Sentry is already configured)
    // Sentry will automatically capture errors, but we can add additional context
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        extra: errorData,
      });
    }
  }
}
