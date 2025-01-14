"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex h-full items-center justify-center bg-neutral900">
          <div className="rounded-lg bg-neutral800 p-8 text-center">
            <h2 className="mb-4 text-xl font-bold text-red-500">Oops! Something went wrong</h2>
            <p className="text-neutral100">{this.state.error?.message}</p>
            <button
              className="mt-4 rounded bg-brand px-4 py-2 text-white hover:bg-brand/90"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}