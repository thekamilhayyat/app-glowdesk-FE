/**
 * Service Selection Component
 * Step 1: Select a service
 */

import { usePublicServices } from '@/hooks/api/public/usePublicServices';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface ServiceSelectionProps {
  salonId: string | null;
  onSelect: (serviceId: string) => void;
}

export const ServiceSelection = ({ salonId, onSelect }: ServiceSelectionProps) => {
  const { data, isLoading, error } = usePublicServices(salonId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data?.services || data.services.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            {error ? 'Failed to load services' : 'No services available'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-4">
      {data.services.map((service) => (
        <Card key={service.id} className="hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle>{service.name}</CardTitle>
                {service.description && (
                  <CardDescription className="mt-1">{service.description}</CardDescription>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${service.price}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDuration(service.duration)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => onSelect(service.id)}
              className="w-full"
              variant="outline"
            >
              Select Service
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
