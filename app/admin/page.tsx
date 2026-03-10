'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, Home, Trash2, Shield, Eye, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { formatDate, formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile, loading: authLoading } = useAuth()
  const supabase = getSupabase()

  useEffect(() => {
    if (authLoading) return
    if (!user || profile?.role !== 'admin') return
    Promise.all([
      supabase.from('users').select('*').order('created_at',{ascending:false}),
      supabase.from('rooms').select('*,users(full_name,email),room_images(*)').order('created_at',{ascending:false}),
    ]).then(([u,r]) => { if(u.data)setUsers(u.data); if(r.data)setRooms(r.data); setLoading(false) })
  }, [user, profile, authLoading, supabase])

  const deleteUser = async (id: string) => {
    if(!confirm('Delete this user?')) return
    await supabase.from('users').delete().eq('id',id)
    setUsers(p=>p.filter(u=>u.id!==id))
    toast({ title:'User removed' })
  }
  const deleteRoom = async (id: string) => {
    if(!confirm('Remove this listing?')) return
    await supabase.from('rooms').delete().eq('id',id)
    setRooms(p=>p.filter(r=>r.id!==id))
    toast({ title:'Listing removed' })
  }
  const toggleRoomAvail = async (id: string, cur: boolean) => {
    await supabase.from('rooms').update({is_available:!cur}).eq('id',id)
    setRooms(p=>p.map(r=>r.id===id?{...r,is_available:!cur}:r))
  }

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/></div>

  if (!user || profile?.role !== 'admin') return (
    <div className="min-h-screen bg-background"><Navbar/>
      <div className="pt-24 max-w-md mx-auto px-4 text-center">
        <AlertCircle className="w-14 h-14 mx-auto mb-4 text-destructive"/>
        <h2 className="text-2xl font-display font-bold mb-2">Admin Access Only</h2>
        <p className="text-muted-foreground mb-6">To become admin, sign up then run this SQL in Supabase:<br/><code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">UPDATE users SET role='admin' WHERE email='you@email.com';</code></p>
        <Link href="/"><Button>Go Home</Button></Link>
      </div>
    </div>
  )

  const stats = [
    {l:'Total Users',v:users.length,icon:Users,c:'text-blue-500',bg:'bg-blue-500/10'},
    {l:'Owners',v:users.filter(u=>u.role==='owner').length,icon:Home,c:'text-amber-500',bg:'bg-amber-500/10'},
    {l:'Citizens',v:users.filter(u=>u.role==='citizen').length,icon:Users,c:'text-violet-500',bg:'bg-violet-500/10'},
    {l:'Rooms Listed',v:rooms.length,icon:Home,c:'text-emerald-500',bg:'bg-emerald-500/10'},
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar/>
      <div className="pt-20 max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25"><Shield className="w-6 h-6 text-white"/></div>
          <div><h1 className="text-4xl font-display font-bold">Admin Panel</h1><p className="text-muted-foreground text-sm">Platform overview and moderation</p></div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((s,i)=>(
            <motion.div key={s.l} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}} className="glass-card rounded-2xl p-5 border border-border/50">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.c}`}/></div>
              <div className="text-2xl font-display font-bold">{s.v}</div>
              <div className="text-muted-foreground text-xs mt-0.5">{s.l}</div>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6"><TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4"/>Users ({users.length})</TabsTrigger><TabsTrigger value="rooms" className="gap-2"><Home className="w-4 h-4"/>Rooms ({rooms.length})</TabsTrigger></TabsList>

          <TabsContent value="users">
            <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border/50"><th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left">User</th><th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left">Role</th><th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left hidden md:table-cell">Joined</th><th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th></tr></thead>
                  <tbody className="divide-y divide-border/30">
                    {users.map(u=>(
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{u.full_name?.charAt(0)||'?'}</div>
                            <div><div className="font-medium">{u.full_name||'—'}</div><div className="text-xs text-muted-foreground">{u.email}</div></div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><Badge variant={u.role==='admin'?'default':u.role==='owner'?'warning':'secondary'} className="capitalize">{u.role}</Badge></td>
                        <td className="px-5 py-4 text-muted-foreground text-xs hidden md:table-cell">{formatDate(u.created_at)}</td>
                        <td className="px-5 py-4 text-right">{u.id!==user.id&&<button onClick={()=>deleteUser(u.id)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rooms">
            <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border/50"><th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left">Room</th><th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left hidden sm:table-cell">Owner</th><th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left">Rent</th><th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left">Status</th><th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th></tr></thead>
                  <tbody className="divide-y divide-border/30">
                    {rooms.map(r=>(
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4"><div className="font-medium line-clamp-1 max-w-36">{r.title}</div><div className="text-xs text-muted-foreground">{r.city} • {r.room_type}</div></td>
                        <td className="px-5 py-4 text-muted-foreground hidden sm:table-cell text-xs">{r.users?.full_name||'—'}</td>
                        <td className="px-5 py-4 font-bold text-violet-500">{formatPrice(r.rent_price)}</td>
                        <td className="px-5 py-4">
                          <button onClick={()=>toggleRoomAvail(r.id,r.is_available)} className="flex items-center gap-1.5">
                            {r.is_available?<ToggleRight className="w-5 h-5 text-emerald-500"/>:<ToggleLeft className="w-5 h-5 text-muted-foreground"/>}
                            <Badge variant={r.is_available?'success':'warning'}>{r.is_available?'Available':'Occupied'}</Badge>
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/room/${r.id}`}><button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-4 h-4"/></button></Link>
                            <button onClick={()=>deleteRoom(r.id)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
