import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://ndfqysbzwckegfrmrgan.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kZnF5c2J6d2NrZWdmcm1yZ2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNzU0NzIsImV4cCI6MjA4ODY1MTQ3Mn0.QpomigKhoa6drq381guK-gaJvry7fxnIqhA-Nuh1vGs'
export const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kZnF5c2J6d2NrZWdmcm1yZ2FuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA3NTQ3MiwiZXhwIjoyMDg4NjUxNDcyfQ.MFZsOgtotyAqlqzuPvcuQfWYxq0DchhDQ5MMPb-CM-M'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  }
  return _client
}

export const createBrowserClient = getSupabase
