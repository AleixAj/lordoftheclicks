import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('Unhandled render error', { error, componentStack: info.componentStack });
  }

  private reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center h-screen w-screen p-6 text-center bg-[#0e1118] text-[#c9a44a] font-[Crimson_Pro]"
      >
        <h1 className="font-[Cinzel_Decorative] text-3xl mb-2 text-[#d83838]">Algo se torció en el Camino</h1>
        <p className="opacity-80 max-w-md mb-4">
          La aventura sufrió un percance inesperado. Puedes reintentar o recargar la página.
        </p>
        <pre className="text-xs text-[#888] opacity-70 max-w-2xl overflow-auto bg-black/30 p-3 rounded border border-[#7a6a30] mb-4">
          {error.message}
        </pre>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={this.reset}
            className="px-4 py-1 bg-gradient-to-b from-[#c9a44a] to-[#a08030] border border-[#8a7020] text-[#1a1000] rounded font-bold"
          >
            Reintentar
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-1 border border-[#7a6a30] text-[#c9a44a] rounded"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }
}
