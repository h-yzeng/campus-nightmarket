import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs the errors, and displays a fallback UI instead of crashing the app.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    logger.error('ErrorBoundary caught an error:', error);
    logger.error('Error Info:', errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Note: Error tracking service (like Sentry) could be integrated here if needed
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-gray-800 p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-center">
              <div className="rounded-full bg-red-500/10 p-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
            </div>

            <h1 className="mb-4 text-center text-3xl font-bold text-white">
              Oops! Something went wrong
            </h1>

            <p className="mb-6 text-center text-gray-400">
              We're sorry for the inconvenience. An unexpected error occurred. Please try refreshing
              the page or return to the home page.
            </p>

            <div className="mb-8 flex justify-center gap-4">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white transition-colors hover:bg-red-700"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 rounded-lg bg-gray-700 px-6 py-3 text-white transition-colors hover:bg-gray-600"
              >
                <Home className="h-5 w-5" />
                Go Home
              </button>
            </div>

            {/* Show error details in development */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-8 rounded-lg border border-gray-700 bg-gray-900 p-4">
                <h2 className="mb-2 text-lg font-semibold text-red-400">
                  Error Details (Development Only)
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="mb-1 text-sm font-medium text-gray-400">Error Message:</p>
                    <p className="rounded bg-gray-950 p-3 font-mono text-sm text-red-400">
                      {this.state.error.message}
                    </p>
                  </div>

                  {this.state.error.stack && (
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-400">Stack Trace:</p>
                      <pre className="overflow-x-auto rounded bg-gray-950 p-3 text-xs text-gray-300">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}

                  {this.state.errorInfo && (
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-400">Component Stack:</p>
                      <pre className="overflow-x-auto rounded bg-gray-950 p-3 text-xs text-gray-300">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
