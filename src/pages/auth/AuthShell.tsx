import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-ink p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#F5620E" /><path d="M8 20l2-6a2 2 0 012-1.4h8A2 2 0 0122 14l2 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /><circle cx="11" cy="21" r="2" fill="white" /><circle cx="21" cy="21" r="2" fill="white" /></svg>
          <span className="font-display text-xl font-bold text-white">AutoCare</span>
        </Link>
        <div>
          <p className="font-display text-3xl font-semibold leading-tight text-white">
            From "brake problem" to<br />repair complete —<br /><span className="text-torque">one clear thread.</span>
          </p>
          <p className="mt-4 max-w-sm text-sm text-white/50">
            Submit a request, watch the diagnosis and estimate land in real time, approve the work, and track it to pickup.
          </p>
        </div>
        <p className="text-xs text-white/30">© {new Date().getFullYear()} AutoCare</p>
      </div>
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <svg width="26" height="26" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#F5620E" /><path d="M8 20l2-6a2 2 0 012-1.4h8A2 2 0 0122 14l2 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /><circle cx="11" cy="21" r="2" fill="white" /><circle cx="21" cy="21" r="2" fill="white" /></svg>
              <span className="font-display text-lg font-bold text-ink">AutoCare</span>
            </Link>
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-ink/60">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
