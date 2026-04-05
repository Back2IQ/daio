import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#ef4444' }}>Etwas ist schiefgelaufen.</h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            {this.state.error?.message ?? 'Unbekannter Fehler'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '1rem', padding: '0.5rem 1rem',
              background: '#4f46e5', color: '#fff', border: 'none',
              borderRadius: '0.375rem', cursor: 'pointer',
            }}
          >
            Neu laden
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
