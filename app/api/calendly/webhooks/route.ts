// Calendly Webhook Endpoint
// Receives and processes webhook events from Calendly

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, processWebhookEvent } from '@/lib/calendly/webhooks';
import { getCalendlyConnection } from '@/lib/calendly/oauth';
import type { CalendlyWebhookEvent } from '@/types/calendly';

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature from headers
    const signature = request.headers.get('calendly-webhook-signature');

    if (!signature) {
      console.error('Missing webhook signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify webhook signature
    const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY!;
    const isValid = verifyWebhookSignature(rawBody, signature, signingKey);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const webhookEvent: CalendlyWebhookEvent = JSON.parse(rawBody);

    console.log('Received webhook event:', webhookEvent.event);

    // Extract user URI from event payload
    // We need to fetch the event to get the host's user URI
    // For now, we'll process with a temporary access token approach
    // In production, you might want to store a service-level token or
    // use the webhook's organization context

    // Process the webhook event
    // Note: We need an access token to fetch event details
    // The webhook payload doesn't include full event details
    // We'll need to fetch them using the Calendly API

    // For simplicity, we'll use a different approach:
    // Store minimal webhook data and process later with user's token
    // Or require users to have active connections

    // This is a simplified version - in production you'd want more robust handling
    try {
      // We need to get the user's access token
      // The webhook doesn't tell us which user it belongs to directly
      // We need to fetch the event and match the host

      // For now, we'll acknowledge receipt and process asynchronously
      // In a production system, you'd use a job queue here

      // Acknowledge webhook receipt immediately
      // Process asynchronously to avoid timeout
      processWebhookAsync(webhookEvent);

      return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
      console.error('Error processing webhook:', error);
      // Return 200 to prevent Calendly from retrying
      // Log the error for manual investigation
      return NextResponse.json({ received: true }, { status: 200 });
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Process webhook asynchronously
 * In production, this should be handled by a job queue
 */
async function processWebhookAsync(webhookEvent: CalendlyWebhookEvent) {
  try {
    // Import here to avoid circular dependencies
    const { CalendlyAPIClient } = await import('@/lib/calendly/api');
    const { createClient } = await import('@/lib/supabase/server');

    // We need to determine which user this webhook belongs to
    // Fetch the event to get the host information
    // Use a service-level approach or fetch from first available connection

    // Get all active Calendly connections
    const supabase = await createClient();
    const { data: connections } = await supabase
      .from('calendly_connections')
      .select('*')
      .eq('is_active', true);

    if (!connections || connections.length === 0) {
      console.error('No active Calendly connections found');
      return;
    }

    // Try each connection until we find the one that owns this event
    for (const connection of connections) {
      try {
        const client = new CalendlyAPIClient(connection.access_token);

        // Fetch invitee to get event details
        const invitee = await client.getInvitee(webhookEvent.payload.invitee);

        // Fetch the event to check if it belongs to this user
        const event = await client.getScheduledEvent(webhookEvent.payload.event);

        // Check if this connection's user is the host
        const isHost = event.event_memberships.some(
          (membership) => membership.user === connection.calendly_user_uri
        );

        if (isHost) {
          // Found the right connection, process the webhook
          await processWebhookEvent(webhookEvent, connection.access_token);
          console.log('Webhook processed successfully');
          return;
        }
      } catch (error) {
        // Continue to next connection
        console.error('Error checking connection:', error);
        continue;
      }
    }

    console.error('Could not find owner for webhook event');
  } catch (error) {
    console.error('Error in async webhook processing:', error);
  }
}
