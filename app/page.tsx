'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ArrowRight, Home, Users, Shield, Building2, ChevronDown, Sparkles, Star } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { RoomCard, RoomCardSkeleton } from '@/components/rooms/RoomCard'
import { Button } from '@/components/ui/button'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { CITIES } from '@/lib/utils'

export default function Home() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')
  const { user } = useAuth()
  const router = useRouter()
  const supabase = getSupabase()

  useEffect(() => {
    supabase.from('rooms').select('*,room_images(*),users(full_name,email,phone)').eq('is_available',true).order('created_at',{ascending:false}).limit(6)
      .then(({ data }) => { if (data) setRooms(data); setLoading(false) })
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar/>

      {/* HERO */}
      <section className="relative min-h-screen hero-bg flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl animate-float"/>
          <div className="absolute bottom-1/4 right-1/5 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-float" style={{animationDelay:'2s'}}/>
          <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(rgba(255,255,255,0.4) 1px,transparent 1px)',backgroundSize:'32px 32px'}}/>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-white/70 text-sm font-medium mb-8 border border-white/10">
              <Sparkles className="w-4 h-4 text-violet-400"/>
              The smart way to find rooms
            </div>
          </motion.div>
          <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1,duration:0.6}} className="text-5xl sm:text-7xl font-display font-bold text-white leading-[1.1] mb-6">
            Find rooms that<br/><span className="gradient-text">match your life</span>
          </motion.h1>
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2,duration:0.6}} className="text-xl text-white/55 mb-10 max-w-2xl mx-auto leading-relaxed">
            Browse thousands of verified rooms, connect directly with owners, and move in with complete confidence.
          </motion.p>

          {/* Search */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.6}} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-8">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400"/>
              <input list="cities-list" value={city} onChange={e=>setCity(e.target.value)} placeholder="Search by city..."
                className="w-full h-14 pl-12 pr-4 rounded-2xl glass text-white placeholder-white/40 border border-white/15 focus:outline-none focus:border-violet-500/60 text-base"/>
              <datalist id="cities-list">{CITIES.map(c=><option key={c} value={c}/>)}</datalist>
            </div>
            <Button onClick={() => router.push(`/browse${city?`?city=${encodeURIComponent(city)}`:''}`)}
              className="h-14 px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-semibold border-0 shadow-xl shadow-violet-500/30 whitespace-nowrap">
              <Search className="w-5 h-5 mr-2"/> Search
            </Button>
          </motion.div>

          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}} className="flex flex-wrap gap-2 justify-center text-sm">
            <span className="text-white/35">Popular:</span>
            {['Mumbai','Bangalore','Delhi','Pune','Hyderabad'].map(c=>(
              <button key={c} onClick={()=>router.push(`/browse?city=${c}`)} className="text-white/55 hover:text-violet-400 transition-colors">{c}</button>
            ))}
          </motion.div>
        </div>

        <motion.div animate={{y:[0,8,0]}} transition={{repeat:Infinity,duration:2.5}} className="absolute bottom-8 text-white/30">
          <ChevronDown className="w-6 h-6"/>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {v:'2,400+',l:'Rooms Listed',icon:Home},
            {v:'1,800+',l:'Happy Tenants',icon:Users},
            {v:'20+',l:'Cities',icon:MapPin},
            {v:'600+',l:'Verified Owners',icon:Shield},
          ].map((s,i)=>(
            <motion.div key={s.l} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
              className="glass-card rounded-2xl p-6 text-center border border-border/50">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-6 h-6 text-violet-500"/>
              </div>
              <div className="text-3xl font-display font-bold gradient-text">{s.v}</div>
              <div className="text-muted-foreground text-sm mt-1">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured rooms */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-violet-500 text-sm font-semibold uppercase tracking-wider mb-2">Featured</p>
              <h2 className="text-4xl font-display font-bold">Latest Rooms</h2>
            </div>
            <Link href="/browse"><Button variant="outline" className="hidden sm:flex gap-2">Browse All <ArrowRight className="w-4 h-4"/></Button></Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{Array(6).fill(0).map((_,i)=><RoomCardSkeleton key={i}/>)}</div>
          ) : rooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((r,i)=><RoomCard key={r.id} room={r} userId={user?.id} index={i}/>)}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20"/>
              <p>No rooms yet — be the first to list one!</p>
              <Link href="/auth/signup"><Button className="mt-4 bg-violet-600 hover:bg-violet-700 text-white border-0">List a Room</Button></Link>
            </div>
          )}
          <div className="text-center mt-10">
            <Link href="/browse"><Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 px-8">Browse All Rooms <ArrowRight className="w-4 h-4 ml-2"/></Button></Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-display font-bold mb-4">How LinkMate Works</h2>
            <p className="text-muted-foreground">Simple steps to find or list your room</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {n:'01',t:'Search & Filter',d:'Find rooms by city, price range, type and amenities in seconds.',icon:Search},
              {n:'02',t:'View & Save',d:'Explore photos and details. Save favourites to compare later.',icon:Star},
              {n:'03',t:'Connect & Move',d:'Contact the owner directly and move into your perfect room.',icon:Home},
            ].map((s,i)=>(
              <motion.div key={s.n} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.15}} className="text-center group">
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/25 group-hover:scale-110 transition-transform">
                    <s.icon className="w-8 h-8 text-white"/>
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-violet-500 flex items-center justify-center text-xs font-bold text-violet-500">{s.n}</span>
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">{s.t}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{opacity:0,scale:0.97}} whileInView={{opacity:1,scale:1}} viewport={{once:true}}
            className="rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 30% 50%,white 1px,transparent 1px)',backgroundSize:'28px 28px'}}/>
            <div className="relative z-10">
              <h2 className="text-4xl font-display font-bold text-white mb-4">Ready to find your room?</h2>
              <p className="text-white/70 mb-8 text-lg">Join LinkMate and discover your perfect home today.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup"><Button size="lg" className="bg-white text-violet-700 hover:bg-white/90 font-bold px-8">Get Started Free</Button></Link>
                <Link href="/browse"><Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">Browse Rooms</Button></Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border/50 text-center text-sm text-muted-foreground">
        <p>© 2024 LinkMate. Find rooms, make connections.</p>
      </footer>
    </div>
  )
}
