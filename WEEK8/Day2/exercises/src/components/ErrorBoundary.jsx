import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ hasError: true, error: error });
    console.error("Error caught in boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger mt-4" role="alert">
          <h4 className="alert-heading">An Error Occurred</h4>
          <p>The application encountered an unexpected error and could not render this component.</p>
          <hr />
          <p className="mb-0 text-muted" style={{ fontFamily: 'monospace' }}>
            {this.state.error?.toString()}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
