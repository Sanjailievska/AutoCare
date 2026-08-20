import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StarRating } from '@/components/ui/StarRating'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/Empty'
import { supabase } from '@/lib/supabase'
import type { RepairShop, Service, Review, Profile } from '@/types/database.types'
import { IconShop, IconStar, IconCar } from '@/components/layout/NavIcons'

type ReviewRow = Review & { profiles: Pick<Profile, 'full_name'> | null }

export default function ShopProfile() {
  const { id } = useParams()
  const [shop, setShop] = useState<RepairShop | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      const [{ data: s }, { data: svc }, { data: rev }] = await Promise.all([
        supabase.from('repair_shops').select('*').eq('id', id).single(),
        supabase.from('services').select('*').eq('shop_id', id).eq('is_active', true).order('category'),
        supabase.from('reviews').select('*, profiles(full_name)').eq('shop_id', id).order('created_at', { ascending: false }),
      ])
      setShop(s as RepairShop)
      setServices((svc as Service[]) ?? [])
      setReviews((rev as unknown as ReviewRow[]) ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <DashboardLayout title="Repair Shop"><PageSpinner /></DashboardLayout>
  if (!shop) return <DashboardLayout title="Repair Shop"><p className="text-sm text-ink/60">Shop not found.</p></DashboardLayout>

  const byCategory = services.reduce<Record<string, Service[]>>((acc, s) => {
    const key = s.category || 'Other services'
    acc[key] = acc[key] ? [...acc[key], s] : [s]
    return acc
  }, {})

  return (
    <DashboardLayout title={shop.name}>
      <Card className="mb-6">
        <CardBody className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-subtle">
              {shop.logo_url ? <img src={shop.logo_url} className="h-full w-full rounded-xl object-cover" alt="" /> : <IconShop className="h-7 w-7 text-ink/30" />}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink">{shop.name}</h2>
              <p className="text-sm text-ink/50">{shop.address}, {shop.city}</p>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <IconStar className="h-4 w-4 text-torque" /><span className="font-medium">{shop.rating.toFixed(1)}</span>
                <span className="text-ink/40">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            </div>
          </div>
          <Link to={`/customer/requests/new?shop=${shop.id}`}><Button size="lg">Request Repair</Button></Link>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {shop.description && (
            <Card><CardBody><p className="text-sm text-ink/70">{shop.description}</p></CardBody></Card>
          )}

          <Card>
            <CardHeader><h3 className="font-display text-sm font-semibold text-ink">Services & prices</h3></CardHeader>
            <CardBody>
              {Object.keys(byCategory).length === 0 ? (
                <p className="text-sm text-ink/50">No services listed yet.</p>
              ) : (
                Object.entries(byCategory).map(([cat, svcs]) => (
                  <div key={cat} className="mb-4 last:mb-0">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">{cat}</p>
                    <div className="space-y-2">
                      {svcs.map((s) => (
                        <div key={s.id} className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0">
                          <div>
                            <p className="font-medium text-ink">{s.name}</p>
                            {s.estimated_duration && <p className="text-xs text-ink/40">{s.estimated_duration}</p>}
                          </div>
                          {s.base_price != null && <span className="font-mono text-ink">from €{s.base_price}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="font-display text-sm font-semibold text-ink">Reviews</h3></CardHeader>
            <CardBody>
              {reviews.length === 0 ? (
                <EmptyState title="No reviews yet" message="Be the first to leave one after your repair is completed." />
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-ink">{r.profiles?.full_name ?? 'AutoCare customer'}</p>
                        <span className="text-xs text-ink/40">{format(new Date(r.created_at), 'MMM d, yyyy')}</span>
                      </div>
                      <StarRating value={r.rating} readOnly size={16} />
                      {r.comment && <p className="mt-1.5 text-sm text-ink/60">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader><h3 className="font-display text-sm font-semibold text-ink">Details</h3></CardHeader>
          <CardBody className="space-y-2.5 text-sm">
            {shop.opening_hours && <Detail label="Hours" value={shop.opening_hours} />}
            {shop.phone && <Detail label="Phone" value={shop.phone} />}
            {shop.email && <Detail label="Email" value={shop.email} />}
            {shop.website && <Detail label="Website" value={shop.website} />}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border pb-2 last:border-0">
      <span className="text-ink/50">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  )
}
