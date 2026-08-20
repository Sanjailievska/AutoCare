import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Empty'
import { useNotifications } from '@/hooks/useNotifications'
import { IconBell } from '@/components/layout/NavIcons'

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications()
  const navigate = useNavigate()

  return (
    <DashboardLayout title="Notifications" actions={unreadCount > 0 ? <Button size="sm" variant="secondary" onClick={markAllAsRead}>Mark all read</Button> : undefined}>
      {!loading && notifications.length === 0 ? (
        <EmptyState icon={<IconBell />} title="You're all caught up" message="New updates about your vehicles and requests will show up here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={!n.is_read ? 'border-torque/30 bg-torque-50/30' : ''}>
              <CardBody
                className="flex cursor-pointer items-start justify-between gap-3"
                onClick={() => { markAsRead(n.id); if (n.related_request_id) navigate(`/customer/requests/${n.related_request_id}`) }}
              >
                <div className="flex items-start gap-3">
                  {!n.is_read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-torque" />}
                  <div className={n.is_read ? 'pl-3.5' : ''}>
                    <p className="text-sm font-medium text-ink">{n.title}</p>
                    <p className="mt-0.5 text-sm text-ink/60">{n.message}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-ink/40">{format(new Date(n.created_at), 'MMM d, HH:mm')}</span>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
