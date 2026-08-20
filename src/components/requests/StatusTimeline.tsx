import type { RequestStatus } from '@/types/database.types'

// Signature visual: a horizontal diagnostic-gauge rail. Each stage is a
// node on the rail; completed stages fill solid torque-orange, the
// current stage pulses, future stages sit hollow. This is the one
// component every customer and shop watches most closely, so it carries
// the app's visual identity.

const HAPPY_PATH: { status: RequestStatus; label: string }[] = [
  { status: 'SUBMITTED', label: 'Submitted' },
  { status: 'ACCEPTED', label: 'Accepted' },
  { status: 'DIAGNOSING', label: 'Diagnosis' },
  { status: 'ESTIMATE_SENT', label: 'Estimate' },
  { status: 'IN_REPAIR', label: 'In repair' },
  { status: 'READY_FOR_PICKUP', label: 'Ready' },
  { status: 'COMPLETED', label: 'Completed' },
]

// CUSTOMER_APPROVED collapses visually into IN_REPAIR (it's a transient
// state that immediately becomes IN_REPAIR once a repair row is created).
function normalize(status: RequestStatus): RequestStatus {
  return status === 'CUSTOMER_APPROVED' ? 'IN_REPAIR' : status
}

export function StatusTimeline({ status }: { status: RequestStatus }) {
  if (status === 'REJECTED' || status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-danger/20 bg-danger-50 px-4 py-3">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#DC2626" strokeWidth="1.5" /><path d="M7 7l6 6M13 7l-6 6" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" /></svg>
        <span className="text-sm font-medium text-danger">
          {status === 'REJECTED' ? 'This request was declined or its estimate was rejected.' : 'This request was cancelled.'}
        </span>
      </div>
    )
  }

  const current = normalize(status)
  const currentIdx = HAPPY_PATH.findIndex((s) => s.status === current)

  return (
    <div className="w-full overflow-x-auto thin-scroll">
      <div className="flex min-w-[640px] items-start">
        {HAPPY_PATH.map((step, i) => {
          const done = i < currentIdx
          const active = i === currentIdx
          const upcoming = i > currentIdx
          return (
            <div key={step.status} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div className={`h-0.5 flex-1 ${i === 0 ? 'invisible' : done || active ? 'bg-torque' : 'bg-border'}`} />
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold"
                  style={{
                    borderColor: done || active ? '#F5620E' : '#E3E6EA',
                    backgroundColor: done ? '#F5620E' : '#FFFFFF',
                    color: done ? '#FFFFFF' : active ? '#F5620E' : '#B7BCC4',
                  }}
                >
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : active ? (
                    <span className="absolute h-3 w-3 animate-ping rounded-full bg-torque/50" />
                  ) : null}
                  {active && <span className="relative h-2.5 w-2.5 rounded-full bg-torque" />}
                </div>
                <div className={`h-0.5 flex-1 ${i === HAPPY_PATH.length - 1 ? 'invisible' : done ? 'bg-torque' : 'bg-border'}`} />
              </div>
              <span className={`mt-2 text-center text-[11px] font-medium leading-tight ${upcoming ? 'text-ink/40' : 'text-ink'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
