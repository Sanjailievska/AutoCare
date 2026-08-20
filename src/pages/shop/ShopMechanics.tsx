import { useEffect, useState, type FormEvent } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/Empty'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { PageSpinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { useMyShop } from '@/hooks/useMyShop'
import { supabase } from '@/lib/supabase'
import type { Mechanic } from '@/types/database.types'
import { IconUsers, IconPlus, IconX } from '@/components/layout/NavIcons'

export default function ShopMechanics() {
  const { shop, loading: shopLoading } = useMyShop()
  const { push } = useToast()
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [spec, setSpec] = useState('')
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<Mechanic | null>(null)

  async function load() {
    if (!shop) return
    const { data } = await supabase.from('mechanics').select('*').eq('shop_id', shop.id).order('full_name')
    setMechanics((data as Mechanic[]) ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [shop])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!shop) return
    setSaving(true)
    const { error } = await supabase.from('mechanics').insert({ shop_id: shop.id, full_name: name, specialization: spec || null })
    setSaving(false)
    if (error) { push('Could not add mechanic: ' + error.message, 'error'); return }
    push('Mechanic added.')
    setOpen(false); setName(''); setSpec('')
    load()
  }

  async function toggleActive(m: Mechanic) {
    await supabase.from('mechanics').update({ is_active: !m.is_active }).eq('id', m.id)
    load()
  }

  async function remove() {
    if (!toDelete) return
    await supabase.from('mechanics').delete().eq('id', toDelete.id)
    push('Mechanic removed.')
    load()
  }

  if (shopLoading) return <DashboardLayout title="Mechanics"><PageSpinner /></DashboardLayout>

  return (
    <DashboardLayout title="Mechanics" actions={<Button size="sm" onClick={() => setOpen(true)}><IconPlus /><span className="ml-1.5">Add mechanic</span></Button>}>
      {loading ? <TableSkeleton /> : mechanics.length === 0 ? (
        <EmptyState icon={<IconUsers />} title="No mechanics yet" message="Add your team so you can assign them to repair requests." action={<Button onClick={() => setOpen(true)}>Add a mechanic</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mechanics.map((m) => (
            <Card key={m.id} className={!m.is_active ? 'opacity-50' : ''}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-ink">{m.full_name}</p>
                    {m.specialization && <p className="text-xs text-ink/50">{m.specialization}</p>}
                  </div>
                  <button onClick={() => setToDelete(m)} className="text-ink/30 hover:text-danger"><IconX className="h-4 w-4" /></button>
                </div>
                <button onClick={() => toggleActive(m)} className="mt-3 text-xs font-medium text-torque hover:underline">{m.is_active ? 'Deactivate' : 'Activate'}</button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add a mechanic"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button form="mech-form" type="submit" loading={saving}>Add</Button></>}>
        <form id="mech-form" onSubmit={onSubmit} className="space-y-4">
          <Input label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Specialization" value={spec} onChange={(e) => setSpec(e.target.value)} placeholder="Engine & Diagnostics" />
        </form>
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={remove} title="Remove mechanic?" message={`"${toDelete?.full_name}" will be removed from your team.`} confirmLabel="Remove" danger />
    </DashboardLayout>
  )
}
