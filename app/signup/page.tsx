'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { validateEmail, validatePassword } from '@/lib/utils/validation'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import Footer from '@/components/Footer'
import type { Database } from '@/types/database'

function ConfirmationSent({ email }: { email: string }) {
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState('')

  const handleResend = async () => {
    setResending(true)
    setResendError('')
    setResendSuccess(false)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) throw error
      setResendSuccess(true)
    } catch (err) {
      setResendError(err instanceof Error ? err.message : 'Failed to resend email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="text-center space-y-4">
      <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
        <div className="flex items-center justify-center mb-2">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-semibold text-lg mb-2">Check your email!</h3>
        <p className="text-sm">
          We&apos;ve sent a confirmation email to <strong>{email}</strong>
        </p>
        <p className="text-sm mt-2">
          Click the link in the email to verify your account and complete the signup process.
        </p>
      </div>

      {resendSuccess && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded text-sm">
          Confirmation email resent successfully!
        </div>
      )}

      {resendError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
          {resendError}
        </div>
      )}

      <div className="text-sm text-primary-300 space-y-2">
        <p>Didn&apos;t receive the email?</p>
        <p>Check your spam folder, or</p>
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-primary-600 hover:text-primary-700 font-medium underline disabled:opacity-50"
        >
          {resending ? 'Resending...' : 'Resend confirmation email'}
        </button>
      </div>

      <div className="pt-2">
        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Back to Sign in
        </Link>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      setError(passwordValidation.errors[0])
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      // Check if email confirmation is required
      // If user exists but session is null, email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        setSuccess(true)
        setLoading(false)
        return
      }

      // If we have a session, user is logged in (email confirmation disabled)
      if (data.user && data.session) {
        // Profile should be automatically created by database trigger
        // Wait a moment to ensure trigger has completed
        await new Promise(resolve => setTimeout(resolve, 500))

        // Verify profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id' as keyof Database['public']['Tables']['profiles']['Row'], data.user.id)
          .maybeSingle()

        if (profileError || !profile) {
          // This should rarely happen since trigger creates profile
          setError('Account created but profile setup is pending. Please try logging in again.')
          setLoading(false)
          return
        }

        // Check if there's a redirect flag for chat history restoration
        const shouldRedirect = localStorage.getItem('quotla_redirect_after_auth')
        if (shouldRedirect) {
          localStorage.removeItem('quotla_redirect_after_auth')
        }

        router.push('/business/dashboard')
      } else {
        setError('Unexpected signup response. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-700 flex flex-col">
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-primary-600">
              Quotla
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-primary-50">
              Create your account
            </h2>
          </div>

          <div className="card">
            {success ? (
              <ConfirmationSent email={email} />
            ) : (
              <>
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
                    <p className="text-xs text-primary-400 mt-1">
                      Minimum 8 characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="label">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className="input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary"
                  >
                    {loading ? 'Creating account...' : 'Sign up'}
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

                <GoogleSignInButton mode="signup" redirectTo="/dashboard" />

                <div className="mt-6 text-center text-sm">
                  <span className="text-primary-300">Already have an account? </span>
                  <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                    Sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
