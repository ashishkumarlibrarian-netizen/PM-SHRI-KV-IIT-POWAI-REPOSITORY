import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-red-900">
            {this.props.componentName ? `${this.props.componentName} Failed to Load` : 'Component Error'}
          </h3>
          <p className="text-sm text-red-700 max-w-sm">
            We encountered an unexpected error while loading this section. Please try refreshing the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
