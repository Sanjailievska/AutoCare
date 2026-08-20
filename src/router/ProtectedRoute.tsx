import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types/database.types'
import { PageSpinner } from '@/components/ui/Spinner'

export function ProtectedRoute({ roles, children }: { roles?: UserRole[]; children: ReactNode }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="flex min-h-screen items-center justify-center"><PageSpinner /></div>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!profile) return <div className="flex min-h-screen items-center justify-center"><PageSpinner /></div>
  if (roles && !roles.includes(profile.role)) {
    const home = profile.role === 'shop' ? '/shop' : profile.role === 'admin' ? '/admin' : '/customer'
    return <Navigate to={home} replace />
  }
  return <>{children}</>
}
