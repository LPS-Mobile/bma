'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export function UploadButton({ deploymentId }: { deploymentId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)

    // 1. Upload to Storage
    const fileName = `${deploymentId}-${file.name}`
    const { data, error: uploadError } = await supabase.storage
      .from('bot-exports')
      .upload(fileName, file)

    if (uploadError) {
      alert('Upload failed')
      setUploading(false)
      return
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('bot-exports')
      .getPublicUrl(fileName)

    // 3. Update Deployment Record
    const { error: dbError } = await supabase
      .from('deployments')
      .update({ 
        status: 'completed',
        file_url: publicUrl 
      })
      .eq('id', deploymentId)

    if (!dbError) {
      alert('Deployment sent to user!')
      window.location.reload() // Refresh list
    }
    setUploading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-sm"
      />
      <button 
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Complete & Send'}
      </button>
    </div>
  )
}