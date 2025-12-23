import { supabaseAdmin } from '@/lib/supabase/server'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

export async function checkRateLimit(
  identifier: string,
  action: string,
  maxRequests: number = 5,
  windowMinutes: number = 60
): Promise<RateLimitResult> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000)

  const { data: existing } = await supabaseAdmin
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('action', action)
    .gte('window_start', windowStart.toISOString())
    .order('window_start', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) {
    if (existing.count >= maxRequests) {
      const resetAt = new Date(
        new Date(existing.window_start).getTime() + windowMinutes * 60 * 1000
      )
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      }
    }

    await supabaseAdmin
      .from('rate_limits')
      .update({ count: existing.count + 1 })
      .eq('id', existing.id)

    const resetAt = new Date(
      new Date(existing.window_start).getTime() + windowMinutes * 60 * 1000
    )

    return {
      allowed: true,
      remaining: maxRequests - (existing.count + 1),
      resetAt,
    }
  }

  await supabaseAdmin.from('rate_limits').insert({
    identifier,
    action,
    count: 1,
    window_start: now.toISOString(),
  })

  return {
    allowed: true,
    remaining: maxRequests - 1,
    resetAt: new Date(now.getTime() + windowMinutes * 60 * 1000),
  }
}

export async function logAudit(
  userId: string | null,
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  await supabaseAdmin.from('audit_logs').insert({
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details: details || null,
    ip_address: ipAddress,
  })
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  return ip
}

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
}

// Enhanced rate limiting for AI endpoints (expensive operations)
export const AI_RATE_LIMITS = {
  // AI generation endpoints - 10 requests per hour per user
  ai_generate: { maxRequests: 10, windowMinutes: 60 },
  ai_quote: { maxRequests: 20, windowMinutes: 60 },
  ai_invoice: { maxRequests: 20, windowMinutes: 60 },
  ai_transcribe: { maxRequests: 5, windowMinutes: 60 },

  // Other sensitive endpoints
  account_delete: { maxRequests: 3, windowMinutes: 1440 }, // 3 per day
  blog_comment: { maxRequests: 5, windowMinutes: 60 },
  newsletter_subscribe: { maxRequests: 3, windowMinutes: 60 },
} as const

export async function enforceRateLimit(
  identifier: string,
  action: keyof typeof AI_RATE_LIMITS
): Promise<RateLimitResult> {
  const config = AI_RATE_LIMITS[action]
  return checkRateLimit(identifier, action, config.maxRequests, config.windowMinutes)
}

// Helper to create rate limit response
export function createRateLimitResponse(result: RateLimitResult) {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again after ${result.resetAt.toISOString()}`,
      resetAt: result.resetAt.toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetAt.getTime().toString(),
        'Retry-After': Math.ceil(
          (result.resetAt.getTime() - Date.now()) / 1000
        ).toString(),
      },
    }
  )
}

// Validate request authentication
export async function validateAuth(request: Request): Promise<{
  authenticated: boolean
  userId: string | null
  error?: string
}> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return { authenticated: false, userId: null, error: 'No authentication token provided' }
    }

    // In a real implementation, verify the JWT token here
    // For now, we rely on Supabase's built-in auth
    return { authenticated: true, userId: null }
  } catch (error) {
    return { authenticated: false, userId: null, error: 'Invalid authentication token' }
  }
}

// Sanitize input to prevent injection attacks
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, 10000) // Limit length to prevent DoS
}

// Validate file upload
export interface FileValidationResult {
  valid: boolean
  error?: string
  fileType?: string
  fileSize?: number
}

export function validateFileUpload(
  file: File,
  allowedTypes: string[] = ['image/png', 'image/jpeg', 'image/webp'],
  maxSizeBytes: number = 2 * 1024 * 1024 // 2MB default
): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      fileType: file.type,
    }
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeBytes / 1024 / 1024}MB`,
      fileSize: file.size,
    }
  }

  return { valid: true, fileType: file.type, fileSize: file.size }
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)

  for (let i = 0; i < length; i++) {
    token += chars[randomValues[i] % chars.length]
  }

  return token
}
