# Stripe Integration

Complete Stripe payment processing and subscription management integration for Quotla.

## Features

✅ **Payment Processing**
- One-time payments via Payment Intents
- Checkout Sessions for hosted payment pages
- Support for multiple payment methods
- Automatic currency conversion

✅ **Subscription Management**
- Recurring billing support
- Subscription lifecycle management
- Automatic renewal and cancellation
- Proration handling

✅ **Stripe Connect**
- OAuth flow for account connection
- Secure token storage
- Account disconnection support

✅ **Webhook Integration**
- Real-time payment status updates
- Subscription event handling
- Secure webhook verification

✅ **Database Integration**
- Payment intent tracking
- Customer management
- Subscription storage
- OAuth state management

## Quick Start

### 1. Install Dependencies

Already installed:
- `stripe` - Stripe Node.js SDK
- `@stripe/stripe-js` - Stripe.js for client-side

### 2. Configure Environment

Add to `.env`:
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CLIENT_ID=ca_...  # Optional, for Connect
```

### 3. Set Up Database

Run the migration:
```sql
-- Execute: database/migrations/create_stripe_tables.sql
```

### 4. Configure Webhooks

**Development:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Production:**
- Add endpoint: `https://yourdomain.com/api/stripe/webhook`
- Copy webhook secret to `.env`

## Usage Examples

### Create Payment Intent

```typescript
const response = await fetch('/api/stripe/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 99.99,
    currency: 'usd',
    description: 'Invoice #1234',
    metadata: { invoice_id: 'inv_123' },
  }),
});

const { clientSecret } = await response.json();
```

### Create Checkout Session

```typescript
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: 'price_1234',
    successUrl: `${window.location.origin}/success`,
    cancelUrl: `${window.location.origin}/cancel`,
    mode: 'subscription',
  }),
});

const { url } = await response.json();
window.location.href = url;
```

### Connect Stripe Account

Navigate to `/settings/integrations` and click "Connect Stripe Account"

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stripe/create-payment-intent` | POST | Create payment intent |
| `/api/stripe/create-checkout-session` | POST | Create checkout session |
| `/api/stripe/webhook` | POST | Handle webhooks |
| `/api/stripe/auth/connect` | GET | Start OAuth flow |
| `/api/stripe/auth/callback` | GET | Handle OAuth callback |
| `/api/stripe/auth/disconnect` | POST | Disconnect account |

## Database Schema

### Tables

- **stripe_connections** - Stripe Connect account data
- **stripe_customers** - User to Stripe customer mapping
- **stripe_payment_intents** - Payment intent tracking
- **stripe_subscriptions** - Subscription management
- **oauth_states** - OAuth CSRF protection

All tables have RLS enabled for security.

## File Structure

```
lib/stripe/
  ├── config.ts           # Server-side Stripe config
  └── client.ts           # Client-side Stripe utilities

app/api/stripe/
  ├── create-payment-intent/route.ts
  ├── create-checkout-session/route.ts
  ├── webhook/route.ts
  └── auth/
      ├── connect/route.ts
      ├── callback/route.ts
      └── disconnect/route.ts

types/
  └── stripe.ts          # TypeScript interfaces

database/migrations/
  └── create_stripe_tables.sql
```

## Testing

### Test Cards

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 9995`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry, any CVC, and any ZIP.

### Trigger Webhooks

```bash
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

## Security

✅ Webhook signature verification
✅ Row Level Security (RLS) policies
✅ CSRF protection via OAuth state
✅ Environment variable validation
✅ Server-side secret key usage only

## Going Live

**Pre-launch Checklist:**
- [ ] Replace test keys with live keys
- [ ] Update webhook endpoint URL
- [ ] Test live payment flow
- [ ] Complete Stripe verification
- [ ] Enable email receipts
- [ ] Set up monitoring

## Documentation

- [Full Setup Guide](./STRIPE_SETUP_GUIDE.md)
- [Stripe Official Docs](https://stripe.com/docs)
- [API Reference](https://stripe.com/docs/api)

## Support

For issues or questions:
1. Check the [Setup Guide](./STRIPE_SETUP_GUIDE.md)
2. Review [Stripe Documentation](https://stripe.com/docs)
3. Contact Stripe Support

## Next Steps

1. Configure your Stripe dashboard
2. Create products and prices
3. Test payment flows
4. Add payment UI to invoices
5. Implement subscription management
6. Set up customer portal
