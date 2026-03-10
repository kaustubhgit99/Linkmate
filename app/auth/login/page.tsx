'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Link2, Loader2, AlertCircle } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = getSupabase()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    const { data: profile } = await supabase.from('users').select('role').eq('id', data.user.id).single()
    const role = profile?.role || 'citizen'
    if (role === 'admin') router.push('/admin')
    else if (role === 'owner') router.push('/owner')
    else router.push('/browse')
  }

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0"><div className="absolute top-1/3 left-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl"/><div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"/></div>
      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} className="w-full max-w-md relative z-10">
        <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-violet-500/30">
                <Link2 className="w-5 h-5 text-white"/>
              </div>
              <span className="font-display font-bold text-xl">LinkMate</span>
            </Link>
            <h1 className="text-3xl font-display font-bold">Welcome back</h1>
            <p className="text-muted-foreground mt-2 text-sm">Sign in to your account</p>
          </div>
          {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm mb-4"><AlertCircle className="w-4 h-4 shrink-0"/>{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5"><Label>Email</Label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" className="h-11"/>
            </div>
            <div className="space-y-1.5"><Label>Password</Label>
              <div className="relative">
                <Input type={show?'text':'password'} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required className="h-11 pr-10"/>
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">{show?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 font-semibold mt-2">
              {loading?<><Loader2 className="w-4 h-4 animate-spin mr-2"/>Signing in...</>:'Sign In'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">No account? <Link href="/auth/signup" className="text-violet-500 hover:text-violet-400 font-medium">Sign up free</Link></p>
        </div>
      </motion.div>
    </div>
  )
}
