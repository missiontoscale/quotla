import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}
if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'x-application-name': 'quotla',
    },
    fetch: (url, options = {}) => {
      // Only apply timeout to non-auth endpoints to prevent token refresh issues
      const isAuthEndpoint = url.toString().includes('/auth/')
      const timeout = isAuthEndpoint ? 60000 : 30000 // 60s for auth, 30s for others

      return fetch(url, {
        ...options,
        signal: options.signal || AbortSignal.timeout(timeout),
      }).catch((error) => {
        throw error
      })
    },
  },
})

// Handle auth state changes and clean up invalid sessions
supabase.auth.onAuthStateChange(async (event, session) => {
  // Clear invalid sessions
  if (event === 'TOKEN_REFRESH_FAILED' || event === 'USER_DELETED') {
    await supabase.auth.signOut()
  }
})
