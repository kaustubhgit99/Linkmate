'use client'
import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export type UserProfile = {
  id: string; email: string; full_name: string | null
  role: 'citizen' | 'owner' | 'admin'; phone: string | null; avatar_url: string | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabase()

  const fetchProfile = useCallback(async (uid: string) => {
    const { data } = await supabase.from('users').select('*').eq('id', uid).single()
    if (data) setProfile(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [fetchProfile, supabase.auth])

  return { user, profile, loading, signOut: () => supabase.auth.signOut() }
}

export function useFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<string[]>([])
  const supabase = getSupabase()
  useEffect(() => {
    if (!userId) return
    supabase.from('favorites').select('room_id').eq('user_id', userId)
      .then(({ data }) => { if (data) setFavorites(data.map((f: any) => f.room_id)) })
  }, [userId, supabase])
  const toggleFavorite = async (roomId: string) => {
    if (!userId) return
    if (favorites.includes(roomId)) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('room_id', roomId)
      setFavorites(p => p.filter(id => id !== roomId))
    } else {
      await supabase.from('favorites').insert({ user_id: userId, room_id: roomId })
      setFavorites(p => [...p, roomId])
    }
  }
  return { favorites, toggleFavorite }
}
