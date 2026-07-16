import { Component, type ErrorInfo, type ReactNode } from 'react';
import { MaterialIcon } from './Ui';
import { sanitizeText } from '../lib/redaction';

type ErrorBoundaryProps = {
  children: ReactNode;
  description?: string;
  title?: string;
  variant?: 'app' | 'section';
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Skill Panel render error', sanitizeText(error.message), sanitizeText(info.componentStack));
  }

  render() {
    if (this.state.error) {
      const title = this.props.title ?? 'Skill Panel';
      const description = this.props.description ?? '应用遇到异常，请刷新或重启后继续。';
      const content = (
        <section className="error-boundary-panel">
          <MaterialIcon name="error" size={28} />
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
            <pre>{sanitizeText(this.state.error.message)}</pre>
          </div>
        </section>
      );

      if (this.props.variant === 'section') {
        return (
          <div className="error-boundary-section" role="alert">
            {content}
          </div>
        );
      }

      return (
        <main className="app-shell error-boundary-shell" role="alert">
          {content}
        </main>
      );
    }

    return this.props.children;
  }
}
