'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, Menu, X, Sun, Moon, LayoutDashboard, LogOut, Heart, Plus, Shield, Home, Search } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const handleSignOut = async () => { await signOut(); router.push('/') }

  const dashLink = profile?.role === 'admin' ? '/admin' : profile?.role === 'owner' ? '/owner' : '/browse'
  const initial = (profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/browse', label: 'Browse Rooms', icon: Search },
  ]

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-violet-500/30">
            <Link2 className="w-4 h-4 text-white"/>
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">LinkMate</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === l.href ? 'text-violet-400 bg-violet-500/10' : 'text-white/70 hover:text-white hover:bg-white/8'}`}>
              <l.icon className="w-4 h-4"/>{l.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all">
            {theme === 'dark' ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
          </button>

          {!loading && (user ? (
            <>
              {profile?.role === 'owner' && (
                <Link href="/owner">
                  <Button size="sm" className="hidden sm:flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white border-0">
                    <Plus className="w-3.5 h-3.5"/> Add Room
                  </Button>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm hover:scale-105 transition-transform shadow-lg shadow-violet-500/20">
                    {initial}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="font-semibold text-sm truncate">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{profile?.role} account</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href={dashLink} className="cursor-pointer"><LayoutDashboard className="w-4 h-4"/> Dashboard</Link>
                  </DropdownMenuItem>
                  {profile?.role === 'citizen' && (
                    <DropdownMenuItem asChild>
                      <Link href="/browse/favorites" className="cursor-pointer"><Heart className="w-4 h-4"/> Saved Rooms</Link>
                    </DropdownMenuItem>
                  )}
                  {profile?.role === 'owner' && (
                    <DropdownMenuItem asChild>
                      <Link href="/owner/add" className="cursor-pointer"><Plus className="w-4 h-4"/> Add New Room</Link>
                    </DropdownMenuItem>
                  )}
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer"><Shield className="w-4 h-4"/> Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-400 cursor-pointer focus:text-red-400 focus:bg-red-500/10">
                    <LogOut className="w-4 h-4"/> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/auth/login"><Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">Login</Button></Link>
              <Link href="/auth/signup"><Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-violet-500/25">Sign Up</Button></Link>
            </div>
          ))}

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all">
            {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="md:hidden glass border-t border-white/10 px-4 py-3 space-y-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors" onClick={() => setOpen(false)}>
                <l.icon className="w-4 h-4"/> {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href={dashLink} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium" onClick={() => setOpen(false)}>
                  <LayoutDashboard className="w-4 h-4"/> Dashboard
                </Link>
                {profile?.role === 'owner' && (
                  <Link href="/owner/add" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-violet-400 hover:bg-violet-500/10 text-sm font-medium" onClick={() => setOpen(false)}>
                    <Plus className="w-4 h-4"/> Add Room
                  </Link>
                )}
                <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-medium">
                  <LogOut className="w-4 h-4"/> Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link href="/auth/login" className="flex-1" onClick={() => setOpen(false)}><Button variant="outline" className="w-full text-sm">Login</Button></Link>
                <Link href="/auth/signup" className="flex-1" onClick={() => setOpen(false)}><Button className="w-full text-sm bg-violet-600 hover:bg-violet-700 text-white border-0">Sign Up</Button></Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
