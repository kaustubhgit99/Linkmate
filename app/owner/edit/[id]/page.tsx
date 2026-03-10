'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/rooms/ImageUpload'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { CITIES, ROOM_TYPES, AMENITIES_LIST } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

export default function EditRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = getSupabase()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [room, setRoom] = useState<any>(null)
  const [form, setForm] = useState({ title:'',description:'',rent_price:'',location:'',city:'',room_type:'',num_beds:'1',is_available:true,amenities:[] as string[] })

  useEffect(() => {
    supabase.from('rooms').select('*,room_images(*)').eq('id',params.id).single().then(({ data }) => {
      if (data) {
        setRoom(data)
        setForm({ title:data.title, description:data.description, rent_price:String(data.rent_price), location:data.location, city:data.city, room_type:data.room_type, num_beds:String(data.num_beds), is_available:data.is_available, amenities:data.amenities||[] })
      }
      setLoading(false)
    })
  }, [params.id, supabase])

  const set = (k: string, v: any) => setForm(p=>({...p,[k]:v}))
  const toggleAmenity = (a: string) => set('amenities', form.amenities.includes(a) ? form.amenities.filter(x=>x!==a) : [...form.amenities, a])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('rooms').update({
      title:form.title.trim(), description:form.description.trim(), rent_price:Number(form.rent_price),
      location:form.location.trim(), city:form.city, room_type:form.room_type,
      num_beds:Number(form.num_beds), is_available:form.is_available, amenities:form.amenities,
    }).eq('id', params.id)
    if (error) { toast({ title:'Save failed', description:error.message, variant:'destructive' }) }
    else { toast({ title:'Changes saved! ✓' }); router.push('/owner') }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/></div>

  return (
    <div className="min-h-screen bg-background">
      <Navbar/>
      <div className="pt-20 max-w-2xl mx-auto px-4 py-8">
        <Link href="/owner" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group text-sm">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/> Back to Dashboard
        </Link>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
          <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="p-6 border-b border-border/50 bg-gradient-to-r from-violet-600/10 to-indigo-600/10">
              <h1 className="text-2xl font-display font-bold">Edit Room</h1>
              <p className="text-muted-foreground text-sm mt-1 line-clamp-1">{room?.title}</p>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1.5"><Label>Room Title *</Label><Input value={form.title} onChange={e=>set('title',e.target.value)} required className="h-11"/></div>
              <div className="space-y-1.5"><Label>Description *</Label><Textarea rows={4} value={form.description} onChange={e=>set('description',e.target.value)} required/></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Area / Street *</Label><Input value={form.location} onChange={e=>set('location',e.target.value)} required className="h-11"/></div>
                <div className="space-y-1.5"><Label>City *</Label>
                  <Select value={form.city} onValueChange={v=>set('city',v)}>
                    <SelectTrigger className="h-11"><SelectValue/></SelectTrigger>
                    <SelectContent>{CITIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5"><Label>Room Type *</Label>
                  <Select value={form.room_type} onValueChange={v=>set('room_type',v)}>
                    <SelectTrigger className="h-11"><SelectValue/></SelectTrigger>
                    <SelectContent>{ROOM_TYPES.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Beds</Label><Input type="number" min="1" value={form.num_beds} onChange={e=>set('num_beds',e.target.value)} className="h-11"/></div>
                <div className="space-y-1.5"><Label>Rent (₹/mo)</Label><Input type="number" min="0" value={form.rent_price} onChange={e=>set('rent_price',e.target.value)} className="h-11"/></div>
              </div>
              <label className="flex items-center justify-between p-4 rounded-xl bg-muted cursor-pointer">
                <div><p className="font-medium text-sm">Available for Rent</p><p className="text-xs text-muted-foreground">Toggle off if occupied</p></div>
                <Switch checked={form.is_available} onCheckedChange={v=>set('is_available',v)}/>
              </label>
              <div>
                <Label className="mb-3 block">Amenities</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITIES_LIST.map(a=>(
                    <label key={a} className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer text-sm transition-all ${form.amenities.includes(a)?'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/30':'bg-muted border border-transparent'}`}>
                      <Checkbox checked={form.amenities.includes(a)} onCheckedChange={()=>toggleAmenity(a)}/>{a}
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={saving} className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 font-semibold shadow-lg shadow-violet-500/25">
                {saving?<><Loader2 className="w-4 h-4 animate-spin mr-2"/>Saving...</>:<><Save className="w-4 h-4 mr-2"/>Save Changes</>}
              </Button>
            </form>
          </div>

          {room && (
            <div className="mt-6 glass-card rounded-2xl border border-border/50 p-6">
              <h3 className="font-display font-semibold text-lg mb-4">Room Photos</h3>
              <ImageUpload roomId={params.id as string} existingImages={room.room_images||[]}/>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
