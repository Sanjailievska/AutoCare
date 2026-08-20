import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { IconUsers, IconShop, IconClipboard, IconWrench, IconStar } from '@/components/layout/NavIcons'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, shops: 0, requests: 0, activeRepairs: 0, reviews: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [users, shops, requests, activeRepairs, reviews, revenueRows] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('repair_shops').select('id', { count: 'exact', head: true }),
        supabase.from('repair_requests').select('id', { count: 'exact', head: true }),
        supabase.from('repairs').select('id', { count: 'exact', head: true }).in('status', ['IN_REPAIR', 'READY_FOR_PICKUP']),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
        supabase.from('repairs').select('final_cost').eq('status', 'COMPLETED'),
      ])
      setStats({
        users: users.count ?? 0, shops: shops.count ?? 0, requests: requests.count ?? 0,
        activeRepairs: activeRepairs.count ?? 0, reviews: reviews.count ?? 0,
        revenue: ((revenueRows.data as any[]) ?? []).reduce((s, r) => s + (r.final_cost ?? 0), 0),
      })
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label: 'Total users', value: stats.users, icon: <IconUsers /> },
    { label: 'Repair shops', value: stats.shops, icon: <IconShop /> },
    { label: 'Repair requests', value: stats.requests, icon: <IconClipboard /> },
    { label: 'Active repairs', value: stats.activeRepairs, icon: <IconWrench /> },
    { label: 'Reviews', value: stats.reviews, icon: <IconStar /> },
    { label: 'Platform revenue', value: `€${stats.revenue.toFixed(0)}`, icon: <IconClipboard /> },
  ]

  return (
    <DashboardLayout title="Platform Overview">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}><CardBody>
            <span className="text-torque">{c.icon}</span>
            <p className="mt-3 font-display text-2xl font-bold text-ink">{loading ? '—' : c.value}</p>
            <p className="text-xs text-ink/50">{c.label}</p>
          </CardBody></Card>
        ))}
      </div>
    </DashboardLayout>
  )
}
