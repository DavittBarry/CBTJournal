import { Component, type ReactNode } from 'react'
import { logger } from '@/utils/logger'

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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('ErrorBoundary', 'React component error', error, {
      componentStack: errorInfo.componentStack
    })
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleExportLogs = (): void => {
    const logs = logger.exportLogs()
    const blob = new Blob([logs], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `untwist-error-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-warm-100 flex items-center justify-center p-6">
          <div className="card p-8 max-w-md w-full text-center">q
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-critical-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-critical-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            
            <h1 className="text-xl font-semibold text-stone-800 mb-2">
              Something went wrong
            </h1>
            
            <p className="text-stone-500 text-sm mb-6">
              An unexpected error occurred. Your data is safe.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="bg-stone-100 rounded-lg p-4 mb-6 text-left">
                <p className="text-xs font-mono text-critical-600 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="btn-primary w-full"
              >
                Try again
              </button>
              
              <button
                onClick={this.handleReload}
                className="btn-secondary w-full"
              >
                Reload app
              </button>

              <button
                onClick={this.handleExportLogs}
                className="text-stone-500 hover:text-stone-700 text-sm font-medium py-2"
              >
                Export error logs
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
