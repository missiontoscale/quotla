import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Handle auth errors gracefully
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-application-name': 'quotla',
    },
  },
})

// Handle auth state changes and clean up invalid sessions
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully')
  }
  if (event === 'SIGNED_OUT') {
    console.log('User signed out')
  }
})
