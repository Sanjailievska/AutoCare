import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthShell } from './AuthShell'

export default function Login() {
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: { pathname: string } } }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) { setError(error); return }
    const dest = location.state?.from?.pathname
    navigate(dest || (profile?.role === 'shop' ? '/shop' : profile?.role === 'admin' ? '/admin' : '/customer'), { replace: true })
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your vehicles and repairs.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <div>
          <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <Link to="/forgot-password" className="mt-1.5 inline-block text-xs font-medium text-torque hover:underline">Forgot password?</Link>
        </div>
        {error && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">Sign in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink/60">
        Don't have an account? <Link to="/register" className="font-medium text-torque hover:underline">Create one</Link>
      </p>
    </AuthShell>
  )
}
