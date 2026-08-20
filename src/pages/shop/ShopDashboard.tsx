import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Empty'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { PageSpinner } from '@/components/ui/Spinner'
import { useMyShop } from '@/hooks/useMyShop'
import { supabase } from '@/lib/supabase'
import type { RepairRequest, Vehicle, Profile } from '@/types/database.types'
import { IconClipboard, IconWrench, IconCheck, IconUsers, IconChevronRight, IconCalendar } from '@/components/layout/NavIcons'
import ShopOnboarding from './ShopOnboarding'

type Row = RepairRequest & { vehicles: Pick<Vehicle, 'make' | 'model'> | null; profiles: Pick<Profile, 'full_name'> | null }

export default function ShopDashboard() {
  const { shop, loading: shopLoading, setShop } = useMyShop()
  const [requests, setRequests] = useState<Row[]>([])
  const [customerCount, setCustomerCount] = useState(0)
  const [revenue, setRevenue] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!shop) return
    async function load() {
      const [{ data: reqs }, { data: revData }] = await Promise.all([
        supabase.from('repair_requests').select('*, vehicles(make, model), profiles(full_name)').eq('shop_id', shop!.id).order('created_at', { ascending: false }).limit(8),
        supabase.from('repairs').select('final_cost, repair_requests!inner(shop_id)').eq('repair_requests.shop_id', shop!.id).eq('status', 'COMPLETED'),
      ])
      setRequests((reqs as unknown as Row[]) ?? [])
      setRevenue(((revData as any[]) ?? []).reduce((s, r) => s + (r.final_cost ?? 0), 0))
      const { data: allReqs } = await supabase.from('repair_requests').select('customer_id').eq('shop_id', shop!.id)
      setCustomerCount(new Set(((allReqs as any[]) ?? []).map((r) => r.customer_id)).size)
      setLoading(false)
    }
    load()
  }, [shop])

  if (shopLoading) return <DashboardLayout title="Dashboard"><PageSpinner /></DashboardLayout>
  if (!shop) return <ShopOnboarding onCreated={setShop} />

  const pending = requests.filter((r) => r.status === 'SUBMITTED')
  const active = requests.filter((r) => ['ACCEPTED', 'DIAGNOSING', 'IN_REPAIR'].includes(r.status))
  const awaiting = requests.filter((r) => r.status === 'ESTIMATE_SENT')
  const completed = requests.filter((r) => r.status === 'COMPLETED')
  const today = new Date().toISOString().slice(0, 10)
  const todaysAppts = requests.filter((r) => r.preferred_date === today)

  const stats = [
    { label: 'Pending requests', value: pending.length, icon: <IconClipboard /> },
    { label: 'Active repairs', value: active.length, icon: <IconWrench /> },
    { label: 'Awaiting approval', value: awaiting.length, icon: <IconCheck /> },
    { label: "Today's appointments", value: todaysAppts.length, icon: <IconCalendar /> },
  ]

  return (
    <DashboardLayout title={shop.name}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}><CardBody>
            <span className="text-torque">{s.icon}</span>
            <p className="mt-3 font-display text-2xl font-bold text-ink">{s.value}</p>
            <p className="text-xs text-ink/50">{s.label}</p>
          </CardBody></Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card><CardBody className="flex items-center justify-between">
          <div><p className="text-xs text-ink/50">Total revenue (completed)</p><p className="font-mono text-2xl font-bold text-ink">€{revenue.toFixed(2)}</p></div>
        </CardBody></Card>
        <Card><CardBody className="flex items-center justify-between">
          <div><p className="text-xs text-ink/50">Unique customers</p><p className="font-display text-2xl font-bold text-ink">{customerCount}</p></div>
          <IconUsers className="text-ink/20" />
        </CardBody></Card>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink">Recent requests</h2>
          <Link to="/shop/requests" className="text-sm font-medium text-torque hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : requests.length === 0 ? (
          <EmptyState icon={<IconClipboard />} title="No requests yet" message="New repair requests from customers will show up here." />
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <Link key={r.id} to={`/shop/requests/${r.id}`}>
                <Card className="hover:shadow-pop">
                  <CardBody className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink">{r.title}</p>
                      <p className="text-xs text-ink/50">{r.profiles?.full_name} · {r.vehicles?.make} {r.vehicles?.model} · {format(new Date(r.created_at), 'MMM d')}</p>
                    </div>
                    <div className="flex items-center gap-3"><StatusBadge status={r.status} /><IconChevronRight className="text-ink/30" /></div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
