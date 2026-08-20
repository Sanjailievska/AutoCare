import { type ReactNode, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { Sidebar } from './Sidebar'
import { NotificationBell } from './NotificationBell'
import { useAuth } from '@/context/AuthContext'
import { IconLogout, IconDashboard, IconCar, IconClipboard, IconSearch, IconWrench, IconUsers, IconShop, IconStar, IconX } from './NavIcons'

export function DashboardLayout({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  const { profile, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const mobileNav = profile?.role === 'shop'
    ? [
        { to: '/shop', label: 'Dashboard', icon: <IconDashboard /> },
        { to: '/shop/requests', label: 'Requests', icon: <IconClipboard /> },
        { to: '/shop/repairs', label: 'Repairs', icon: <IconWrench /> },
        { to: '/shop/customers', label: 'Customers', icon: <IconUsers /> },
      ]
    : profile?.role === 'admin'
    ? [
        { to: '/admin', label: 'Dashboard', icon: <IconDashboard /> },
        { to: '/admin/users', label: 'Users', icon: <IconUsers /> },
        { to: '/admin/shops', label: 'Shops', icon: <IconShop /> },
        { to: '/admin/reviews', label: 'Reviews', icon: <IconStar /> },
      ]
    : [
        { to: '/customer', label: 'Dashboard', icon: <IconDashboard /> },
        { to: '/customer/vehicles', label: 'Vehicles', icon: <IconCar /> },
        { to: '/customer/requests', label: 'Requests', icon: <IconClipboard /> },
        { to: '/customer/shops', label: 'Shops', icon: <IconSearch /> },
      ]

  return (
    <div className="min-h-screen bg-subtle">
      <Sidebar />
      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-ink p-4">
            <button onClick={() => setMobileOpen(false)} className="mb-4 rounded-md p-1.5 text-white/70 hover:bg-white/10"><IconX /></button>
            <nav className="space-y-1">
              {mobileNav.map((item) => (
                <NavLink key={item.to} to={item.to} end onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => clsx('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium', isActive ? 'bg-torque text-white' : 'text-white/70 hover:bg-white/5')}>
                  {item.icon}{item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="rounded-md p-1.5 text-ink/70 hover:bg-subtle lg:hidden" aria-label="Open menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
            <h1 className="font-display text-lg font-semibold text-ink sm:text-xl">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <NotificationBell />
            <Link to={profile?.role === 'shop' ? '/shop/settings' : profile?.role === 'customer' ? '/customer/profile' : '/admin'}
              className="hidden items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 hover:bg-subtle sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-torque-50 text-xs font-bold text-torque-700">
                {profile?.full_name?.charAt(0).toUpperCase() ?? '?'}
              </span>
              <span className="text-sm font-medium text-ink">{profile?.full_name}</span>
            </Link>
            <button onClick={() => signOut()} aria-label="Log out" className="rounded-md p-2 text-ink/50 hover:bg-subtle hover:text-danger">
              <IconLogout />
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
