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
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 w-full max-w-md text-center">
            <h1 className="text-xl font-extrabold text-ink mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-600 mb-4">
              The app hit an unexpected error. Reload to recover.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 rounded-xl bg-brand border-2 border-brand-dark text-white font-extrabold uppercase tracking-wide duo-button-shadow"
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

