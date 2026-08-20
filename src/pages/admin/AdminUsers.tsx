import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/Empty'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { ConfirmDialog } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types/database.types'
import { IconUsers, IconX } from '@/components/layout/NavIcons'

export default function AdminUsers() {
  const { push } = useToast()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'' | UserRole>('')
  const [toRemove, setToRemove] = useState<Profile | null>(null)

  async function load() {
    setLoading(true)
    let q = supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (roleFilter) q = q.eq('role', roleFilter)
    const { data } = await q
    setUsers((data as Profile[]) ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [roleFilter])

  async function removeUser() {
    if (!toRemove) return
    // Deletes the profile row (RLS-guarded to admin). The auth.users row
    // itself requires the Auth Admin API (service role) — see README.
    await supabase.from('profiles').delete().eq('id', toRemove.id)
    push('Profile deactivated. Remove the login from Supabase Auth to fully delete the account.')
    load()
  }

  const filtered = users.filter((u) => !search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <DashboardLayout title="Users">
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
          <option value="">All roles</option><option value="customer">Customer</option><option value="shop">Repair shop</option><option value="admin">Admin</option>
        </Select>
      </div>
      {loading ? <TableSkeleton /> : filtered.length === 0 ? (
        <EmptyState icon={<IconUsers />} title="No users found" message="Try a different search or filter." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-subtle text-xs uppercase tracking-wide text-ink/50">
              <tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Joined</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-subtle">
                  <td className="px-4 py-3 font-medium text-ink">{u.full_name}{u.is_demo && <span className="ml-2 rounded bg-subtle px-1.5 py-0.5 text-[10px] font-semibold text-ink/40">DEMO</span>}</td>
                  <td className="px-4 py-3 text-ink/60">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-ink/60">{u.role}</td>
                  <td className="px-4 py-3 text-ink/60">{format(new Date(u.created_at), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3 text-right">
                    {u.role !== 'admin' && <button onClick={() => setToRemove(u)} className="text-ink/30 hover:text-danger"><IconX className="h-4 w-4" /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog open={!!toRemove} onClose={() => setToRemove(null)} onConfirm={removeUser}
        title="Deactivate this user?" message={`"${toRemove?.full_name}" will lose access to their profile data.`} confirmLabel="Deactivate" danger />
    </DashboardLayout>
  )
}
