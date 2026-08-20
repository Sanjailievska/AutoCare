import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/Empty'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { PageSpinner } from '@/components/ui/Spinner'
import { useMyShop } from '@/hooks/useMyShop'
import { supabase } from '@/lib/supabase'
import { IconCar } from '@/components/layout/NavIcons'

interface Row { id: string; make: string; model: string; year: number; license_plate: string | null; vin: string | null; mileage: number | null; owner: string }

export default function ShopVehicles() {
  const { shop, loading: shopLoading } = useMyShop()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!shop) return
    async function load() {
      const { data: reqs } = await supabase.from('repair_requests').select('vehicles(id, make, model, year, license_plate, vin, mileage), profiles(full_name)').eq('shop_id', shop!.id)
      const map = new Map<string, Row>()
      for (const r of (reqs as any[]) ?? []) {
        const v = r.vehicles
        if (!v || map.has(v.id)) continue
        map.set(v.id, { ...v, owner: r.profiles?.full_name ?? 'Unknown' })
      }
      setRows(Array.from(map.values()))
      setLoading(false)
    }
    load()
  }, [shop])

  if (shopLoading) return <DashboardLayout title="Vehicles"><PageSpinner /></DashboardLayout>

  const filtered = rows.filter((r) =>
    !search || `${r.make} ${r.model}`.toLowerCase().includes(search.toLowerCase()) ||
    r.license_plate?.toLowerCase().includes(search.toLowerCase()) || r.vin?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout title="Vehicles">
      <Input placeholder="Search by make, plate, or VIN..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 max-w-sm" />
      {loading ? <TableSkeleton /> : filtered.length === 0 ? (
        <EmptyState icon={<IconCar />} title="No vehicles yet" message="Vehicles from customer requests will appear here." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-subtle text-xs uppercase tracking-wide text-ink/50">
              <tr><th className="px-4 py-3 text-left">Vehicle</th><th className="px-4 py-3 text-left">Owner</th><th className="px-4 py-3 text-left">Plate</th><th className="px-4 py-3 text-left">VIN</th><th className="px-4 py-3 text-left">Mileage</th></tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-b border-border last:border-0 hover:bg-subtle">
                  <td className="px-4 py-3 font-medium text-ink">{v.make} {v.model} ({v.year})</td>
                  <td className="px-4 py-3 text-ink/60">{v.owner}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink/60">{v.license_plate ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink/60">{v.vin ?? '—'}</td>
                  <td className="px-4 py-3 text-ink/60">{v.mileage ? `${v.mileage.toLocaleString()} km` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}
