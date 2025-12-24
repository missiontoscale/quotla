import { createClient } from '@supabase/supabase-js'
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

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Add retry configuration for auth operations
    retryAttempts: 3,
    retryDelay: 1,
  },
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
        // Only log meaningful errors in development, skip timeout/abort errors
        if (process.env.NODE_ENV === 'development') {
          // Skip logging for timeout errors on profile fetches (common during background refresh)
          const isTimeoutError = error?.name === 'AbortError' || error?.name === 'TimeoutError'
          const isProfileFetch = url.toString().includes('/profiles')

          if (!isTimeoutError || !isProfileFetch) {
            console.error('Supabase fetch error:', {
              url: url.toString(),
              message: error?.message || String(error) || 'Unknown error',
              name: error?.name || typeof error,
            })
          }
        }
        throw error
      })
    },
  },
})

// Handle auth state changes and clean up invalid sessions
supabase.auth.onAuthStateChange(async (event, session) => {
  if (process.env.NODE_ENV === 'development') {
    if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed successfully')
    }
    if (event === 'SIGNED_OUT') {
      console.log('User signed out')
    }
  }

  // Clear invalid sessions
  if (event === 'TOKEN_REFRESH_FAILED' || event === 'USER_DELETED') {
    await supabase.auth.signOut()
  }
})
