# Stripe Integration Setup Guide

This guide will help you set up Stripe integration for Quotla, enabling payment processing and subscription management.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Stripe Account Setup](#stripe-account-setup)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Testing the Integration](#testing-the-integration)
6. [Webhook Configuration](#webhook-configuration)
7. [Going Live](#going-live)

## Prerequisites

- A Stripe account (https://dashboard.stripe.com/register)
- Access to Supabase database
- Node.js environment with the project running

## Stripe Account Setup

### 1. Create a Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Sign up for a new account or log in to your existing account
3. Complete the business verification process (required for live payments)

### 2. Get API Keys

1. Navigate to **Developers** → **API keys** in the Stripe dashboard
2. You'll see two sets of keys:
   - **Test mode keys** (for development)
   - **Live mode keys** (for production)

3. Copy the following keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 3. Set Up Stripe Connect (Optional)

If you want to allow users to connect their own Stripe accounts:

1. Go to **Settings** → **Connect**
2. Click **Get Started**
3. Fill in your platform information
4. Under **Integration**, note down:
   - **Client ID** (starts with `ca_`)
5. Set the OAuth redirect URI to: `https://yourdomain.com/api/stripe/auth/callback`

## Environment Variables

Add the following variables to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Optional: For Stripe Connect
STRIPE_CLIENT_ID=ca_your_client_id_here
```

### For Production

When deploying to production:

1. Replace test keys with live keys
2. Update webhook secret with production webhook secret
3. Ensure `NEXT_PUBLIC_APP_URL` is set to your production domain

## Database Setup

### 1. Run the Migration Script

Execute the SQL migration file to create necessary tables:

```bash
# Using Supabase CLI
supabase db push

# Or run manually in Supabase SQL Editor
```

Copy and execute the contents of:
`database/migrations/create_stripe_tables.sql`

This creates the following tables:
- `stripe_connections` - Stores Stripe Connect account information
- `stripe_customers` - Maps users to Stripe customer IDs
- `stripe_payment_intents` - Tracks payment intents
- `stripe_subscriptions` - Manages subscription data
- `oauth_states` - CSRF protection for OAuth flows

### 2. Verify Tables

In Supabase dashboard:
1. Go to **Table Editor**
2. Verify all tables are created
3. Check that RLS (Row Level Security) policies are enabled

## Webhook Configuration

Webhooks allow Stripe to notify your application about events (payments, subscriptions, etc.)

### 1. Set Up Webhook Endpoint

#### For Development (using Stripe CLI)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_`) and add to `.env`

#### For Production

1. Go to **Developers** → **Webhooks** in Stripe dashboard
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
5. Copy the **Signing secret** and update `.env`

### 2. Test Webhooks

```bash
# Using Stripe CLI
stripe trigger payment_intent.succeeded
```

Check your application logs to verify webhook processing.

## Testing the Integration

### 1. Test Payment Intent Creation

```bash
curl -X POST http://localhost:3000/api/stripe/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "currency": "usd",
    "description": "Test payment"
  }'
```

### 2. Test Checkout Session

```bash
curl -X POST http://localhost:3000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_test_id",
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'
```

### 3. Test Stripe Connect

1. Navigate to `/settings/integrations`
2. Click **Connect Stripe Account**
3. Complete the OAuth flow
4. Verify connection appears in the UI

### 4. Use Test Cards

Stripe provides test cards for development:

- **Success**: `4242 4242 4242 4242`
- **Requires authentication**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 9995`

Use any future date for expiry, any 3 digits for CVC, and any ZIP code.

## Integration Points

### 1. Payment on Invoices

To add a payment button to invoices:

```typescript
import { getStripe } from '@/lib/stripe/client';

async function handlePayment(invoiceId: string, amount: number) {
  // Create payment intent
  const response = await fetch('/api/stripe/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      currency: 'usd',
      metadata: { invoice_id: invoiceId },
    }),
  });

  const { clientSecret } = await response.json();

  // Redirect to Stripe Checkout or use Elements
  const stripe = await getStripe();
  // ... implement payment UI
}
```

### 2. Subscription Plans

Create products and prices in Stripe:

1. Go to **Products** → **Add product**
2. Create a product (e.g., "Pro Plan")
3. Add a recurring price (e.g., $29/month)
4. Note the price ID (starts with `price_`)

Use this price ID in your checkout sessions.

## Going Live

### Checklist

- [ ] Replace all test API keys with live keys
- [ ] Update webhook endpoint to production URL
- [ ] Update webhook secret with production secret
- [ ] Test all payment flows in live mode
- [ ] Complete Stripe account verification
- [ ] Review and accept Stripe's terms of service
- [ ] Set up proper error monitoring
- [ ] Configure email receipts in Stripe settings
- [ ] Test refund and dispute handling
- [ ] Document customer support procedures

### Security Considerations

1. **Never expose secret keys** - Only use them server-side
2. **Validate webhook signatures** - Always verify `stripe-signature` header
3. **Use HTTPS** - Required for production webhooks
4. **Implement rate limiting** - Protect API endpoints
5. **Log sensitive operations** - Audit payment activities
6. **Handle PCI compliance** - Use Stripe.js for card data

## Troubleshooting

### Common Issues

**Issue**: Webhook signature verification fails
- **Solution**: Ensure `STRIPE_WEBHOOK_SECRET` matches the endpoint secret

**Issue**: Payment intent creation fails
- **Solution**: Check API key is correct and has proper permissions

**Issue**: OAuth redirect fails
- **Solution**: Verify redirect URI matches Stripe Connect settings

**Issue**: Database errors
- **Solution**: Ensure all tables are created and RLS policies are set

### Support Resources

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Stripe Community: https://stripe.com/community

## Next Steps

1. Customize payment UI using Stripe Elements
2. Implement subscription management dashboard
3. Add invoice payment tracking
4. Set up automated email receipts
5. Implement refund functionality
6. Add payment analytics

## API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stripe/create-payment-intent` | POST | Create a payment intent |
| `/api/stripe/create-checkout-session` | POST | Create a checkout session |
| `/api/stripe/webhook` | POST | Handle Stripe webhooks |
| `/api/stripe/auth/connect` | GET | Initiate Stripe Connect OAuth |
| `/api/stripe/auth/callback` | GET | Handle OAuth callback |
| `/api/stripe/auth/disconnect` | POST | Disconnect Stripe account |

## Files Created

```
lib/
  stripe/
    config.ts          # Stripe configuration
    client.ts          # Client-side Stripe utilities

app/api/stripe/
  create-payment-intent/route.ts
  create-checkout-session/route.ts
  webhook/route.ts
  auth/
    connect/route.ts
    callback/route.ts
    disconnect/route.ts

types/
  stripe.ts           # TypeScript types

database/migrations/
  create_stripe_tables.sql
```
