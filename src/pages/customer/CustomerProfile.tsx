import { useState, type FormEvent } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function CustomerProfile() {
  const { profile, refreshProfile } = useAuth()
  const { push } = useToast()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone: phone || null }).eq('id', profile.id)
    setSaving(false)
    if (error) { push('Could not save: ' + error.message, 'error'); return }
    await refreshProfile()
    push('Profile updated.')
  }

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-lg">
        <Card>
          <CardHeader><h2 className="font-display text-sm font-semibold text-ink">Your details</h2></CardHeader>
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input label="Full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input label="Email" value={profile?.email ?? ''} disabled hint="Contact support to change your email." />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+389 ..." />
              <Button type="submit" loading={saving}>Save changes</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  )
}
