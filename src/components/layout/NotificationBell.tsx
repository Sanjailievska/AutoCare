import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { IconBell } from './NavIcons'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/context/AuthContext'

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const base = profile?.role === 'shop' ? '/shop' : profile?.role === 'admin' ? '/admin' : '/customer'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative rounded-full p-2 text-ink/60 hover:bg-subtle hover:text-ink"
      >
        <IconBell />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-torque px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-xl border border-border bg-white shadow-pop">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-display text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs font-medium text-torque hover:underline">Mark all read</button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto thin-scroll">
            {notifications.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-ink/50">No notifications yet.</p>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  markAsRead(n.id)
                  setOpen(false)
                  if (n.related_request_id) {
                    navigate(`${base}/requests/${n.related_request_id}`)
                  }
                }}
                className={`block w-full border-b border-border px-4 py-3 text-left last:border-0 hover:bg-subtle ${!n.is_read ? 'bg-torque-50/40' : ''}`}
              >
                <div className="flex items-start gap-2">
                  {!n.is_read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-torque" />}
                  <div className={n.is_read ? 'pl-3.5' : ''}>
                    <p className="text-sm font-medium text-ink">{n.title}</p>
                    <p className="mt-0.5 text-xs text-ink/60">{n.message}</p>
                    <p className="mt-1 text-[11px] text-ink/40">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
