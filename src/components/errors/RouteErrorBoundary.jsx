import { Component } from 'react'
import ErrorFallback from '@/components/errors/ErrorFallback'

class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error) {
    console.error('Route error caught by RouteErrorBoundary:', error)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleReset}
        />
      )
    }
    return this.props.children
  }
}

export default RouteErrorBoundary