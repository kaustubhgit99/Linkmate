'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
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

export default function AddRoomPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const supabase = getSupabase()
  const [step, setStep] = useState<'form'|'photos'|'done'>('form')
  const [roomId, setRoomId] = useState<string|null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title:'', description:'', rent_price:'', location:'', city:'', room_type:'', num_beds:'1', is_available:true, amenities:[] as string[]
  })

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
    if (!authLoading && profile && profile.role !== 'owner' && profile.role !== 'admin') router.push('/browse')
  }, [user, profile, authLoading])

  const set = (k: string, v: any) => setForm(p=>({...p,[k]:v}))
  const toggleAmenity = (a: string) => set('amenities', form.amenities.includes(a) ? form.amenities.filter(x=>x!==a) : [...form.amenities, a])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/auth/login'); return }
    if (!form.city || !form.room_type) { toast({ title:'Missing fields', description:'Please select a city and room type', variant:'destructive' }); return }
    setSubmitting(true)

    const { data, error } = await supabase.from('rooms').insert({
      owner_id: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      rent_price: Number(form.rent_price),
      location: form.location.trim(),
      city: form.city,
      room_type: form.room_type,
      num_beds: Number(form.num_beds),
      is_available: form.is_available,
      amenities: form.amenities,
    }).select().single()

    if (error) { toast({ title:'Failed to create room', description:error.message, variant:'destructive' }); setSubmitting(false); return }
    
    setRoomId(data.id)
    toast({ title:'Room created! 🎉', description:'Now add some photos to attract tenants.' })
    setStep('photos')
    setSubmitting(false)
  }

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/></div>

  return (
    <div className="min-h-screen bg-background">
      <Navbar/>
      <div className="pt-20 max-w-2xl mx-auto px-4 py-8">
        <Link href="/owner" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group text-sm">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/> Back to Dashboard
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {[{n:1,l:'Details'},{n:2,l:'Photos'},{n:3,l:'Done'}].map((s,i)=>(
            <div key={s.n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step==='form'&&s.n===1||step==='photos'&&s.n===2||step==='done'&&s.n===3?'bg-violet-600 text-white shadow-lg shadow-violet-500/30':step==='photos'&&s.n===1||step==='done'&&s.n<=2?'bg-emerald-500 text-white':'bg-muted text-muted-foreground'}`}>
                {(step==='photos'&&s.n===1)||(step==='done'&&s.n<=2)?<CheckCircle className="w-4 h-4"/>:s.n}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step==='form'&&s.n===1||step==='photos'&&s.n===2||step==='done'&&s.n===3?'text-foreground':'text-muted-foreground'}`}>{s.l}</span>
              {i < 2 && <div className="w-8 h-px bg-border mx-1"/>}
            </div>
          ))}
        </div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
          {step === 'form' && (
            <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
              <div className="p-6 border-b border-border/50 bg-gradient-to-r from-violet-600/10 to-indigo-600/10">
                <h1 className="text-2xl font-display font-bold">Add New Room</h1>
                <p className="text-muted-foreground text-sm mt-1">Fill in the details to list your room</p>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic */}
                <section className="space-y-4">
                  <h3 className="font-display font-semibold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">Basic Info</h3>
                  <div className="space-y-1.5">
                    <Label>Room Title *</Label>
                    <Input placeholder="e.g. Cozy 1BHK near Metro Station" value={form.title} onChange={e=>set('title',e.target.value)} required className="h-11"/>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description *</Label>
                    <Textarea placeholder="Describe your room — size, surroundings, what makes it special..." rows={4} value={form.description} onChange={e=>set('description',e.target.value)} required/>
                  </div>
                </section>

                {/* Location */}
                <section className="space-y-4 pt-4 border-t border-border/50">
                  <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Location</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Area / Street Address *</Label>
                      <Input placeholder="e.g. Koramangala 5th Block" value={form.location} onChange={e=>set('location',e.target.value)} required className="h-11"/>
                    </div>
                    <div className="space-y-1.5">
                      <Label>City *</Label>
                      <Select value={form.city} onValueChange={v=>set('city',v)}>
                        <SelectTrigger className="h-11"><SelectValue placeholder="Select city"/></SelectTrigger>
                        <SelectContent>{CITIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                {/* Room details */}
                <section className="space-y-4 pt-4 border-t border-border/50">
                  <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Room Details</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Room Type *</Label>
                      <Select value={form.room_type} onValueChange={v=>set('room_type',v)}>
                        <SelectTrigger className="h-11"><SelectValue placeholder="Select type"/></SelectTrigger>
                        <SelectContent>{ROOM_TYPES.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>No. of Beds *</Label>
                      <Input type="number" min="1" max="10" value={form.num_beds} onChange={e=>set('num_beds',e.target.value)} required className="h-11"/>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Monthly Rent (₹) *</Label>
                      <Input type="number" min="500" placeholder="e.g. 12000" value={form.rent_price} onChange={e=>set('rent_price',e.target.value)} required className="h-11"/>
                    </div>
                  </div>
                  <label className="flex items-center justify-between p-4 rounded-xl bg-muted cursor-pointer hover:bg-muted/80 transition-colors">
                    <div>
                      <p className="font-medium text-sm">Available for Rent</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Toggle off if currently occupied</p>
                    </div>
                    <Switch checked={form.is_available} onCheckedChange={v=>set('is_available',v)}/>
                  </label>
                </section>

                {/* Amenities */}
                <section className="space-y-4 pt-4 border-t border-border/50">
                  <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Amenities <span className="text-muted-foreground font-normal normal-case tracking-normal">(select all that apply)</span></h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AMENITIES_LIST.map(a=>(
                      <label key={a} className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all text-sm ${form.amenities.includes(a)?'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/30':'bg-muted hover:bg-muted/80 border border-transparent'}`}>
                        <Checkbox checked={form.amenities.includes(a)} onCheckedChange={()=>toggleAmenity(a)}/>
                        {a}
                      </label>
                    ))}
                  </div>
                </section>

                <Button type="submit" disabled={submitting} className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 font-semibold text-base shadow-lg shadow-violet-500/25">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/>Creating listing...</> : 'Continue → Add Photos'}
                </Button>
              </form>
            </div>
          )}

          {step === 'photos' && roomId && (
            <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
              <div className="p-6 border-b border-border/50 bg-gradient-to-r from-violet-600/10 to-indigo-600/10">
                <h2 className="text-2xl font-display font-bold">Add Photos</h2>
                <p className="text-muted-foreground text-sm mt-1">Listings with photos get 3× more inquiries</p>
              </div>
              <div className="p-6">
                <ImageUpload roomId={roomId}/>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={()=>setStep('done')} className="flex-1">Skip for now</Button>
                  <Button onClick={()=>setStep('done')} className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0">Done! View Listing →</Button>
                </div>
              </div>
            </div>
          )}

          {step === 'done' && roomId && (
            <div className="glass-card rounded-2xl border border-border/50 p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-500"/>
              </div>
              <h2 className="text-3xl font-display font-bold mb-2">Room Listed! 🎉</h2>
              <p className="text-muted-foreground mb-8">Your room is now live and visible to thousands of users.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/owner/add"><Button variant="outline">Add Another Room</Button></Link>
                <Link href={`/room/${roomId}`}><Button variant="outline">View Listing</Button></Link>
                <Link href="/owner"><Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0">Go to Dashboard</Button></Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
