import { Link } from 'react-router-dom'
import { StatusTimeline } from '@/components/requests/StatusTimeline'

const steps = [
  'Create account', 'Add your vehicle', 'Find a repair shop', 'Submit the problem',
  'Shop diagnoses & sends estimate', 'You approve', 'Repair happens', 'Vehicle ready — history updated',
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <svg width="26" height="26" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#12181F" /><path d="M8 20l2-6a2 2 0 012-1.4h8A2 2 0 0122 14l2 6" stroke="#F5620E" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /><circle cx="11" cy="21" r="2" fill="#F5620E" /><circle cx="21" cy="21" r="2" fill="#F5620E" /></svg>
            <span className="font-display text-lg font-bold text-ink">AutoCare</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-ink/70 hover:text-ink">Sign in</Link>
            <Link to="/register" className="rounded-lg bg-torque px-4 py-2 text-sm font-medium text-white hover:bg-torque-600">Get started</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-block rounded-full bg-torque-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-torque-700">Repair shops & drivers, one thread</span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Every repair, tracked from <span className="text-torque">"what's wrong"</span> to <span className="text-torque">"ready for pickup."</span>
            </h1>
            <p className="mt-5 text-lg text-ink/60">
              AutoCare connects drivers with repair shops for diagnosis, estimates, approvals, and status updates — no phone tag, no guessing where your car stands.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/register" className="rounded-lg bg-torque px-5 py-3 text-sm font-semibold text-white hover:bg-torque-600">Register as a customer</Link>
              <Link to="/register" className="rounded-lg border border-border px-5 py-3 text-sm font-semibold text-ink hover:bg-subtle">List your shop</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-subtle p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink/40">Brake problem — BMW 320d</p>
            <StatusTimeline status="IN_REPAIR" />
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-subtle py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl font-bold text-ink">How it works</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s} className="rounded-xl border border-border bg-white p-4">
                <span className="font-mono text-xs text-torque">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-2 text-sm font-medium text-ink">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-ink/40">
        © {new Date().getFullYear()} AutoCare. Built as a full-stack portfolio project.
      </footer>
    </div>
  )
}
