# Calendly Integration Plan for Quotla

**Document Version**: 1.0
**Created**: January 5, 2026
**Integration Type**: Optional (Non-Forced)
**API Version**: Calendly API v2 (Latest)
**Authentication**: OAuth 2.0

---

## Executive Summary

This document outlines the integration plan for Calendly scheduling capabilities within Quotla. The integration is designed to be **optional and non-intrusive**, enhancing the user experience without forcing adoption. It leverages Calendly's latest API (v2) with OAuth 2.0 for secure authentication.

---

## Integration Philosophy

**Key Principle**: Calendly integration should be **optional, not forced**.

- Users can choose to connect their Calendly account or skip entirely
- Core Quotla functionality remains independent
- Integration enhances collaboration but is not required
- Users maintain full control over scheduling preferences

---

## Optimal Integration Points (Based on PRD Analysis)

### 1. **Client Detail Pages** ✅ RECOMMENDED
**Location**: `/clients/[id]` - Individual client view page
**Use Case**: Schedule follow-up meetings, consultations, or project discussions with specific clients

**Why This Makes Sense**:
- Clients are at the center of business relationships (PRD Section 1.3: Client Management)
- Natural workflow: view client → schedule meeting → continue work
- Non-intrusive: appears as optional action alongside other client tools
- Supports both existing and prospective clients

**Implementation**:
- Add "Schedule Meeting" button in client action toolbar
- Display upcoming scheduled events with this client
- Option to embed inline scheduling widget or open pop-up
- Track scheduled meetings in client history

**User Flow**:
```
View Client Profile → Click "Schedule Meeting" (Optional) →
Choose Calendly Event Type → Client books time →
Webhook updates client activity log
```

---

### 2. **Quote & Invoice Detail Pages** ✅ RECOMMENDED
**Locations**:
- `/quotes/[id]` - Individual quote view
- `/invoices/[id]` - Individual invoice view

**Use Case**: Schedule follow-up calls after sending quotes, payment discussions, or project kickoff meetings

**Why This Makes Sense**:
- Natural follow-up after quote/invoice creation (PRD Sections 1.1 & 1.2)
- Supports sales workflow: send quote → schedule discussion → close deal
- Enables payment discussions for outstanding invoices
- Enhances the "Client Portal" future feature (PRD Section 3.2)

**Implementation**:
- "Schedule Follow-up" button on quote/invoice detail pages
- Pre-populate client email in Calendly widget
- Link scheduled event to quote/invoice in activity log
- Optional: Show "Meeting Scheduled" badge on document

**User Flow**:
```
Send Quote → Click "Schedule Follow-up" (Optional) →
Client receives scheduling link → Books meeting →
Quote status updates with scheduled meeting timestamp
```

---

### 3. **Dashboard Quick Actions** ✅ RECOMMENDED
**Location**: `/dashboard` - Main business dashboard
**Use Case**: Quick access to schedule meetings with any client or prospect

**Why This Makes Sense**:
- Dashboard is the central hub (PRD Section 3.2: Dashboard & Analytics)
- Supports "Quick action buttons" philosophy
- Users who adopt Calendly benefit from fast access
- Optional widget that can be enabled/disabled in settings

**Implementation**:
- Optional dashboard card: "Schedule Meeting" (can be hidden)
- Quick dropdown: select client → choose event type → send link
- Display upcoming meetings calendar widget (if connected)
- Integration with existing "Recent quotes and invoices overview"

**User Flow**:
```
Open Dashboard → (Optional) View "Upcoming Meetings" widget →
Click "Schedule New" → Select client → Send Calendly link
```

---

### 4. **Settings/Integrations Page** ✅ REQUIRED
**Location**: `/settings/integrations` (new sub-page under Settings)
**Use Case**: Connect/disconnect Calendly account, configure integration preferences

**Why This Makes Sense**:
- Central location for all third-party integrations
- Aligns with PRD Phase 5: Third-Party Integrations (2027 roadmap)
- Gives users control over integration settings
- Supports OAuth 2.0 connection flow

**Implementation**:
- OAuth 2.0 connection button
- Display connected account info (email, organization)
- Choose default event types for quick scheduling
- Webhook configuration status
- Disconnect option

**User Flow**:
```
Settings → Integrations → Connect Calendly →
OAuth Authorization → Select Event Types →
Configure Preferences → Save
```

---

### 5. **Client Portal (Future Enhancement)** 🔮 FUTURE
**Location**: Client-facing portal (PRD Section 3.2: Phase 3)
**Use Case**: Allow clients to self-schedule meetings when viewing quotes/invoices

**Why This Makes Sense**:
- Supports PRD Phase 3 Q3 2026: Client Portal
- Enables self-service scheduling for clients
- Reduces back-and-forth email scheduling
- Enhances client experience

**Implementation** (Future):
- Embed Calendly widget in client portal
- Clients can schedule without creating Quotla account
- Automatic notification to business owner
- Meeting appears in client history

---

## Where NOT to Integrate (Intentionally Avoided)

### ❌ Login/Signup Flow
**Reason**: Would force users to connect Calendly before using core features. Violates "optional integration" principle.

### ❌ Quote/Invoice Creation Flow
**Reason**: Would interrupt document creation workflow. Scheduling should come after creation, not during.

### ❌ Mandatory Onboarding Steps
**Reason**: Not all users need scheduling features. Forcing connection would create friction.

### ❌ Homepage/Landing Pages
**Reason**: Marketing pages should focus on Quotla's core value proposition. Calendly is an enhancement, not a selling point for guest users.

---

## Technical Architecture

### API Integration Strategy

**Base URL**: `https://api.calendly.com`
**API Version**: v2 (Latest)
**Authentication**: OAuth 2.0
**Webhook Version**: v1

### Core Components

```
/lib/calendly/
├── oauth.ts           # OAuth 2.0 flow handlers
├── api.ts             # Calendly API client wrapper
├── webhooks.ts        # Webhook signature verification
├── types.ts           # TypeScript types for Calendly data
└── embed.ts           # Calendly embed helpers

/app/api/calendly/
├── auth/
│   ├── callback/
│   │   └── route.ts   # OAuth callback handler
│   └── connect/
│       └── route.ts   # Initiate OAuth flow
├── webhooks/
│   └── route.ts       # Webhook endpoint
└── events/
    └── route.ts       # Fetch user's event types

/app/settings/integrations/
└── page.tsx           # Integration management UI

/types/calendly.ts     # Calendly type definitions
```

### Database Schema Addition

**New Table**: `calendly_connections`

```sql
CREATE TABLE calendly_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- OAuth tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Calendly user info
  calendly_user_uri TEXT NOT NULL,
  calendly_email TEXT NOT NULL,
  calendly_organization_uri TEXT,

  -- Settings
  default_event_type_uri TEXT, -- User's preferred event type for quick scheduling
  webhook_subscription_uri TEXT, -- Active webhook subscription

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id) -- One Calendly connection per user
);

-- Enable Row Level Security
ALTER TABLE calendly_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own connections
CREATE POLICY "Users can manage their own Calendly connections"
  ON calendly_connections
  FOR ALL
  USING (auth.uid() = user_id);
```

**New Table**: `scheduled_meetings` (Optional - for tracking)

```sql
CREATE TABLE scheduled_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,

  -- Calendly event data
  calendly_event_uri TEXT NOT NULL UNIQUE,
  calendly_invitee_uri TEXT NOT NULL,
  event_type_name TEXT NOT NULL,

  -- Meeting details
  invitee_email TEXT NOT NULL,
  invitee_name TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT, -- Video link, phone, etc.

  -- Status
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'canceled', 'completed')),
  canceled_at TIMESTAMP WITH TIME ZONE,
  canceled_by TEXT, -- 'host' or 'invitee'
  cancellation_reason TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(calendly_event_uri)
);

-- Enable Row Level Security
ALTER TABLE scheduled_meetings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own meetings
CREATE POLICY "Users can manage their own scheduled meetings"
  ON scheduled_meetings
  FOR ALL
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_scheduled_meetings_user_id ON scheduled_meetings(user_id);
CREATE INDEX idx_scheduled_meetings_client_id ON scheduled_meetings(client_id);
CREATE INDEX idx_scheduled_meetings_start_time ON scheduled_meetings(start_time);
```

---

## OAuth 2.0 Flow

### Authorization Flow

```
1. User clicks "Connect Calendly" in Settings → Integrations
   ↓
2. Frontend calls /api/calendly/auth/connect
   ↓
3. Backend redirects to Calendly OAuth authorization URL:
   https://calendly.com/oauth/authorize?
     client_id={CLIENT_ID}&
     response_type=code&
     redirect_uri={REDIRECT_URI}&
     state={CSRF_TOKEN}
   ↓
4. User authorizes on Calendly
   ↓
5. Calendly redirects to /api/auth/calendly/callback?code={AUTH_CODE}
   ↓
6. Backend exchanges code for access token:
   POST https://calendly.com/oauth/token
   ↓
7. Store tokens in calendly_connections table
   ↓
8. Fetch user's Calendly profile (/users/me)
   ↓
9. Create webhook subscription for invitee events
   ↓
10. Redirect user back to Settings with success message
```

### Token Refresh Strategy

```typescript
// Automatic token refresh before expiry
async function getValidAccessToken(userId: string): Promise<string> {
  const connection = await getCalendlyConnection(userId)

  // Refresh if token expires within 5 minutes
  if (connection.token_expires_at < new Date(Date.now() + 5 * 60 * 1000)) {
    const newTokens = await refreshAccessToken(connection.refresh_token)
    await updateTokens(userId, newTokens)
    return newTokens.access_token
  }

  return connection.access_token
}
```

---

## Webhook Integration

### Webhook Events to Subscribe

1. **`invitee.created`** - New meeting scheduled
2. **`invitee.canceled`** - Meeting canceled

### Webhook Endpoint

**URL**: `https://yourdomain.com/api/calendly/webhooks`
**Method**: POST
**Authentication**: Signature verification using `CALENDLY_WEBHOOK_SIGNING_KEY`

### Signature Verification

```typescript
import crypto from 'crypto'

function verifyWebhookSignature(
  payload: string,
  signature: string,
  signingKey: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', signingKey)
    .update(payload)
    .digest('base64')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
```

### Webhook Handler Logic

```typescript
// When invitee.created webhook received:
1. Verify signature
2. Extract invitee and event data
3. Match invitee email to client (if exists)
4. Create record in scheduled_meetings table
5. Link to quote/invoice if context available
6. Send notification to user
7. Update client activity log

// When invitee.canceled webhook received:
1. Verify signature
2. Find scheduled_meeting by calendly_event_uri
3. Update status to 'canceled'
4. Record canceled_by and reason
5. Send notification to user
```

---

## User Interface Components

### 1. Settings → Integrations Page

```
┌─────────────────────────────────────────────┐
│ Integrations                                │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🗓️  Calendly                            │ │
│ │                                         │ │
│ │ Status: Not Connected                   │ │
│ │                                         │ │
│ │ Schedule meetings with clients directly │ │
│ │ from Quotla. Sync your availability and │ │
│ │ automate meeting scheduling.            │ │
│ │                                         │ │
│ │ [Connect Calendly Account]              │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 💳  Stripe (Coming Soon)                │ │
│ │ Accept payments on invoices             │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**After Connection**:

```
┌─────────────────────────────────────────────┐
│ 🗓️  Calendly                                │
│                                             │
│ Status: ✅ Connected                        │
│ Account: john@example.com                   │
│ Organization: Acme Inc.                     │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Default Event Type                      │ │
│ │ [30 Minute Meeting ▼]                   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [View Scheduled Meetings]  [Disconnect]     │
└─────────────────────────────────────────────┘
```

### 2. Client Detail Page Integration

```
┌─────────────────────────────────────────────┐
│ Client: Acme Corporation                    │
│ john@acme.com • +1 555 0123                 │
│                                             │
│ [✏️ Edit] [📄 New Quote] [🗓️ Schedule Meeting] │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│ Recent Activity                             │
│ • Quote #1234 sent - Dec 15                 │
│ • 🗓️ Meeting scheduled - Dec 20, 2pm        │
│ • Invoice #5678 paid - Dec 22               │
│                                             │
│ Upcoming Meetings                           │
│ • 30 Min Meeting - Jan 8, 10:00 AM          │
│   Video Call: [Join Link]                   │
└─────────────────────────────────────────────┘
```

**Schedule Meeting Modal**:

```
┌─────────────────────────────────────────────┐
│ Schedule Meeting with Acme Corporation      │
│                                             │
│ Event Type:                                 │
│ [30 Minute Meeting           ▼]             │
│                                             │
│ Client Email:                               │
│ [john@acme.com                ]             │
│                                             │
│ Link to Quote/Invoice (Optional):           │
│ [Select quote or invoice     ▼]             │
│                                             │
│ [ ] Send scheduling link via email          │
│ [ ] Copy scheduling link to clipboard       │
│                                             │
│ [Cancel]              [Generate Link]       │
└─────────────────────────────────────────────┘
```

### 3. Quote/Invoice Detail Page Integration

```
┌─────────────────────────────────────────────┐
│ Quote #QUO-1234                             │
│ Status: Sent                                │
│                                             │
│ [✏️ Edit] [📧 Resend] [🗓️ Schedule Follow-up] │
│                                             │
│ 💡 Tip: Schedule a follow-up meeting to     │
│    discuss this quote with your client      │
└─────────────────────────────────────────────┘
```

### 4. Dashboard Widget (Optional)

```
┌─────────────────────────────────────────────┐
│ Upcoming Meetings                    🗓️     │
│                                             │
│ Today                                       │
│ • 10:00 AM - Acme Corp (30 min)             │
│   Quote #1234 Follow-up                     │
│                                             │
│ Tomorrow                                    │
│ • 2:00 PM - Beta LLC (1 hour)               │
│   Project Kickoff                           │
│                                             │
│ [Schedule New Meeting]                      │
└─────────────────────────────────────────────┘
```

---

## API Endpoints to Implement

### 1. OAuth Endpoints

**`GET /api/calendly/auth/connect`**
- Initiates OAuth flow
- Generates state token for CSRF protection
- Redirects to Calendly authorization URL

**`GET /api/calendly/auth/callback`**
- Handles OAuth callback from Calendly
- Exchanges authorization code for access token
- Stores tokens and user info in database
- Creates webhook subscription
- Redirects to settings page

**`POST /api/calendly/auth/disconnect`**
- Revokes access token
- Deletes webhook subscription
- Removes connection from database

### 2. Calendly API Proxy Endpoints

**`GET /api/calendly/me`**
- Fetches current user's Calendly profile
- Returns user info and organization details

**`GET /api/calendly/event-types`**
- Lists user's available event types
- Used for default event type selection

**`GET /api/calendly/scheduled-events`**
- Lists upcoming scheduled events
- Supports filtering by date range

**`POST /api/calendly/scheduling-links`**
- Generates scheduling link for specific event type
- Pre-fills invitee information
- Returns shareable link

### 3. Webhook Endpoint

**`POST /api/calendly/webhooks`**
- Receives webhook events from Calendly
- Verifies signature
- Processes invitee.created and invitee.canceled events
- Updates database and triggers notifications

### 4. Internal Endpoints

**`GET /api/meetings`**
- Lists scheduled meetings for authenticated user
- Supports filtering by client, quote, invoice

**`GET /api/clients/[id]/meetings`**
- Lists meetings for specific client

**`GET /api/quotes/[id]/meetings`**
- Lists meetings linked to specific quote

---

## Environment Variables

See [`.env.example`](../.env.example) for complete configuration template.

**Required for OAuth 2.0**:
- `CALENDLY_CLIENT_ID`
- `CALENDLY_CLIENT_SECRET`
- `CALENDLY_REDIRECT_URI`
- `CALENDLY_WEBHOOK_SIGNING_KEY`

**Optional**:
- `CALENDLY_PERSONAL_ACCESS_TOKEN` (dev/testing only)
- `CALENDLY_ORGANIZATION_URI` (for org-level operations)

---

## Implementation Phases

### Phase 1: Foundation (Week 1) ✅
- [x] Create .env.example with Calendly credentials
- [ ] Set up database schema (calendly_connections, scheduled_meetings)
- [ ] Implement OAuth 2.0 flow
- [ ] Create Settings → Integrations page
- [ ] Test OAuth connection and token refresh

### Phase 2: Core Features (Week 2)
- [ ] Implement webhook endpoint with signature verification
- [ ] Build API client wrapper for Calendly API
- [ ] Create scheduling link generation endpoint
- [ ] Implement event type fetching
- [ ] Test webhook event handling

### Phase 3: UI Integration (Week 3)
- [ ] Add "Schedule Meeting" to client detail pages
- [ ] Add "Schedule Follow-up" to quote/invoice pages
- [ ] Create scheduling modal component
- [ ] Display upcoming meetings on client pages
- [ ] Test end-to-end user flow

### Phase 4: Polish & Optional Features (Week 4)
- [ ] Add dashboard widget for upcoming meetings
- [ ] Implement meeting history view
- [ ] Add email notifications for scheduled meetings
- [ ] Create meeting analytics
- [ ] User acceptance testing

---

## Security Considerations

### 1. OAuth 2.0 Best Practices
- ✅ Use state parameter for CSRF protection
- ✅ Store tokens encrypted at rest
- ✅ Implement automatic token refresh
- ✅ Use HTTPS for all OAuth redirects
- ✅ Validate redirect_uri matches configured value

### 2. Webhook Security
- ✅ Verify webhook signatures using HMAC SHA-256
- ✅ Use timing-safe comparison for signatures
- ✅ Validate webhook payload structure
- ✅ Rate limit webhook endpoint
- ✅ Log all webhook events for audit

### 3. Data Privacy
- ✅ Store only necessary Calendly data
- ✅ Implement RLS policies on new tables
- ✅ Allow users to disconnect and delete data
- ✅ Don't expose access tokens to frontend
- ✅ Use service role key only on backend

### 4. API Rate Limits
- Calendly API: 10,000 requests per user per day
- Implement caching for event types
- Use webhook events instead of polling
- Implement exponential backoff for retries

---

## Error Handling

### OAuth Errors
```typescript
// User denies authorization
if (error === 'access_denied') {
  redirect('/settings/integrations?error=calendly_denied')
}

// Invalid state token (CSRF attempt)
if (state !== storedState) {
  throw new Error('Invalid OAuth state')
}

// Token exchange failure
if (tokenResponse.error) {
  log error and notify user
}
```

### Webhook Errors
```typescript
// Invalid signature
if (!verifySignature(payload, signature)) {
  return 401 Unauthorized
}

// Duplicate event (idempotency)
if (eventAlreadyProcessed(event.uri)) {
  return 200 OK (acknowledge)
}

// Database error
try {
  await saveScheduledMeeting(event)
} catch (error) {
  log error, return 500 (Calendly will retry)
}
```

### API Errors
```typescript
// Token expired (should be auto-refreshed)
if (response.status === 401) {
  await refreshTokenAndRetry()
}

// Rate limit exceeded
if (response.status === 429) {
  await exponentialBackoff()
}

// Calendly service down
if (response.status === 503) {
  show user-friendly error message
}
```

---

## Testing Strategy

### 1. OAuth Flow Testing
- Test successful connection
- Test user denies authorization
- Test invalid state parameter (security)
- Test token refresh before expiry
- Test disconnection and data cleanup

### 2. Webhook Testing
- Use Calendly webhook test tool
- Verify signature validation (valid & invalid)
- Test invitee.created event handling
- Test invitee.canceled event handling
- Test duplicate event handling (idempotency)

### 3. Integration Testing
- End-to-end: Connect → Schedule → Webhook → Display
- Test scheduling from client page
- Test scheduling from quote page
- Test scheduling from invoice page
- Test meeting display on dashboard

### 4. Edge Cases
- User disconnects Calendly mid-session
- Webhook arrives before user refreshes page
- Client email doesn't match Calendly invitee
- Event type deleted on Calendly
- Organization changes on Calendly

---

## User Documentation

### Help Center Articles to Create

1. **"How to Connect Your Calendly Account"**
   - Step-by-step OAuth flow
   - Permissions required
   - Troubleshooting connection issues

2. **"Scheduling Meetings with Clients"**
   - Using Schedule Meeting button
   - Choosing event types
   - Sending scheduling links

3. **"Managing Your Calendly Integration"**
   - Viewing scheduled meetings
   - Changing default event type
   - Disconnecting Calendly

4. **"Calendly Integration FAQs"**
   - Is Calendly required? (No)
   - What data is synced?
   - How to cancel integration

---

## Success Metrics

### Adoption Metrics
- % of users who connect Calendly
- Average meetings scheduled per connected user
- % of clients with scheduled meetings
- % of quotes/invoices with follow-up meetings

### Engagement Metrics
- Time from quote sent to meeting scheduled
- Meeting completion rate
- Meeting-to-deal conversion rate
- Feature usage by integration point (client page vs quote page)

### Technical Metrics
- OAuth connection success rate
- Webhook delivery success rate
- Token refresh failure rate
- API error rate

---

## Future Enhancements (Post-MVP)

1. **Meeting Templates**
   - Pre-configured meeting types for specific workflows
   - "Post-Quote Discussion" template
   - "Payment Terms Negotiation" template

2. **Automated Meeting Scheduling**
   - Auto-schedule follow-up when quote sent
   - Configurable rules: "Schedule 2 days after quote sent"

3. **Calendar Sync**
   - Display all Calendly meetings in Quotla calendar view
   - Integrate with Google Calendar / Outlook

4. **Meeting Notes Integration**
   - Add meeting notes after completion
   - Link notes to client, quote, or invoice
   - AI-powered meeting summary

5. **Team Scheduling**
   - Round-robin scheduling for sales teams
   - Collective meetings with multiple team members
   - Organization-level event type management

6. **Advanced Analytics**
   - Meeting performance dashboard
   - Conversion tracking: meetings → quotes → deals
   - Calendar heatmap of busy times

---

## Alternatives Considered

### Why Calendly vs. Other Scheduling Tools?

**Calendly** ✅
- Pros: Industry leader, robust API, OAuth 2.0, webhooks
- Cons: External dependency

**Cal.com** (Open Source)
- Pros: Self-hostable, open source
- Cons: Less mature API, smaller user base

**Google Calendar API**
- Pros: No external service needed
- Cons: Complex API, requires Google account, no scheduling pages

**Custom Scheduling Solution**
- Pros: Full control, no dependencies
- Cons: Significant development time, reinventing wheel

**Decision**: Calendly provides best balance of features, reliability, and user adoption.

---

## Critical Reasoning & Error-Free Action Plan

### Reasoning Summary

**1. Why These Integration Points?**
- **Client Pages**: Clients are central to business (PRD emphasizes client management). Natural place for relationship-building activities like scheduling.
- **Quote/Invoice Pages**: Follow-up is critical for sales conversion. Optional scheduling after document creation supports natural workflow.
- **Dashboard**: Quick access for power users without forcing casual users.
- **Settings**: Required for OAuth connection, gives users full control.

**2. Why NOT Forced Integration?**
- Not all businesses need scheduling (e.g., e-commerce, automated services)
- Forcing integration creates friction in onboarding
- Quotla's core value is AI document generation, not scheduling
- Optional integration respects user autonomy

**3. Why OAuth 2.0 vs. Personal Access Tokens?**
- OAuth 2.0 is more secure (scoped permissions, automatic expiry)
- Supports org-level access for team features (future)
- Industry standard, better for production apps
- Personal tokens are user-specific and require manual rotation

**4. Why Webhooks vs. Polling?**
- Real-time updates without constant API calls
- Respects Calendly's rate limits (10k requests/day)
- More efficient and scalable
- Better user experience (instant updates)

**5. Why New Database Tables?**
- Separates Calendly data from core Quotla data (modularity)
- Easy to remove if integration discontinued
- Supports future features (meeting analytics, history)
- RLS policies ensure data security

### Error-Free Action Plan

**Phase 1: Foundation** (No code until environment is ready)
1. ✅ Create .env.example with OAuth credentials
2. Get Calendly Developer Account (create app in Calendly dashboard)
3. Add secrets to actual .env (NOT committed to git)
4. Run database migrations for new tables
5. Verify Supabase RLS policies are active
6. Test OAuth redirect URI is correct

**Phase 2: Backend First** (API before UI)
1. Build OAuth flow (/api/calendly/auth/*)
2. Test OAuth connection in isolation (Postman/Bruno)
3. Implement token refresh logic
4. Build webhook endpoint with signature verification
5. Test webhook with Calendly's webhook test tool
6. Build API proxy endpoints (/api/calendly/*)
7. Test each endpoint with unit tests

**Phase 3: UI Last** (After backend is stable)
1. Create Settings → Integrations page
2. Test OAuth connection end-to-end
3. Build scheduling modal component (reusable)
4. Add to client detail page
5. Test scheduling from client page
6. Add to quote/invoice pages
7. Add optional dashboard widget
8. User acceptance testing

**Phase 4: Polish & Documentation**
1. Add loading states and error messages
2. Create help center articles
3. Add tooltips and onboarding hints
4. Performance testing (API response times)
5. Security audit (OAuth, webhooks, RLS)
6. Analytics tracking setup
7. Deploy to production with feature flag

### Error Prevention Checklist

- [ ] Never commit .env with real credentials
- [ ] Always verify webhook signatures (prevent spoofing)
- [ ] Use timing-safe comparison for signatures (prevent timing attacks)
- [ ] Validate all OAuth state parameters (prevent CSRF)
- [ ] Refresh tokens before expiry (prevent auth failures)
- [ ] Implement rate limiting on webhook endpoint (prevent abuse)
- [ ] Test RLS policies (prevent data leaks)
- [ ] Handle API errors gracefully (user-friendly messages)
- [ ] Log all OAuth and webhook events (debugging & audit)
- [ ] Make integration optional in code (feature flag)
- [ ] Test disconnection flow (data cleanup)
- [ ] Implement idempotency for webhooks (prevent duplicate records)

---

## Conclusion

This integration plan provides a **comprehensive, secure, and user-friendly** approach to integrating Calendly into Quotla. The design philosophy prioritizes:

1. **Optional adoption** - Users choose if and when to connect
2. **Natural workflows** - Integration points align with existing user behavior
3. **Security first** - OAuth 2.0, webhook verification, RLS policies
4. **Future-proof** - Scalable architecture supports future enhancements
5. **Error-free execution** - Phased approach with testing at each stage

The integration enhances Quotla's value proposition without forcing users to adopt yet another tool. It supports the PRD's vision of becoming an "all-in-one platform" while respecting the "customer-centric design" principle.

---

**Next Steps**:
1. Review and approve this integration plan
2. Obtain Calendly Developer credentials
3. Begin Phase 1: Foundation implementation
4. Schedule team review after each phase

**Questions? Reach out to the Product Team.**
