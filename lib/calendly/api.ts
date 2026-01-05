// Calendly API Client Wrapper
// Handles all interactions with Calendly API v2

import type {
  CalendlyUser,
  CalendlyEventType,
  CalendlyEvent,
  CalendlyInvitee,
  CalendlyListResponse,
  CalendlyResourceResponse,
  CreateSchedulingLinkRequest,
  CreateSchedulingLinkResponse,
} from '@/types/calendly';

const CALENDLY_API_BASE_URL = 'https://api.calendly.com';

/**
 * Calendly API Client
 * Provides methods to interact with Calendly API v2
 */
export class CalendlyAPIClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Make authenticated request to Calendly API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${CALENDLY_API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Calendly API error: ${response.status} ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.title || errorMessage;
      } catch {
        // Use default error message if response is not JSON
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Get current user's Calendly profile
   * GET https://api.calendly.com/users/me
   */
  async getCurrentUser(): Promise<CalendlyUser> {
    const response = await this.request<CalendlyResourceResponse<CalendlyUser>>(
      '/users/me'
    );
    return response.resource;
  }

  /**
   * Get user by URI
   * GET https://api.calendly.com/users/{uuid}
   */
  async getUser(userUri: string): Promise<CalendlyUser> {
    const response = await this.request<CalendlyResourceResponse<CalendlyUser>>(
      userUri
    );
    return response.resource;
  }

  /**
   * List user's event types
   * GET https://api.calendly.com/event_types
   */
  async listEventTypes(params?: {
    user?: string;
    organization?: string;
    active?: boolean;
    count?: number;
    page_token?: string;
  }): Promise<CalendlyListResponse<CalendlyEventType>> {
    const searchParams = new URLSearchParams();

    if (params?.user) searchParams.append('user', params.user);
    if (params?.organization) searchParams.append('organization', params.organization);
    if (params?.active !== undefined) searchParams.append('active', String(params.active));
    if (params?.count) searchParams.append('count', String(params.count));
    if (params?.page_token) searchParams.append('page_token', params.page_token);

    return this.request<CalendlyListResponse<CalendlyEventType>>(
      `/event_types?${searchParams.toString()}`
    );
  }

  /**
   * Get event type by URI
   * GET https://api.calendly.com/event_types/{uuid}
   */
  async getEventType(eventTypeUri: string): Promise<CalendlyEventType> {
    const response = await this.request<CalendlyResourceResponse<CalendlyEventType>>(
      eventTypeUri
    );
    return response.resource;
  }

  /**
   * List scheduled events
   * GET https://api.calendly.com/scheduled_events
   */
  async listScheduledEvents(params?: {
    user?: string;
    organization?: string;
    invitee_email?: string;
    status?: 'active' | 'canceled';
    min_start_time?: string;
    max_start_time?: string;
    count?: number;
    page_token?: string;
  }): Promise<CalendlyListResponse<CalendlyEvent>> {
    const searchParams = new URLSearchParams();

    if (params?.user) searchParams.append('user', params.user);
    if (params?.organization) searchParams.append('organization', params.organization);
    if (params?.invitee_email) searchParams.append('invitee_email', params.invitee_email);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.min_start_time) searchParams.append('min_start_time', params.min_start_time);
    if (params?.max_start_time) searchParams.append('max_start_time', params.max_start_time);
    if (params?.count) searchParams.append('count', String(params.count));
    if (params?.page_token) searchParams.append('page_token', params.page_token);

    return this.request<CalendlyListResponse<CalendlyEvent>>(
      `/scheduled_events?${searchParams.toString()}`
    );
  }

  /**
   * Get scheduled event by URI
   * GET https://api.calendly.com/scheduled_events/{uuid}
   */
  async getScheduledEvent(eventUri: string): Promise<CalendlyEvent> {
    const response = await this.request<CalendlyResourceResponse<CalendlyEvent>>(
      eventUri
    );
    return response.resource;
  }

  /**
   * List event invitees
   * GET https://api.calendly.com/scheduled_events/{uuid}/invitees
   */
  async listEventInvitees(
    eventUri: string,
    params?: {
      count?: number;
      email?: string;
      page_token?: string;
      status?: 'active' | 'canceled';
    }
  ): Promise<CalendlyListResponse<CalendlyInvitee>> {
    const searchParams = new URLSearchParams();

    if (params?.count) searchParams.append('count', String(params.count));
    if (params?.email) searchParams.append('email', params.email);
    if (params?.page_token) searchParams.append('page_token', params.page_token);
    if (params?.status) searchParams.append('status', params.status);

    return this.request<CalendlyListResponse<CalendlyInvitee>>(
      `${eventUri}/invitees?${searchParams.toString()}`
    );
  }

  /**
   * Get invitee by URI
   * GET https://api.calendly.com/scheduled_events/{event_uuid}/invitees/{invitee_uuid}
   */
  async getInvitee(inviteeUri: string): Promise<CalendlyInvitee> {
    const response = await this.request<CalendlyResourceResponse<CalendlyInvitee>>(
      inviteeUri
    );
    return response.resource;
  }

  /**
   * Create scheduling link (single-use link with pre-filled data)
   * POST https://api.calendly.com/scheduling_links
   */
  async createSchedulingLink(
    data: CreateSchedulingLinkRequest
  ): Promise<CreateSchedulingLinkResponse> {
    return this.request<CreateSchedulingLinkResponse>(
      '/scheduling_links',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * Cancel scheduled event
   * POST https://api.calendly.com/scheduled_events/{uuid}/cancellation
   */
  async cancelScheduledEvent(
    eventUri: string,
    reason?: string
  ): Promise<CalendlyResourceResponse<any>> {
    return this.request<CalendlyResourceResponse<any>>(
      `${eventUri}/cancellation`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
  }
}

/**
 * Helper function to get Calendly API client with valid access token
 * Automatically refreshes token if needed
 */
export async function getCalendlyClient(userId: string): Promise<CalendlyAPIClient> {
  // Import here to avoid circular dependency
  const { getValidAccessToken } = await import('./oauth');

  const accessToken = await getValidAccessToken(userId);
  return new CalendlyAPIClient(accessToken);
}

/**
 * Extract UUID from Calendly URI
 * Example: https://api.calendly.com/users/XXXXXX -> XXXXXX
 */
export function extractUuidFromUri(uri: string): string {
  const parts = uri.split('/');
  return parts[parts.length - 1];
}

/**
 * Build full Calendly URI from UUID and resource type
 */
export function buildCalendlyUri(resourceType: 'users' | 'event_types' | 'scheduled_events', uuid: string): string {
  return `${CALENDLY_API_BASE_URL}/${resourceType}/${uuid}`;
}
