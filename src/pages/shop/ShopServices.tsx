import { useEffect, useState, type FormEvent } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/Empty'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { PageSpinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { useMyShop } from '@/hooks/useMyShop'
import { supabase } from '@/lib/supabase'
import type { Service } from '@/types/database.types'
import { IconWrench, IconPlus, IconX } from '@/components/layout/NavIcons'

const emptyForm = { name: '', category: '', description: '', base_price: '', estimated_duration: '' }

export default function ShopServices() {
  const { shop, loading: shopLoading } = useMyShop()
  const { push } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<Service | null>(null)

  async function load() {
    if (!shop) return
    const { data } = await supabase.from('services').select('*').eq('shop_id', shop.id).order('category')
    setServices((data as Service[]) ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [shop])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!shop) return
    setSaving(true)
    const { error } = await supabase.from('services').insert({
      shop_id: shop.id, name: form.name, category: form.category || null, description: form.description || null,
      base_price: form.base_price ? Number(form.base_price) : null, estimated_duration: form.estimated_duration || null,
    })
    setSaving(false)
    if (error) { push('Could not add service: ' + error.message, 'error'); return }
    push('Service added.')
    setOpen(false)
    setForm(emptyForm)
    load()
  }

  async function toggleActive(s: Service) {
    await supabase.from('services').update({ is_active: !s.is_active }).eq('id', s.id)
    load()
  }

  async function deleteService() {
    if (!toDelete) return
    await supabase.from('services').delete().eq('id', toDelete.id)
    push('Service removed.')
    load()
  }

  if (shopLoading) return <DashboardLayout title="Services"><PageSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Services" actions={<Button size="sm" onClick={() => setOpen(true)}><IconPlus /><span className="ml-1.5">Add service</span></Button>}>
      {loading ? <TableSkeleton /> : services.length === 0 ? (
        <EmptyState icon={<IconWrench />} title="No services yet" message="Add the services your shop offers so customers can select them." action={<Button onClick={() => setOpen(true)}>Add a service</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Card key={s.id} className={!s.is_active ? 'opacity-50' : ''}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-ink">{s.name}</p>
                    {s.category && <p className="text-xs text-ink/40">{s.category}</p>}
                  </div>
                  <button onClick={() => setToDelete(s)} className="text-ink/30 hover:text-danger"><IconX className="h-4 w-4" /></button>
                </div>
                {s.description && <p className="mt-2 text-xs text-ink/60">{s.description}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-ink">{s.base_price ? `€${s.base_price}` : '—'}</span>
                  <button onClick={() => toggleActive(s)} className="text-xs font-medium text-torque hover:underline">{s.is_active ? 'Deactivate' : 'Activate'}</button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add a service"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button form="service-form" type="submit" loading={saving}>Add service</Button></>}>
        <form id="service-form" onSubmit={onSubmit} className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Brake Pad Replacement" />
          <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Brakes" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Base price (€)" type="number" step="0.01" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} />
            <Input label="Estimated duration" value={form.estimated_duration} onChange={(e) => setForm({ ...form, estimated_duration: e.target.value })} placeholder="1.5 hr" />
          </div>
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </form>
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={deleteService} title="Remove service?" message={`"${toDelete?.name}" will be removed from your service list.`} confirmLabel="Remove" danger />
    </DashboardLayout>
  )
}
