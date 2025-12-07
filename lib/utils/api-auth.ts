import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { getClientIp, logAudit } from './security'

export interface AuthenticatedUser {
  id: string
  email: string
  isAdmin: boolean
}

export interface ApiAuthResult {
  authenticated: boolean
  user: AuthenticatedUser | null
  error?: string
  statusCode?: number
}

/**
 * Authenticate API requests using Supabase session
 * Usage in API routes:
 *
 * const auth = await authenticateApiRequest(request)
 * if (!auth.authenticated) {
 *   return new Response(JSON.stringify({ error: auth.error }), {
 *     status: auth.statusCode
 *   })
 * }
 */
export async function authenticateApiRequest(
  request: Request
): Promise<ApiAuthResult> {
  try {
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return {
        authenticated: false,
        user: null,
        error: 'Authentication required',
        statusCode: 401,
      }
    }

    // Get user profile to check admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      return {
        authenticated: false,
        user: null,
        error: 'Failed to fetch user profile',
        statusCode: 500,
      }
    }

    return {
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email || '',
        isAdmin: profile?.is_admin || false,
      },
    }
  } catch (error) {
    console.error('API authentication error:', error)
    return {
      authenticated: false,
      user: null,
      error: 'Internal authentication error',
      statusCode: 500,
    }
  }
}

/**
 * Require admin access for API routes
 */
export async function requireAdmin(
  request: Request
): Promise<ApiAuthResult> {
  const auth = await authenticateApiRequest(request)

  if (!auth.authenticated) {
    return auth
  }

  if (!auth.user?.isAdmin) {
    // Log unauthorized admin access attempt
    await logAudit(
      auth.user?.id || null,
      'unauthorized_admin_access',
      'api_endpoint',
      new URL(request.url).pathname,
      { ip: getClientIp(request) },
      getClientIp(request)
    )

    return {
      authenticated: false,
      user: null,
      error: 'Admin access required',
      statusCode: 403,
    }
  }

  return auth
}

/**
 * Create a standardized error response
 */
export function createApiErrorResponse(
  error: string,
  statusCode: number = 400,
  details?: Record<string, unknown>
) {
  return new Response(
    JSON.stringify({
      error,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

/**
 * Create a standardized success response
 */
export function createApiSuccessResponse(
  data: unknown,
  statusCode: number = 200
) {
  return new Response(JSON.stringify(data), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): { valid: boolean; missing?: string[] } {
  const missing = requiredFields.filter(field => !body[field])

  if (missing.length > 0) {
    return { valid: false, missing }
  }

  return { valid: true }
}

/**
 * Parse and validate JSON request body
 */
export async function parseJsonBody<T = Record<string, unknown>>(
  request: Request
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const contentType = request.headers.get('content-type')

    if (!contentType?.includes('application/json')) {
      return {
        success: false,
        error: 'Content-Type must be application/json',
      }
    }

    const body = await request.json()
    return { success: true, data: body as T }
  } catch (error) {
    return {
      success: false,
      error: 'Invalid JSON body',
    }
  }
}

/**
 * CORS headers for API routes (if needed for external access)
 */
export function getCorsHeaders(origin?: string) {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    // Add other allowed origins here
  ]

  const isAllowed = origin && allowedOrigins.includes(origin)

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}
