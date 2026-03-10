'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Bed, Phone, Mail, Heart, ArrowLeft, CheckCircle, Shield, ChevronLeft, ChevronRight, Share2 } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getSupabase } from '@/lib/supabase'
import { useAuth, useFavorites } from '@/lib/hooks'
import { formatPrice, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const { user } = useAuth()
  const { favorites, toggleFavorite } = useFavorites(user?.id)
  const supabase = getSupabase()

  useEffect(() => {
    supabase.from('rooms').select('*,room_images(*),users(id,full_name,email,phone,avatar_url)').eq('id',params.id).single()
      .then(({ data }) => { setRoom(data); setLoading(false) })
  }, [params.id, supabase])

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Navbar/><div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/></div>
  if (!room) return <div className="min-h-screen bg-background"><Navbar/><div className="pt-24 text-center"><h2 className="text-2xl font-display font-bold mb-4">Room not found</h2><Link href="/browse"><Button>Browse Rooms</Button></Link></div></div>

  const imgs = room.room_images || []
  const isFav = favorites.includes(room.id)

  const share = () => { navigator.clipboard?.writeText(window.location.href); toast({ title: 'Link copied!' }) }

  return (
    <div className="min-h-screen bg-background">
      <Navbar/>
      <div className="pt-20 max-w-6xl mx-auto px-4 py-8">
        <button onClick={()=>router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group text-sm">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/> Back to listings
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
              <div className="relative h-72 sm:h-[420px] rounded-2xl overflow-hidden bg-muted">
                {imgs.length > 0 ? (
                  <Image src={imgs[imgIdx]?.url} alt={room.title} fill className="object-cover transition-all duration-300"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-indigo-500/20"><span className="text-7xl">🏠</span></div>
                )}
                <div className="absolute top-4 left-4"><Badge variant={room.is_available?'success':'warning'} className="font-semibold">{room.is_available?'● Available':'○ Occupied'}</Badge></div>
                <div className="absolute top-4 right-4 flex gap-2">
                  {user && <button onClick={()=>toggleFavorite(room.id)} className={`w-10 h-10 rounded-full glass flex items-center justify-center transition-all hover:scale-110 ${isFav?'text-red-400':'text-white/60 hover:text-red-400'}`}><Heart className={`w-5 h-5 ${isFav?'fill-current':''}`}/></button>}
                  <button onClick={share} className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-110"><Share2 className="w-5 h-5"/></button>
                </div>
                {imgs.length > 1 && <>
                  <button onClick={()=>setImgIdx(i=>(i-1+imgs.length)%imgs.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass text-white flex items-center justify-center hover:bg-white/20"><ChevronLeft className="w-5 h-5"/></button>
                  <button onClick={()=>setImgIdx(i=>(i+1)%imgs.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass text-white flex items-center justify-center hover:bg-white/20"><ChevronRight className="w-5 h-5"/></button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {imgs.map((_:any,i:number)=><button key={i} onClick={()=>setImgIdx(i)} className={`rounded-full transition-all ${i===imgIdx?'w-5 h-2 bg-white':'w-2 h-2 bg-white/50'}`}/>)}
                  </div>
                </>}
              </div>
              {imgs.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {imgs.map((img:any,i:number)=>(
                    <button key={img.id} onClick={()=>setImgIdx(i)} className={`relative w-16 h-12 rounded-xl overflow-hidden shrink-0 transition-all ${i===imgIdx?'ring-2 ring-violet-500':'opacity-60 hover:opacity-100'}`}>
                      <Image src={img.url} alt="" fill className="object-cover"/>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="glass-card rounded-2xl p-6 border border-border/50">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div>
                  <h1 className="text-3xl font-display font-bold mb-2">{room.title}</h1>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm"><MapPin className="w-4 h-4 text-violet-500"/>{room.location}, {room.city}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-bold text-violet-500">{formatPrice(room.rent_price)}</div>
                  <div className="text-muted-foreground text-xs">/month</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-xl text-sm"><Bed className="w-4 h-4 text-violet-500"/>{room.num_beds} Bed{room.num_beds>1?'s':''}</span>
                <span className="px-3 py-1.5 bg-muted rounded-xl text-sm">{room.room_type}</span>
                <span className="px-3 py-1.5 bg-muted rounded-xl text-xs text-muted-foreground">Listed {formatDate(room.created_at)}</span>
              </div>
              <div className="mb-5">
                <h3 className="font-display font-semibold text-lg mb-2">About this room</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{room.description || 'No description provided.'}</p>
              </div>
              {room.amenities?.length > 0 && (
                <div>
                  <h3 className="font-display font-semibold text-lg mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((a:string)=>(
                      <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl text-sm">
                        <CheckCircle className="w-3.5 h-3.5"/>{a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.2}} className="glass-card rounded-2xl p-6 border border-border/50 sticky top-24">
              <h3 className="font-display font-semibold text-lg mb-4">Owner Details</h3>
              {room.users ? (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-500/20">
                      {room.users.full_name?.charAt(0)||'?'}
                    </div>
                    <div>
                      <div className="font-semibold">{room.users.full_name}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><Shield className="w-3 h-3 text-emerald-500"/>Verified Owner</div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {room.users.phone && (
                      <a href={`tel:${room.users.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-violet-500/10 transition-colors text-sm font-medium">
                        <Phone className="w-4 h-4 text-violet-500"/>{room.users.phone}
                      </a>
                    )}
                    <a href={`mailto:${room.users.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-violet-500/10 transition-colors text-sm font-medium">
                      <Mail className="w-4 h-4 text-violet-500"/><span className="truncate">{room.users.email}</span>
                    </a>
                  </div>
                  {!user && <p className="text-xs text-muted-foreground mb-3 text-center"><Link href="/auth/login" className="text-violet-500 hover:underline">Sign in</Link> to contact owner</p>}
                  <a href={room.users.phone ? `tel:${room.users.phone}` : `mailto:${room.users.email}`}>
                    <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0">
                      Contact Owner
                    </Button>
                  </a>
                </>
              ) : <p className="text-muted-foreground text-sm">Owner info not available</p>}

              <div className="mt-4 pt-4 border-t border-border/50 space-y-2 text-sm">
                {[['Type',room.room_type],['Beds',room.num_beds],['City',room.city],['Status',room.is_available?'✓ Available':'✗ Occupied'],['Rent/mo',formatPrice(room.rent_price)]].map(([k,v])=>(
                  <div key={k} className="flex justify-between">
                    <span className="text-muted-foreground">{k}</span>
                    <span className={`font-medium ${k==='Status'?(room.is_available?'text-emerald-500':'text-red-500'):k==='Rent/mo'?'text-violet-500':''}`}>{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
