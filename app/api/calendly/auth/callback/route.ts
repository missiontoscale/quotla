// OAuth 2.0 Callback Route
// Handles OAuth callback from Calendly after user authorization

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  exchangeCodeForToken,
  saveCalendlyConnection,
  verifyOAuthState,
  createWebhookSubscription,
  updateWebhookSubscriptionUri,
} from '@/lib/calendly/oauth';
import { CalendlyAPIClient } from '@/lib/calendly/api';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check if user denied authorization
    if (error === 'access_denied') {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=calendly_denied', request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=invalid_callback', request.url)
      );
    }

    // Verify state (CSRF protection)
    const cookieStore = await cookies();
    const storedState = cookieStore.get('calendly_oauth_state')?.value;

    if (!storedState || !verifyOAuthState(state, storedState)) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=invalid_state', request.url)
      );
    }

    // Clear state cookie
    cookieStore.delete('calendly_oauth_state');

    // Check if user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(
        new URL('/login?error=unauthorized', request.url)
      );
    }

    // Exchange code for access token
    const tokens = await exchangeCodeForToken(code);

    // Get user info from Calendly
    const calendlyClient = new CalendlyAPIClient(tokens.access_token);
    const calendlyUser = await calendlyClient.getCurrentUser();

    // Save connection to database
    await saveCalendlyConnection(
      user.id,
      tokens,
      calendlyUser.uri,
      calendlyUser.email,
      calendlyUser.current_organization
    );

    // Create webhook subscription for invitee events
    try {
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendly/webhooks`;
      const webhook = await createWebhookSubscription(tokens.access_token, {
        url: webhookUrl,
        events: ['invitee.created', 'invitee.canceled'],
        organization: calendlyUser.current_organization,
        scope: 'user',
        user: calendlyUser.uri,
      });

      // Save webhook URI to database
      await updateWebhookSubscriptionUri(user.id, webhook.uri);
    } catch (webhookError) {
      console.error('Error creating webhook subscription:', webhookError);
      // Continue even if webhook creation fails
      // User can still use scheduling features manually
    }

    // Redirect to settings page with success message
    return NextResponse.redirect(
      new URL('/settings/integrations?success=calendly_connected', request.url)
    );
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/settings/integrations?error=oauth_failed', request.url)
    );
  }
}
