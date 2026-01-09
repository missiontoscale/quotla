import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?redirect=/settings/integrations', req.url)
      );
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomUUID();

    // Store state in session or database for verification
    await supabase.from('oauth_states').insert({
      state,
      user_id: user.id,
      provider: 'stripe',
      created_at: new Date().toISOString(),
    });

    // Build Stripe Connect OAuth URL
    const params = new URLSearchParams({
      client_id: process.env.STRIPE_CLIENT_ID || '',
      state,
      response_type: 'code',
      scope: 'read_write',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/auth/callback`,
    });

    const authUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('Error initiating Stripe Connect:', error);
    return NextResponse.redirect(
      new URL('/settings/integrations?error=stripe_connect_failed', req.url)
    );
  }
}
