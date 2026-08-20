import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/Empty'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import type { RepairShop } from '@/types/database.types'
import { IconShop, IconStar } from '@/components/layout/NavIcons'

export default function AdminShops() {
  const { push } = useToast()
  const [shops, setShops] = useState<RepairShop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function load() {
    const { data } = await supabase.from('repair_shops').select('*').order('created_at', { ascending: false })
    setShops((data as RepairShop[]) ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function toggleActive(s: RepairShop) {
    await supabase.from('repair_shops').update({ is_active: !s.is_active }).eq('id', s.id)
    push(s.is_active ? 'Shop deactivated.' : 'Shop reactivated.')
    load()
  }

  const filtered = shops.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase()))

  return (
    <DashboardLayout title="Repair Shops">
      <Input placeholder="Search shops or cities..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 max-w-sm" />
      {loading ? <TableSkeleton /> : filtered.length === 0 ? (
        <EmptyState icon={<IconShop />} title="No shops found" message="Try a different search." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Card key={s.id} className={!s.is_active ? 'opacity-50' : ''}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/customer/shops/${s.id}`} className="font-display font-semibold text-ink hover:underline">{s.name}</Link>
                    <p className="text-xs text-ink/50">{s.city}{s.is_demo && <span className="ml-2 rounded bg-subtle px-1.5 py-0.5 text-[10px] font-semibold text-ink/40">DEMO</span>}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-sm"><IconStar className="h-4 w-4 text-torque" /><span className="font-medium text-ink">{s.rating.toFixed(1)}</span></div>
                <button onClick={() => toggleActive(s)} className="mt-3 text-xs font-medium text-torque hover:underline">{s.is_active ? 'Deactivate shop' : 'Reactivate shop'}</button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
