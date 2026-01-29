/**
 * Booking Confirmation Component
 * Step 4: Review and confirm booking
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePublicApp } from '../../contexts/PublicAppContext';
import { useCreatePublicBooking } from '@/hooks/api/public/usePublicBookings';
import { usePublicService } from '@/hooks/api/public/usePublicServices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Clock, User, Mail, Phone, FileText, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BookingConfirmationProps {
  bookingState: {
    salonId: string | null;
    serviceId: string | null;
    selectedDate: string | null;
    selectedTimeSlot: { startTime: string; endTime: string } | null;
    customerDetails: {
      name: string;
      email: string;
      phone: string;
      notes: string;
    };
  };
}

export const BookingConfirmation = ({ bookingState }: BookingConfirmationProps) => {
  const navigate = useNavigate();
  const { resetBookingState } = usePublicApp();
  const createBooking = useCreatePublicBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: serviceData } = usePublicService(bookingState.serviceId);

  const handleConfirm = async () => {
    if (
      !bookingState.salonId ||
      !bookingState.serviceId ||
      !bookingState.selectedTimeSlot ||
      !bookingState.customerDetails.name ||
      (!bookingState.customerDetails.email && !bookingState.customerDetails.phone)
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createBooking.mutateAsync({
        salonId: bookingState.salonId,
        serviceId: bookingState.serviceId,
        startTime: bookingState.selectedTimeSlot.startTime,
        customerName: bookingState.customerDetails.name,
        customerEmail: bookingState.customerDetails.email || undefined,
        customerPhone: bookingState.customerDetails.phone || undefined,
        notes: bookingState.customerDetails.notes || undefined,
      });

      if (result?.booking) {
        resetBookingState();
        navigate(`/booking/${result.booking.bookingNumber}`);
      }
    } catch (error) {
      // Error handling is done by the mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const startTime = bookingState.selectedTimeSlot
    ? parseISO(bookingState.selectedTimeSlot.startTime)
    : null;
  const endTime = bookingState.selectedTimeSlot
    ? parseISO(bookingState.selectedTimeSlot.endTime)
    : null;

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
          <CardDescription>Please review your booking details before confirming</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Service */}
          {serviceData?.service && (
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Service</p>
                <p className="text-sm text-muted-foreground">{serviceData.service.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${serviceData.service.price} • {serviceData.service.duration} minutes
                </p>
              </div>
            </div>
          )}

          {/* Date & Time */}
          {startTime && endTime && (
            <>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(startTime, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">
                    {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Customer Details */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{bookingState.customerDetails.name}</p>
              </div>
            </div>
            {bookingState.customerDetails.email && (
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {bookingState.customerDetails.email}
                  </p>
                </div>
              </div>
            )}
            {bookingState.customerDetails.phone && (
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">
                    {bookingState.customerDetails.phone}
                  </p>
                </div>
              </div>
            )}
            {bookingState.customerDetails.notes && (
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">
                    {bookingState.customerDetails.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Button */}
      <Button
        onClick={handleConfirm}
        disabled={isSubmitting || createBooking.isPending}
        className="w-full"
        size="lg"
      >
        {isSubmitting || createBooking.isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Confirming Booking...
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Confirm Booking
          </>
        )}
      </Button>

      {createBooking.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {createBooking.error?.message || 'Failed to create booking. Please try again.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
