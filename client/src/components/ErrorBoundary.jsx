import { Component } from 'react';
import * as Sentry from '@sentry/react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', {
      boundary: this.props.boundaryName || 'unknown',
      error,
      errorInfo,
    });
    Sentry.captureException(error, {
      extra: { boundary: this.props.boundaryName || 'unknown', errorInfo },
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const title       = this.props.title       || 'Có lỗi xảy ra';
    const description = this.props.description || 'Phần nội dung này tạm thời không hiển thị được. Vui lòng thử lại sau ít phút.';
    const isModule    = this.props.module;     // true → hiện inline nhỏ gọn, false → full-page

    if (isModule) {
      return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/30 dark:bg-red-950/20">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700 dark:bg-red-900/40 dark:text-red-300">!</span>
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">{title}</p>
              <p className="text-xs text-red-600 dark:text-red-400">{description}</p>
            </div>
          </div>
          <button type="button" onClick={this.handleRetry}
            className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-700 dark:bg-transparent dark:text-red-300">
            Tải lại phần này
          </button>
        </div>
      );
    }

    return (
      <section className="min-h-65 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-lg border border-red-900/15 bg-white/90 px-6 py-7 text-center shadow-sm dark:border-red-200/10 dark:bg-neutral-950/80">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-800 dark:bg-red-950/45 dark:text-red-200 text-lg font-bold">
            !
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            {description}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-5 rounded-md bg-red-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-900/30 dark:bg-red-700 dark:hover:bg-red-600"
          >
            Tải lại phần này
          </button>
        </div>
      </section>
    );
  }
}

export default ErrorBoundary;
