import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { supabase } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth denial
    if (error) {
      console.error('Stripe OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL('/settings/integrations?error=stripe_denied', req.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=invalid_callback', req.url)
      );
    }

    // Verify state parameter
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('provider', 'stripe')
      .single();

    if (stateError || !stateData) {
      console.error('Invalid state parameter:', stateError);
      return NextResponse.redirect(
        new URL('/settings/integrations?error=invalid_state', req.url)
      );
    }

    // Delete used state
    await supabase.from('oauth_states').delete().eq('state', state);

    // Exchange code for access token
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    if (!response.stripe_user_id || !response.access_token) {
      throw new Error('Invalid OAuth response from Stripe');
    }

    // Get Stripe account details
    const account = await stripe.accounts.retrieve(response.stripe_user_id);

    // Store connection in database
    const { error: insertError } = await supabase.from('stripe_connections').upsert({
      user_id: stateData.user_id,
      stripe_account_id: response.stripe_user_id,
      stripe_email: account.email || '',
      access_token: response.access_token,
      refresh_token: response.refresh_token || '',
      token_type: response.token_type,
      scope: response.scope,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Error storing Stripe connection:', insertError);
      throw insertError;
    }

    // Redirect back to integrations page with success message
    return NextResponse.redirect(
      new URL('/settings/integrations?success=stripe_connected', req.url)
    );
  } catch (error: any) {
    console.error('Error handling Stripe OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/settings/integrations?error=oauth_failed', req.url)
    );
  }
}
