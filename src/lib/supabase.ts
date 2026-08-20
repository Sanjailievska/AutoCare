import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anonKey) {
  // Fails loudly at startup rather than silently hitting the network with
  // undefined credentials — much easier to debug during setup.
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project values.'
  )
}

// Row shapes are typed at the call site via src/types/database.types.ts
// rather than through supabase-js's generic Database param, which keeps
// query typing simple without needing the CLI-generated schema type.
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})
