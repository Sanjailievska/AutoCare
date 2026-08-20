import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Empty'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { RepairRequest, Vehicle } from '@/types/database.types'
import { IconCar, IconClipboard, IconWrench, IconCheck, IconPlus, IconSearch, IconChevronRight } from '@/components/layout/NavIcons'
import { format } from 'date-fns'

type RequestRow = RepairRequest & { vehicles: Pick<Vehicle, 'make' | 'model'> | null; repair_shops: { name: string } | null }

export default function CustomerDashboard() {
  const { user, profile } = useAuth()
  const [vehicleCount, setVehicleCount] = useState(0)
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      const [{ count }, { data: reqs }] = await Promise.all([
        supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('customer_id', user!.id),
        supabase.from('repair_requests')
          .select('*, vehicles(make, model), repair_shops(name)')
          .eq('customer_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(6),
      ])
      setVehicleCount(count ?? 0)
      setRequests((reqs as unknown as RequestRow[]) ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  const active = requests.filter((r) => !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(r.status))
  const inProgress = requests.filter((r) => ['IN_REPAIR', 'READY_FOR_PICKUP'].includes(r.status))
  const completed = requests.filter((r) => r.status === 'COMPLETED')

  const stats = [
    { label: 'Vehicles', value: vehicleCount, icon: <IconCar />, to: '/customer/vehicles' },
    { label: 'Active requests', value: active.length, icon: <IconClipboard />, to: '/customer/requests' },
    { label: 'In progress', value: inProgress.length, icon: <IconWrench />, to: '/customer/requests' },
    { label: 'Completed', value: completed.length, icon: <IconCheck />, to: '/customer/history' },
  ]

  return (
    <DashboardLayout title={`Welcome back, ${profile?.full_name?.split(' ')[0] ?? ''}`}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to}>
            <Card className="transition-shadow hover:shadow-pop">
              <CardBody>
                <div className="flex items-center justify-between">
                  <span className="text-torque">{s.icon}</span>
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-ink">{s.value}</p>
                <p className="text-xs text-ink/50">{s.label}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/customer/vehicles" className="inline-flex items-center gap-2 rounded-lg bg-torque px-4 py-2.5 text-sm font-medium text-white hover:bg-torque-600"><IconPlus /> Add Vehicle</Link>
        <Link to="/customer/requests/new" className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-subtle"><IconClipboard /> Request Repair</Link>
        <Link to="/customer/shops" className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-subtle"><IconSearch /> Find Repair Shop</Link>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink">Recent repair requests</h2>
          <Link to="/customer/requests" className="text-sm font-medium text-torque hover:underline">View all</Link>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={<IconClipboard />}
            title="No repair requests yet"
            message="Submit your first request and a shop will get right back to you."
            action={<Link to="/customer/requests/new" className="rounded-lg bg-torque px-4 py-2 text-sm font-medium text-white hover:bg-torque-600">Request a repair</Link>}
          />
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <Link key={r.id} to={`/customer/requests/${r.id}`}>
                <Card className="transition-shadow hover:shadow-pop">
                  <CardBody className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink">{r.title}</p>
                      <p className="text-xs text-ink/50">{r.vehicles?.make} {r.vehicles?.model} · {r.repair_shops?.name} · {format(new Date(r.created_at), 'MMM d, yyyy')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={r.status} />
                      <IconChevronRight className="text-ink/30" />
                    </div>
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
