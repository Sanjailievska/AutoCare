import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { StarRating } from '@/components/ui/StarRating'
import { ConfirmDialog } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/Empty'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import type { Review, Profile, RepairShop } from '@/types/database.types'
import { IconStar, IconX } from '@/components/layout/NavIcons'

type Row = Review & { profiles: Pick<Profile, 'full_name'> | null; repair_shops: Pick<RepairShop, 'name'> | null }

export default function AdminReviews() {
  const { push } = useToast()
  const [reviews, setReviews] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [toRemove, setToRemove] = useState<Row | null>(null)

  async function load() {
    const { data } = await supabase.from('reviews').select('*, profiles(full_name), repair_shops(name)').order('created_at', { ascending: false })
    setReviews((data as unknown as Row[]) ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function removeReview() {
    if (!toRemove) return
    await supabase.from('reviews').delete().eq('id', toRemove.id)
    push('Review removed.')
    load()
  }

  return (
    <DashboardLayout title="Reviews">
      {loading ? <TableSkeleton /> : reviews.length === 0 ? (
        <EmptyState icon={<IconStar />} title="No reviews yet" message="Reviews across the platform will show up here." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id}><CardBody className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{r.profiles?.full_name} → {r.repair_shops?.name}</p>
                <StarRating value={r.rating} readOnly size={16} />
                {r.comment && <p className="mt-1.5 text-sm text-ink/60">{r.comment}</p>}
                <p className="mt-1 text-xs text-ink/30">{format(new Date(r.created_at), 'MMM d, yyyy')}</p>
              </div>
              <button onClick={() => setToRemove(r)} className="text-ink/30 hover:text-danger"><IconX /></button>
            </CardBody></Card>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!toRemove} onClose={() => setToRemove(null)} onConfirm={removeReview} title="Remove review?" message="This review will be permanently removed and the shop's rating recalculated." confirmLabel="Remove" danger />
    </DashboardLayout>
  )
}
