// Calendly Integration Types
// Based on Calendly API v2: https://developer.calendly.com/api-docs

// ============================================================
// Database Types
// ============================================================

export interface CalendlyConnection {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  calendly_user_uri: string;
  calendly_email: string;
  calendly_organization_uri: string | null;
  default_event_type_uri: string | null;
  webhook_subscription_uri: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduledMeeting {
  id: string;
  user_id: string;
  client_id: string | null;
  quote_id: string | null;
  invoice_id: string | null;
  calendly_event_uri: string;
  calendly_invitee_uri: string;
  event_type_name: string;
  invitee_email: string;
  invitee_name: string;
  start_time: string;
  end_time: string;
  location: string | null;
  status: 'scheduled' | 'canceled' | 'completed';
  canceled_at: string | null;
  canceled_by: 'host' | 'invitee' | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Calendly API Response Types
// ============================================================

export interface CalendlyUser {
  uri: string;
  name: string;
  slug: string;
  email: string;
  scheduling_url: string;
  timezone: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  current_organization: string;
}

export interface CalendlyEventType {
  uri: string;
  name: string;
  active: boolean;
  booking_method: 'instant' | 'poll';
  color: string;
  created_at: string;
  updated_at: string;
  description_html: string | null;
  description_plain: string | null;
  duration: number; // in minutes
  internal_note: string | null;
  kind: 'solo' | 'group';
  pooling_type: string | null;
  profile: {
    name: string;
    owner: string;
    type: 'User' | 'Team';
  };
  scheduling_url: string;
  secret: boolean;
  slug: string;
  type: 'StandardEventType' | 'CustomEventType';
  custom_questions: CalendlyCustomQuestion[];
}

export interface CalendlyCustomQuestion {
  answer_choices: string[];
  enabled: boolean;
  include_other: boolean;
  name: string;
  position: number;
  required: boolean;
  type: 'string' | 'text' | 'phone_number' | 'single_select' | 'multi_select';
}

export interface CalendlyEvent {
  uri: string;
  name: string;
  meeting_notes_html: string | null;
  meeting_notes_plain: string | null;
  status: 'active' | 'canceled';
  start_time: string;
  end_time: string;
  event_type: string;
  location: CalendlyLocation;
  invitees_counter: {
    active: number;
    limit: number;
    total: number;
  };
  created_at: string;
  updated_at: string;
  event_memberships: CalendlyEventMembership[];
  event_guests: CalendlyEventGuest[];
}

export interface CalendlyLocation {
  type: 'physical' | 'outbound_call' | 'inbound_call' | 'google_conference' | 'zoom' | 'gotomeeting' | 'microsoft_teams' | 'webex' | 'custom';
  location?: string;
  join_url?: string;
  data?: Record<string, any>;
}

export interface CalendlyEventMembership {
  user: string;
  user_email: string;
  user_name: string;
}

export interface CalendlyEventGuest {
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CalendlyInvitee {
  uri: string;
  email: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  status: 'active' | 'canceled';
  timezone: string;
  event: string;
  created_at: string;
  updated_at: string;
  questions_and_answers: CalendlyQuestionAnswer[];
  tracking: {
    utm_campaign: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_content: string | null;
    utm_term: string | null;
    salesforce_uuid: string | null;
  };
  text_reminder_number: string | null;
  rescheduled: boolean;
  old_invitee: string | null;
  new_invitee: string | null;
  cancel_url: string;
  reschedule_url: string;
  cancellation: CalendlyCancellation | null;
  payment: CalendlyPayment | null;
  no_show: CalendlyNoShow | null;
  reconfirmation: CalendlyReconfirmation | null;
}

export interface CalendlyQuestionAnswer {
  question: string;
  answer: string;
  position: number;
}

export interface CalendlyCancellation {
  canceled_by: string;
  reason: string | null;
  canceler_type: 'host' | 'invitee';
  created_at: string;
}

export interface CalendlyPayment {
  id: string;
  provider: string;
  amount: number;
  currency: string;
  terms: string;
  successful: boolean;
}

export interface CalendlyNoShow {
  uri: string;
  created_at: string;
}

export interface CalendlyReconfirmation {
  uri: string;
  created_at: string;
  confirmed_at: string | null;
}

export interface CalendlyWebhookSubscription {
  uri: string;
  callback_url: string;
  created_at: string;
  updated_at: string;
  retry_started_at: string | null;
  state: 'active' | 'disabled';
  events: string[];
  scope: 'user' | 'organization';
  organization: string;
  user: string;
  creator: string;
}

// ============================================================
// Calendly API List Response Wrapper
// ============================================================

export interface CalendlyListResponse<T> {
  collection: T[];
  pagination: {
    count: number;
    next_page: string | null;
    previous_page: string | null;
    next_page_token: string | null;
    previous_page_token: string | null;
  };
}

export interface CalendlyResourceResponse<T> {
  resource: T;
}

// ============================================================
// Webhook Event Payloads
// ============================================================

export interface CalendlyWebhookEvent {
  event: 'invitee.created' | 'invitee.canceled';
  time: string;
  payload: {
    event: string;
    invitee: string;
  };
}

export interface CalendlyInviteeCreatedPayload extends CalendlyWebhookEvent {
  event: 'invitee.created';
}

export interface CalendlyInviteeCanceledPayload extends CalendlyWebhookEvent {
  event: 'invitee.canceled';
}

// ============================================================
// OAuth Types
// ============================================================

export interface CalendlyOAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  created_at: number;
  organization: string;
  owner: string;
}

export interface CalendlyOAuthError {
  error: string;
  error_description?: string;
}

// ============================================================
// API Request/Response Types
// ============================================================

export interface CreateSchedulingLinkRequest {
  max_event_count?: number;
  owner: string;
  owner_type: 'EventType' | 'User';
}

export interface CreateSchedulingLinkResponse {
  resource: {
    booking_url: string;
    owner: string;
    owner_type: string;
  };
}

export interface CreateWebhookSubscriptionRequest {
  url: string;
  events: ('invitee.created' | 'invitee.canceled')[];
  organization: string;
  scope: 'user' | 'organization';
  signing_key?: string;
  user?: string;
}

// ============================================================
// Frontend Component Props
// ============================================================

export interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  clientEmail?: string;
  clientName?: string;
  quoteId?: string;
  invoiceId?: string;
}

export interface CalendlyConnectionCardProps {
  connection: CalendlyConnection | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export interface UpcomingMeetingsWidgetProps {
  meetings: ScheduledMeeting[];
  maxDisplay?: number;
}

export interface MeetingListItemProps {
  meeting: ScheduledMeeting;
  onCancel?: (meetingId: string) => void;
}

// ============================================================
// Utility Types
// ============================================================

export type CalendlyEventTypeSelection = Pick<CalendlyEventType, 'uri' | 'name' | 'duration' | 'scheduling_url'>;

export type MeetingStatus = ScheduledMeeting['status'];

export type WebhookEventType = 'invitee.created' | 'invitee.canceled';
