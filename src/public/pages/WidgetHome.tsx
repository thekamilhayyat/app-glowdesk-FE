/**
 * Widget Home Page
 * Simple entry point that redirects to default salon or shows salon selector
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const WidgetHome = () => {
  const navigate = useNavigate();

  // For testing: redirect to default salon
  // In production, this could show a salon selector or be removed
  useEffect(() => {
    // Auto-redirect to default salon for easy testing
    navigate('/salon/glow-salon', { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Glowdesk Booking Widget</CardTitle>
          <CardDescription>Redirecting to salon...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              For testing, you can access salons directly:
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/salon/glow-salon')}
              >
                Glow Salon
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/salon/elite-spa')}
              >
                Elite Spa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
