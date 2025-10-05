"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-8 max-w-md mx-auto mt-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-sm text-muted-foreground">
                We encountered an unexpected error. Please try again.
              </p>
            </div>

            {this.state.error && (
              <details className="w-full text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Error details
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <Button onClick={this.handleReset} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
