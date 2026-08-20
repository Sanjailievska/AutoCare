import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { RepairShop } from '@/types/database.types'

// Every shop-side page needs the caller's own shop row. Centralized here
// so pages don't duplicate the fetch-by-owner_id query.
export function useMyShop() {
  const { user } = useAuth()
  const [shop, setShop] = useState<RepairShop | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('repair_shops').select('*').eq('owner_id', user.id).maybeSingle().then(({ data }) => {
      setShop((data as RepairShop) ?? null)
      setLoading(false)
    })
  }, [user])

  return { shop, loading, setShop }
}
