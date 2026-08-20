import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { StarRating } from '@/components/ui/StarRating'
import { EmptyState } from '@/components/ui/Empty'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { PageSpinner } from '@/components/ui/Spinner'
import { useMyShop } from '@/hooks/useMyShop'
import { supabase } from '@/lib/supabase'
import type { Review, Profile } from '@/types/database.types'
import { IconStar } from '@/components/layout/NavIcons'

type Row = Review & { profiles: Pick<Profile, 'full_name'> | null }

export default function ShopReviews() {
  const { shop, loading: shopLoading } = useMyShop()
  const [reviews, setReviews] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!shop) return
    supabase.from('reviews').select('*, profiles(full_name)').eq('shop_id', shop.id).order('created_at', { ascending: false })
      .then(({ data }) => { setReviews((data as unknown as Row[]) ?? []); setLoading(false) })
  }, [shop])

  if (shopLoading) return <DashboardLayout title="Reviews"><PageSpinner /></DashboardLayout>

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <DashboardLayout title="Reviews">
      {!loading && reviews.length > 0 && (
        <Card className="mb-6"><CardBody className="flex items-center gap-4">
          <span className="font-display text-3xl font-bold text-ink">{avg.toFixed(1)}</span>
          <div><StarRating value={Math.round(avg)} readOnly /><p className="text-xs text-ink/50">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p></div>
        </CardBody></Card>
      )}
      {loading ? <TableSkeleton /> : reviews.length === 0 ? (
        <EmptyState icon={<IconStar />} title="No reviews yet" message="Reviews from customers after completed repairs will appear here." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id}><CardBody>
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink">{r.profiles?.full_name ?? 'AutoCare customer'}</p>
                <span className="text-xs text-ink/40">{format(new Date(r.created_at), 'MMM d, yyyy')}</span>
              </div>
              <StarRating value={r.rating} readOnly size={16} />
              {r.comment && <p className="mt-2 text-sm text-ink/60">{r.comment}</p>}
            </CardBody></Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
