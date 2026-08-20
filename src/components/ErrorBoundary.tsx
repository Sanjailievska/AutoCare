import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

// Catches render errors anywhere in the tree instead of showing a blank
// white screen — important once real network/RLS errors start surfacing
// during development against a live Supabase project.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-subtle px-6 text-center">
          <h1 className="font-display text-xl font-bold text-ink">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-ink/60">{this.state.error.message}</p>
          <button onClick={() => window.location.assign('/')} className="mt-4 rounded-lg bg-torque px-4 py-2 text-sm font-medium text-white hover:bg-torque-600">
            Back to home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
