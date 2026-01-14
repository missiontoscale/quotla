# Rate Limiting Implementation

## Overview
Quotla implements comprehensive rate limiting to protect API endpoints from abuse and ensure fair usage across all users.

## Rate Limit Configuration

All rate limits are configured in `lib/utils/security.ts`:

```typescript
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
}
```

## Endpoints with Rate Limiting

### AI Endpoints
- **`/api/ai/generate`**: 10 requests per hour
- **`/api/ai/generate-quote`**: 20 requests per hour
- **`/api/ai/generate-invoice`**: 20 requests per hour
- **`/api/ai/transcribe`**: 5 requests per hour

### User-facing Endpoints
- **`/api/blog/comment`**: 5 requests per hour
- **`/api/newsletter/subscribe`**: 3 requests per hour
- **`/api/account/delete`**: 3 requests per day

## Implementation

### For Authenticated Users
Rate limits are tracked by user ID:
```typescript
const identifier = session?.user?.id
const rateLimitResult = await enforceRateLimit(identifier, 'ai_generate')
```

### For Anonymous Users
Rate limits are tracked by IP address:
```typescript
const identifier = getClientIp(request)
const rateLimitResult = await enforceRateLimit(identifier, 'ai_generate')
```

### Example Implementation in API Route

```typescript
import { enforceRateLimit, createRateLimitResponse, getClientIp } from '@/lib/utils/security'

export async function POST(request: NextRequest) {
  // Get user ID or IP address
  const identifier = session?.user?.id || getClientIp(request)

  // Check rate limit
  const rateLimitResult = await enforceRateLimit(identifier, 'ai_generate')

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult)
  }

  // Continue with request processing...
}
```

## Response Headers

When rate limited, the response includes the following headers:
- `X-RateLimit-Remaining`: Number of requests remaining
- `X-RateLimit-Reset`: Unix timestamp when the limit resets
- `Retry-After`: Seconds until the client can retry

## Database Schema

Rate limits are stored in the `rate_limits` table:

```sql
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  count INTEGER NOT NULL,
  window_start TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_identifier_action ON rate_limits(identifier, action, window_start);
```

## Adjusting Rate Limits

To adjust rate limits for a specific endpoint:

1. Edit the `AI_RATE_LIMITS` object in `lib/utils/security.ts`
2. Change `maxRequests` or `windowMinutes` as needed
3. Deploy the changes

Example:
```typescript
// Increase AI generation limit to 20 requests per hour
ai_generate: { maxRequests: 20, windowMinutes: 60 },
```

## Monitoring

Rate limit violations are logged in the database and can be monitored via:

```sql
SELECT
  identifier,
  action,
  count,
  window_start
FROM rate_limits
WHERE count >= (SELECT max_requests FROM ai_rate_limits WHERE action = action_name)
ORDER BY window_start DESC;
```

## Best Practices

1. **Authenticated users**: Use user ID for more accurate tracking
2. **Anonymous users**: Use IP address with stricter limits
3. **Error handling**: Always show user-friendly messages when rate limited
4. **Retry logic**: Implement exponential backoff in client code
5. **Premium tiers**: Consider different limits for paid vs free users

## Future Enhancements

- [ ] Redis-based rate limiting for better performance
- [ ] Per-tier rate limits (free, pro, enterprise)
- [ ] Rate limit analytics dashboard
- [ ] Automatic IP blocking for repeated violations
- [ ] Grace period for accidental limit hits
