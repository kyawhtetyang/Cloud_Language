import React from 'react';

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('App crashed:', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-app">
          <div className="w-full max-w-md rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--surface-default)] p-6 text-center">
            <h1 className="text-xl font-extrabold text-ink mb-2">Something went wrong</h1>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              The app hit an unexpected error. Reload to recover.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 rounded-xl border-2 font-extrabold uppercase tracking-wide btn-selected"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

