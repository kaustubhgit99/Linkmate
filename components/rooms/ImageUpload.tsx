'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Star, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { getSupabase, SUPABASE_URL } from '@/lib/supabase'
import { toast } from '@/components/ui/use-toast'

interface Props { roomId: string; existingImages?: any[]; onImagesChange?: (imgs: any[]) => void }

export function ImageUpload({ roomId, existingImages = [], onImagesChange }: Props) {
  const [images, setImages] = useState(existingImages)
  const [uploading, setUploading] = useState(false)
  const supabase = getSupabase()

  const updateImages = (newImgs: any[]) => { setImages(newImgs); onImagesChange?.(newImgs) }

  const onDrop = useCallback(async (files: File[]) => {
    if (!roomId) { toast({ title: 'Error', description: 'Room ID missing', variant: 'destructive' }); return }
    setUploading(true)
    const uploaded: any[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${roomId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from('room-images').upload(path, file, { upsert: true })
      if (upErr) { toast({ title: 'Upload failed', description: upErr.message, variant: 'destructive' }); continue }
      const url = `${SUPABASE_URL}/storage/v1/object/public/room-images/${path}`
      const isPrimary = images.length === 0 && uploaded.length === 0
      const { data, error: dbErr } = await supabase.from('room_images').insert({ room_id: roomId, url, is_primary: isPrimary }).select().single()
      if (!dbErr && data) uploaded.push(data)
    }
    const newImgs = [...images, ...uploaded]
    updateImages(newImgs)
    toast({ title: `${uploaded.length} photo${uploaded.length>1?'s':''} uploaded!` })
    setUploading(false)
  }, [roomId, images, supabase])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg','.jpeg','.png','.webp'] }, maxFiles: 8, maxSize: 10*1024*1024,
  })

  const deleteImage = async (img: any) => {
    await supabase.from('room_images').delete().eq('id', img.id)
    const path = img.url.split('/room-images/')[1]
    if (path) await supabase.storage.from('room-images').remove([path])
    const remaining = images.filter(i => i.id !== img.id)
    // if deleted primary, set first remaining as primary
    if (img.is_primary && remaining.length > 0) {
      await supabase.from('room_images').update({ is_primary: true }).eq('id', remaining[0].id)
      remaining[0].is_primary = true
    }
    updateImages(remaining)
    toast({ title: 'Photo removed' })
  }

  const setPrimary = async (imgId: string) => {
    await supabase.from('room_images').update({ is_primary: false }).eq('room_id', roomId)
    await supabase.from('room_images').update({ is_primary: true }).eq('id', imgId)
    updateImages(images.map(i => ({ ...i, is_primary: i.id === imgId })))
  }

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-violet-500 bg-violet-500/5' : 'border-border hover:border-violet-400 hover:bg-violet-500/5'}`}>
        <input {...getInputProps()}/>
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin"/>
            <p className="text-sm text-violet-500 font-medium">Uploading photos...</p>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground"/>
            <p className="font-medium text-sm">{isDragActive ? 'Drop photos here' : 'Drag & drop photos or click to upload'}</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP • max 10MB each • up to 8 photos</p>
          </>
        )}
      </div>

      {images.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">{images.length} photo{images.length>1?'s':''} • <span className="text-yellow-500">★ = cover photo</span></p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map(img => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-video bg-muted">
                <Image src={img.url} alt="" fill className="object-cover"/>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => setPrimary(img.id)} title="Set as cover" className={`p-2 rounded-full transition-colors ${img.is_primary ? 'bg-yellow-500 text-white' : 'bg-white/20 text-white hover:bg-yellow-500'}`}>
                    <Star className="w-4 h-4"/>
                  </button>
                  <button onClick={() => deleteImage(img)} title="Delete" className="p-2 rounded-full bg-white/20 text-white hover:bg-red-500 transition-colors">
                    <X className="w-4 h-4"/>
                  </button>
                </div>
                {img.is_primary && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">Cover</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
