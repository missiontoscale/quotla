'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { validateEmail } from '@/lib/utils/validation'
import Footer from '@/components/Footer'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { ROUTES, STORAGE_KEYS, ERROR_MESSAGES } from '@/lib/constants'
import type { Database } from '@/types/database'

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Check for OAuth errors in URL
  useEffect(() => {
    const oauthError = searchParams.get('error')
    if (oauthError) {
      setError(decodeURIComponent(oauthError))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Check for network errors
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          setError(ERROR_MESSAGES.CONNECTION_FAILED)
        }
        // Check if it's an email confirmation error
        else if (error.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before signing in. Check your inbox for the confirmation link.')
        }
        // Check for invalid credentials
        else if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else {
          setError(error.message || ERROR_MESSAGES.SOMETHING_WENT_WRONG)
        }
        setLoading(false)
        return
      }

      // Verify we have a valid session
      if (!data.session) {
        setError('Unable to establish session. Please try again or contact support.')
        setLoading(false)
        return
      }

      // Profile should exist (created by database trigger during signup)
      // Verify it exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id' as keyof Database['public']['Tables']['profiles']['Row'], data.user.id)
        .maybeSingle()

      if (profileError || !profile) {
        setError('Unable to access your profile. Please contact support.')
        setLoading(false)
        return
      }

      // Check if there's a redirect parameter in the URL
      const redirectTo = searchParams.get('redirect')

      // Check if there's a redirect flag for chat history restoration
      const shouldRedirect = localStorage.getItem(STORAGE_KEYS.REDIRECT_AFTER_AUTH)
      if (shouldRedirect) {
        localStorage.removeItem(STORAGE_KEYS.REDIRECT_AFTER_AUTH)
      }

      // Small delay to ensure session is properly established
      await new Promise(resolve => setTimeout(resolve, 100))

      // Redirect to the intended page or default to dashboard
      // Use window.location for a full page reload to ensure middleware picks up the new session
      window.location.href = redirectTo || ROUTES.DASHBOARD
    } catch (err) {

      // Provide more helpful error messages
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError(ERROR_MESSAGES.NETWORK)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(ERROR_MESSAGES.SOMETHING_WENT_WRONG)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-700 flex flex-col">
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href={ROUTES.HOME} className="text-3xl font-bold text-primary-600">
              Quotla
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-primary-50">
              Sign in to your account
            </h2>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-500"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-primary-400">Or continue with</span>
              </div>
            </div>

            <GoogleSignInButton
              mode="signin"
              redirectTo={searchParams.get('redirect') || ROUTES.DASHBOARD}
            />

            <div className="mt-6 text-center text-sm">
              <span className="text-primary-300">Don&apos;t have an account? </span>
              <Link href={ROUTES.SIGNUP} className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16">
        <Footer />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-primary-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
