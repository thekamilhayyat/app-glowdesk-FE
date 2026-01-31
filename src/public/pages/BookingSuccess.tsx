/**
 * Booking Success Page
 * Shows confirmation after successful booking
 */

import { useParams, Link } from 'react-router-dom';
import { usePublicBooking } from '@/hooks/api/public/usePublicBookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, Clock, FileText, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export const BookingSuccess = () => {
  const { bookingNumber } = useParams<{ bookingNumber: string }>();
  const { data, isLoading, error } = usePublicBooking(bookingNumber || null);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8">
            <div className="space-y-4">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data?.booking) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Booking Not Found</CardTitle>
            <CardDescription>
              The booking you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const booking = data.booking;
  const startTime = parseISO(booking.startTime);
  const endTime = parseISO(booking.endTime);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-8">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
              <p className="text-muted-foreground">
                Your appointment has been successfully booked. We'll send you a confirmation email
                shortly.
              </p>
            </div>

            {/* Booking Details */}
            <div className="rounded-lg border bg-muted/50 p-4 text-left space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Booking Number</p>
                  <p className="font-mono font-semibold">{booking.bookingNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Date</p>
                  <p className="font-medium">{format(startTime, 'EEEE, MMMM d, yyyy')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Time</p>
                  <p className="font-medium">
                    {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">Service</p>
                <p className="font-medium">{booking.serviceName}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You can use your booking number to manage or cancel your appointment.
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link to="/">Book Another Appointment</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
