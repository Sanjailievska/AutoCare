import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { StatusBadge, UrgencyBadge, EstimateBadge } from '@/components/ui/Badge'
import { StatusTimeline } from '@/components/requests/StatusTimeline'
import { ConfirmDialog } from '@/components/ui/Modal'
import { PageSpinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useMyShop } from '@/hooks/useMyShop'
import { supabase } from '@/lib/supabase'
import type {
  RepairRequest, Vehicle, Profile, RepairRequestImage, Diagnosis, Mechanic,
  Estimate, EstimateItem, Repair, RepairImage, EstimateItemType,
} from '@/types/database.types'
import { IconCamera, IconPlus, IconX } from '@/components/layout/NavIcons'

interface FullRequest extends RepairRequest {
  vehicles: Vehicle
  profiles: Profile
}

const emptyItem = { description: '', item_type: 'PART' as EstimateItemType, quantity: 1, unit_price: 0 }

export default function ShopRequestDetail() {
  const { id } = useParams()
  const { shop } = useMyShop()
  const { push } = useToast()
  const { upload } = useImageUpload('repair-images')

  const [request, setRequest] = useState<FullRequest | null>(null)
  const [images, setImages] = useState<RepairRequestImage[]>([])
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [items, setItems] = useState<EstimateItem[]>([])
  const [repair, setRepair] = useState<Repair | null>(null)
  const [repairImages, setRepairImages] = useState<RepairImage[]>([])
  const [loading, setLoading] = useState(true)

  const [confirmReject, setConfirmReject] = useState(false)
  const [acting, setActing] = useState(false)

  const [diagText, setDiagText] = useState('')
  const [diagRecommend, setDiagRecommend] = useState('')
  const [savingDiag, setSavingDiag] = useState(false)

  const [estNotes, setEstNotes] = useState('')
  const [newItems, setNewItems] = useState([{ ...emptyItem }])
  const [savingEstimate, setSavingEstimate] = useState(false)

  const [repairNotes, setRepairNotes] = useState('')
  const [finalCost, setFinalCost] = useState('')
  const [savingRepair, setSavingRepair] = useState(false)

  const load = useCallback(async () => {
    if (!id || !shop) return
    setLoading(true)
    const { data: r } = await supabase.from('repair_requests').select('*, vehicles(*), profiles(*)').eq('id', id).single()
    setRequest(r as unknown as FullRequest)
    const [{ data: imgs }, { data: mechs }, { data: diag }, { data: est }] = await Promise.all([
      supabase.from('repair_request_images').select('*').eq('repair_request_id', id),
      supabase.from('mechanics').select('*').eq('shop_id', shop.id).eq('is_active', true),
      supabase.from('diagnoses').select('*').eq('repair_request_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('estimates').select('*').eq('repair_request_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ])
    setImages((imgs as RepairRequestImage[]) ?? [])
    setMechanics((mechs as Mechanic[]) ?? [])
    setDiagnosis((diag as Diagnosis) ?? null)
    if (diag) { setDiagText((diag as Diagnosis).description); setDiagRecommend((diag as Diagnosis).recommended_repairs ?? '') }
    setEstimate((est as Estimate) ?? null)
    if (est) {
      const { data: its } = await supabase.from('estimate_items').select('*').eq('estimate_id', (est as Estimate).id)
      setItems((its as EstimateItem[]) ?? [])
    } else setItems([])

    const { data: rep } = await supabase.from('repairs').select('*').eq('repair_request_id', id).maybeSingle()
    setRepair((rep as Repair) ?? null)
    if (rep) {
      setRepairNotes((rep as Repair).notes ?? '')
      setFinalCost((rep as Repair).final_cost != null ? String((rep as Repair).final_cost) : '')
      const { data: rimgs } = await supabase.from('repair_images').select('*').eq('repair_id', (rep as Repair).id)
      setRepairImages((rimgs as RepairImage[]) ?? [])
    }
    setLoading(false)
  }, [id, shop])

  useEffect(() => { load() }, [load])

  async function accept() {
    if (!request) return
    setActing(true)
    await supabase.from('repair_requests').update({ status: 'ACCEPTED' }).eq('id', request.id)
    setActing(false)
    push('Request accepted.')
    load()
  }

  async function reject() {
    if (!request) return
    setActing(true)
    await supabase.from('repair_requests').update({ status: 'REJECTED' }).eq('id', request.id)
    setActing(false)
    push('Request declined.')
    load()
  }

  async function assignMechanic(mechanicId: string) {
    if (!request) return
    await supabase.from('repair_requests').update({ assigned_mechanic_id: mechanicId || null }).eq('id', request.id)
    load()
  }

  async function saveDiagnosis() {
    if (!request) return
    setSavingDiag(true)
    const { error } = await supabase.from('diagnoses').insert({
      repair_request_id: request.id, mechanic_id: request.assigned_mechanic_id, description: diagText, recommended_repairs: diagRecommend || null,
    })
    setSavingDiag(false)
    if (error) { push('Could not save diagnosis: ' + error.message, 'error'); return }
    push('Diagnosis saved.')
    load()
  }

  function updateItem(i: number, patch: Partial<typeof emptyItem>) {
    setNewItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }

  async function sendEstimate() {
    if (!request) return
    const validItems = newItems.filter((it) => it.description.trim() && it.unit_price >= 0)
    if (validItems.length === 0) { push('Add at least one line item.', 'error'); return }
    setSavingEstimate(true)
    const { data: est, error } = await supabase.from('estimates').insert({ repair_request_id: request.id, notes: estNotes || null }).select().single()
    if (error || !est) { push('Could not create estimate: ' + (error?.message ?? ''), 'error'); setSavingEstimate(false); return }
    const { error: itemsErr } = await supabase.from('estimate_items').insert(
      validItems.map((it) => ({ estimate_id: est.id, description: it.description, item_type: it.item_type, quantity: it.quantity, unit_price: it.unit_price }))
    )
    setSavingEstimate(false)
    if (itemsErr) { push('Could not save line items: ' + itemsErr.message, 'error'); return }
    push('Estimate sent to customer.')
    load()
  }

  const estimateTotal = newItems.reduce((s, it) => s + it.quantity * it.unit_price, 0)

  async function updateRepairStatus(status: 'READY_FOR_PICKUP' | 'COMPLETED') {
    if (!repair) return
    setSavingRepair(true)
    const patch: Record<string, unknown> = { status, notes: repairNotes || null }
    if (status === 'COMPLETED') patch.final_cost = finalCost ? Number(finalCost) : estimate?.total_amount ?? 0
    const { error } = await supabase.from('repairs').update(patch).eq('id', repair.id)
    setSavingRepair(false)
    if (error) { push('Could not update: ' + error.message, 'error'); return }
    push(status === 'COMPLETED' ? 'Repair marked complete.' : 'Vehicle marked ready for pickup.')
    load()
  }

  async function onUploadRepairPhoto(file: File) {
    if (!repair) return
    const url = await upload(file, repair.id)
    if (url) { await supabase.from('repair_images').insert({ repair_id: repair.id, image_url: url }); load() }
  }

  if (loading) return <DashboardLayout title="Repair Request"><PageSpinner /></DashboardLayout>
  if (!request) return <DashboardLayout title="Repair Request"><p className="text-sm text-ink/60">Not found.</p></DashboardLayout>

  return (
    <DashboardLayout title={request.title}>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <StatusBadge status={request.status} />
        <UrgencyBadge urgency={request.urgency} />
        <span className="text-xs text-ink/40">Submitted {format(new Date(request.created_at), 'MMM d, yyyy')}</span>
      </div>

      <Card className="mb-6"><CardBody><StatusTimeline status={request.status} /></CardBody></Card>

      {request.status === 'SUBMITTED' && (
        <Card className="mb-6 border-torque/30 bg-torque-50/40">
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">New request — accept it to begin working with this customer.</p>
            <div className="flex gap-2">
              <Button variant="success" onClick={accept} loading={acting}>Accept</Button>
              <Button variant="danger" onClick={() => setConfirmReject(true)}>Reject</Button>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><h2 className="font-display text-sm font-semibold text-ink">Problem description</h2></CardHeader>
            <CardBody>
              <p className="text-sm text-ink/70">{request.description}</p>
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {images.map((img) => <a key={img.id} href={img.image_url} target="_blank" rel="noreferrer"><img src={img.image_url} className="aspect-square w-full rounded-lg object-cover" alt="" /></a>)}
                </div>
              )}
            </CardBody>
          </Card>

          {request.status !== 'SUBMITTED' && request.status !== 'REJECTED' && (
            <Card>
              <CardHeader><h2 className="font-display text-sm font-semibold text-ink">Diagnosis</h2></CardHeader>
              <CardBody className="space-y-3">
                <Textarea label="Diagnosis" value={diagText} onChange={(e) => setDiagText(e.target.value)} placeholder="What's wrong with the vehicle..." />
                <Textarea label="Recommended repairs" value={diagRecommend} onChange={(e) => setDiagRecommend(e.target.value)} placeholder="What needs to be done..." />
                <Button onClick={saveDiagnosis} loading={savingDiag} disabled={!diagText.trim()}>{diagnosis ? 'Update diagnosis' : 'Save diagnosis'}</Button>
              </CardBody>
            </Card>
          )}

          {diagnosis && !estimate && (
            <Card>
              <CardHeader><h2 className="font-display text-sm font-semibold text-ink">Create estimate</h2></CardHeader>
              <CardBody className="space-y-3">
                {newItems.map((it, i) => (
                  <div key={i} className="grid grid-cols-12 items-end gap-2">
                    <Input className="col-span-5" placeholder="Description" value={it.description} onChange={(e) => updateItem(i, { description: e.target.value })} />
                    <Select className="col-span-2" value={it.item_type} onChange={(e) => updateItem(i, { item_type: e.target.value as EstimateItemType })}>
                      <option value="PART">Part</option><option value="LABOR">Labor</option><option value="SERVICE">Service</option>
                    </Select>
                    <Input className="col-span-2" type="number" min={0} step="0.5" placeholder="Qty" value={it.quantity} onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })} />
                    <Input className="col-span-2" type="number" min={0} step="0.01" placeholder="Unit €" value={it.unit_price} onChange={(e) => updateItem(i, { unit_price: Number(e.target.value) })} />
                    <button type="button" onClick={() => setNewItems((arr) => arr.filter((_, idx) => idx !== i))} className="col-span-1 flex justify-center text-ink/30 hover:text-danger"><IconX /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setNewItems((arr) => [...arr, { ...emptyItem }])} className="inline-flex items-center gap-1.5 text-sm font-medium text-torque hover:underline">
                  <IconPlus className="h-4 w-4" /> Add line item
                </button>
                <Textarea label="Notes (optional)" value={estNotes} onChange={(e) => setEstNotes(e.target.value)} />
                <div className="flex items-center justify-between rounded-lg bg-subtle px-4 py-3">
                  <span className="text-sm font-medium text-ink">Total</span>
                  <span className="font-mono text-lg font-bold text-ink">€{estimateTotal.toFixed(2)}</span>
                </div>
                <Button onClick={sendEstimate} loading={savingEstimate}>Send estimate to customer</Button>
              </CardBody>
            </Card>
          )}

          {estimate && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold text-ink">Estimate</h2>
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
                  <tfoot><tr className="border-t-2 border-ink"><td className="pt-2 font-semibold text-ink">Total</td><td className="pt-2 text-right font-mono text-lg font-bold text-ink">€{estimate.total_amount.toFixed(2)}</td></tr></tfoot>
                </table>
                {estimate.status === 'PENDING' && <p className="mt-3 text-xs text-ink/50">Waiting for customer approval.</p>}
              </CardBody>
            </Card>
          )}

          {repair && (
            <Card>
              <CardHeader><h2 className="font-display text-sm font-semibold text-ink">Repair progress</h2></CardHeader>
              <CardBody className="space-y-3">
                <Textarea label="Repair notes" value={repairNotes} onChange={(e) => setRepairNotes(e.target.value)} placeholder="Parts used, work performed..." />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Repair photos</label>
                  <div className="grid grid-cols-4 gap-2">
                    {repairImages.map((img) => <img key={img.id} src={img.image_url} className="aspect-square w-full rounded-lg object-cover" alt="" />)}
                    <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-ink/40 hover:bg-subtle">
                      <IconCamera />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadRepairPhoto(f) }} />
                    </label>
                  </div>
                </div>
                {repair.status === 'IN_REPAIR' && (
                  <Button onClick={() => updateRepairStatus('READY_FOR_PICKUP')} loading={savingRepair}>Mark ready for pickup</Button>
                )}
                {repair.status === 'READY_FOR_PICKUP' && (
                  <div className="flex items-end gap-3">
                    <Input label="Final cost (€)" type="number" step="0.01" value={finalCost} onChange={(e) => setFinalCost(e.target.value)} placeholder={estimate?.total_amount.toFixed(2)} />
                    <Button onClick={() => updateRepairStatus('COMPLETED')} loading={savingRepair}>Mark completed</Button>
                  </div>
                )}
                {repair.status === 'COMPLETED' && (
                  <p className="text-sm font-medium text-success">Completed{repair.completed_at ? ` on ${format(new Date(repair.completed_at), 'MMM d, yyyy')}` : ''} · Final cost €{(repair.final_cost ?? 0).toFixed(2)}</p>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="font-display text-sm font-semibold text-ink">Customer</h2></CardHeader>
            <CardBody className="text-sm">
              <p className="font-medium text-ink">{request.profiles.full_name}</p>
              <p className="mt-1 text-ink/50">{request.profiles.email}</p>
              {request.profiles.phone && <p className="text-ink/50">{request.profiles.phone}</p>}
            </CardBody>
          </Card>
          <Card>
            <CardHeader><h2 className="font-display text-sm font-semibold text-ink">Vehicle</h2></CardHeader>
            <CardBody className="text-sm">
              <p className="font-medium text-ink">{request.vehicles.make} {request.vehicles.model} ({request.vehicles.year})</p>
              <p className="mt-1 text-ink/50">{request.vehicles.mileage ? `${request.vehicles.mileage.toLocaleString()} km` : 'Mileage unknown'}</p>
              {request.vehicles.vin && <p className="font-mono text-xs text-ink/40">VIN {request.vehicles.vin}</p>}
              {request.vehicles.license_plate && <p className="font-mono text-xs text-ink/40">{request.vehicles.license_plate}</p>}
            </CardBody>
          </Card>
          {request.status !== 'SUBMITTED' && request.status !== 'REJECTED' && (
            <Card>
              <CardHeader><h2 className="font-display text-sm font-semibold text-ink">Assigned mechanic</h2></CardHeader>
              <CardBody>
                <Select value={request.assigned_mechanic_id ?? ''} onChange={(e) => assignMechanic(e.target.value)}>
                  <option value="">Unassigned</option>
                  {mechanics.map((m) => <option key={m.id} value={m.id}>{m.full_name}{m.specialization ? ` — ${m.specialization}` : ''}</option>)}
                </Select>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog open={confirmReject} onClose={() => setConfirmReject(false)} onConfirm={reject}
        title="Reject this request?" message="The customer will be notified that the request was declined." confirmLabel="Reject" danger />
    </DashboardLayout>
  )
}
