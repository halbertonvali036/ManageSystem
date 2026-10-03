import { Component } from 'react'
import { useLocation } from 'react-router-dom'
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

  componentDidUpdate(previousProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.handleReset()
    }
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

function NavigationErrorBoundary({ children }) {
  const location = useLocation()
  return <RouteErrorBoundary resetKey={location.key}>{children}</RouteErrorBoundary>
}

export default NavigationErrorBoundary
