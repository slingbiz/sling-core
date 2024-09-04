// ErrorBoundary.js in sling-fe or sling-core
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Widget has an error: {this.state.error.message}</h1>;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;