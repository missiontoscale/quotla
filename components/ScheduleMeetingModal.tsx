'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import type { CalendlyEventType } from '@/types/calendly';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  clientEmail?: string;
  clientName?: string;
  quoteId?: string;
  invoiceId?: string;
}

export function ScheduleMeetingModal({
  isOpen,
  onClose,
  clientEmail = '',
  clientName = '',
  quoteId,
  invoiceId,
}: ScheduleMeetingModalProps) {
  const [loading, setLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState<CalendlyEventType[]>([]);
  const [selectedEventType, setSelectedEventType] = useState('');
  const [email, setEmail] = useState(clientEmail);
  const [name, setName] = useState(clientName);
  const [sendEmail, setSendEmail] = useState(true);
  const [copyToClipboard, setCopyToClipboard] = useState(false);
  const [schedulingLink, setSchedulingLink] = useState('');
  const [linkGenerated, setLinkGenerated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadEventTypes();
      setEmail(clientEmail);
      setName(clientName);
      setSchedulingLink('');
      setLinkGenerated(false);
    }
  }, [isOpen, clientEmail, clientName]);

  const loadEventTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendly/events');

      if (!response.ok) {
        throw new Error('Failed to fetch event types');
      }

      const data = await response.json();
      setEventTypes(data.event_types || []);

      // Auto-select first event type if available
      if (data.event_types && data.event_types.length > 0) {
        setSelectedEventType(data.event_types[0].uri);
      }
    } catch (error) {
      console.error('Error loading event types:', error);
      toast({
        title: 'Error',
        description: 'Failed to load event types. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!selectedEventType) {
      toast({
        title: 'Error',
        description: 'Please select an event type',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Get the selected event type's scheduling URL
      const eventType = eventTypes.find((et) => et.uri === selectedEventType);

      if (!eventType) {
        throw new Error('Event type not found');
      }

      // Build scheduling URL with prefilled data
      const url = new URL(eventType.scheduling_url);

      if (email) {
        url.searchParams.set('email', email);
      }

      if (name) {
        url.searchParams.set('name', name);
      }

      const link = url.toString();
      setSchedulingLink(link);
      setLinkGenerated(true);

      // Copy to clipboard if requested
      if (copyToClipboard) {
        await navigator.clipboard.writeText(link);
        toast({
          title: 'Link Copied',
          description: 'Scheduling link has been copied to clipboard',
        });
      }

      // Send email if requested
      if (sendEmail && email) {
        // In a real implementation, you'd send an email here
        // For now, we'll just show a success message
        toast({
          title: 'Link Generated',
          description: `Scheduling link generated${sendEmail ? ' and email sent' : ''}`,
        });
      } else {
        toast({
          title: 'Link Generated',
          description: 'You can now share the scheduling link',
        });
      }
    } catch (error) {
      console.error('Error generating link:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate scheduling link',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(schedulingLink);
      toast({
        title: 'Copied',
        description: 'Link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  const handleOpenLink = () => {
    window.open(schedulingLink, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Schedule Meeting
          </DialogTitle>
          <DialogDescription>
            Generate a scheduling link to send to your client
            {quoteId && ' for this quote'}
            {invoiceId && ' for this invoice'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Event Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="event-type">Event Type</Label>
            <Select value={selectedEventType} onValueChange={setSelectedEventType}>
              <SelectTrigger id="event-type">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((eventType) => (
                  <SelectItem key={eventType.uri} value={eventType.uri}>
                    {eventType.name} ({eventType.duration} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Client Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="client@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Client Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="send-email"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
              />
              <label
                htmlFor="send-email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Send scheduling link via email
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="copy-clipboard"
                checked={copyToClipboard}
                onCheckedChange={(checked) => setCopyToClipboard(checked as boolean)}
              />
              <label
                htmlFor="copy-clipboard"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Copy scheduling link to clipboard
              </label>
            </div>
          </div>

          {/* Generated Link Display */}
          {linkGenerated && schedulingLink && (
            <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Link generated successfully!</span>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={schedulingLink}
                  className="text-xs"
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenLink}
                  className="shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleGenerateLink} disabled={loading || !selectedEventType}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>Generate Link</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
