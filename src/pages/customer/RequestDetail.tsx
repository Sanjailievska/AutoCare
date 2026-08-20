import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { StatusBadge, UrgencyBadge, EstimateBadge } from '@/components/ui/Badge'
import { StatusTimeline } from '@/components/requests/StatusTimeline'
import { StarRating } from '@/components/ui/StarRating'
import { ConfirmDialog } from '@/components/ui/Modal'
import { PageSpinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type {
  RepairRequest, Vehicle, RepairShop, RepairRequestImage, Diagnosis,
  Estimate, EstimateItem, Repair, RepairImage, Review,
} from '@/types/database.types'

interface FullRequest extends RepairRequest {
  vehicles: Vehicle
  repair_shops: RepairShop
}

export default function RequestDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { push } = useToast()

  const [request, setRequest] = useState<FullRequest | null>(null)
  const [images, setImages] = useState<RepairRequestImage[]>([])
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [items, setItems] = useState<EstimateItem[]>([])
  const [repair, setRepair] = useState<Repair | null>(null)
  const [repairImages, setRepairImages] = useState<RepairImage[]>([])
  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)

  const [confirmApprove, setConfirmApprove] = useState(false)
  const [confirmReject, setConfirmReject] = useState(false)
  const [acting, setActing] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const { data: r } = await supabase.from('repair_requests').select('*, vehicles(*), repair_shops(*)').eq('id', id).single()
    setRequest(r as unknown as FullRequest)
    const [{ data: imgs }, { data: diag }, { data: est }] = await Promise.all([
      supabase.from('repair_request_images').select('*').eq('repair_request_id', id),
      supabase.from('diagnoses').select('*').eq('repair_request_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('estimates').select('*').eq('repair_request_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ])
    setImages((imgs as RepairRequestImage[]) ?? [])
    setDiagnosis((diag as Diagnosis) ?? null)
    setEstimate((est as Estimate) ?? null)
    if (est) {
      const { data: its } = await supabase.from('estimate_items').select('*').eq('estimate_id', (est as Estimate).id)
      setItems((its as EstimateItem[]) ?? [])
    } else setItems([])

    const { data: rep } = await supabase.from('repairs').select('*').eq('repair_request_id', id).maybeSingle()
    setRepair((rep as Repair) ?? null)
    if (rep) {
      const { data: rimgs } = await supabase.from('repair_images').select('*').eq('repair_id', (rep as Repair).id)
      setRepairImages((rimgs as RepairImage[]) ?? [])
    }
    const { data: rev } = await supabase.from('reviews').select('*').eq('repair_request_id', id).maybeSingle()
    setReview((rev as Review) ?? null)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleEstimateDecision(approve: boolean) {
    if (!estimate) return
    setActing(true)
    const { error } = await supabase.from('estimates').update({ status: approve ? 'APPROVED' : 'REJECTED' }).eq('id', estimate.id)
    setActing(false)
    if (error) { push('Something went wrong: ' + error.message, 'error'); return }
    push(approve ? 'Estimate approved — repair will begin shortly.' : 'Estimate rejected.')
    load()
  }

  async function submitReview() {
    if (!request || !user) return
    setSubmittingReview(true)
    const { error } = await supabase.from('reviews').insert({
      customer_id: user.id, shop_id: request.shop_id, repair_request_id: request.id, rating, comment: comment || null,
    })
    setSubmittingReview(false)
    if (error) { push('Could not submit review: ' + error.message, 'error'); return }
    push('Thanks for your review!')
    load()
  }

  if (loading) return <DashboardLayout title="Repair Request"><PageSpinner /></DashboardLayout>
  if (!request) return <DashboardLayout title="Repair Request"><p className="text-sm text-ink/60">Request not found.</p></DashboardLayout>

  return (
    <DashboardLayout title={request.title}>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <StatusBadge status={request.status} />
        <UrgencyBadge urgency={request.urgency} />
        <span className="text-xs text-ink/40">Submitted {format(new Date(request.created_at), 'MMM d, yyyy')}</span>
      </div>

      <Card className="mb-6">
        <CardBody>
          <StatusTimeline status={request.status} />
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><h2 className="font-display text-sm font-semibold text-ink">The problem</h2></CardHeader>
            <CardBody>
              <p className="text-sm text-ink/70">{request.description}</p>
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {images.map((img) => (
                    <a key={img.id} href={img.image_url} target="_blank" rel="noreferrer">
                      <img src={img.image_url} className="aspect-square w-full rounded-lg object-cover" alt="" />
                    </a>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {diagnosis && (
            <Card>
              <CardHeader><h2 className="font-display text-sm font-semibold text-ink">Diagnosis</h2></CardHeader>
              <CardBody className="space-y-2 text-sm">
                <p className="text-ink/70">{diagnosis.description}</p>
                {diagnosis.recommended_repairs && <p className="text-ink/50"><span className="font-medium text-ink/70">Recommended: </span>{diagnosis.recommended_repairs}</p>}
              </CardBody>
            </Card>
          )}

          {estimate && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold text-ink">Repair estimate</h2>
                <EstimateBadge status={estimate.status} />
              </CardHeader>
              <CardBody>
                <table className="w-full text-sm">
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.id} className="border-b border-border last:border-0">
                        <td className="py-2 text-ink/70">{it.description} <span className="text-xs text-ink/40">×{it.quantity}</span></td>
                        <td className="py-2 text-right font-mono text-ink">€{it.total_price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-ink">
                      <td className="pt-2 font-semibold text-ink">Total</td>
                      <td className="pt-2 text-right font-mono text-lg font-bold text-ink">€{estimate.total_amount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
                {estimate.notes && <p className="mt-3 text-xs text-ink/50">{estimate.notes}</p>}

                {estimate.status === 'PENDING' && (
                  <div className="mt-4 flex gap-2">
                    <Button variant="success" onClick={() => setConfirmApprove(true)}>Approve Estimate</Button>
                    <Button variant="danger" onClick={() => setConfirmReject(true)}>Reject Estimate</Button>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {repair && repairImages.length > 0 && (
            <Card>
              <CardHeader><h2 className="font-display text-sm font-semibold text-ink">Repair photos</h2></CardHeader>
              <CardBody className="grid grid-cols-3 gap-2">
                {repairImages.map((img) => (
                  <a key={img.id} href={img.image_url} target="_blank" rel="noreferrer">
                    <img src={img.image_url} className="aspect-square w-full rounded-lg object-cover" alt="" />
                  </a>
                ))}
              </CardBody>
            </Card>
          )}

          {request.status === 'COMPLETED' && (
            <Card>
              <CardHeader><h2 className="font-display text-sm font-semibold text-ink">Your review</h2></CardHeader>
              <CardBody>
                {review ? (
                  <div>
                    <StarRating value={review.rating} readOnly />
                    {review.comment && <p className="mt-2 text-sm text-ink/70">{review.comment}</p>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <StarRating value={rating} onChange={setRating} />
                    <Textarea placeholder="How was the repair? (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
                    <Button onClick={submitReview} loading={submittingReview}>Submit review</Button>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="font-display text-sm font-semibold text-ink">Vehicle</h2></CardHeader>
            <CardBody className="text-sm">
              <p className="font-medium text-ink">{request.vehicles.make} {request.vehicles.model} ({request.vehicles.year})</p>
              <p className="mt-1 text-ink/50">{request.vehicles.mileage ? `${request.vehicles.mileage.toLocaleString()} km` : 'Mileage not on file'}</p>
              {request.vehicles.license_plate && <p className="mt-1 font-mono text-xs text-ink/50">{request.vehicles.license_plate}</p>}
            </CardBody>
          </Card>
          <Card>
            <CardHeader><h2 className="font-display text-sm font-semibold text-ink">Repair shop</h2></CardHeader>
            <CardBody className="text-sm">
              <p className="font-medium text-ink">{request.repair_shops.name}</p>
              <p className="mt-1 text-ink/50">{request.repair_shops.address}, {request.repair_shops.city}</p>
              {request.repair_shops.phone && <p className="mt-1 text-ink/50">{request.repair_shops.phone}</p>}
            </CardBody>
          </Card>
        </div>
      </div>

      <ConfirmDialog open={confirmApprove} onClose={() => setConfirmApprove(false)} onConfirm={() => handleEstimateDecision(true)}
        title="Approve estimate?" message={`This authorizes the shop to begin the repair for €${estimate?.total_amount.toFixed(2)}.`} confirmLabel="Approve" />
      <ConfirmDialog open={confirmReject} onClose={() => setConfirmReject(false)} onConfirm={() => handleEstimateDecision(false)}
        title="Reject estimate?" message="The shop will be notified and the request will be marked rejected." confirmLabel="Reject" danger />
    </DashboardLayout>
  )
}
