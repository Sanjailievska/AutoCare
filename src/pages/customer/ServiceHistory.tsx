import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/Empty'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { IconHistory } from '@/components/layout/NavIcons'

interface Row { id: string; title: string; completed_at: string | null; final_cost: number | null; vehicle: string; shop: string }

export default function ServiceHistory() {
  const { user } = useAuth()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data } = await supabase
        .from('repair_requests')
        .select('id, title, updated_at, vehicles(make, model), repair_shops(name), repairs(completed_at, final_cost)')
        .eq('customer_id', user!.id)
        .eq('status', 'COMPLETED')
        .order('updated_at', { ascending: false })

      const mapped: Row[] = ((data as any[]) ?? []).map((r) => {
        const rep = Array.isArray(r.repairs) ? r.repairs[0] : r.repairs
        return {
          id: r.id, title: r.title,
          completed_at: rep?.completed_at ?? r.updated_at,
          final_cost: rep?.final_cost ?? null,
          vehicle: `${r.vehicles?.make ?? ''} ${r.vehicles?.model ?? ''}`.trim(),
          shop: r.repair_shops?.name ?? '',
        }
      })
      setRows(mapped)
      setTotal(mapped.reduce((s, r) => s + (r.final_cost ?? 0), 0))
      setLoading(false)
    }
    load()
  }, [user])

  const byMonth = rows.reduce<Record<string, Row[]>>((acc, r) => {
    const key = r.completed_at ? format(new Date(r.completed_at), 'MMMM yyyy') : 'Unknown date'
    acc[key] = acc[key] ? [...acc[key], r] : [r]
    return acc
  }, {})

  return (
    <DashboardLayout title="Service History">
      {loading ? <TableSkeleton /> : rows.length === 0 ? (
        <EmptyState icon={<IconHistory />} title="No service history yet" message="Completed repairs across all your vehicles will appear here." />
      ) : (
        <>
          <Card className="mb-6"><CardBody className="flex items-center justify-between">
            <span className="text-sm text-ink/60">Total spent across all completed repairs</span>
            <span className="font-mono text-xl font-bold text-ink">€{total.toFixed(2)}</span>
          </CardBody></Card>

          <div className="space-y-6">
            {Object.entries(byMonth).map(([month, items]) => (
              <div key={month}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">{month}</h3>
                <div className="space-y-2">
                  {items.map((r) => (
                    <Link key={r.id} to={`/customer/requests/${r.id}`}>
                      <Card className="hover:shadow-pop">
                        <CardBody className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-ink">{r.title}</p>
                            <p className="text-xs text-ink/50">{r.vehicle} · {r.shop}</p>
                          </div>
                          <span className="font-mono font-semibold text-ink">€{(r.final_cost ?? 0).toFixed(2)}</span>
                        </CardBody>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
