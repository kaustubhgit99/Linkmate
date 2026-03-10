'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Link2, Loader2, AlertCircle, UserCircle, Home } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'' })
  const [role, setRole] = useState<'citizen'|'owner'>('citizen')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = getSupabase()

  const set = (k: string, v: string) => setForm(p=>({...p,[k]:v}))

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    const { data, error: err } = await supabase.auth.signUp({ email:form.email, password:form.password, options:{ data:{ full_name:form.name, role } } })
    if (err) { setError(err.message); setLoading(false); return }
    if (data.user) {
      const { error: dbErr } = await supabase.from('users').upsert({ id:data.user.id, email:form.email, full_name:form.name, role, phone:form.phone||null })
      if (dbErr) console.error('Profile insert error:', dbErr)
      if (role === 'owner') router.push('/owner')
      else router.push('/browse')
    }
  }

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0"><div className="absolute top-1/3 right-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl"/><div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"/></div>
      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} className="w-full max-w-md relative z-10">
        <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-violet-500/30"><Link2 className="w-5 h-5 text-white"/></div>
              <span className="font-display font-bold text-xl">LinkMate</span>
            </Link>
            <h1 className="text-3xl font-display font-bold">Create account</h1>
            <p className="text-muted-foreground mt-2 text-sm">Join thousands finding their perfect home</p>
          </div>

          {/* Role picker */}
          <div className="mb-6">
            <Label className="mb-3 block">I want to...</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { r:'citizen' as const, icon: UserCircle, title:'Find a Room', desc:'Browse & rent rooms' },
                { r:'owner' as const, icon: Home, title:'List a Room', desc:'Post & manage rooms' },
              ].map(opt=>(
                <button key={opt.r} type="button" onClick={()=>setRole(opt.r)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${role===opt.r ? 'border-violet-500 bg-violet-500/10' : 'border-border hover:border-violet-400'}`}>
                  <opt.icon className={`w-6 h-6 mb-2 ${role===opt.r ? 'text-violet-500' : 'text-muted-foreground'}`}/>
                  <div className={`font-semibold text-sm ${role===opt.r ? 'text-violet-500' : ''}`}>{opt.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm mb-4"><AlertCircle className="w-4 h-4 shrink-0"/>{error}</div>}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5"><Label>Full Name</Label><Input placeholder="John Doe" value={form.name} onChange={e=>set('name',e.target.value)} required className="h-11"/></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)} required className="h-11"/></div>
            <div className="space-y-1.5"><Label>Phone <span className="text-muted-foreground">(optional)</span></Label><Input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e=>set('phone',e.target.value)} className="h-11"/></div>
            <div className="space-y-1.5"><Label>Password</Label>
              <div className="relative">
                <Input type={show?'text':'password'} placeholder="Min 6 characters" value={form.password} onChange={e=>set('password',e.target.value)} required minLength={6} className="h-11 pr-10"/>
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{show?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 font-semibold mt-2">
              {loading?<><Loader2 className="w-4 h-4 animate-spin mr-2"/>Creating account...</>:'Create Account'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">Already have an account? <Link href="/auth/login" className="text-violet-500 hover:text-violet-400 font-medium">Sign in</Link></p>
        </div>
      </motion.div>
    </div>
  )
}
