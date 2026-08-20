import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { StatusBadge, UrgencyBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Empty'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { RepairRequest, Vehicle, RequestStatus } from '@/types/database.types'
import { IconClipboard, IconChevronRight, IconPlus } from '@/components/layout/NavIcons'

type Row = RepairRequest & { vehicles: Pick<Vehicle, 'make' | 'model'> | null; repair_shops: { name: string } | null }

export default function RequestsList() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'' | RequestStatus>('')

  useEffect(() => {
    if (!user) return
    async function load() {
      setLoading(true)
      let q = supabase.from('repair_requests').select('*, vehicles(make, model), repair_shops(name)').eq('customer_id', user!.id).order('created_at', { ascending: false })
      if (statusFilter) q = q.eq('status', statusFilter)
      const { data } = await q
      setRequests((data as unknown as Row[]) ?? [])
      setLoading(false)
    }
    load()
  }, [user, statusFilter])

  return (
    <DashboardLayout title="Repair Requests" actions={
      <Link to="/customer/requests/new"><Button size="sm"><IconPlus /> <span className="ml-1.5">New request</span></Button></Link>
    }>
      <div className="mb-4 flex items-center gap-3">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="max-w-[220px]">
          <option value="">All statuses</option>
          {(['SUBMITTED','ACCEPTED','DIAGNOSING','ESTIMATE_SENT','CUSTOMER_APPROVED','IN_REPAIR','READY_FOR_PICKUP','COMPLETED','REJECTED','CANCELLED'] as RequestStatus[]).map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </Select>
      </div>

      {loading ? <TableSkeleton /> : requests.length === 0 ? (
        <EmptyState icon={<IconClipboard />} title="No requests found" message="Try a different filter, or submit a new repair request."
          action={<Link to="/customer/requests/new"><Button>New request</Button></Link>} />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Link key={r.id} to={`/customer/requests/${r.id}`}>
              <Card className="hover:shadow-pop">
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{r.title}</p>
                    <p className="text-xs text-ink/50">{r.vehicles?.make} {r.vehicles?.model} · {r.repair_shops?.name} · {format(new Date(r.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <UrgencyBadge urgency={r.urgency} />
                    <StatusBadge status={r.status} />
                    <IconChevronRight className="text-ink/30" />
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
