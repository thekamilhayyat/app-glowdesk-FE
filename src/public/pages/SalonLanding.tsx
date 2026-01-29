/**
 * Salon Landing Page
 * First step: Show salon info and "Book Appointment" CTA
 */

import { useParams, useNavigate } from 'react-router-dom';
import { usePublicSalon } from '@/hooks/api/public/usePublicSalon';
import { usePublicApp } from '../contexts/PublicAppContext';
import { useEffect } from 'react';
import { Loader2, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SalonLanding = () => {
  const { salonSlug } = useParams<{ salonSlug: string }>();
  const navigate = useNavigate();
  const { updateBookingState } = usePublicApp();
  const { data, isLoading, error } = usePublicSalon(salonSlug || null);

  useEffect(() => {
    if (data?.salon) {
      updateBookingState({
        salonId: data.salon.id,
        salonSlug: salonSlug || null,
      });
    }
  }, [data, salonSlug, updateBookingState]);

  const handleBookAppointment = () => {
    navigate(`/salon/${salonSlug}/book`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data?.salon) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Salon Not Found</CardTitle>
            <CardDescription>
              The salon you're looking for doesn't exist or is no longer available.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const salon = data.salon;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Salon Header */}
        <div className="text-center space-y-4">
          {salon.logo && (
            <div className="flex justify-center">
              <img
                src={salon.logo}
                alt={salon.name}
                className="h-16 w-16 rounded-lg object-contain"
              />
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{salon.name}</h1>
          {salon.description && (
            <p className="text-muted-foreground">{salon.description}</p>
          )}
        </div>

        {/* Salon Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Salon Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {salon.address && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{salon.address}</p>
                </div>
              </div>
            )}
            {salon.phone && (
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <a
                    href={`tel:${salon.phone}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {salon.phone}
                  </a>
                </div>
              </div>
            )}
            {salon.email && (
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a
                    href={`mailto:${salon.email}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {salon.email}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex justify-center">
          <Button size="lg" onClick={handleBookAppointment} className="w-full md:w-auto">
            <Calendar className="mr-2 h-5 w-5" />
            Book an Appointment
          </Button>
        </div>
      </div>
    </div>
  );
};
