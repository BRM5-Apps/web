"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center gap-4 p-12">
            <p className="text-lg font-medium">Something went wrong</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
