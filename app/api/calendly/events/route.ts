// Calendly Events API Route
// Fetch user's Calendly event types and scheduled events

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCalendlyClient } from '@/lib/calendly/api';

/**
 * GET /api/calendly/events
 * Fetch user's event types
 */
export async function GET(request: NextRequest) {
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

    // Get Calendly client with valid token
    const client = await getCalendlyClient(user.id);

    // Get current user to retrieve their URI
    const calendlyUser = await client.getCurrentUser();

    // Fetch event types
    const eventTypes = await client.listEventTypes({
      user: calendlyUser.uri,
      active: true,
    });

    return NextResponse.json({
      event_types: eventTypes.collection,
      user: calendlyUser,
    });
  } catch (error: any) {
    console.error('Error fetching event types:', error);

    if (error.message?.includes('No Calendly connection')) {
      return NextResponse.json(
        { error: 'Calendly not connected' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch event types' },
      { status: 500 }
    );
  }
}
