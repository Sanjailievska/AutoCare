import clsx from 'clsx'
import type { RequestStatus, UrgencyLevel, EstimateStatus } from '@/types/database.types'

const statusStyles: Record<RequestStatus, string> = {
  SUBMITTED: 'bg-subtle text-ink border-border',
  ACCEPTED: 'bg-diag-50 text-diag border-diag/20',
  DIAGNOSING: 'bg-diag-50 text-diag border-diag/20',
  ESTIMATE_SENT: 'bg-warn-50 text-warn border-warn/20',
  CUSTOMER_APPROVED: 'bg-torque-50 text-torque-700 border-torque/20',
  IN_REPAIR: 'bg-torque-50 text-torque-700 border-torque/20',
  READY_FOR_PICKUP: 'bg-success-50 text-success border-success/20',
  COMPLETED: 'bg-success-50 text-success border-success/20',
  REJECTED: 'bg-danger-50 text-danger border-danger/20',
  CANCELLED: 'bg-danger-50 text-danger border-danger/20',
}

export const statusLabels: Record<RequestStatus, string> = {
  SUBMITTED: 'Submitted',
  ACCEPTED: 'Accepted',
  DIAGNOSING: 'Diagnosing',
  ESTIMATE_SENT: 'Estimate sent',
  CUSTOMER_APPROVED: 'Approved',
  IN_REPAIR: 'In repair',
  READY_FOR_PICKUP: 'Ready for pickup',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
}

export function StatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', statusStyles[status], className)}>
      {statusLabels[status]}
    </span>
  )
}

const urgencyStyles: Record<UrgencyLevel, string> = {
  low: 'bg-subtle text-ink/60 border-border',
  normal: 'bg-diag-50 text-diag border-diag/20',
  urgent: 'bg-danger-50 text-danger border-danger/20',
}
export function UrgencyBadge({ urgency }: { urgency: UrgencyLevel }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize', urgencyStyles[urgency])}>
      {urgency}
    </span>
  )
}

const estimateStyles: Record<EstimateStatus, string> = {
  PENDING: 'bg-warn-50 text-warn border-warn/20',
  APPROVED: 'bg-success-50 text-success border-success/20',
  REJECTED: 'bg-danger-50 text-danger border-danger/20',
}
export function EstimateBadge({ status }: { status: EstimateStatus }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize', estimateStyles[status])}>
      {status.toLowerCase()}
    </span>
  )
}
