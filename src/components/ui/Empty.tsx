import type { ReactNode } from 'react'

export function EmptyState({ icon, title, message, action }: { icon?: ReactNode; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white px-6 py-14 text-center">
      {icon && <div className="mb-3 text-ink/30">{icon}</div>}
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink/60">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
