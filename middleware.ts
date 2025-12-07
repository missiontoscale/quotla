import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/about',
  '/blog',
  '/newsletter',
  '/advisor',
  '/forums',
  '/api/newsletter/subscribe',
  '/api/blog/comment',
]

// Admin-only routes
const ADMIN_ROUTES = [
  '/admin',
]

// API routes that need rate limiting
const RATE_LIMITED_API_ROUTES = [
  '/api/ai/generate',
  '/api/ai/generate-quote',
  '/api/ai/invoice',
  '/api/ai/transcribe',
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const { pathname } = request.nextUrl

  // Skip middleware for static files, public assets, and Supabase auth
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/api/auth/') ||  // Allow Supabase auth callbacks
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf)$/)
  ) {
    addSecurityHeaders(response)
    return response
  }

  // Create Supabase client for session verification
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Add security headers to all responses
  addSecurityHeaders(response)

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    if (route === '/blog') {
      return pathname === '/blog' || pathname.startsWith('/blog/')
    }
    if (route === '/forums') {
      return pathname === '/forums' || pathname.startsWith('/forums/')
    }
    return pathname === route
  })

  // Routes that use client-side ProtectedRoute component (skip server-side redirect)
  const clientSideProtectedRoutes = [
    '/dashboard',
    '/quotes',
    '/invoices',
    '/clients',
    '/settings',
    '/billing',
    '/create',
  ]

  const isClientSideProtected = clientSideProtectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  // Only redirect on server-side for routes that don't have client-side protection
  // This prevents redirect loops with ProtectedRoute component
  if (!isPublicRoute && !session && !isClientSideProtected) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check admin routes
  if (session && ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Add rate limiting headers for API routes
  if (pathname.startsWith('/api/')) {
    const identifier = session?.user.id || getClientIp(request)

    // Check if this is a rate-limited endpoint
    const isRateLimited = RATE_LIMITED_API_ROUTES.some(route =>
      pathname.startsWith(route)
    )

    if (isRateLimited) {
      // Add rate limit headers (actual enforcement happens in the API route)
      response.headers.set('X-RateLimit-Identifier', identifier)
      response.headers.set('X-Content-Type-Options', 'nosniff')
    }
  }

  // Prevent caching of sensitive pages
  if (!isPublicRoute && session) {
    response.headers.set(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate'
    )
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  return response
}

function addSecurityHeaders(response: NextResponse) {
  // Content Security Policy - different for dev and production
  const isDev = process.env.NODE_ENV !== 'production'

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.supabase.co https://rjrsjnzxqhemksdjcybi.supabase.co;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co https://rjrsjnzxqhemksdjcybi.supabase.co wss://*.supabase.co;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${!isDev ? 'upgrade-insecure-requests;' : ''}
  `.replace(/\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)

  // Other security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  // HSTS (HTTP Strict Transport Security) - only in production with HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  return response
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  return cfConnectingIp || realIp || forwarded?.split(',')[0] || 'unknown'
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
