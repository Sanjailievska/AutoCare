import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useImageUpload } from '@/hooks/useImageUpload'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Vehicle, RepairShop, Service, UrgencyLevel } from '@/types/database.types'
import { IconCar, IconShop, IconCamera, IconCheck } from '@/components/layout/NavIcons'

const CATEGORIES = ['Engine', 'Brakes', 'Tires', 'Oil & Filters', 'Battery', 'Electrical', 'Air Conditioning', 'Suspension', 'Transmission', 'Other']
const STEPS = ['Vehicle', 'Shop', 'Category', 'Describe', 'Urgency', 'Date', 'Photos', 'Review']

export default function NewRequest() {
  const { user } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { upload } = useImageUpload('request-images')

  const [step, setStep] = useState(0)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [shops, setShops] = useState<RepairShop[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [vehicleId, setVehicleId] = useState('')
  const [shopId, setShopId] = useState(params.get('shop') ?? '')
  const [category, setCategory] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal')
  const [preferredDate, setPreferredDate] = useState('')
  const [files, setFiles] = useState<File[]>([])

  useEffect(() => {
    if (!user) return
    supabase.from('vehicles').select('*').eq('customer_id', user.id).then(({ data }) => setVehicles((data as Vehicle[]) ?? []))
    supabase.from('repair_shops').select('*').eq('is_active', true).order('name').then(({ data }) => setShops((data as RepairShop[]) ?? []))
  }, [user])

  useEffect(() => {
    if (!shopId) { setServices([]); return }
    supabase.from('services').select('*').eq('shop_id', shopId).eq('is_active', true).then(({ data }) => setServices((data as Service[]) ?? []))
  }, [shopId])

  const canNext = [
    !!vehicleId, !!shopId, !!category, title.trim().length > 2 && description.trim().length > 5, true, true, true, true,
  ][step]

  async function submit() {
    if (!user) return
    setSubmitting(true)
    const { data: req, error } = await supabase.from('repair_requests').insert({
      customer_id: user.id, vehicle_id: vehicleId, shop_id: shopId, service_id: serviceId || null,
      category, title, description, urgency, preferred_date: preferredDate || null,
    }).select().single()

    if (error || !req) { push('Could not submit request: ' + (error?.message ?? ''), 'error'); setSubmitting(false); return }

    for (const f of files) {
      const url = await upload(f, req.id)
      if (url) await supabase.from('repair_request_images').insert({ repair_request_id: req.id, image_url: url })
    }

    setSubmitting(false)
    push('Repair request submitted.')
    navigate(`/customer/requests/${req.id}`)
  }

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId)
  const selectedShop = shops.find((s) => s.id === shopId)

  return (
    <DashboardLayout title="New Repair Request">
      <div className="mx-auto max-w-2xl">
        <ol className="mb-6 flex items-center gap-1 overflow-x-auto thin-scroll">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center">
              <span className={clsx('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                i < step ? 'bg-torque text-white' : i === step ? 'border-2 border-torque text-torque' : 'border border-border text-ink/30')}>
                {i < step ? <IconCheck className="h-3 w-3" /> : i + 1}
              </span>
              {i < STEPS.length - 1 && <span className={clsx('mx-1 h-px w-4 shrink-0', i < step ? 'bg-torque' : 'bg-border')} />}
            </li>
          ))}
        </ol>

        <Card>
          <CardBody className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-torque">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>

            {step === 0 && (
              vehicles.length === 0 ? (
                <p className="text-sm text-ink/60">You don't have any vehicles yet. Add one from the Vehicles page first.</p>
              ) : (
                <div className="grid gap-2">
                  {vehicles.map((v) => (
                    <button key={v.id} type="button" onClick={() => setVehicleId(v.id)}
                      className={clsx('flex items-center gap-3 rounded-lg border px-4 py-3 text-left', vehicleId === v.id ? 'border-torque bg-torque-50' : 'border-border hover:bg-subtle')}>
                      <IconCar className="text-ink/40" />
                      <div>
                        <p className="font-medium text-ink">{v.make} {v.model}</p>
                        <p className="text-xs text-ink/50">{v.year} · {v.license_plate ?? 'no plate on file'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )
            )}

            {step === 1 && (
              <div className="grid gap-2">
                {shops.map((s) => (
                  <button key={s.id} type="button" onClick={() => { setShopId(s.id); setServiceId('') }}
                    className={clsx('flex items-center gap-3 rounded-lg border px-4 py-3 text-left', shopId === s.id ? 'border-torque bg-torque-50' : 'border-border hover:bg-subtle')}>
                    <IconShop className="text-ink/40" />
                    <div>
                      <p className="font-medium text-ink">{s.name}</p>
                      <p className="text-xs text-ink/50">{s.city} · ★ {s.rating.toFixed(1)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CATEGORIES.map((c) => (
                    <button key={c} type="button" onClick={() => setCategory(c)}
                      className={clsx('rounded-lg border px-3 py-2 text-sm font-medium', category === c ? 'border-torque bg-torque-50 text-torque-700' : 'border-border text-ink/70 hover:bg-subtle')}>
                      {c}
                    </button>
                  ))}
                </div>
                {services.length > 0 && (
                  <Select label="Related service (optional)" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                    <option value="">No specific service</option>
                    {services.map((s) => <option key={s.id} value={s.id}>{s.name} {s.base_price ? `— from €${s.base_price}` : ''}</option>)}
                  </Select>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Brake problem" />
                <Textarea label="Describe the problem" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's happening, when did it start, any noises or warning lights..." />
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'normal', 'urgent'] as UrgencyLevel[]).map((u) => (
                  <button key={u} type="button" onClick={() => setUrgency(u)}
                    className={clsx('rounded-lg border px-3 py-3 text-sm font-medium capitalize', urgency === u ? 'border-torque bg-torque-50 text-torque-700' : 'border-border text-ink/70 hover:bg-subtle')}>
                    {u}
                  </button>
                ))}
              </div>
            )}

            {step === 5 && (
              <Input label="Preferred appointment date (optional)" type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
            )}

            {step === 6 && (
              <div>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-4 text-sm text-ink/60 hover:bg-subtle">
                  <IconCamera /> Upload photos of the problem (optional)
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
                </label>
                {files.length > 0 && <p className="mt-2 text-xs text-ink/50">{files.length} photo(s) selected</p>}
              </div>
            )}

            {step === 7 && (
              <div className="space-y-2 text-sm">
                <SummaryRow label="Vehicle" value={selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : '—'} />
                <SummaryRow label="Shop" value={selectedShop?.name ?? '—'} />
                <SummaryRow label="Category" value={category} />
                <SummaryRow label="Title" value={title} />
                <SummaryRow label="Description" value={description} />
                <SummaryRow label="Urgency" value={urgency} />
                <SummaryRow label="Preferred date" value={preferredDate || 'No preference'} />
                <SummaryRow label="Photos" value={`${files.length} attached`} />
              </div>
            )}
          </CardBody>
        </Card>

        <div className="mt-4 flex justify-between">
          <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>Continue</Button>
          ) : (
            <Button onClick={submit} loading={submitting}>Submit request</Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 last:border-0">
      <span className="shrink-0 text-ink/50">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  )
}
