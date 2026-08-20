import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Select, Input } from '@/components/ui/Input'
import { StatusBadge, UrgencyBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Empty'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { PageSpinner } from '@/components/ui/Spinner'
import { useMyShop } from '@/hooks/useMyShop'
import { supabase } from '@/lib/supabase'
import type { RepairRequest, Vehicle, Profile, RequestStatus, Mechanic } from '@/types/database.types'
import { IconClipboard, IconChevronRight } from '@/components/layout/NavIcons'

type Row = RepairRequest & { vehicles: Pick<Vehicle, 'make' | 'model' | 'license_plate'> | null; profiles: Pick<Profile, 'full_name'> | null; mechanics: Pick<Mechanic, 'full_name'> | null }

export default function ShopRequestsList() {
  const { shop, loading: shopLoading } = useMyShop()
  const [requests, setRequests] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'' | RequestStatus>('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!shop) return
    async function load() {
      setLoading(true)
      let q = supabase.from('repair_requests')
        .select('*, vehicles(make, model, license_plate), profiles(full_name), mechanics(full_name)')
        .eq('shop_id', shop!.id).order('created_at', { ascending: false })
      if (statusFilter) q = q.eq('status', statusFilter)
      const { data } = await q
      setRequests((data as unknown as Row[]) ?? [])
      setLoading(false)
    }
    load()
  }, [shop, statusFilter])

  if (shopLoading) return <DashboardLayout title="Repair Requests"><PageSpinner /></DashboardLayout>

  const filtered = requests.filter((r) =>
    !search ||
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.vehicles?.license_plate?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout title="Repair Requests">
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input placeholder="Search customer, title, plate..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          <option value="">All statuses</option>
          {(['SUBMITTED','ACCEPTED','DIAGNOSING','ESTIMATE_SENT','CUSTOMER_APPROVED','IN_REPAIR','READY_FOR_PICKUP','COMPLETED','REJECTED','CANCELLED'] as RequestStatus[]).map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </Select>
      </div>

      {loading ? <TableSkeleton /> : filtered.length === 0 ? (
        <EmptyState icon={<IconClipboard />} title="No requests found" message="Try a different search or filter." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-subtle text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3 text-left">Request</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Vehicle</th>
                <th className="px-4 py-3 text-left">Mechanic</th>
                <th className="px-4 py-3 text-left">Urgency</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-subtle">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{r.title}</p>
                    <p className="text-xs text-ink/40">{format(new Date(r.created_at), 'MMM d, yyyy')}</p>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{r.profiles?.full_name}</td>
                  <td className="px-4 py-3 text-ink/70">{r.vehicles?.make} {r.vehicles?.model}</td>
                  <td className="px-4 py-3 text-ink/70">{r.mechanics?.full_name ?? '—'}</td>
                  <td className="px-4 py-3"><UrgencyBadge urgency={r.urgency} /></td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/shop/requests/${r.id}`} className="inline-flex items-center text-torque"><IconChevronRight /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}
