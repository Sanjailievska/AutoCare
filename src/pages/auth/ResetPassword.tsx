import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthShell } from './AuthShell'
import { useToast } from '@/components/ui/Toast'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { push } = useToast()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    push('Password updated. Please sign in.')
    navigate('/login')
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose something you haven't used before.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="New password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} hint="At least 8 characters." />
        {error && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">Update password</Button>
      </form>
    </AuthShell>
  )
}
