// Calendly Webhook Handler
// Processes webhook events from Calendly (invitee.created, invitee.canceled)

import crypto from 'crypto';
import type {
  CalendlyWebhookEvent,
  CalendlyInvitee,
  CalendlyEvent,
  ScheduledMeeting,
} from '@/types/calendly';
import { createClient } from '@/lib/supabase/server';
import { CalendlyAPIClient } from './api';

/**
 * Verify webhook signature using HMAC SHA-256
 * Prevents webhook spoofing attacks
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  signingKey: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', signingKey)
      .update(payload)
      .digest('base64');

    // Timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Extract user ID from Calendly user URI
 * Maps Calendly user to Quotla user
 */
async function getUserIdFromCalendlyUri(calendlyUserUri: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('calendly_connections')
    .select('user_id')
    .eq('calendly_user_uri', calendlyUserUri)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data.user_id;
}

/**
 * Match invitee email to existing customer
 */
async function matchClientByEmail(userId: string, email: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', userId)
    .eq('email', email)
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}

/**
 * Check if event was already processed (idempotency)
 */
async function isEventProcessed(calendlyEventUri: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('scheduled_meetings')
    .select('id')
    .eq('calendly_event_uri', calendlyEventUri)
    .single();

  return !error && data !== null;
}

/**
 * Handle invitee.created webhook event
 * Creates a new scheduled meeting record
 */
export async function handleInviteeCreated(
  event: CalendlyWebhookEvent,
  accessToken: string
): Promise<void> {
  const client = new CalendlyAPIClient(accessToken);

  // Fetch invitee details
  const invitee = await client.getInvitee(event.payload.invitee);

  // Fetch event details
  const calendlyEvent = await client.getScheduledEvent(event.payload.event);

  // Extract event host (first membership)
  const hostUri = calendlyEvent.event_memberships[0]?.user;
  if (!hostUri) {
    throw new Error('No host found for event');
  }

  // Get user ID from Calendly user URI
  const userId = await getUserIdFromCalendlyUri(hostUri);
  if (!userId) {
    console.warn('No user found for Calendly URI:', hostUri);
    return; // Skip if user not found
  }

  // Check if already processed (idempotency)
  if (await isEventProcessed(invitee.uri)) {
    console.log('Event already processed:', invitee.uri);
    return;
  }

  // Try to match client by email
  const clientId = await matchClientByEmail(userId, invitee.email);

  // Determine location string
  let location: string | null = null;
  if (calendlyEvent.location.type === 'physical') {
    location = calendlyEvent.location.location || null;
  } else if (calendlyEvent.location.join_url) {
    location = calendlyEvent.location.join_url;
  } else if (calendlyEvent.location.location) {
    location = calendlyEvent.location.location;
  }

  // Create scheduled meeting record
  const supabase = await createClient();
  const { error } = await supabase.from('scheduled_meetings').insert({
    user_id: userId,
    client_id: clientId,
    calendly_event_uri: invitee.event,
    calendly_invitee_uri: invitee.uri,
    event_type_name: calendlyEvent.name,
    invitee_email: invitee.email,
    invitee_name: invitee.name,
    start_time: calendlyEvent.start_time,
    end_time: calendlyEvent.end_time,
    location,
    status: 'scheduled',
  });

  if (error) {
    console.error('Error creating scheduled meeting:', error);
    throw error;
  }

  console.log('Created scheduled meeting for invitee:', invitee.email);
}

/**
 * Handle invitee.canceled webhook event
 * Updates meeting status to canceled
 */
export async function handleInviteeCanceled(
  event: CalendlyWebhookEvent,
  accessToken: string
): Promise<void> {
  const client = new CalendlyAPIClient(accessToken);

  // Fetch invitee details (includes cancellation info)
  const invitee = await client.getInvitee(event.payload.invitee);

  // Find existing meeting record
  const supabase = await createClient();
  const { data: meeting, error: findError } = await supabase
    .from('scheduled_meetings')
    .select('*')
    .eq('calendly_invitee_uri', invitee.uri)
    .single();

  if (findError || !meeting) {
    console.warn('Meeting not found for cancellation:', invitee.uri);
    return;
  }

  // Update meeting status
  const { error: updateError } = await supabase
    .from('scheduled_meetings')
    .update({
      status: 'canceled',
      canceled_at: invitee.cancellation?.created_at || new Date().toISOString(),
      canceled_by: invitee.cancellation?.canceler_type || null,
      cancellation_reason: invitee.cancellation?.reason || null,
    })
    .eq('id', meeting.id);

  if (updateError) {
    console.error('Error updating meeting cancellation:', updateError);
    throw updateError;
  }

  console.log('Canceled meeting:', meeting.id);
}

/**
 * Process webhook event
 * Main webhook handler that routes to specific event handlers
 */
export async function processWebhookEvent(
  event: CalendlyWebhookEvent,
  accessToken: string
): Promise<void> {
  switch (event.event) {
    case 'invitee.created':
      await handleInviteeCreated(event, accessToken);
      break;

    case 'invitee.canceled':
      await handleInviteeCanceled(event, accessToken);
      break;

    default:
      console.warn('Unknown webhook event type:', event.event);
  }
}

/**
 * Get scheduled meetings for user
 */
export async function getScheduledMeetings(
  userId: string,
  filters?: {
    clientId?: string;
    quoteId?: string;
    invoiceId?: string;
    status?: 'scheduled' | 'canceled' | 'completed';
    startAfter?: string;
    startBefore?: string;
  }
): Promise<ScheduledMeeting[]> {
  const supabase = await createClient();

  let query = supabase
    .from('scheduled_meetings')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: true });

  if (filters?.clientId) {
    query = query.eq('client_id', filters.clientId);
  }

  if (filters?.quoteId) {
    query = query.eq('quote_id', filters.quoteId);
  }

  if (filters?.invoiceId) {
    query = query.eq('invoice_id', filters.invoiceId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.startAfter) {
    query = query.gte('start_time', filters.startAfter);
  }

  if (filters?.startBefore) {
    query = query.lte('start_time', filters.startBefore);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Link meeting to quote or invoice
 */
export async function linkMeetingToDocument(
  meetingId: string,
  documentType: 'quote' | 'invoice',
  documentId: string
): Promise<void> {
  const supabase = await createClient();

  const updateData: any = {};
  if (documentType === 'quote') {
    updateData.quote_id = documentId;
  } else {
    updateData.invoice_id = documentId;
  }

  const { error } = await supabase
    .from('scheduled_meetings')
    .update(updateData)
    .eq('id', meetingId);

  if (error) {
    throw error;
  }
}

/**
 * Mark meeting as completed
 */
export async function markMeetingCompleted(meetingId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('scheduled_meetings')
    .update({
      status: 'completed',
    })
    .eq('id', meetingId);

  if (error) {
    throw error;
  }
}
