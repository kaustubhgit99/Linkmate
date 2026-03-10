'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Home, Eye, Edit3, Trash2, ToggleLeft, ToggleRight, TrendingUp, DollarSign, AlertCircle } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { formatPrice, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

export default function OwnerDashboard() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile, loading: authLoading } = useAuth()
  const supabase = getSupabase()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (profile && profile.role !== 'owner' && profile.role !== 'admin') { router.push('/browse'); return }
    if (user) fetchRooms()
  }, [user, profile, authLoading])

  const fetchRooms = async () => {
    if (!user) return
    const { data, error } = await supabase.from('rooms').select('*,room_images(*)').eq('owner_id',user.id).order('created_at',{ascending:false})
    if (error) console.error(error)
    if (data) setRooms(data)
    setLoading(false)
  }

  const deleteRoom = async (id: string) => {
    if (!confirm('Delete this listing permanently?')) return
    const { error } = await supabase.from('rooms').delete().eq('id', id)
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return }
    setRooms(p => p.filter(r => r.id !== id))
    toast({ title: 'Room deleted' })
  }

  const toggleAvail = async (id: string, cur: boolean) => {
    await supabase.from('rooms').update({ is_available: !cur }).eq('id', id)
    setRooms(p => p.map(r => r.id===id ? {...r,is_available:!cur} : r))
    toast({ title: `Marked as ${!cur ? 'available' : 'occupied'}` })
  }

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/></div>

  if (profile && profile.role !== 'owner' && profile.role !== 'admin') return (
    <div className="min-h-screen bg-background"><Navbar/><div className="pt-24 max-w-md mx-auto px-4 text-center"><AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive"/><h2 className="text-2xl font-display font-bold mb-2">Owner Access Only</h2><p className="text-muted-foreground mb-6">You need an owner account to manage listings.</p><Link href="/auth/signup"><Button className="bg-violet-600 hover:bg-violet-700 text-white border-0">Create Owner Account</Button></Link></div></div>
  )

  const stats = [
    {l:'Total Listings',v:rooms.length,icon:Home,c:'text-blue-500',bg:'bg-blue-500/10'},
    {l:'Available',v:rooms.filter(r=>r.is_available).length,icon:TrendingUp,c:'text-emerald-500',bg:'bg-emerald-500/10'},
    {l:'Occupied',v:rooms.filter(r=>!r.is_available).length,icon:Home,c:'text-amber-500',bg:'bg-amber-500/10'},
    {l:'Monthly Value',v:formatPrice(rooms.filter(r=>r.is_available).reduce((s,r)=>s+r.rent_price,0)),icon:DollarSign,c:'text-violet-500',bg:'bg-violet-500/10'},
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar/>
      <div className="pt-20 max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold">My Listings</h1>
            <p className="text-muted-foreground mt-1">Manage all your room listings</p>
          </div>
          <Link href="/owner/add">
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 flex items-center gap-2 shadow-lg shadow-violet-500/25">
              <Plus className="w-4 h-4"/> Add New Room
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((s,i)=>(
            <motion.div key={s.l} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}} className="glass-card rounded-2xl p-5 border border-border/50">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.c}`}/></div>
              <div className="text-2xl font-display font-bold">{s.v}</div>
              <div className="text-muted-foreground text-xs mt-0.5">{s.l}</div>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="glass-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Room Listings</h2>
            <span className="text-sm text-muted-foreground">{rooms.length} listing{rooms.length!==1?'s':''}</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading your listings...</div>
          ) : rooms.length === 0 ? (
            <div className="p-12 text-center">
              <Home className="w-14 h-14 mx-auto mb-4 text-muted-foreground opacity-30"/>
              <p className="text-muted-foreground mb-2">No listings yet</p>
              <p className="text-sm text-muted-foreground mb-6">Add your first room to start getting inquiries</p>
              <Link href="/owner/add"><Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0"><Plus className="w-4 h-4 mr-2"/>Add Your First Room</Button></Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Room</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">City</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rent</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Photos</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {rooms.map(room=>(
                    <tr key={room.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium line-clamp-1 max-w-44">{room.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{room.room_type} • {room.num_beds} bed</div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell">{room.city}</td>
                      <td className="px-5 py-4 font-bold text-violet-500">{formatPrice(room.rent_price)}</td>
                      <td className="px-5 py-4">
                        <button onClick={()=>toggleAvail(room.id,room.is_available)} title="Click to toggle" className="flex items-center gap-1.5 group">
                          {room.is_available ? <ToggleRight className="w-5 h-5 text-emerald-500"/> : <ToggleLeft className="w-5 h-5 text-muted-foreground"/>}
                          <Badge variant={room.is_available?'success':'warning'} className="text-xs group-hover:opacity-80 transition-opacity">
                            {room.is_available?'Available':'Occupied'}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground hidden md:table-cell text-xs">
                        {room.room_images?.length || 0} photo{room.room_images?.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/room/${room.id}`}><button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="View"><Eye className="w-4 h-4"/></button></Link>
                          <Link href={`/owner/edit/${room.id}`}><button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-violet-500" title="Edit"><Edit3 className="w-4 h-4"/></button></Link>
                          <button onClick={()=>deleteRoom(room.id)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-red-500" title="Delete"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
