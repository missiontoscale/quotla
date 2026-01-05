// Disconnect Calendly Route
// Revokes OAuth tokens and removes connection

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { disconnectCalendly } from '@/lib/calendly/oauth';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Disconnect Calendly
    await disconnectCalendly(user.id);

    return NextResponse.json({
      success: true,
      message: 'Calendly disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting Calendly:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Calendly' },
      { status: 500 }
    );
  }
}
