/**
 * Public App Routes Component
 * Routes for the public booking widget
 * Note: Routes are defined in App.tsx, this component just renders based on location
 */

import { useLocation, useParams } from 'react-router-dom';
import { SalonLanding } from './pages/SalonLanding';
import { BookingFlow } from './pages/BookingFlow';
import { BookingSuccess } from './pages/BookingSuccess';
import { NotFound } from './pages/NotFound';

export const PublicAppRoutes = () => {
  const location = useLocation();
  const params = useParams();
  
  // Render appropriate component based on current path
  // Routes are already matched in App.tsx, so we just render the component
  if (location.pathname.includes('/salon/') && location.pathname.endsWith('/book')) {
    return <BookingFlow />;
  } else if (location.pathname.startsWith('/salon/') && params.salonSlug) {
    return <SalonLanding />;
  } else if (location.pathname.startsWith('/booking/') && params.bookingNumber) {
    return <BookingSuccess />;
  } else {
    return <NotFound />;
  }
};
