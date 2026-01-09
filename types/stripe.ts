export interface StripeConnection {
  id: string;
  user_id: string;
  stripe_account_id: string;
  stripe_email: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  scope: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_synced_at?: string;
}

export interface StripePaymentIntent {
  id: string;
  user_id: string;
  invoice_id?: string;
  quote_id?: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  client_secret: string;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface StripeSubscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  stripe_price_id: string;
  status: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface StripeCustomer {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  email: string;
  name?: string;
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
  description?: string;
  receipt_email?: string;
}

export interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}
