import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/Empty'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { useImageUpload } from '@/hooks/useImageUpload'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Vehicle } from '@/types/database.types'
import { IconCar, IconPlus, IconCamera } from '@/components/layout/NavIcons'

const emptyForm = { make: '', model: '', year: new Date().getFullYear(), engine: '', fuel_type: '', transmission: '', mileage: '', license_plate: '', vin: '' }

export default function Vehicles() {
  const { user } = useAuth()
  const { push } = useToast()
  const { upload, uploading } = useImageUpload('vehicle-images')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('vehicles').select('*').eq('customer_id', user.id).order('created_at', { ascending: false })
    setVehicles((data as Vehicle[]) ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [user])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const { data, error } = await supabase.from('vehicles').insert({
      customer_id: user.id,
      make: form.make, model: form.model, year: Number(form.year),
      engine: form.engine || null, fuel_type: form.fuel_type || null, transmission: form.transmission || null,
      mileage: form.mileage ? Number(form.mileage) : null,
      license_plate: form.license_plate || null, vin: form.vin || null,
    }).select().single()

    if (error || !data) { push('Could not add vehicle: ' + (error?.message ?? 'unknown error'), 'error'); setSaving(false); return }

    if (file) {
      const url = await upload(file, data.id)
      if (url) await supabase.from('vehicles').update({ image_url: url }).eq('id', data.id)
    }

    setSaving(false)
    setOpen(false)
    setForm(emptyForm)
    setFile(null)
    push('Vehicle added.')
    load()
  }

  return (
    <DashboardLayout title="My Vehicles" actions={
      <Button size="sm" onClick={() => setOpen(true)}><IconPlus /> <span className="ml-1.5">Add Vehicle</span></Button>
    }>
      {loading ? (
        <TableSkeleton />
      ) : vehicles.length === 0 ? (
        <EmptyState icon={<IconCar />} title="No vehicles yet" message="Add a vehicle to start requesting repairs." action={<Button onClick={() => setOpen(true)}>Add your first vehicle</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <Link key={v.id} to={`/customer/vehicles/${v.id}`}>
              <Card className="overflow-hidden transition-shadow hover:shadow-pop">
                <div className="flex h-32 items-center justify-center bg-subtle">
                  {v.image_url ? <img src={v.image_url} alt={`${v.make} ${v.model}`} className="h-full w-full object-cover" /> : <IconCar className="h-10 w-10 text-ink/20" />}
                </div>
                <CardBody>
                  <p className="font-display font-semibold text-ink">{v.make} {v.model}</p>
                  <p className="text-xs text-ink/50">{v.year} · {v.fuel_type ?? '—'} · {v.mileage ? `${v.mileage.toLocaleString()} km` : '—'}</p>
                  {v.license_plate && <p className="mt-2 inline-block rounded border border-border bg-subtle px-2 py-0.5 font-mono text-xs text-ink/70">{v.license_plate}</p>}
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add a vehicle" size="lg"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button form="vehicle-form" type="submit" loading={saving || uploading}>Add vehicle</Button></>}>
        <form id="vehicle-form" onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Make" required value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} placeholder="BMW" />
            <Input label="Model" required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="320d" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Year" type="number" required value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
            <Input label="Mileage (km)" type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Engine" value={form.engine} onChange={(e) => setForm({ ...form, engine: e.target.value })} placeholder="2.0 Diesel" />
            <Input label="Fuel type" value={form.fuel_type} onChange={(e) => setForm({ ...form, fuel_type: e.target.value })} placeholder="Diesel" />
          </div>
          <Input label="Transmission" value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })} placeholder="Automatic" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="License plate" value={form.license_plate} onChange={(e) => setForm({ ...form, license_plate: e.target.value })} />
            <Input label="VIN" value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Photo (optional)</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-ink/60 hover:bg-subtle">
              <IconCamera /> {file ? file.name : 'Upload a photo'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
