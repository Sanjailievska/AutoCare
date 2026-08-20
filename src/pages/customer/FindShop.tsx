import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/Empty'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'
import type { RepairShop } from '@/types/database.types'
import { IconShop, IconSearch, IconStar } from '@/components/layout/NavIcons'

export default function FindShop() {
  const [shops, setShops] = useState<RepairShop[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [minRating, setMinRating] = useState(0)

  useEffect(() => {
    supabase.from('repair_shops').select('*').eq('is_active', true).order('rating', { ascending: false }).then(({ data }) => {
      const all = (data as RepairShop[]) ?? []
      setShops(all)
      setCities(Array.from(new Set(all.map((s) => s.city))).sort())
      setLoading(false)
    })
  }, [])

  const filtered = shops.filter((s) =>
    (!search || s.name.toLowerCase().includes(search.toLowerCase())) &&
    (!city || s.city === city) &&
    s.rating >= minRating
  )

  return (
    <DashboardLayout title="Find a Repair Shop">
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
          <option value={0}>Any rating</option>
          <option value={3}>3+ stars</option>
          <option value={4}>4+ stars</option>
          <option value={4.5}>4.5+ stars</option>
        </Select>
      </div>

      {loading ? <TableSkeleton /> : filtered.length === 0 ? (
        <EmptyState icon={<IconSearch />} title="No shops match your filters" message="Try a broader search or clear filters." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Link key={s.id} to={`/customer/shops/${s.id}`}>
              <Card className="h-full transition-shadow hover:shadow-pop">
                <CardBody>
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-subtle">
                      {s.logo_url ? <img src={s.logo_url} className="h-full w-full rounded-lg object-cover" alt="" /> : <IconShop className="text-ink/30" />}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-ink">{s.name}</p>
                      <p className="text-xs text-ink/50">{s.city}</p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-ink/60">{s.description}</p>
                  <div className="mt-3 flex items-center gap-1 text-sm">
                    <IconStar className="h-4 w-4 text-torque" />
                    <span className="font-medium text-ink">{s.rating.toFixed(1)}</span>
                    <span className="text-ink/40">rating</span>
                  </div>
                  {s.opening_hours && <p className="mt-2 text-xs text-ink/40">{s.opening_hours}</p>}
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
