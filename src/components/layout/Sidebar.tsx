import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import {
  IconDashboard, IconCar, IconWrench, IconHistory, IconSearch, IconUser,
  IconClipboard, IconUsers, IconSettings, IconStar, IconShop, IconCalendar, IconShield, IconBell,
} from './NavIcons'
import type { ReactNode } from 'react'

interface NavItem { to: string; label: string; icon: ReactNode }

const customerNav: NavItem[] = [
  { to: '/customer', label: 'Dashboard', icon: <IconDashboard /> },
  { to: '/customer/vehicles', label: 'My Vehicles', icon: <IconCar /> },
  { to: '/customer/requests', label: 'Repair Requests', icon: <IconClipboard /> },
  { to: '/customer/history', label: 'Service History', icon: <IconHistory /> },
  { to: '/customer/shops', label: 'Find a Shop', icon: <IconSearch /> },
  { to: '/customer/notifications', label: 'Notifications', icon: <IconBell /> },
  { to: '/customer/profile', label: 'Profile', icon: <IconUser /> },
]

const shopNav: NavItem[] = [
  { to: '/shop', label: 'Dashboard', icon: <IconDashboard /> },
  { to: '/shop/requests', label: 'Repair Requests', icon: <IconClipboard /> },
  { to: '/shop/repairs', label: 'Active Repairs', icon: <IconWrench /> },
  { to: '/shop/appointments', label: 'Appointments', icon: <IconCalendar /> },
  { to: '/shop/customers', label: 'Customers', icon: <IconUsers /> },
  { to: '/shop/vehicles', label: 'Vehicles', icon: <IconCar /> },
  { to: '/shop/services', label: 'Services', icon: <IconWrench /> },
  { to: '/shop/mechanics', label: 'Mechanics', icon: <IconUsers /> },
  { to: '/shop/reviews', label: 'Reviews', icon: <IconStar /> },
  { to: '/shop/settings', label: 'Shop Settings', icon: <IconSettings /> },
]

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: <IconDashboard /> },
  { to: '/admin/users', label: 'Users', icon: <IconUsers /> },
  { to: '/admin/shops', label: 'Repair Shops', icon: <IconShop /> },
  { to: '/admin/requests', label: 'Repair Requests', icon: <IconClipboard /> },
  { to: '/admin/reviews', label: 'Reviews', icon: <IconStar /> },
]

export function Sidebar() {
  const { profile } = useAuth()
  const nav = profile?.role === 'shop' ? shopNav : profile?.role === 'admin' ? adminNav : customerNav

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-ink lg:flex">
      <div className="flex h-16 items-center gap-2 px-5">
        <svg width="26" height="26" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#F5620E" /><path d="M8 20l2-6a2 2 0 012-1.4h8A2 2 0 0122 14l2 6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /><circle cx="11" cy="21" r="2" fill="white" /><circle cx="21" cy="21" r="2" fill="white" /></svg>
        <span className="font-display text-lg font-bold text-white">AutoCare</span>
      </div>
      <nav className="mt-2 flex-1 space-y-0.5 overflow-y-auto px-3 thin-scroll">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/customer' || item.to === '/shop' || item.to === '/admin'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-torque text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      {profile?.role === 'admin' && (
        <div className="mx-3 mb-3 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/50">
          <IconShield /> Admin access
        </div>
      )}
    </aside>
  )
}
