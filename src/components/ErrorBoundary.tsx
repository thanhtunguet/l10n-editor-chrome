import React from 'react';
import {Alert, Button, Typography} from 'antd';
import type {AppError} from '../types/errors';
import {ErrorHandler} from '../types/errors';

const {Title, Paragraph} = Typography;

interface ErrorBoundaryState {
  hasError: boolean;
  error?: AppError;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{error: AppError; retry: () => void}>;
  onError?: (error: AppError, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {hasError: false};
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const appError = ErrorHandler.normalize(error);
    return {
      hasError: true,
      error: appError,
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = ErrorHandler.normalize(error);

    // Log the error
    ErrorHandler.log(appError);

    // Call custom error handler if provided
    this.props.onError?.(appError, errorInfo);

    this.setState({
      error: appError,
      errorInfo,
    });
  }

  public readonly handleRetry = () => {
    this.setState({hasError: false, error: undefined, errorInfo: undefined});
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            retry={this.handleRetry}
          />
        );
      }

      // Default error UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          retry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: AppError;
  retry: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  retry,
}) => {
  const userMessage = ErrorHandler.getUserMessage(error);
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Alert
        message="Something went wrong"
        description={userMessage}
        type="error"
        showIcon
        className="mb-4"
      />

      <div className="text-center mb-6">
        <Button type="primary" onClick={retry}>
          Try Again
        </Button>
      </div>

      {isDevelopment && (
        <div className="mt-6">
          <Title level={4}>Debug Information</Title>
          <Paragraph>
            <strong>Error Type:</strong> {error.type}
          </Paragraph>
          <Paragraph>
            <strong>Message:</strong> {error.message}
          </Paragraph>
          <Paragraph>
            <strong>Timestamp:</strong> {error.timestamp.toLocaleString()}
          </Paragraph>

          {error.details && (
            <Paragraph>
              <strong>Details:</strong>
              <pre className="bg-gray-100 p-2 rounded text-sm">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </Paragraph>
          )}

          {error.stack && (
            <Paragraph>
              <strong>Stack Trace:</strong>
              <pre className="bg-gray-100 p-2 rounded text-xs max-h-48 overflow-auto">
                {error.stack}
              </pre>
            </Paragraph>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Hook for handling errors in functional components
 */
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: unknown) => {
    const appError = ErrorHandler.normalize(error);
    ErrorHandler.log(appError);

    // Re-throw the error so it can be caught by ErrorBoundary
    throw appError;
  }, []);

  return {handleError};
};

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{error: AppError; retry: () => void}>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
