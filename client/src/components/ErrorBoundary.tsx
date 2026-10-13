// src/components/ErrorBoundary.tsx

import React, { ReactNode } from 'react';
import i18n from '../i18n';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white p-4">
          <div className="bg-gray-800 rounded-lg p-8 border border-red-500 max-w-md">
            <h1 className="text-2xl font-bold text-red-500 mb-4">
              {i18n.t('errorBoundary.title')}
            </h1>
            <p className="text-gray-300 mb-6">
              {i18n.t('errorBoundary.description')}
            </p>
            {this.state.error && (
              <details className="text-xs text-gray-400 mb-4 bg-gray-700 p-3 rounded">
                <summary className="cursor-pointer font-semibold mb-2">
                  {i18n.t('errorBoundary.details_label')}
                </summary>
                <p className="font-mono">{this.state.error.message}</p>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
            >
              {i18n.t('errorBoundary.reload_button')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
