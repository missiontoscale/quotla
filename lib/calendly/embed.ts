// Calendly Embed Helpers
// Utilities for embedding Calendly scheduling widgets

/**
 * Generate Calendly inline embed URL
 * Used for embedding scheduling widget in modals or pages
 */
export function generateEmbedUrl(
  schedulingUrl: string,
  options?: {
    hideEventTypeDetails?: boolean;
    hideLandingPageDetails?: boolean;
    backgroundColor?: string;
    textColor?: string;
    primaryColor?: string;
    prefill?: {
      name?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      customAnswers?: Record<string, string>;
    };
  }
): string {
  const url = new URL(schedulingUrl);

  if (options?.hideEventTypeDetails) {
    url.searchParams.set('hide_event_type_details', '1');
  }

  if (options?.hideLandingPageDetails) {
    url.searchParams.set('hide_landing_page_details', '1');
  }

  if (options?.backgroundColor) {
    url.searchParams.set('background_color', options.backgroundColor.replace('#', ''));
  }

  if (options?.textColor) {
    url.searchParams.set('text_color', options.textColor.replace('#', ''));
  }

  if (options?.primaryColor) {
    url.searchParams.set('primary_color', options.primaryColor.replace('#', ''));
  }

  // Prefill parameters
  if (options?.prefill) {
    if (options.prefill.name) {
      url.searchParams.set('name', options.prefill.name);
    }
    if (options.prefill.email) {
      url.searchParams.set('email', options.prefill.email);
    }
    if (options.prefill.firstName) {
      url.searchParams.set('first_name', options.prefill.firstName);
    }
    if (options.prefill.lastName) {
      url.searchParams.set('last_name', options.prefill.lastName);
    }

    // Custom answers (for custom questions)
    if (options.prefill.customAnswers) {
      Object.entries(options.prefill.customAnswers).forEach(([key, value]) => {
        url.searchParams.set(`a${key}`, value);
      });
    }
  }

  return url.toString();
}

/**
 * Get Calendly widget script URL
 * Load this script to enable Calendly widgets
 */
export const CALENDLY_WIDGET_SCRIPT_URL = 'https://assets.calendly.com/assets/external/widget.js';

/**
 * Generate scheduling link with pre-filled data
 * Returns a single-use link that can be shared via email
 */
export function generateSchedulingLink(
  baseUrl: string,
  prefillData?: {
    name?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  }
): string {
  const url = new URL(baseUrl);

  if (prefillData?.name) {
    url.searchParams.set('name', prefillData.name);
  }
  if (prefillData?.email) {
    url.searchParams.set('email', prefillData.email);
  }
  if (prefillData?.firstName) {
    url.searchParams.set('first_name', prefillData.firstName);
  }
  if (prefillData?.lastName) {
    url.searchParams.set('last_name', prefillData.lastName);
  }

  return url.toString();
}

/**
 * Format meeting location for display
 */
export function formatMeetingLocation(location: string | null, locationType?: string): string {
  if (!location) {
    return 'Location TBD';
  }

  // Check if it's a URL (video call)
  try {
    new URL(location);
    return 'Video Call';
  } catch {
    // Not a URL, return as-is
    return location;
  }
}

/**
 * Get meeting platform from join URL
 */
export function getMeetingPlatform(joinUrl: string): string {
  if (joinUrl.includes('zoom.us')) {
    return 'Zoom';
  }
  if (joinUrl.includes('meet.google.com')) {
    return 'Google Meet';
  }
  if (joinUrl.includes('teams.microsoft.com')) {
    return 'Microsoft Teams';
  }
  if (joinUrl.includes('gotomeeting.com')) {
    return 'GoToMeeting';
  }
  if (joinUrl.includes('webex.com')) {
    return 'Webex';
  }
  return 'Video Call';
}

/**
 * Calculate meeting duration in minutes
 */
export function calculateMeetingDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Format meeting duration for display
 */
export function formatMeetingDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} min`;
}

/**
 * Check if meeting is in the past
 */
export function isMeetingPast(endTime: string): boolean {
  return new Date(endTime) < new Date();
}

/**
 * Check if meeting is upcoming (within next 24 hours)
 */
export function isMeetingUpcoming(startTime: string): boolean {
  const now = new Date();
  const start = new Date(startTime);
  const diff = start.getTime() - now.getTime();
  const hours = diff / (1000 * 60 * 60);

  return hours > 0 && hours <= 24;
}

/**
 * Get time until meeting starts
 */
export function getTimeUntilMeeting(startTime: string): string {
  const now = new Date();
  const start = new Date(startTime);
  const diff = start.getTime() - now.getTime();

  if (diff < 0) {
    return 'Started';
  }

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `in ${days} ${days === 1 ? 'day' : 'days'}`;
  }
  if (hours > 0) {
    return `in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  if (minutes > 0) {
    return `in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }

  return 'Starting now';
}
