import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Select } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Empty'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'
import type { RepairRequest, Vehicle, Profile, RepairShop, RequestStatus } from '@/types/database.types'
import { IconClipboard } from '@/components/layout/NavIcons'

type Row = RepairRequest & { vehicles: Pick<Vehicle, 'make' | 'model'> | null; profiles: Pick<Profile, 'full_name'> | null; repair_shops: Pick<RepairShop, 'name'> | null }

export default function AdminRequests() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'' | RequestStatus>('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      let q = supabase.from('repair_requests').select('*, vehicles(make, model), profiles(full_name), repair_shops(name)').order('created_at', { ascending: false }).limit(200)
      if (statusFilter) q = q.eq('status', statusFilter)
      const { data } = await q
      setRows((data as unknown as Row[]) ?? [])
      setLoading(false)
    }
    load()
  }, [statusFilter])

  return (
    <DashboardLayout title="All Repair Requests">
      <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="mb-4 max-w-xs">
        <option value="">All statuses</option>
        {(['SUBMITTED','ACCEPTED','DIAGNOSING','ESTIMATE_SENT','CUSTOMER_APPROVED','IN_REPAIR','READY_FOR_PICKUP','COMPLETED','REJECTED','CANCELLED'] as RequestStatus[]).map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
        ))}
      </Select>
      {loading ? <TableSkeleton /> : rows.length === 0 ? (
        <EmptyState icon={<IconClipboard />} title="No requests found" message="Try a different filter." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-subtle text-xs uppercase tracking-wide text-ink/50">
              <tr><th className="px-4 py-3 text-left">Request</th><th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-left">Shop</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Date</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-subtle">
                  <td className="px-4 py-3"><p className="font-medium text-ink">{r.title}</p><p className="text-xs text-ink/40">{r.vehicles?.make} {r.vehicles?.model}</p></td>
                  <td className="px-4 py-3 text-ink/60">{r.profiles?.full_name}</td>
                  <td className="px-4 py-3 text-ink/60">{r.repair_shops?.name}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-ink/60">{format(new Date(r.created_at), 'MMM d, yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}
