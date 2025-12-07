import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <h3 className="text-sm font-medium text-red-900">Something went wrong</h3>
            <p className="text-sm text-red-700 mt-1">{this.state.error?.message}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
