import { useEffect, useState, type FormEvent } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useMyShop } from '@/hooks/useMyShop'
import { supabase } from '@/lib/supabase'
import { PageSpinner } from '@/components/ui/Spinner'
import { IconShop, IconCamera } from '@/components/layout/NavIcons'
import ShopOnboarding from './ShopOnboarding'

export default function ShopSettings() {
  const { shop, loading, setShop } = useMyShop()
  const { push } = useToast()
  const { upload, uploading } = useImageUpload('shop-logos')
  const [form, setForm] = useState({ name: '', description: '', address: '', city: '', phone: '', email: '', website: '', opening_hours: '' })
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (shop) setForm({
      name: shop.name, description: shop.description ?? '', address: shop.address ?? '', city: shop.city,
      phone: shop.phone ?? '', email: shop.email ?? '', website: shop.website ?? '', opening_hours: shop.opening_hours ?? '',
    })
  }, [shop])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!shop) return
    setSaving(true)
    let logo_url = shop.logo_url
    if (file) { const url = await upload(file, shop.id); if (url) logo_url = url }
    const { error } = await supabase.from('repair_shops').update({ ...form, logo_url }).eq('id', shop.id)
    setSaving(false)
    if (error) { push('Could not save: ' + error.message, 'error'); return }
    push('Shop settings updated.')
  }

  if (loading) return <DashboardLayout title="Shop Settings"><PageSpinner /></DashboardLayout>
  if (!shop) return <ShopOnboarding onCreated={setShop} />

  return (
    <DashboardLayout title="Shop Settings">
      <div className="max-w-2xl">
        <Card>
          <CardHeader className="flex items-center gap-2"><IconShop className="text-torque" /><h2 className="font-display text-sm font-semibold text-ink">Shop profile</h2></CardHeader>
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-subtle">
                  {shop.logo_url ? <img src={shop.logo_url} className="h-full w-full rounded-xl object-cover" alt="" /> : <IconShop className="text-ink/30" />}
                </div>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-ink/60 hover:bg-subtle">
                  <IconCamera /> {file ? file.name : 'Change logo'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>
              <Input label="Shop name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="City" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
              <Input label="Opening hours" value={form.opening_hours} onChange={(e) => setForm({ ...form, opening_hours: e.target.value })} />
              <Button type="submit" loading={saving || uploading}>Save changes</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  )
}
