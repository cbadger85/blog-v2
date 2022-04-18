/* eslint-disable no-console */
import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    if (import.meta.env.DEV) {
      console.error(error);
      console.log(errorInfo);
    }
  }

  render() {
    const { children, fallback = null } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      return fallback;
    }
    return children;
  }
}
