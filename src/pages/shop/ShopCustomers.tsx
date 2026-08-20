import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/Empty'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { PageSpinner } from '@/components/ui/Spinner'
import { useMyShop } from '@/hooks/useMyShop'
import { supabase } from '@/lib/supabase'
import { IconUsers } from '@/components/layout/NavIcons'

interface CustomerRow { id: string; full_name: string; email: string; phone: string | null; requestCount: number; vehicleCount: number }

export default function ShopCustomers() {
  const { shop, loading: shopLoading } = useMyShop()
  const [rows, setRows] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!shop) return
    async function load() {
      const { data: reqs } = await supabase.from('repair_requests').select('customer_id, vehicle_id, profiles(id, full_name, email, phone)').eq('shop_id', shop!.id)
      const map = new Map<string, CustomerRow>()
      for (const r of (reqs as any[]) ?? []) {
        const p = r.profiles
        if (!p) continue
        const existing = map.get(p.id)
        if (existing) { existing.requestCount++; existing.vehicleCount = new Set([...Array(existing.vehicleCount).keys(), r.vehicle_id]).size }
        else map.set(p.id, { id: p.id, full_name: p.full_name, email: p.email, phone: p.phone, requestCount: 1, vehicleCount: 1 })
      }
      setRows(Array.from(map.values()))
      setLoading(false)
    }
    load()
  }, [shop])

  if (shopLoading) return <DashboardLayout title="Customers"><PageSpinner /></DashboardLayout>

  const filtered = rows.filter((r) => !search || r.full_name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <DashboardLayout title="Customers">
      <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 max-w-sm" />
      {loading ? <TableSkeleton /> : filtered.length === 0 ? (
        <EmptyState icon={<IconUsers />} title="No customers yet" message="Customers who submit requests to your shop will appear here." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-subtle text-xs uppercase tracking-wide text-ink/50">
              <tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Contact</th><th className="px-4 py-3 text-left">Requests</th></tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-subtle">
                  <td className="px-4 py-3 font-medium text-ink">{c.full_name}</td>
                  <td className="px-4 py-3 text-ink/60">{c.email}{c.phone ? ` · ${c.phone}` : ''}</td>
                  <td className="px-4 py-3 text-ink/60">{c.requestCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}
