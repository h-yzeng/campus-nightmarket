import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  routeName?: string;
  onNavigateBack?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * RouteErrorBoundary Component
 * A lightweight error boundary for individual routes that allows
 * users to recover without leaving the app entirely
 */
class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(`RouteErrorBoundary [${this.props.routeName || 'Unknown'}]:`, error);
    logger.error('Component Stack:', errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoBack = () => {
    if (this.props.onNavigateBack) {
      this.props.onNavigateBack();
    } else {
      window.history.back();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center bg-[#0A0A0B] p-4">
          <div className="w-full max-w-lg rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-8 text-center shadow-xl">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-[#2A0A0A] p-4">
                <AlertTriangle className="h-10 w-10 text-[#CC0000]" />
              </div>
            </div>

            <h2 className="mb-3 text-2xl font-bold text-white">Something went wrong</h2>

            <p className="mb-6 text-[#A0A0A0]">
              We encountered an error loading this page. Please try again or go back.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 rounded-xl bg-[#CC0000] px-6 py-3 font-semibold text-white transition-all hover:bg-[#AA0000]"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </button>

              <button
                onClick={this.handleGoBack}
                className="flex items-center gap-2 rounded-xl border-2 border-[#3A3A3A] bg-[#252525] px-6 py-3 font-semibold text-white transition-all hover:border-[#5A5A5A]"
              >
                <ArrowLeft className="h-5 w-5" />
                Go Back
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="mt-6 rounded-xl border border-[#3A3A3A] bg-[#0A0A0B] p-4 text-left">
                <p className="mb-2 text-xs font-semibold text-[#888888]">Error (dev only):</p>
                <pre className="overflow-x-auto text-xs text-[#FF8888]">
                  {this.state.error.message}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
