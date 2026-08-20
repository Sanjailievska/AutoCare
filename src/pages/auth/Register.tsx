import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthShell } from './AuthShell'
import type { UserRole } from '@/types/database.types'
import { IconCar, IconShop } from '@/components/layout/NavIcons'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<UserRole>('customer')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [needsConfirm, setNeedsConfirm] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    const { error } = await signUp(email, password, fullName, role)
    setLoading(false)
    if (error) { setError(error); return }
    setNeedsConfirm(true)
  }

  if (needsConfirm) {
    return (
      <AuthShell title="Check your inbox" subtitle="Almost there.">
        <p className="rounded-lg border border-border bg-white p-4 text-sm text-ink/70">
          We've sent a confirmation link to <strong>{email}</strong>. Once confirmed, sign in to
          {role === 'shop' ? ' set up your shop profile.' : ' start adding vehicles.'}
        </p>
        <Button className="mt-4 w-full" onClick={() => navigate('/login')}>Go to sign in</Button>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create your account" subtitle="Join AutoCare as a customer or a repair shop.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">I am a...</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setRole('customer')}
              className={clsx('flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-medium', role === 'customer' ? 'border-torque bg-torque-50 text-torque-700' : 'border-border text-ink/60 hover:bg-subtle')}>
              <IconCar /> Customer
            </button>
            <button type="button" onClick={() => setRole('shop')}
              className={clsx('flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-medium', role === 'shop' ? 'border-torque bg-torque-50 text-torque-700' : 'border-border text-ink/60 hover:bg-subtle')}>
              <IconShop /> Repair shop
            </button>
          </div>
        </div>
        <Input label="Full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Smith" />
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} hint="At least 8 characters." />
        {error && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">Create account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink/60">
        Already have an account? <Link to="/login" className="font-medium text-torque hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  )
}
