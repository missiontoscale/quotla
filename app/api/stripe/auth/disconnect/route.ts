import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Stripe connection
    const { data: connection, error: fetchError } = await supabase
      .from('stripe_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (fetchError || !connection) {
      return NextResponse.json(
        { error: 'No active Stripe connection found' },
        { status: 404 }
      );
    }

    try {
      // Revoke OAuth access with Stripe
      await stripe.oauth.deauthorize({
        client_id: process.env.STRIPE_CLIENT_ID || '',
        stripe_user_id: connection.stripe_account_id,
      });
    } catch (stripeError) {
      console.error('Error revoking Stripe OAuth:', stripeError);
      // Continue with local disconnection even if Stripe revocation fails
    }

    // Deactivate connection in database
    const { error: updateError } = await supabase
      .from('stripe_connections')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error disconnecting Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect Stripe' },
      { status: 500 }
    );
  }
}
