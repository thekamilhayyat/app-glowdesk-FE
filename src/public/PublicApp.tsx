/**
 * Public Booking Widget App
 * Separate app for public-facing booking widget
 */

import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { PublicAppProvider } from './contexts/PublicAppContext';
import './styles/widget.css';

interface PublicAppProps {
  children: ReactNode;
}

export const PublicApp = ({ children }: PublicAppProps) => {
  return (
    <PublicAppProvider>
      <div className="booking-widget">
        {children}
        <Toaster />
      </div>
    </PublicAppProvider>
  );
};
