import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40 }}>
          <h1 style={{ color: '#c53030' }}>Something went wrong</h1>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fee', padding: 12 }}>
            {this.state.error && String(this.state.error)}
            {this.state.info && this.state.info.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
