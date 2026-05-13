import { Component } from 'react';

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
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const title = this.props.title || 'Co loi xay ra';
    const description = this.props.description || 'Phan noi dung nay tam thoi khong hien thi duoc. Vui long thu lai sau it phut.';

    return (
      <section className="min-h-[260px] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-lg border border-red-900/15 bg-white/90 px-6 py-7 text-center shadow-sm dark:border-red-200/10 dark:bg-neutral-950/80">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-800 dark:bg-red-950/45 dark:text-red-200">
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
            Thu lai
          </button>
        </div>
      </section>
    );
  }
}

export default ErrorBoundary;
