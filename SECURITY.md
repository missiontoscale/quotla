# Security Documentation - Quotla

## 🔒 Security Overview

This document outlines the security measures, best practices, and guidelines for the Quotla application.

**Last Updated:** December 6, 2025
**Security Level:** Production-Ready
**Compliance:** OWASP Top 10, GDPR-Ready

---

## Table of Contents

1. [Infrastructure & Deployment Security](#infrastructure--deployment-security)
2. [Authentication & Authorization](#authentication--authorization)
3. [Secrets Management](#secrets-management)
4. [API Security](#api-security)
5. [Rate Limiting](#rate-limiting)
6. [Input Validation & Sanitization](#input-validation--sanitization)
7. [Security Headers](#security-headers)
8. [Database Security](#database-security)
9. [Monitoring & Audit Logging](#monitoring--audit-logging)
10. [Security Checklist](#security-checklist)
11. [Incident Response](#incident-response)

---

## Infrastructure & Deployment Security

### ✅ Authentication at Infrastructure Layer

**Middleware Protection** ([middleware.ts](middleware.ts))
- Server-side authentication checks on all protected routes
- Session validation using Supabase Auth
- Automatic redirect to login for unauthenticated access
- Admin-only route protection with database verification

**Public vs Protected Routes:**
```typescript
// Public routes (no authentication required)
- / (landing page)
- /login, /signup
- /about, /blog, /newsletter, /advisor, /forums
- /api/newsletter/subscribe
- /api/blog/comment

// Protected routes (authentication required)
- /dashboard
- /quotes, /invoices, /clients
- /settings
- All other API routes

// Admin-only routes
- /admin
```

### ✅ Secure Transport (HTTPS)

**Production Requirements:**
- All traffic MUST use HTTPS in production
- HTTP Strict Transport Security (HSTS) enabled
- Certificate auto-renewal configured via hosting platform
- Upgrade insecure requests via CSP

**Local Development:**
- HTTP allowed for localhost only
- HTTPS recommended for production-like testing

---

## Authentication & Authorization

### Authentication Flow

**Provider:** Supabase Auth
**Method:** Email/Password with JWT tokens
**Session Storage:** HTTP-only cookies (managed by Supabase)

**Implementation:**
1. User signs up/logs in via Supabase Auth
2. JWT token stored in HTTP-only cookie
3. Session validated on each request via middleware
4. Token automatically refreshed by Supabase client

### Password Security

**Requirements:**
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character

**Validation:** [lib/utils/validation.ts](lib/utils/validation.ts)

### Authorization Levels

| Level | Access | Implementation |
|-------|--------|----------------|
| **Unauthenticated** | Public pages only | Middleware redirect |
| **Authenticated User** | Own data only | Row Level Security (RLS) |
| **Admin** | All data + admin panel | `is_admin` flag + RLS |

### Admin Access

**Verification:**
```typescript
// Server-side admin check in middleware
const { data: profile } = await supabase
  .from('profiles')
  .select('is_admin')
  .eq('id', session.user.id)
  .single()

if (!profile?.is_admin) {
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

---

## Secrets Management

### ✅ Environment Variables

**File Structure:**
- `.env` - Local secrets (NEVER commit to git)
- `.env.example` - Template with placeholder values (committed)
- `.gitignore` - Ensures `.env` is never tracked

**Required Secrets:**
```bash
# Supabase (get from https://app.supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # NEVER expose to client

# AI Providers (only include ones you use)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
OPENAI_API_KEY=sk-proj-xxxxx
GOOGLE_AI_API_KEY=xxxxx
AI_PROVIDER=openai  # or 'anthropic', 'gemini', 'none'

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 🔴 CRITICAL: Secret Rotation

**If secrets are exposed:**
1. **Immediately** rotate all API keys
2. Check git history for leaked credentials
3. Review application logs for unauthorized access
4. Update all deployment environments

**Rotation Schedule:**
- Supabase keys: Only if compromised
- AI API keys: Every 90 days or if compromised
- Service role keys: Only if compromised

### ✅ Client vs Server Secrets

| Secret Type | Exposure | Usage |
|-------------|----------|-------|
| `NEXT_PUBLIC_*` | Client-side (public) | Browser-safe values only |
| No prefix | Server-side only | Sensitive credentials |

**Examples:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Safe to expose
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Safe with RLS enabled
- ❌ `SUPABASE_SERVICE_ROLE_KEY` - NEVER expose to client
- ❌ `OPENAI_API_KEY` - NEVER expose to client

---

## API Security

### API Authentication

**Helper Utilities:** [lib/utils/api-auth.ts](lib/utils/api-auth.ts)

**Usage in API Routes:**
```typescript
import { authenticateApiRequest, createApiErrorResponse } from '@/lib/utils/api-auth'

export async function POST(request: Request) {
  // Authenticate the request
  const auth = await authenticateApiRequest(request)

  if (!auth.authenticated) {
    return createApiErrorResponse(auth.error!, auth.statusCode!)
  }

  // Proceed with authenticated user
  const userId = auth.user!.id
  // ... rest of your logic
}
```

**Admin-Only Endpoints:**
```typescript
import { requireAdmin } from '@/lib/utils/api-auth'

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request)

  if (!auth.authenticated) {
    return createApiErrorResponse(auth.error!, auth.statusCode!)
  }

  // Admin-only logic here
}
```

### Input Validation

**Required Field Validation:**
```typescript
import { validateRequiredFields, parseJsonBody } from '@/lib/utils/api-auth'

const bodyResult = await parseJsonBody(request)
if (!bodyResult.success) {
  return createApiErrorResponse(bodyResult.error)
}

const validation = validateRequiredFields(bodyResult.data, ['email', 'name'])
if (!validation.valid) {
  return createApiErrorResponse(
    `Missing required fields: ${validation.missing!.join(', ')}`
  )
}
```

### Input Sanitization

**HTML Sanitization:**
```typescript
import { sanitizeHtml, sanitizeInput } from '@/lib/utils/security'

// Remove dangerous HTML tags and attributes
const safeHtml = sanitizeHtml(userInput)

// Basic input sanitization
const safeInput = sanitizeInput(userInput)
```

---

## Rate Limiting

### Implementation

**Database-Backed Rate Limiting:** [lib/utils/security.ts](lib/utils/security.ts)

**Rate Limits by Endpoint:**

| Endpoint | Limit | Window | Reason |
|----------|-------|--------|--------|
| `/api/ai/generate` | 10 requests | 1 hour | Expensive AI operations |
| `/api/ai/generate-quote` | 20 requests | 1 hour | Moderate AI usage |
| `/api/ai/invoice` | 20 requests | 1 hour | Moderate AI usage |
| `/api/ai/transcribe` | 5 requests | 1 hour | Very expensive operation |
| `/api/account/delete` | 3 requests | 24 hours | Security-sensitive |
| `/api/blog/comment` | 5 requests | 1 hour | Spam prevention |
| `/api/newsletter/subscribe` | 3 requests | 1 hour | Spam prevention |

### Usage in API Routes

```typescript
import { enforceRateLimit, createRateLimitResponse } from '@/lib/utils/security'

export async function POST(request: Request) {
  const identifier = auth.user?.id || getClientIp(request)

  const rateLimit = await enforceRateLimit(identifier, 'ai_generate')

  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit)
  }

  // Proceed with request
  // Rate limit headers automatically added
}
```

### Rate Limit Headers

**Response Headers:**
- `X-RateLimit-Remaining` - Requests remaining in window
- `X-RateLimit-Reset` - Timestamp when limit resets
- `Retry-After` - Seconds until retry is allowed

---

## Input Validation & Sanitization

### Email Validation

```typescript
import { validateEmail } from '@/lib/utils/validation'

if (!validateEmail(email)) {
  return createApiErrorResponse('Invalid email format')
}
```

### File Upload Validation

```typescript
import { validateFile } from '@/lib/utils/validation'

const validation = validateFile(file)
if (!validation.valid) {
  return createApiErrorResponse(validation.error)
}

// Allowed: PNG, JPEG, WebP
// Max size: 2MB
```

### SQL Injection Prevention

**✅ Using Supabase (Parameterized Queries):**
```typescript
// SAFE - Parameters are automatically escaped
const { data } = await supabase
  .from('quotes')
  .select('*')
  .eq('user_id', userId)
  .ilike('title', `%${searchTerm}%`)
```

**❌ Never do this:**
```typescript
// UNSAFE - Never construct raw SQL with user input
const query = `SELECT * FROM quotes WHERE title = '${userInput}'`
```

### XSS Prevention

**Content Security Policy (CSP):**
- Scripts only from self and approved CDNs
- No inline scripts without nonce
- No eval() or Function() constructor
- No unsafe-eval

**React Built-in Protection:**
- All user content automatically escaped
- Use `dangerouslySetInnerHTML` only with sanitized content

---

## Security Headers

### Implementation

**Middleware:** [middleware.ts](middleware.ts)
**Next.js Config:** [next.config.mjs](next.config.mjs)

### Headers Applied

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | Restrictive policy | Prevent XSS, injection attacks |
| `X-Frame-Options` | DENY | Prevent clickjacking |
| `X-Content-Type-Options` | nosniff | Prevent MIME sniffing |
| `Referrer-Policy` | strict-origin-when-cross-origin | Control referrer information |
| `X-XSS-Protection` | 1; mode=block | Enable browser XSS filter |
| `Permissions-Policy` | Restrictive | Disable unnecessary browser features |
| `Strict-Transport-Security` | max-age=31536000 | Enforce HTTPS (production only) |

### Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' blob: data: https://*.supabase.co;
font-src 'self' https://fonts.gstatic.com;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

---

## Database Security

### Row Level Security (RLS)

**All tables have RLS enabled** - [supabase-schema.sql](supabase-schema.sql)

**Policy Examples:**

**User Data Isolation:**
```sql
-- Users can only see their own quotes
CREATE POLICY "Users can view own quotes"
  ON quotes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only update their own quotes
CREATE POLICY "Users can update own quotes"
  ON quotes FOR UPDATE
  USING (auth.uid() = user_id);
```

**Admin Access:**
```sql
-- Admins can view all data
CREATE POLICY "Admins can view all quotes"
  ON quotes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### Database Best Practices

✅ **Do:**
- Use parameterized queries (Supabase automatically does this)
- Rely on RLS for authorization
- Use the anonymous client for user operations
- Use the service role client only for admin operations
- Enable RLS on ALL tables

❌ **Don't:**
- Construct raw SQL with user input
- Bypass RLS in client-side code
- Use service role key in client-side code
- Disable RLS on any table
- Trust client-side validation alone

---

## Monitoring & Audit Logging

### Audit Log Implementation

**Function:** [lib/utils/security.ts:logAudit()](lib/utils/security.ts)

**Usage:**
```typescript
import { logAudit, getClientIp } from '@/lib/utils/security'

await logAudit(
  userId,                    // User who performed the action
  'quote_created',           // Action type
  'quote',                   // Resource type
  quoteId,                   // Resource ID
  { amount: 5000 },          // Additional details
  getClientIp(request)       // IP address
)
```

### Events to Log

**Security Events:**
- Failed login attempts
- Unauthorized access attempts
- Admin privilege escalation attempts
- Account deletions
- Password changes

**Business Events:**
- Quote creation/modification/deletion
- Invoice generation
- Client data access
- Export operations
- AI API usage

### Monitoring Recommendations

**Tools:**
- Supabase Dashboard - Database metrics
- Vercel Analytics - Application performance
- Sentry (recommended) - Error tracking
- LogRocket (optional) - Session replay

**Key Metrics:**
- Failed authentication rate
- API error rate
- Rate limit violations
- Database query performance
- AI API usage and costs

---

## Security Checklist

### Pre-Deployment Checklist

- [ ] All secrets in `.env`, never in code
- [ ] `.env` in `.gitignore`
- [ ] `.env.example` created with placeholders
- [ ] All API keys rotated from development
- [ ] HTTPS enabled and enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled on all sensitive endpoints
- [ ] RLS enabled on all database tables
- [ ] Admin-only routes protected
- [ ] Middleware authentication active
- [ ] TypeScript strict mode enabled
- [ ] ESLint security rules enabled
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] Build errors NOT ignored (check `next.config.mjs`)
- [ ] Console logs removed from production
- [ ] Error messages don't expose sensitive data
- [ ] File upload validation in place
- [ ] Input sanitization on all user inputs
- [ ] Audit logging implemented for sensitive operations

### Regular Security Tasks

**Weekly:**
- [ ] Review audit logs for suspicious activity
- [ ] Check rate limit violations

**Monthly:**
- [ ] Run `npm audit` and update dependencies
- [ ] Review Supabase auth logs
- [ ] Check for failed authentication patterns

**Quarterly:**
- [ ] Rotate AI API keys
- [ ] Review and update security policies
- [ ] Conduct security audit
- [ ] Update dependencies to latest stable versions

---

## Incident Response

### If Secrets Are Exposed

**Immediate Actions (within 1 hour):**
1. Rotate ALL exposed credentials immediately
2. Check git history: `git log -p -- .env`
3. If committed to git, consider repository as compromised
4. Notify team members
5. Review Supabase auth logs for unauthorized access
6. Review AI provider usage for anomalies

**Investigation (within 24 hours):**
1. Review audit logs for suspicious activity
2. Check database for unauthorized data access
3. Review API usage patterns
4. Identify scope of compromise
5. Document timeline and impact

**Recovery:**
1. Create new Supabase project if service role key was exposed
2. Migrate data to new project
3. Update all environment variables
4. Force re-authentication of all users
5. Monitor for continued suspicious activity

### If Unauthorized Access Detected

**Immediate Actions:**
1. Identify affected user accounts
2. Force password reset for affected accounts
3. Review audit logs for extent of access
4. Check for data exfiltration
5. Preserve evidence for investigation

**Communication:**
1. Notify affected users (if PII accessed)
2. Document incident
3. Implement additional security measures
4. Consider regulatory reporting requirements (GDPR, etc.)

---

## Security Contacts

**Report Security Issues:**
- Do NOT create public GitHub issues for security vulnerabilities
- Email: [your-security-email@example.com]
- Response time: Within 24 hours for critical issues

**External Security Resources:**
- Supabase Security: https://supabase.com/docs/guides/platform/security
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Next.js Security: https://nextjs.org/docs/app/building-your-application/deploying#security

---

## Additional Resources

### Secure Coding Guidelines

1. **Never trust client-side validation** - Always validate on server
2. **Use allowlists, not blocklists** - Define what's allowed, not what's blocked
3. **Fail securely** - Default to denying access on errors
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Log security events** - But never log sensitive data
6. **Use TypeScript strictly** - Catch errors at compile time
7. **Review AI-generated code** - Don't trust it blindly
8. **Test security** - Include security tests in your test suite

### Tools & Scripts

**Security Audit:**
```bash
npm run security:check
```

**Fix Vulnerabilities:**
```bash
npm run security:fix
```

**Type Check:**
```bash
npm run type-check
```

**Lint with Auto-fix:**
```bash
npm run lint:fix
```

---

**Document Version:** 1.0
**Last Reviewed:** December 6, 2025
**Next Review:** March 6, 2026
