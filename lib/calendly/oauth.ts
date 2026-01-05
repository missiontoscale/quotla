// Calendly OAuth 2.0 Flow Handler
// Manages OAuth authorization, token exchange, and token refresh

import type {
  CalendlyOAuthTokenResponse,
  CalendlyConnection,
  CalendlyWebhookSubscription,
  CreateWebhookSubscriptionRequest,
  CalendlyResourceResponse,
} from '@/types/calendly';
import { createClient } from '@/lib/supabase/server';

const CALENDLY_OAUTH_BASE_URL = 'https://calendly.com/oauth';
const CALENDLY_API_BASE_URL = 'https://api.calendly.com';

/**
 * Get OAuth authorization URL
 * Redirects user to Calendly to authorize the app
 */
export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.CALENDLY_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.CALENDLY_REDIRECT_URI!,
    state,
  });

  return `${CALENDLY_OAUTH_BASE_URL}/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string
): Promise<CalendlyOAuthTokenResponse> {
  const response = await fetch(`${CALENDLY_OAUTH_BASE_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.CALENDLY_CLIENT_ID!,
      client_secret: process.env.CALENDLY_CLIENT_SECRET!,
      redirect_uri: process.env.CALENDLY_REDIRECT_URI!,
      code,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error_description || errorData.error || 'Failed to exchange code for token'
    );
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<CalendlyOAuthTokenResponse> {
  const response = await fetch(`${CALENDLY_OAUTH_BASE_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.CALENDLY_CLIENT_ID!,
      client_secret: process.env.CALENDLY_CLIENT_SECRET!,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error_description || errorData.error || 'Failed to refresh token'
    );
  }

  return response.json();
}

/**
 * Revoke access token (disconnect)
 */
export async function revokeAccessToken(token: string): Promise<void> {
  const response = await fetch(`${CALENDLY_OAUTH_BASE_URL}/revoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.CALENDLY_CLIENT_ID!,
      client_secret: process.env.CALENDLY_CLIENT_SECRET!,
      token,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error_description || errorData.error || 'Failed to revoke token'
    );
  }
}

/**
 * Get Calendly connection for user
 */
export async function getCalendlyConnection(
  userId: string
): Promise<CalendlyConnection | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('calendly_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Get valid access token (auto-refresh if needed)
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const connection = await getCalendlyConnection(userId);

  if (!connection) {
    throw new Error('No Calendly connection found for user');
  }

  // Check if token expires within 5 minutes
  const expiresAt = new Date(connection.token_expires_at);
  const refreshThreshold = new Date(Date.now() + 5 * 60 * 1000);

  if (expiresAt <= refreshThreshold) {
    // Token is expired or about to expire, refresh it
    const newTokens = await refreshAccessToken(connection.refresh_token);
    await updateConnectionTokens(userId, newTokens);
    return newTokens.access_token;
  }

  return connection.access_token;
}

/**
 * Save new Calendly connection
 */
export async function saveCalendlyConnection(
  userId: string,
  tokens: CalendlyOAuthTokenResponse,
  userUri: string,
  userEmail: string,
  organizationUri: string | null
): Promise<CalendlyConnection> {
  const supabase = await createClient();

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  const { data, error } = await supabase
    .from('calendly_connections')
    .upsert(
      {
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt.toISOString(),
        calendly_user_uri: userUri,
        calendly_email: userEmail,
        calendly_organization_uri: organizationUri,
        is_active: true,
        last_synced_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Update connection tokens after refresh
 */
export async function updateConnectionTokens(
  userId: string,
  tokens: CalendlyOAuthTokenResponse
): Promise<void> {
  const supabase = await createClient();

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  const { error } = await supabase
    .from('calendly_connections')
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: expiresAt.toISOString(),
      last_synced_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

/**
 * Update default event type
 */
export async function updateDefaultEventType(
  userId: string,
  eventTypeUri: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('calendly_connections')
    .update({
      default_event_type_uri: eventTypeUri,
    })
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

/**
 * Create webhook subscription
 */
export async function createWebhookSubscription(
  accessToken: string,
  data: CreateWebhookSubscriptionRequest
): Promise<CalendlyWebhookSubscription> {
  const response = await fetch(`${CALENDLY_API_BASE_URL}/webhook_subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || errorData.title || 'Failed to create webhook subscription'
    );
  }

  const result = await response.json() as CalendlyResourceResponse<CalendlyWebhookSubscription>;
  return result.resource;
}

/**
 * Delete webhook subscription
 */
export async function deleteWebhookSubscription(
  accessToken: string,
  webhookUri: string
): Promise<void> {
  const response = await fetch(webhookUri, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || errorData.title || 'Failed to delete webhook subscription'
    );
  }
}

/**
 * Update webhook subscription URI in database
 */
export async function updateWebhookSubscriptionUri(
  userId: string,
  webhookUri: string | null
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('calendly_connections')
    .update({
      webhook_subscription_uri: webhookUri,
    })
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

/**
 * Disconnect Calendly (revoke tokens and clean up)
 */
export async function disconnectCalendly(userId: string): Promise<void> {
  const connection = await getCalendlyConnection(userId);

  if (!connection) {
    return; // Already disconnected
  }

  try {
    // Revoke access token
    await revokeAccessToken(connection.access_token);

    // Delete webhook subscription if exists
    if (connection.webhook_subscription_uri) {
      await deleteWebhookSubscription(
        connection.access_token,
        connection.webhook_subscription_uri
      );
    }
  } catch (error) {
    console.error('Error during disconnect cleanup:', error);
    // Continue with database cleanup even if API calls fail
  }

  // Mark connection as inactive
  const supabase = await createClient();
  await supabase
    .from('calendly_connections')
    .update({ is_active: false })
    .eq('user_id', userId);
}

/**
 * Generate random state for OAuth CSRF protection
 */
export function generateOAuthState(): string {
  return crypto.randomUUID();
}

/**
 * Verify OAuth state (CSRF protection)
 */
export function verifyOAuthState(receivedState: string, storedState: string): boolean {
  return receivedState === storedState;
}
