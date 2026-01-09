'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { CalendlyConnection, CalendlyEventType } from '@/types/calendly';
import type { StripeConnection } from '@/types/stripe';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CalendarIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Settings2,
} from 'lucide-react';

export default function IntegrationsPage() {
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState<CalendlyConnection | null>(null);
  const [eventTypes, setEventTypes] = useState<CalendlyEventType[]>([]);
  const [disconnecting, setDisconnecting] = useState(false);
  const [stripeConnection, setStripeConnection] = useState<StripeConnection | null>(null);
  const [stripeDisconnecting, setStripeDisconnecting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    loadConnection();
    checkCallbackStatus();
  }, []);

  const checkCallbackStatus = () => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'calendly_connected') {
      toast({
        title: 'Calendly Connected',
        description: 'Your Calendly account has been connected successfully.',
      });
      router.replace('/settings/integrations');
    } else if (success === 'stripe_connected') {
      toast({
        title: 'Stripe Connected',
        description: 'Your Stripe account has been connected successfully.',
      });
      router.replace('/settings/integrations');
    } else if (error) {
      let errorMessage = 'Connection failed';
      switch (error) {
        case 'calendly_denied':
          errorMessage = 'You denied access to Calendly';
          break;
        case 'stripe_denied':
          errorMessage = 'You denied access to Stripe';
          break;
        case 'invalid_callback':
          errorMessage = 'Invalid callback response';
          break;
        case 'invalid_state':
          errorMessage = 'Security validation failed';
          break;
        case 'oauth_failed':
          errorMessage = 'OAuth authorization failed';
          break;
        case 'stripe_connect_failed':
          errorMessage = 'Failed to connect Stripe';
          break;
      }
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      router.replace('/settings/integrations');
    }
  };

  const loadConnection = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch Calendly connection
      const { data: connectionData, error: connectionError } = await supabase
        .from('calendly_connections' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (!connectionError && connectionData) {
        setConnection(connectionData as CalendlyConnection);
      }

      // If connected, fetch event types
      if (connectionData) {
        try {
          const response = await fetch('/api/calendly/events');
          if (response.ok) {
            const data = await response.json();
            setEventTypes(data.event_types || []);
          }
        } catch (error) {
          console.error('Error fetching event types:', error);
        }
      }

      // Fetch Stripe connection
      const { data: stripeData, error: stripeError } = await supabase
        .from('stripe_connections' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (!stripeError && stripeData) {
        setStripeConnection(stripeData as StripeConnection);
      }
    } catch (error) {
      console.error('Error loading connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // Redirect to OAuth connect endpoint
    window.location.href = '/api/calendly/auth/connect';
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Calendly?')) {
      return;
    }

    try {
      setDisconnecting(true);

      const response = await fetch('/api/calendly/auth/disconnect', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      toast({
        title: 'Disconnected',
        description: 'Calendly has been disconnected successfully.',
      });

      setConnection(null);
      setEventTypes([]);
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect Calendly',
        variant: 'destructive',
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleStripeConnect = () => {
    // Redirect to OAuth connect endpoint
    window.location.href = '/api/stripe/auth/connect';
  };

  const handleStripeDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Stripe?')) {
      return;
    }

    try {
      setStripeDisconnecting(true);

      const response = await fetch('/api/stripe/auth/disconnect', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      toast({
        title: 'Disconnected',
        description: 'Stripe has been disconnected successfully.',
      });

      setStripeConnection(null);
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect Stripe',
        variant: 'destructive',
      });
    } finally {
      setStripeDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect third-party services to enhance your workflow
        </p>
      </div>

      <div className="space-y-6">
        {/* Calendly Integration Card */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold">Calendly</h3>
                {connection && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </span>
                )}
              </div>

              <p className="text-muted-foreground text-sm mb-4">
                Schedule meetings with clients directly from Quotla. Sync your availability
                and automate meeting scheduling.
              </p>

              {connection ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Account</p>
                      <p className="text-sm font-semibold">{connection.calendly_email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <p className="text-sm font-semibold text-green-600">Active</p>
                    </div>
                  </div>

                  {eventTypes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Available Event Types</p>
                      <div className="space-y-2">
                        {eventTypes.slice(0, 3).map((eventType) => (
                          <div
                            key={eventType.uri}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium">{eventType.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {eventType.duration} minutes
                              </p>
                            </div>
                            <a
                              href={eventType.scheduling_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                            >
                              View
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ))}
                        {eventTypes.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            +{eventTypes.length - 3} more event types
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                    >
                      {disconnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Disconnect
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={handleConnect}>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Connect Calendly Account
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Stripe Integration Card */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Settings2 className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold">Stripe</h3>
                {stripeConnection && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </span>
                )}
              </div>

              <p className="text-muted-foreground text-sm mb-4">
                Accept payments on invoices directly through Stripe. Get paid faster with
                online payment options.
              </p>

              {stripeConnection ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Account</p>
                      <p className="text-sm font-semibold">{stripeConnection.stripe_email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <p className="text-sm font-semibold text-green-600">Active</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStripeDisconnect}
                      disabled={stripeDisconnecting}
                    >
                      {stripeDisconnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Disconnect
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={handleStripeConnect}>
                  <Settings2 className="h-4 w-4 mr-2" />
                  Connect Stripe Account
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
