import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Empty'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { PageSpinner } from '@/components/ui/Spinner'
import { useMyShop } from '@/hooks/useMyShop'
import { supabase } from '@/lib/supabase'
import type { RepairRequest, Vehicle, Profile, Mechanic } from '@/types/database.types'
import { IconWrench, IconChevronRight } from '@/components/layout/NavIcons'

type Row = RepairRequest & { vehicles: Pick<Vehicle, 'make' | 'model'> | null; profiles: Pick<Profile, 'full_name'> | null; mechanics: Pick<Mechanic, 'full_name'> | null }

export default function ActiveRepairs() {
  const { shop, loading: shopLoading } = useMyShop()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!shop) return
    supabase.from('repair_requests')
      .select('*, vehicles(make, model), profiles(full_name), mechanics(full_name)')
      .eq('shop_id', shop.id)
      .in('status', ['IN_REPAIR', 'READY_FOR_PICKUP'])
      .order('updated_at', { ascending: false })
      .then(({ data }) => { setRows((data as unknown as Row[]) ?? []); setLoading(false) })
  }, [shop])

  if (shopLoading) return <DashboardLayout title="Active Repairs"><PageSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Active Repairs">
      {loading ? <TableSkeleton /> : rows.length === 0 ? (
        <EmptyState icon={<IconWrench />} title="No active repairs" message="Vehicles currently being repaired will show up here." />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Link key={r.id} to={`/shop/requests/${r.id}`}>
              <Card className="hover:shadow-pop"><CardBody className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-ink">{r.title}</p>
                  <p className="text-xs text-ink/50">{r.profiles?.full_name} · {r.vehicles?.make} {r.vehicles?.model} · Mechanic: {r.mechanics?.full_name ?? 'Unassigned'}</p>
                </div>
                <div className="flex items-center gap-3"><StatusBadge status={r.status} /><IconChevronRight className="text-ink/30" /></div>
              </CardBody></Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
