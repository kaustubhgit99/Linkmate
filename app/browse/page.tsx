'use client'
import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, Building2 } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { RoomCard, RoomCardSkeleton } from '@/components/rooms/RoomCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { CITIES, ROOM_TYPES } from '@/lib/utils'

function BrowseContent() {
  const sp = useSearchParams()
  const { user } = useAuth()
  const supabase = getSupabase()
  const [all, setAll] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState(sp.get('city') || '')
  const [type, setType] = useState('')
  const [avail, setAvail] = useState('')
  const [minP, setMinP] = useState('')
  const [maxP, setMaxP] = useState('')
  const [advanced, setAdvanced] = useState(false)

  useEffect(() => {
    supabase.from('rooms').select('*,room_images(*),users(full_name,email,phone)').order('created_at',{ascending:false})
      .then(({ data, error }) => {
        if (error) console.error(error)
        const d = data || []
        setAll(d)
        setFiltered(city ? d.filter((r:any) => r.city === city) : d)
        setLoading(false)
      })
  }, [supabase])

  useEffect(() => {
    let r = [...all]
    if (search) { const s = search.toLowerCase(); r = r.filter(x => x.title?.toLowerCase().includes(s) || x.location?.toLowerCase().includes(s) || x.city?.toLowerCase().includes(s)) }
    if (city) r = r.filter(x => x.city === city)
    if (type) r = r.filter(x => x.room_type === type)
    if (avail === 'true') r = r.filter(x => x.is_available)
    if (avail === 'false') r = r.filter(x => !x.is_available)
    if (minP) r = r.filter(x => x.rent_price >= Number(minP))
    if (maxP) r = r.filter(x => x.rent_price <= Number(maxP))
    setFiltered(r)
  }, [search, city, type, avail, minP, maxP, all])

  const hasFilters = search || city || type || avail || minP || maxP
  const clearAll = () => { setSearch(''); setCity(''); setType(''); setAvail(''); setMinP(''); setMaxP('') }

  return (
    <div className="min-h-screen bg-background">
      <Navbar/>
      <div className="pt-20 max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-1">Browse Rooms</h1>
          <p className="text-muted-foreground">{loading ? 'Loading...' : `${filtered.length} room${filtered.length!==1?'s':''} found`}</p>
        </motion.div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 border border-border/50 mb-8">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
              <Input placeholder="Search title, location..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9"/>
            </div>
            <Select value={city||'all'} onValueChange={v=>setCity(v==='all'?'':v)}>
              <SelectTrigger className="w-44"><SelectValue placeholder="All Cities"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {CITIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={()=>setAdvanced(!advanced)} className={advanced?'border-violet-500 text-violet-500 bg-violet-500/5':''}>
              <SlidersHorizontal className="w-4 h-4"/>
            </Button>
            {hasFilters && <Button variant="ghost" size="icon" onClick={clearAll} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4"/></Button>}
          </div>

          {advanced && (
            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Select value={type||'all'} onValueChange={v=>setType(v==='all'?'':v)}>
                <SelectTrigger><SelectValue placeholder="Room Type"/></SelectTrigger>
                <SelectContent><SelectItem value="all">All Types</SelectItem>{ROOM_TYPES.map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" placeholder="Min Price (₹)" value={minP} onChange={e=>setMinP(e.target.value)}/>
              <Input type="number" placeholder="Max Price (₹)" value={maxP} onChange={e=>setMaxP(e.target.value)}/>
              <Select value={avail||'all'} onValueChange={v=>setAvail(v==='all'?'':v)}>
                <SelectTrigger><SelectValue placeholder="Availability"/></SelectTrigger>
                <SelectContent><SelectItem value="all">Any</SelectItem><SelectItem value="true">Available</SelectItem><SelectItem value="false">Occupied</SelectItem></SelectContent>
              </Select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{Array(9).fill(0).map((_,i)=><RoomCardSkeleton key={i}/>)}</div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r,i)=><RoomCard key={r.id} room={r} userId={user?.id} index={i}/>)}
          </div>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            <Building2 className="w-14 h-14 mx-auto mb-4 opacity-20"/>
            <h3 className="text-xl font-semibold mb-2">No rooms found</h3>
            <p className="text-sm">Try adjusting or clearing your filters.</p>
            {hasFilters && <Button variant="outline" className="mt-4" onClick={clearAll}>Clear Filters</Button>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/></div>}><BrowseContent/></Suspense>
}
