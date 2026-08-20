import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Empty'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { PageSpinner } from '@/components/ui/Spinner'
import { useMyShop } from '@/hooks/useMyShop'
import { supabase } from '@/lib/supabase'
import type { RepairRequest, Vehicle, Profile } from '@/types/database.types'
import { IconCalendar, IconChevronRight } from '@/components/layout/NavIcons'

type Row = RepairRequest & { vehicles: Pick<Vehicle, 'make' | 'model'> | null; profiles: Pick<Profile, 'full_name'> | null }

export default function Appointments() {
  const { shop, loading: shopLoading } = useMyShop()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!shop) return
    supabase.from('repair_requests')
      .select('*, vehicles(make, model), profiles(full_name)')
      .eq('shop_id', shop.id)
      .not('preferred_date', 'is', null)
      .gte('preferred_date', new Date().toISOString().slice(0, 10))
      .order('preferred_date', { ascending: true })
      .then(({ data }) => { setRows((data as unknown as Row[]) ?? []); setLoading(false) })
  }, [shop])

  if (shopLoading) return <DashboardLayout title="Appointments"><PageSpinner /></DashboardLayout>

  const byDate = rows.reduce<Record<string, Row[]>>((acc, r) => {
    const key = r.preferred_date!
    acc[key] = acc[key] ? [...acc[key], r] : [r]
    return acc
  }, {})

  return (
    <DashboardLayout title="Appointments">
      {loading ? <TableSkeleton /> : rows.length === 0 ? (
        <EmptyState icon={<IconCalendar />} title="No upcoming appointments" message="Requests with a preferred date will be scheduled here." />
      ) : (
        <div className="space-y-6">
          {Object.entries(byDate).map(([date, items]) => (
            <div key={date}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</h3>
              <div className="space-y-2">
                {items.map((r) => (
                  <Link key={r.id} to={`/shop/requests/${r.id}`}>
                    <Card className="hover:shadow-pop"><CardBody className="flex items-center justify-between">
                      <div><p className="font-medium text-ink">{r.title}</p><p className="text-xs text-ink/50">{r.profiles?.full_name} · {r.vehicles?.make} {r.vehicles?.model}</p></div>
                      <div className="flex items-center gap-3"><StatusBadge status={r.status} /><IconChevronRight className="text-ink/30" /></div>
                    </CardBody></Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
