# Quotla Architecture

This document explains the technical architecture and design decisions behind Quotla.

## System Overview

Quotla is a modern web application built with Next.js 14 using the App Router architecture. It follows a serverless architecture with edge deployment capabilities.

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│      Next.js Frontend       │
│   (React + TypeScript)      │
└──────────┬──────────────────┘
           │
           ├──────────────────┐
           │                  │
           ▼                  ▼
    ┌────────────┐    ┌──────────────┐
    │  Supabase  │    │  Anthropic   │
    │    API     │    │     API      │
    └────────────┘    └──────────────┘
           │
           ▼
    ┌────────────┐
    │ PostgreSQL │
    │  Database  │
    └────────────┘
```

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form handling
- **date-fns**: Date manipulation

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Row Level Security
  - Storage
- **Anthropic Claude**: AI content generation

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing

## Architecture Patterns

### 1. App Router Structure

We use Next.js App Router for file-based routing:

```
app/
├── (auth)/                 # Auth group
│   ├── login/             # Login page
│   └── signup/            # Signup page
├── (dashboard)/           # Protected routes
│   ├── dashboard/
│   ├── quotes/
│   ├── invoices/
│   ├── clients/
│   └── settings/
├── (public)/              # Public routes
│   ├── blog/
│   └── newsletter/
└── api/                   # API routes
    ├── ai/
    ├── blog/
    └── newsletter/
```

### 2. Component Architecture

```
components/
├── Layout Components
│   ├── DashboardLayout     # Main app layout
│   └── ProtectedRoute      # Auth wrapper
├── Feature Components
│   └── AIDescriptionGenerator
└── Shared Components
```

### 3. State Management

We use React Context for global state:

- **AuthContext**: User authentication and profile data
- **Local State**: Component-specific state with useState
- **Server State**: Managed by Supabase real-time subscriptions

### 4. Data Flow

```
User Input → React Component → Validation → API Route → Supabase → Database
                                                ↓
                                        Row Level Security
                                                ↓
                                        Response → Component → UI Update
```

## Security Architecture

### Row Level Security (RLS)

Every table has RLS policies ensuring:
- Users only see their own data
- Admins have elevated permissions
- Public data is properly scoped

Example policy:
```sql
CREATE POLICY "Users can view own quotes"
ON quotes FOR SELECT
USING (auth.uid() = user_id);
```

### Authentication Flow

```
1. User enters credentials
2. Supabase Auth validates
3. JWT token issued
4. Token stored in httpOnly cookie
5. Subsequent requests include token
6. RLS policies enforce access
```

### Rate Limiting

Implemented at the API level:
```typescript
checkRateLimit(identifier, action, maxRequests, windowMinutes)
```

Prevents:
- Comment spam
- API abuse
- DDoS attempts

## Database Schema

### Core Tables

**profiles**
- Extends Supabase auth.users
- Stores business information
- One-to-many with quotes, invoices, clients

**clients**
- Stores customer data
- Linked to user via user_id
- Referenced by quotes and invoices

**quotes & quote_items**
- Master-detail relationship
- Calculated fields for totals
- Status tracking

**invoices & invoice_items**
- Similar to quotes
- Additional payment tracking
- Due date management

### Supporting Tables

**blog_posts & blog_comments**
- Content management
- Moderation workflow
- Public visibility control

**newsletter_subscribers**
- Email collection
- Subscription management

**rate_limits & audit_logs**
- Security tracking
- Compliance logging

## API Architecture

### RESTful Endpoints

```
POST /api/ai/generate          # AI description generation
POST /api/blog/comment         # Submit blog comment
POST /api/newsletter/subscribe # Newsletter signup
```

### Response Format

```typescript
// Success
{
  success: true,
  data: {...}
}

// Error
{
  error: "Error message",
  status: 400
}
```

## AI Integration

### Claude Integration

```
User Input (prompt)
    ↓
Frontend Component
    ↓
POST /api/ai/generate
    ↓
Anthropic SDK
    ↓
Claude 3.5 Sonnet API
    ↓
Generated Description
    ↓
Sanitization
    ↓
Return to Client
```

### Prompt Engineering

We use a structured prompt:
- Role definition
- Task description
- Output format
- Example context

## Performance Optimization

### 1. Server-Side Rendering (SSR)

Pages are rendered on the server when possible:
- Faster initial load
- Better SEO
- Improved performance

### 2. Code Splitting

Next.js automatically splits code:
- Route-based splitting
- Component-level splitting
- Dynamic imports where needed

### 3. Image Optimization

Using Next.js Image component:
- Automatic format optimization
- Lazy loading
- Responsive images

### 4. Database Optimization

- Indexed columns for fast queries
- Proper foreign key relationships
- Efficient query patterns

## Scalability Considerations

### Horizontal Scaling

Vercel provides automatic scaling:
- Edge network deployment
- Serverless functions
- Auto-scaling based on traffic

### Database Scaling

Supabase offers:
- Connection pooling
- Read replicas (higher tiers)
- Automatic backups
- Point-in-time recovery

### Storage Scaling

Supabase Storage:
- CDN distribution
- Automatic optimization
- Scalable blob storage

## Error Handling

### Client-Side

```typescript
try {
  await apiCall()
} catch (error) {
  setError(error.message)
  // Show user-friendly message
}
```

### Server-Side

```typescript
export async function POST(request: NextRequest) {
  try {
    // Process request
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'User-friendly message' },
      { status: 500 }
    )
  }
}
```

## Testing Strategy

### Recommended Approach

1. **Unit Tests**: Test utility functions
   ```typescript
   describe('validateEmail', () => {
     it('should validate correct email', () => {
       expect(validateEmail('test@example.com')).toBe(true)
     })
   })
   ```

2. **Integration Tests**: Test API routes
   ```typescript
   test('POST /api/ai/generate', async () => {
     const response = await fetch('/api/ai/generate', {
       method: 'POST',
       body: JSON.stringify({ prompt: 'test' })
     })
     expect(response.ok).toBe(true)
   })
   ```

3. **E2E Tests**: Test user flows
   - Signup flow
   - Quote creation flow
   - Invoice creation flow

## Deployment Architecture

### Vercel Deployment

```
Git Push
    ↓
Vercel Build
    ↓
Optimization
    ↓
Edge Network
    ↓
Production
```

### Environment Separation

- **Development**: Local machine
- **Preview**: Vercel preview deployments
- **Production**: Main branch deployment

## Monitoring & Observability

### Metrics to Monitor

1. **Application Metrics**
   - Page load times
   - API response times
   - Error rates

2. **Database Metrics**
   - Query performance
   - Connection pool usage
   - Storage usage

3. **Business Metrics**
   - User signups
   - Quotes created
   - AI generations

### Logging Strategy

```typescript
// Structured logging
console.log({
  timestamp: new Date(),
  level: 'info',
  action: 'quote_created',
  user_id: userId,
  quote_id: quoteId
})
```

## Future Enhancements

### Potential Improvements

1. **Real-time Collaboration**
   - Supabase real-time subscriptions
   - Live updates across devices

2. **Advanced Analytics**
   - Revenue tracking
   - Client lifetime value
   - Conversion rates

3. **Email Integration**
   - Send quotes via email
   - Email templates
   - Tracking opens

4. **PDF Generation**
   - Export quotes as PDF
   - Custom templates
   - Professional formatting

5. **Payment Integration**
   - Stripe/PayPal integration
   - Online payment acceptance
   - Payment tracking

6. **Mobile App**
   - React Native version
   - Native mobile experience
   - Offline capabilities

## Design Principles

### 1. Security First
- Always validate input
- Use RLS for data access
- Sanitize output
- Rate limit sensitive operations

### 2. User Experience
- Minimalistic design
- Fast page loads
- Clear error messages
- Intuitive navigation

### 3. Maintainability
- TypeScript for type safety
- Consistent code style
- Clear file organization
- Comprehensive documentation

### 4. Scalability
- Serverless architecture
- Efficient database queries
- CDN for static assets
- Caching where appropriate

## Conclusion

Quotla is built with modern web technologies and best practices to ensure security, performance, and maintainability. The architecture allows for easy scaling and future enhancements while maintaining code quality and user experience.
