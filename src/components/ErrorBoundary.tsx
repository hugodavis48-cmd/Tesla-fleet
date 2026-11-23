import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let cleanMsg = error?.message || 'An unexpected application error occurred.';
    if (cleanMsg.startsWith('{') && cleanMsg.includes('"operationType"')) {
      try {
        const parsed = JSON.parse(cleanMsg) as { error?: string; operationType?: string; path?: string };
        cleanMsg = parsed.error
          ? `Cloud synchronization error (${parsed.operationType || 'operation'}): ${parsed.error}`
          : 'A cloud synchronization permission error occurred.';
      } catch {
        cleanMsg = 'A cloud synchronization error occurred.';
      }
    }
    return {
      hasError: true,
      errorMessage: cleanMsg,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Application ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleResetHome = () => {
    this.setState({ hasError: false, errorMessage: '' });
    if (typeof window !== 'undefined') {
      window.history.pushState({ tab: 'home' }, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-3xl bg-zinc-950 border border-red-500/30 p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-red-400 font-bold">
                Recovery Safeguard Active
              </span>
              <h1 className="font-heading text-2xl font-black text-white">
                Something Interrupted This View
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {this.state.errorMessage || 'A runtime view exception was caught safely to protect your session.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleResetHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return Home</span>
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Portal</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
