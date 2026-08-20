import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/Empty'
import { PageSpinner } from '@/components/ui/Spinner'
import { supabase } from '@/lib/supabase'
import type { Vehicle, RepairRequest, Repair } from '@/types/database.types'
import { IconCar, IconHistory } from '@/components/layout/NavIcons'

type CompletedRow = { request: RepairRequest; repair: Repair; shopName: string }

export default function VehicleDetail() {
  const { id } = useParams()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [history, setHistory] = useState<CompletedRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      const [{ data: v }, { data: reqs }] = await Promise.all([
        supabase.from('vehicles').select('*').eq('id', id).single(),
        supabase.from('repair_requests')
          .select('*, repairs(*), repair_shops(name)')
          .eq('vehicle_id', id)
          .eq('status', 'COMPLETED')
          .order('created_at', { ascending: false }),
      ])
      setVehicle(v as Vehicle)
      const rows: CompletedRow[] = ((reqs as any[]) ?? [])
        .filter((r) => r.repairs)
        .map((r) => ({ request: r, repair: Array.isArray(r.repairs) ? r.repairs[0] : r.repairs, shopName: r.repair_shops?.name ?? 'Unknown shop' }))
      setHistory(rows)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <DashboardLayout title="Vehicle"><PageSpinner /></DashboardLayout>
  if (!vehicle) return <DashboardLayout title="Vehicle"><EmptyState title="Not found" message="This vehicle doesn't exist or you don't have access." /></DashboardLayout>

  const totalSpent = history.reduce((sum, h) => sum + (h.repair.final_cost ?? 0), 0)

  return (
    <DashboardLayout title={`${vehicle.make} ${vehicle.model}`}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex h-48 items-center justify-center bg-subtle">
            {vehicle.image_url ? <img src={vehicle.image_url} className="h-full w-full object-cover" alt="" /> : <IconCar className="h-14 w-14 text-ink/20" />}
          </div>
          <CardBody className="space-y-2.5">
            <Row label="Year" value={String(vehicle.year)} />
            <Row label="Engine" value={vehicle.engine ?? '—'} />
            <Row label="Fuel" value={vehicle.fuel_type ?? '—'} />
            <Row label="Transmission" value={vehicle.transmission ?? '—'} />
            <Row label="Mileage" value={vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : '—'} />
            <Row label="License plate" value={vehicle.license_plate ?? '—'} mono />
            <Row label="VIN" value={vehicle.vin ?? '—'} mono />
          </CardBody>
        </Card>

        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconHistory className="text-torque" />
              <h2 className="font-display text-base font-semibold text-ink">Service history</h2>
            </div>
            {history.length > 0 && <p className="font-mono text-sm text-ink/60">Total: €{totalSpent.toFixed(2)}</p>}
          </div>

          {history.length === 0 ? (
            <EmptyState icon={<IconHistory />} title="No completed repairs yet" message="Completed repairs for this vehicle will show up here." />
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <Link key={h.request.id} to={`/customer/requests/${h.request.id}`}>
                  <Card className="hover:shadow-pop">
                    <CardBody className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-ink/40">{format(new Date(h.repair.completed_at ?? h.request.updated_at), 'MMMM yyyy')}</p>
                        <p className="mt-0.5 font-medium text-ink">{h.request.title}</p>
                        <p className="text-xs text-ink/50">{h.shopName}</p>
                      </div>
                      <p className="font-mono text-base font-semibold text-ink">€{(h.repair.final_cost ?? 0).toFixed(2)}</p>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="text-xs text-ink/50">{label}</span>
      <span className={`text-sm font-medium text-ink ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
