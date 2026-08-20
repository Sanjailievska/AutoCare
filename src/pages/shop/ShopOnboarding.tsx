import { useState, type FormEvent } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { RepairShop } from '@/types/database.types'
import { IconShop } from '@/components/layout/NavIcons'

export default function ShopOnboarding({ onCreated }: { onCreated: (shop: RepairShop) => void }) {
  const { user, profile } = useAuth()
  const { push } = useToast()
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [openingHours, setOpeningHours] = useState('Mon–Fri 08:00–18:00')
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    const { data, error } = await supabase.from('repair_shops').insert({
      owner_id: user.id, name, city, address: address || null, phone: phone || null,
      email: profile?.email, description: description || null, opening_hours: openingHours || null,
    }).select().single()
    setSaving(false)
    if (error || !data) { push('Could not create shop: ' + (error?.message ?? ''), 'error'); return }
    push('Shop profile created — welcome to AutoCare.')
    onCreated(data as RepairShop)
  }

  return (
    <DashboardLayout title="Set up your shop">
      <div className="mx-auto max-w-lg">
        <Card>
          <CardBody>
            <div className="mb-4 flex items-center gap-2 text-torque"><IconShop /><p className="font-display text-sm font-semibold">Welcome — let's get your shop listed</p></div>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input label="Shop name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="AutoFix Garage" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="City" required value={city} onChange={(e) => setCity(e.target.value)} />
                <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              <Input label="Opening hours" value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} />
              <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What your shop specializes in..." />
              <Button type="submit" loading={saving} className="w-full">Create shop profile</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  )
}
