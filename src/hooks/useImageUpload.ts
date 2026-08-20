import { useState } from 'react'
import { supabase } from '@/lib/supabase'

// Uploads a file into `<bucket>/<folderId>/<timestamp>-<filename>` and
// returns a signed URL (buckets are private, so public URLs won't work
// except for the shop-logos bucket, which is public).
export function useImageUpload(bucket: string) {
  const [uploading, setUploading] = useState(false)

  async function upload(file: File, folderId: string): Promise<string | null> {
    setUploading(true)
    try {
      const path = `${folderId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
      if (error) throw error

      if (bucket === 'shop-logos') {
        return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
      }
      const { data: signed, error: signErr } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 365)
      if (signErr) throw signErr
      return signed.signedUrl
    } catch {
      return null
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading }
}
